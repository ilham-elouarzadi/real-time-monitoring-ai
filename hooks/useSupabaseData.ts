"use client"
import { createClient } from "@supabase/supabase-js"
import { useState, useEffect } from "react"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export interface Mesure {
  identifiant: number
  identifiant_du_capteur: string
  valeur: number
  créé_à: string
  est_une_anomalie: boolean
}

export interface Alerte {
  identifiant: number
  message: string
  gravité: string
  créé_à: string
  résolu: boolean
}

export function useRealtimeMeasures() {
  const [mesures, setMesures] = useState<Mesure[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer les mesures initiales (dernières 50)
    const fetchInitialMeasures = async () => {
      const { data, error } = await supabase.from("mesures").select("*").order("créé_à", { ascending: false }).limit(50)

      if (data && !error) {
        setMesures(data.reverse()) // Inverser pour avoir l'ordre chronologique
      }
      setLoading(false)
    }

    fetchInitialMeasures()

    // S'abonner aux nouvelles mesures en temps réel
    const subscription = supabase
      .channel("mesures_channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "mesures" }, (payload) => {
        setMesures((prev) => [...prev.slice(-49), payload.new as Mesure])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { mesures, loading }
}

export function useRealtimeAlertes() {
  const [alertes, setAlertes] = useState<Alerte[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer les alertes initiales
    const fetchInitialAlertes = async () => {
      const { data, error } = await supabase.from("alertes").select("*").order("créé_à", { ascending: false }).limit(20)

      if (data && !error) {
        setAlertes(data)
      }
      setLoading(false)
    }

    fetchInitialAlertes()

    // S'abonner aux nouvelles alertes en temps réel
    const subscription = supabase
      .channel("alertes_channel")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "alertes" }, (payload) => {
        setAlertes((prev) => [payload.new as Alerte, ...prev.slice(0, 19)])
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { alertes, loading }
}

export function useStatistics() {
  const { mesures } = useRealtimeMeasures()
  const { alertes } = useRealtimeAlertes()

  const stats = {
    totalAnomalies: mesures.filter((m) => m.est_une_anomalie).length,
    capteursActifs: [...new Set(mesures.map((m) => m.identifiant_du_capteur))].length,
    alertesNonResolues: alertes.filter((a) => !a.résolu).length,
    derniereMesure:
      mesures.length > 0 ? new Date(mesures[mesures.length - 1].créé_à).toLocaleTimeString("fr-FR") : "N/A",
  }

  return stats
}
