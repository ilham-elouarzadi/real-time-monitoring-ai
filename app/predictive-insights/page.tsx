"use client"

import { useState, useMemo } from "react"
import { TrendingUp, ShieldAlert, Clock } from "lucide-react"
import styles from "./predictive-insights.module.css" // Importez le module CSS

interface PredictedIssue {
  id: string
  sensor_id: string
  issue_type: string
  predicted_date: string
  confidence: number // 0-100
  risk_level: "Élevé" | "Moyen" | "Faible"
  recommended_action: string
  trend_data?: { time: string; value: number }[] // Données pour un graphique de tendance
}

const initialPredictedIssues: PredictedIssue[] = [
  {
    id: "PRED001",
    sensor_id: "temp_01",
    issue_type: "Surchauffe du moteur",
    predicted_date: "2025-08-20",
    confidence: 92,
    risk_level: "Élevé",
    recommended_action: "Vérifier le système de refroidissement et nettoyer les filtres.",
    trend_data: [
      { time: "J-7", value: 70 },
      { time: "J-5", value: 75 },
      { time: "J-3", value: 80 },
      { time: "J-1", value: 85 },
      { time: "Aujourd'hui", value: 90 },
    ],
  },
  {
    id: "PRED002",
    sensor_id: "pressure_02",
    issue_type: "Défaillance de la pompe",
    predicted_date: "2025-09-05",
    confidence: 78,
    risk_level: "Moyen",
    recommended_action: "Planifier une inspection de la pompe et vérifier les joints.",
    trend_data: [
      { time: "J-7", value: 100 },
      { time: "J-5", value: 105 },
      { time: "J-3", value: 110 },
      { time: "J-1", value: 115 },
      { time: "Aujourd'hui", value: 120 },
    ],
  },
  {
    id: "PRED003",
    sensor_id: "flow_03",
    issue_type: "Obstruction du conduit",
    predicted_date: "2025-08-25",
    confidence: 65,
    risk_level: "Moyen",
    recommended_action: "Effectuer un nettoyage préventif du conduit.",
    trend_data: [
      { time: "J-7", value: 50 },
      { time: "J-5", value: 48 },
      { time: "J-3", value: 45 },
      { time: "J-1", value: 42 },
      { time: "Aujourd'hui", value: 40 },
    ],
  },
  {
    id: "PRED004",
    sensor_id: "humidity_04",
    issue_type: "Problème de ventilation",
    predicted_date: "2025-10-01",
    confidence: 45,
    risk_level: "Faible",
    recommended_action: "Surveiller les relevés d'humidité et planifier une vérification annuelle.",
  },
]

export default function PredictiveInsightsPage() {
  const [predictedIssues, setPredictedIssues] = useState(initialPredictedIssues)
  const [activeRiskFilter, setActiveRiskFilter] = useState<"All" | "Élevé" | "Moyen" | "Faible">("All")
  const [searchQuery, setSearchQuery] = useState("")

  const filteredIssues = useMemo(() => {
    let currentIssues = predictedIssues

    if (activeRiskFilter !== "All") {
      currentIssues = currentIssues.filter((issue) => issue.risk_level === activeRiskFilter)
    }

    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase()
      currentIssues = currentIssues.filter(
        (issue) =>
          issue.sensor_id.toLowerCase().includes(lowerCaseQuery) ||
          issue.issue_type.toLowerCase().includes(lowerCaseQuery) ||
          issue.recommended_action.toLowerCase().includes(lowerCaseQuery),
      )
    }

    return currentIssues
  }, [predictedIssues, activeRiskFilter, searchQuery])

  const totalPredictions = predictedIssues.length
  const highRiskPredictions = predictedIssues.filter((issue) => issue.risk_level === "Élevé").length
  const avgConfidence =
    predictedIssues.length > 0
      ? Math.round(predictedIssues.reduce((sum, issue) => sum + issue.confidence, 0) / predictedIssues.length)
      : 0

  return (
    <div className={styles.pageContainer}>
      <div className={styles.flexCol}>
        <main className={styles.mainContent}>
          <div className={`${styles.flexRow} ${styles.gap4} ${styles.mb4}`}>
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Prédictions Actives</h3>
                <TrendingUp className={styles.h4w4} />
              </div>
              <div className={styles.cardContent}>
                <div className={`${styles.text2xl} ${styles.fontBold}`}>{totalPredictions}</div>
                <p className={`${styles.textXs} ${styles.textMutedForeground}`}>Total d&apos;insights prédictifs</p>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Risque Élevé</h3>
                <ShieldAlert className={styles.h4w4} />
              </div>
              <div className={styles.cardContent}>
                <div className={`${styles.text2xl} ${styles.fontBold}`}>{highRiskPredictions}</div>
                <p className={`${styles.textXs} ${styles.textMutedForeground}`}>Nécessite une attention immédiate</p>
              </div>
            </div>

            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>Confiance Moyenne</h3>
                <Clock className={styles.h4w4} />
              </div>
              <div className={styles.cardContent}>
                <div className={`${styles.text2xl} ${styles.fontBold}`}>{avgConfidence}%</div>
                <p className={`${styles.textXs} ${styles.textMutedForeground}`}>
                  Niveau de confiance moyen des prédictions
                </p>
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Insights Prédictifs Détaillés</h2>
            </div>
            <div className={styles.cardContent}>
              <div className={`${styles.flexRow} ${styles.gap4} ${styles.mb4}`}>
                <input
                  type="text"
                  placeholder="Rechercher par capteur, type de problème..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${styles.input} ${styles.maxWSm}`}
                />
                <div className={styles.tabsList}>
                  <button
                    className={`${styles.tabsTrigger} ${activeRiskFilter === "All" ? styles.tabsTriggerActive : ""}`}
                    onClick={() => setActiveRiskFilter("All")}
                  >
                    Tous les risques
                  </button>
                  <button
                    className={`${styles.tabsTrigger} ${activeRiskFilter === "Élevé" ? styles.tabsTriggerActive : ""}`}
                    onClick={() => setActiveRiskFilter("Élevé")}
                  >
                    Élevé
                  </button>
                  <button
                    className={`${styles.tabsTrigger} ${activeRiskFilter === "Moyen" ? styles.tabsTriggerActive : ""}`}
                    onClick={() => setActiveRiskFilter("Moyen")}
                  >
                    Moyen
                  </button>
                  <button
                    className={`${styles.tabsTrigger} ${activeRiskFilter === "Faible" ? styles.tabsTriggerActive : ""}`}
                    onClick={() => setActiveRiskFilter("Faible")}
                  >
                    Faible
                  </button>
                </div>
              </div>

              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                    <tr>
                      <th className={styles.tableHead}>Capteur</th>
                      <th className={styles.tableHead}>Type de Problème</th>
                      <th className={styles.tableHead}>Date Prévue</th>
                      <th className={styles.tableHead}>Confiance</th>
                      <th className={styles.tableHead}>Niveau de Risque</th>
                      <th className={styles.tableHead}>Action Recommandée</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredIssues.length > 0 ? (
                      filteredIssues.map((issue) => (
                        <tr key={issue.id} className={styles.tableRow}>
                          <td className={`${styles.tableCell} ${styles.fontMedium}`}>{issue.sensor_id}</td>
                          <td className={styles.tableCell}>{issue.issue_type}</td>
                          <td className={styles.tableCell}>{issue.predicted_date}</td>
                          <td className={styles.tableCell}>
                            <div className={`${styles.flexRow} ${styles.itemsCenter} ${styles.gap2}`}>
                              <div className={styles.progressBarContainer}>
                                <div className={styles.progressBarFill} style={{ width: `${issue.confidence}%` }}></div>
                              </div>
                              <span className={`${styles.textSm} ${styles.textMutedForeground}`}>
                                {issue.confidence}%
                              </span>
                            </div>
                          </td>
                          <td className={styles.tableCell}>
                            <span
                              className={`${styles.badge} ${
                                issue.risk_level === "Élevé"
                                  ? styles.badgeDestructive
                                  : issue.risk_level === "Moyen"
                                    ? styles.badgeSecondary
                                    : styles.badgeOutline
                              }`}
                            >
                              {issue.risk_level}
                            </span>
                          </td>
                          <td className={`${styles.tableCell} ${styles.maxW200px} ${styles.truncate}`}>
                            {issue.recommended_action}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr className={styles.tableRow}>
                        <td
                          colSpan={6}
                          className={`${styles.tableCell} ${styles.h24} ${styles.textCenter} ${styles.textMutedForeground}`}
                        >
                          Aucun insight prédictif trouvé avec les filtres actuels.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
