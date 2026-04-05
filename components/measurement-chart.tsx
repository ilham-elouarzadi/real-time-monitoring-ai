"use client"

import { useState } from "react"
import styles from "./measurement-chart.module.css"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts"
import { AlertCircle } from "lucide-react"

interface Measurement {
  id: number
  sensor_id: string
  value: number
  created_at: string
  is_anomaly: boolean
}

interface MeasurementChartProps {
  data: Measurement[]
  showControls?: boolean
}

export default function MeasurementChart({ data, showControls = false }: MeasurementChartProps) {
  const [sensorFilter, setSensorFilter] = useState<string>("all")

  // Extraire les IDs de capteurs uniques
  const sensorIds = Array.from(new Set(data.map((m) => m.sensor_id)))

  // Filtrer les données selon les sélections
  const filteredData = data.filter((measurement) => {
    if (sensorFilter !== "all" && measurement.sensor_id !== sensorFilter) {
      return false
    }
    return true
  })

  // Formater les données pour le graphique
  const chartData = filteredData
    .map((m) => ({
      time: new Date(m.created_at).toLocaleTimeString("fr-FR"),
      value: m.value,
      isAnomaly: m.is_anomaly,
      sensor: m.sensor_id,
    }))
    .reverse()
    .slice(0, 50) // Limiter à 50 points pour la performance

  // Calculer les seuils d'anomalie
  const values = filteredData.map((m) => m.value)
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length
  const stdDev = Math.sqrt(values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length)
  const upperThreshold = mean + 2 * stdDev
  const lowerThreshold = mean - 2 * stdDev

  return (
    <div className={styles.chartContainer}>
      {showControls && (
        <div className={styles.controls}>
          <select
            value={sensorFilter}
            onChange={(e) => setSensorFilter(e.target.value)}
            className={styles.sensorSelect}
          >
            <option value="all">Tous les capteurs</option>
            {sensorIds.map((id) => (
              <option key={id} value={id}>{`Capteur ${id}`}</option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" tick={{ fontSize: 12 }} interval="preserveStartEnd" minTickGap={10} />
            <YAxis />
            <Tooltip
              formatter={(value, name) => [`${value}`, name === "value" ? "Valeur" : name]}
              labelFormatter={(label) => `Temps: ${label}`}
            />
            <Legend />
            <ReferenceLine y={upperThreshold} stroke="red" strokeDasharray="3 3" label="Seuil sup." />
            <ReferenceLine y={lowerThreshold} stroke="red" strokeDasharray="3 3" label="Seuil inf." />
            <Line
              type="monotone"
              dataKey="value"
              name="Valeur"
              stroke="#3b82f6"
              activeDot={{ r: 8 }}
              dot={(props) => {
                const { cx, cy, payload } = props
                return payload.isAnomaly ? (
                  <circle cx={cx} cy={cy} r={4} fill="red" stroke="none" />
                ) : (
                  <circle cx={cx} cy={cy} r={3} fill="#3b82f6" stroke="none" />
                )
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {filteredData.some((m) => m.is_anomaly) && (
        <div className={styles.anomalyWarning}>
          <AlertCircle className={styles.warningIcon} />
          Des anomalies ont été détectées (points rouges sur le graphique)
        </div>
      )}
    </div>
  )
}