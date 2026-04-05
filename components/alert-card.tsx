"use client"

import styles from "./alert-card.module.css" // Importez le module CSS
// Supprimez l'importation de cn car il n'est plus nécessaire
// import { cn } from "@/lib/utils"

interface AlertCardProps {
  id: string
  severity: "HIGH" | "MEDIUM" | "LOW"
  timestamp: string
  description: string
  status: "Nouvelle" | "Résolue" | "Acquittée"
  onResolve: (id: string) => void
}

export function AlertCard({ id, severity, timestamp, description, status, onResolve }: AlertCardProps) {
  const severityColorClass = {
    HIGH: styles.badgeHigh,
    MEDIUM: styles.badgeMedium,
    LOW: styles.badgeLow,
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.flexBetween}>
          <div className={styles.flexGap2}>
            {/* Appliquez les classes directement */}
            <span className={`${styles.badge} ${severityColorClass[severity]}`}>{severity}</span>
            <span className={styles.timestamp}>{timestamp}</span>
          </div>
          {status === "Nouvelle" && (
            <button className={styles.button} onClick={() => onResolve(id)}>
              Résoudre
            </button>
          )}
          {status === "Acquittée" && <span className={`${styles.badge} ${styles.badgeSecondary}`}>Acquittée</span>}
          {status === "Résolue" && <span className={`${styles.badge} ${styles.badgeOutline}`}>Résolue</span>}
        </div>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  )
}