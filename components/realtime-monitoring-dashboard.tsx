'use client'

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from 'next/navigation'
import type { Database } from "@/types/database"
import styles from "./realtime-monitoring-dashboard.module.css"
import { AlertCircle, Activity, Mic, MicOff, Wifi, WifiOff, LogOut } from 'lucide-react'
import MeasurementChart from "./measurement-chart"

// Types pour les données (inchangés)
type Measurement = Database["public"]["Tables"]["measurements"]["Row"]
type Alert = Database["public"]["Tables"]["alerts"]["Row"]

interface RealtimeMonitoringDashboardProps {
  initialMeasurements: Measurement[] // Ces props sont maintenant obligatoires
  initialAlerts: Alert[] // Ces props sont maintenant obligatoires
}

export default function RealtimeMonitoringDashboard({
  initialMeasurements,
  initialAlerts,
}: RealtimeMonitoringDashboardProps) {
  // Initialisez les états avec les props reçues du Server Component
  const [measurements, setMeasurements] = useState<Measurement[]>(initialMeasurements)
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts)
  const [isConnected, setIsConnected] = useState(false)
  const [voiceCommand, setVoiceCommand] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [activeTab, setActiveTab] = useState("live")
  const supabase = createClient()
  const router = useRouter()

  // Fonction pour gérer la déconnexion
  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Erreur lors de la déconnexion:", error.message)
      alert("Erreur lors de la déconnexion: " + error.message)
    } else {
      console.log("Déconnexion réussie.")
      router.push('/login') // Redirige vers la page de connexion après déconnexion
    }
  }

  // Configuration des subscriptions temps réel (logique inchangée)
  useEffect(() => {
    console.log("Configuration des subscriptions temps réel...")
    const measurementsChannel = supabase
      .channel("measurements-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "measurements",
        },
        (payload) => {
          console.log("Nouvelle mesure reçue:", payload.new)
          const newMeasurement = payload.new as Measurement
          // Ajouter la nouvelle mesure au début du tableau et garder les 100 dernières
          setMeasurements((current) => [newMeasurement, ...current.slice(0, 99)])
          // Si c'est une anomalie, jouer un son d'alerte
          if (newMeasurement.is_anomaly) {
            playAlertSound()
            console.log(`🚨 Anomalie Détectée! Capteur ${newMeasurement.sensor_id}: ${newMeasurement.value}`)
          }
        },
      )
      .subscribe((status) => {
        console.log("Statut subscription measurements:", status)
        setIsConnected(status === "SUBSCRIBED")
      })
    const alertsChannel = supabase
      .channel("alerts-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "alerts",
        },
        (payload) => {
          console.log("Nouvelle alerte reçue:", payload.new)
          const newAlert = payload.new as Alert
          setAlerts((current) => [newAlert, ...current])
          // Lire l'alerte à voix haute
          speakAlert(newAlert.message)
          console.log(`🔔 Nouvelle Alerte: ${newAlert.message}`)
        },
      )
      .subscribe()
    // Nettoyage lors du démontage du composant
    return () => {
      console.log("Nettoyage des subscriptions...")
      supabase.removeChannel(measurementsChannel)
      supabase.removeChannel(alertsChannel)
    }
  }, [supabase])
  // Fonction pour jouer un son d'alerte
  const playAlertSound = () => {
    try {
      const audio = new Audio("/alert-sound.mp3")
      audio.volume = 0.5 // Ajustez le volume si nécessaire
      audio.play().catch((e) => console.log("Impossible de jouer le son:", e))
    } catch (error) {
      console.log("Erreur lors de la lecture du son:", error)
    }
  }
  // Fonction pour parler une alerte
  const speakAlert = (message: string) => {
    if ("speechSynthesis" in window) {
      // Arrêter toute synthèse vocale en cours pour éviter les chevauchements
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(message)
      utterance.lang = "fr-FR" // Langue française
      utterance.rate = 0.9 // Vitesse de lecture légèrement plus lente
      utterance.pitch = 1 // Hauteur de la voix normale
      window.speechSynthesis.speak(utterance)
    }
  }
  // Fonction pour démarrer la reconnaissance vocale
  const startVoiceRecognition = () => {
    // Vérifier la compatibilité du navigateur
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      console.error("La reconnaissance vocale n'est pas supportée par votre navigateur.")
      // Vous pouvez ajouter une alerte visuelle ici si vous le souhaitez
      return
    }
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = "fr-FR" // Langue française
    recognition.continuous = false // Arrête après la première phrase
    recognition.interimResults = false // Ne renvoie pas de résultats intermédiaires
    recognition.onstart = () => {
      setIsListening(true)
      setVoiceCommand("🎤 Écoute en cours...")
    }
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setVoiceCommand(transcript)
      processVoiceCommand(transcript)
    }
    recognition.onerror = (event: any) => {
      console.error("Erreur de reconnaissance vocale:", event.error)
      setIsListening(false)
      // Vous pouvez ajouter une alerte visuelle ici
    }
    recognition.onend = () => {
      setIsListening(false)
    }
    recognition.start()
  }
  // Fonction pour traiter les commandes vocales
  const processVoiceCommand = async (command: string) => {
    const lowerCommand = command.toLowerCase()
    let response = ""
    try {
      if (lowerCommand.includes("état") || lowerCommand.includes("statut")) {
        // Récupérer la dernière mesure
        const { data: latestMeasurement } = await supabase
          .from("measurements")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()
        if (latestMeasurement) {
          response = `La dernière mesure du capteur ${latestMeasurement.sensor_id} est de ${latestMeasurement.value}. ${
            latestMeasurement.is_anomaly ? "Une anomalie a été détectée." : "Aucune anomalie détectée."
          }`
        } else {
          response = "Aucune mesure disponible."
        }
      } else if (lowerCommand.includes("alerte") || lowerCommand.includes("alertes")) {
        // Récupérer les alertes non résolues
        const { data: unresolvedAlerts, count } = await supabase
          .from("alerts")
          .select("*", { count: "exact" })
          .eq("resolved", false)
          .order("created_at", { ascending: false })
        if (count && count > 0) {
          response = `Il y a ${count} alertes non résolues. La plus récente est: ${unresolvedAlerts![0].message}`
        } else {
          response = "Aucune alerte active pour le moment."
        }
      } else if (lowerCommand.includes("capteur")) {
        // Informations sur les capteurs
        const { data: sensorData } = await supabase
          .from("measurements")
          .select("sensor_id")
          .order("created_at", { ascending: false })
          .limit(10) // Récupérer les 10 dernières mesures pour trouver les capteurs actifs
        const uniqueSensors = [...new Set(sensorData?.map((m) => m.sensor_id) || [])]
        response = `Les capteurs actifs sont: ${uniqueSensors.join(", ")}`
      } else if (lowerCommand.includes("aide") || lowerCommand.includes("commandes")) {
        response =
          "Vous pouvez me demander l'état du système, les alertes en cours, des informations sur les capteurs, ou dire aide pour cette liste."
      } else {
        response = "Je n'ai pas compris cette commande. Dites 'aide' pour voir les commandes disponibles."
      }
      // Lire la réponse à voix haute
      speakAlert(response)
      console.log(`Commande traitée: ${response}`)
    } catch (error) {
      console.error("Erreur lors du traitement de la commande:", error)
      response = "Désolé, une erreur s'est produite lors du traitement de votre commande."
      speakAlert(response)
    }
  }
  // Fonction pour résoudre une alerte
  const resolveAlert = async (alertId: number) => {
    try {
      const { error } = await supabase.from("alerts").update({ resolved: true }).eq("id", alertId)
      if (error) throw error
      // Mettre à jour l'état local pour refléter le changement
      setAlerts((current) => current.map((alert) => (alert.id === alertId ? { ...alert, resolved: true } : alert)))
      console.log("Alerte marquée comme résolue.")
    } catch (error) {
      console.error("Erreur:", error)
      console.error("Impossible de résoudre l'alerte.")
    }
  }
  return (
    <div className={styles.dashboardContainer}>
      {/* En-tête avec statut de connexion */}
      <div className={styles.header}>
        <h1 className={styles.title}>Supervision Temps Réel</h1>
        <div className={styles.connectionStatus}>
          {isConnected ? (
            <span className={`${styles.badge} ${styles.badgeConnected}`}>
              <Wifi className={styles.icon} />
              Connecté
            </span>
          ) : (
            <span className={`${styles.badge} ${styles.badgeDisconnected}`}>
              <WifiOff className={styles.icon} />
              Déconnecté
            </span>
          )}
        </div>
        {/* Bouton de déconnexion intégré ici */}
        <button
          onClick={handleSignOut}
          className={styles.logoutButton} // Ajoutez une classe CSS pour styliser ce bouton
        >
          <LogOut className={styles.icon} /> Se déconnecter
        </button>
      </div>
      {/* Système d'onglets */}
      <div className={styles.tabsContainer}>
        <div className={styles.tabsList}>
          <button
            className={`${styles.tabTrigger} ${activeTab === "live" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("live")}
          >
            <Activity className={styles.icon} />
            Temps Réel
          </button>
          <button
            className={`${styles.tabTrigger} ${activeTab === "alerts" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("alerts")}
          >
            <AlertCircle className={styles.icon} />
            Alertes ({alerts.filter((a) => !a.resolved).length})
          </button>
          <button
            className={`${styles.tabTrigger} ${activeTab === "voice" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("voice")}
          >
            <Mic className={styles.icon} />
            Commandes Vocales
          </button>
        </div>
        {/* Contenu de l'onglet "Temps Réel" */}
        {activeTab === "live" && (
          <div className={styles.tabContent}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>
                  <Activity className={styles.icon} />
                  Mesures en Temps Réel
                  <span className={styles.badgeOutline}>{measurements.length} mesures</span>
                </h2>
              </div>
              {/* Remplacez le placeholder par le composant MeasurementChart */}
              <div className={styles.cardContent}>
                <MeasurementChart data={measurements} />
              </div>
            </div>
            {/* Statistiques rapides */}
            <div className={styles.statsGrid}>
              <div className={styles.card}>
                <div className={styles.cardContent}>
                  <div className={styles.statValue}>{measurements.filter((m) => m.is_anomaly).length}</div>
                  <p className={styles.statLabel}>Anomalies détectées</p>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardContent}>
                  <div className={styles.statValue}>{[...new Set(measurements.map((m) => m.sensor_id))].length}</div>
                  <p className={styles.statLabel}>Capteurs actifs</p>
                </div>
              </div>
              <div className={styles.card}>
                <div className={styles.cardContent}>
                  <div className={styles.statValue}>
                    {measurements.length > 0 ? new Date(measurements[0].created_at).toLocaleTimeString("fr-FR") : "N/A"}
                  </div>
                  <p className={styles.statLabel}>Dernière mesure</p>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Contenu de l'onglet "Alertes" */}
        {activeTab === "alerts" && (
          <div className={styles.tabContent}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Alertes du Système</h2>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.alertsListContainer}>
                  {alerts.length > 0 ? (
                    alerts.map((alert) => (
                      <div
                        key={alert.id}
                        className={`${styles.alertItem} ${alert.resolved ? styles.alertResolved : ""}`}
                      >
                        <div className={styles.alertHeader}>
                          <span
                            className={`${styles.alertSeverity} ${
                              alert.severity === "high"
                                ? styles.severityHigh
                                : alert.severity === "medium"
                                  ? styles.severityMedium
                                  : styles.severityLow
                            }`}
                          >
                            {alert.severity.toUpperCase()}
                          </span>
                          {alert.resolved && <span className={styles.alertResolvedBadge}>RÉSOLUE</span>}
                          <span className={styles.alertTimestamp}>
                            {new Date(alert.created_at).toLocaleString("fr-FR")}
                          </span>
                        </div>
                        <p className={styles.alertMessage}>{alert.message}</p>
                        {!alert.resolved && (
                          <button className={styles.resolveButton} onClick={() => resolveAlert(alert.id)}>
                            Résoudre
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={styles.noAlerts}>
                      <AlertCircle className={styles.noAlertsIcon} />
                      <p>Aucune alerte pour le moment</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Contenu de l'onglet "Commandes Vocales" */}
        {activeTab === "voice" && (
          <div className={styles.tabContent}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Interface Vocale</h2>
              </div>
              <div className={styles.cardContent}>
                <div className={styles.voiceInputContainer}>
                  <input
                    type="text"
                    value={voiceCommand}
                    onChange={(e) => setVoiceCommand(e.target.value)}
                    placeholder="Votre commande vocale apparaîtra ici..."
                    className={styles.voiceInput}
                    disabled={isListening}
                  />
                  <button
                    onClick={startVoiceRecognition}
                    disabled={isListening}
                    className={`${styles.voiceButton} ${isListening ? styles.voiceButtonListening : ""}`}
                  >
                    {isListening ? <MicOff className={styles.icon} /> : <Mic className={styles.icon} />}
                    {isListening ? "Écoute..." : "Parler"}
                  </button>
                </div>
                <div className={styles.commandsList}>
                  <h4 className={styles.commandsListTitle}>Commandes disponibles :</h4>
                  <ul className={styles.commandsListItems}>
                    <li>• "Quel est l'état du système ?" - État général</li>
                    <li>• "Y a-t-il des alertes ?" - Alertes actives</li>
                    <li>• "Informations sur les capteurs" - Liste des capteurs</li>
                    <li>• "Aide" - Liste des commandes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
