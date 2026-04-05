"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

interface Measurement {
  id: number
  sensor_id: string
  value: number
  created_at: string
  is_anomaly: boolean
}

interface DashboardStats {
  anomaliesCount: number
  activeSensors: number
  lastMeasurementTime: string
  measurements: Measurement[]
}

export function useDashboardData() {
  const [stats, setStats] = useState<DashboardStats>({
    anomaliesCount: 0,
    activeSensors: 0,
    lastMeasurementTime: "",
    measurements: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboardData = async () => {
    try {
      // Récupérer les mesures des dernières 24 heures
      const { data: mesuresData, error: measurementsError } = await supabase
        .from("mesures")
        .select("*")
        .gte("créé_à", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order("créé_à", { ascending: false })
        .limit(100)

      if (measurementsError) throw measurementsError

      const measurements: Measurement[] =
        mesuresData?.map((mesure) => ({
          id: mesure.identifiant,
          sensor_id: mesure.identifiant_du_capteur,
          value: mesure.valeur,
          created_at: mesure.créé_à,
          is_anomaly: mesure.est_une_anomalie,
        })) || []

      // Calculer les statistiques
      const anomaliesCount = measurements.filter((m) => m.is_anomaly).length

      // Compter les capteurs actifs (qui ont envoyé des données dans la dernière heure)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
      const recentMeasurements = measurements.filter((m) => m.created_at >= oneHourAgo)
      const activeSensors = new Set(recentMeasurements.map((m) => m.sensor_id)).size

      // Dernière mesure
      const lastMeasurementTime = measurements[0]?.created_at
        ? new Date(measurements[0].created_at).toLocaleTimeString("fr-FR")
        : ""

      setStats({
        anomaliesCount,
        activeSensors,
        lastMeasurementTime,
        measurements,
      })

      setError(null)
    } catch (err) {
      console.error("Erreur lors de la récupération des données:", err)
      setError("Erreur lors de la récupération des données")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Mettre à jour les données toutes les 30 secondes
    const interval = setInterval(fetchDashboardData, 30000)

    // Écouter les changements en temps réel
    const subscription = supabase
      .channel("mesures_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "mesures" }, () => {
        fetchDashboardData()
      })
      .subscribe()

    return () => {
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [])

  return { stats, loading, error, refetch: fetchDashboardData }
}
