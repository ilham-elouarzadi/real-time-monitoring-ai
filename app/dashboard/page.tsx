import { redirect } from 'next/navigation'
import { createClient } from "@/lib/supabase/server" // Utilisez le client Supabase côté serveur
import RealtimeMonitoringDashboard from "@/components/realtime-monitoring-dashboard"
import type { Database } from "@/types/database" // Assurez-vous que ce chemin est correct

// Types pour les données (réutilisés de realtime-monitoring-dashboard.tsx)
type Measurement = Database["public"]["Tables"]["measurements"]["Row"]
type Alert = Database["public"]["Tables"]["alerts"]["Row"]

export default async function HomePage() {
  const supabase = createClient()

  // Vérifier la session côté serveur
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Si pas de session, rediriger vers la page de connexion
    redirect('/login')
  }

  // Si l'utilisateur est connecté, charger les données initiales pour le tableau de bord
  // Vous pouvez ajuster ces requêtes pour charger les données pertinentes
  const { data: initialMeasurements, error: measurementsError } = await supabase
    .from('measurements')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100) // Charger les 100 dernières mesures

  const { data: initialAlerts, error: alertsError } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50) // Charger les 50 dernières alertes

  if (measurementsError) {
    console.error("Erreur lors du chargement des mesures initiales:", measurementsError.message)
  }
  if (alertsError) {
    console.error("Erreur lors du chargement des alertes initiales:", alertsError.message)
  }

  return (
    <main>
      <RealtimeMonitoringDashboard
        initialMeasurements={initialMeasurements || []}
        initialAlerts={initialAlerts || []}
      />
    </main>
  )
}
