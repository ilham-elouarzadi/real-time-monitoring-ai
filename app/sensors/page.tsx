"use client"

import type React from "react"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, PlusCircle } from "lucide-react"
import styles from "./sensors.module.css" // Importez le module CSS

interface Sensor {
  id: string
  name: string
  type: string
  location: string
  status: "Actif" | "Inactif" | "Maintenance"
  last_reading_at: string
  imageUrl?: string
}

// Données de capteurs simulées
const initialSensors: Sensor[] = [
  {
    id: "temp_01",
    name: "Capteur Température Salle Serveur",
    type: "Température",
    location: "Salle Serveur A",
    status: "Actif",
    last_reading_at: "2025-08-11 15:30:00",
    imageUrl: "/images/sensor-placeholder.png",
  },
  {
    id: "pressure_02",
    name: "Capteur Pression Ligne 1",
    type: "Pression",
    location: "Usine - Ligne Production 1",
    status: "Actif",
    last_reading_at: "2025-08-11 15:29:45",
    imageUrl: "/images/sensor-placeholder.png",
  },
  {
    id: "flow_03",
    name: "Capteur Débit Eau Refroidissement",
    type: "Débit",
    location: "Système de Refroidissement",
    status: "Maintenance",
    last_reading_at: "2025-08-10 10:00:00",
    imageUrl: "/images/sensor-placeholder.png",
  },
  {
    id: "humidity_04",
    name: "Capteur Humidité Entrepôt",
    type: "Humidité",
    location: "Entrepôt Principal",
    status: "Inactif",
    last_reading_at: "2025-08-09 09:00:00",
    imageUrl: "/images/sensor-placeholder.png",
  },
]

export default function SensorsPage() {
  const [sensors, setSensors] = useState<Sensor[]>(initialSensors)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentSensor, setCurrentSensor] = useState<Sensor | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null)

  const handleAddSensor = (newSensor: Omit<Sensor, "id" | "last_reading_at">) => {
    const id = `sensor_${Date.now()}`
    setSensors([...sensors, { ...newSensor, id, status: "Actif", last_reading_at: new Date().toLocaleString("fr-FR") }])
    setIsAddDialogOpen(false)
  }

  const handleEditSensor = (updatedSensor: Sensor) => {
    setSensors(sensors.map((s) => (s.id === updatedSensor.id ? updatedSensor : s)))
    setIsEditDialogOpen(false)
    setCurrentSensor(null)
  }

  const handleDeleteSensor = (id: string) => {
    setSensors(sensors.filter((s) => s.id !== id))
  }

  const handleStatusChange = (id: string, newStatus: Sensor["status"]) => {
    setSensors(sensors.map((s) => (s.id === id ? { ...s, status: newStatus } : s)))
    setOpenDropdownId(null)
  }

  // Gérer la fermeture du dropdown si on clique en dehors
  const dropdownRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [dropdownRef])

  return (
    <div className={styles.pageContainer}>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
        <main className={styles.mainContent}>
          <div className={styles.card}>
            <div className={`${styles.cardHeader} ${styles.flexRow} ${styles.itemsCenter} ${styles.justifyBetween}`}>
              <h2 className={styles.cardTitle}>Gestion des Capteurs</h2>
              <button
                className={`${styles.button} ${styles.buttonSmall} ${styles.gap1}`}
                onClick={() => setIsAddDialogOpen(true)}
              >
                <PlusCircle className={`${styles.h35w35}`} />
                <span className={`${styles.srOnly} ${styles.smNotSrOnly} ${styles.smWhitespaceNowrap}`}>
                  Ajouter un capteur
                </span>
              </button>
            </div>
            <div className={styles.cardContent}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.tableHead}>Image</th>
                    <th className={styles.tableHead}>ID</th>
                    <th className={styles.tableHead}>Nom</th>
                    <th className={styles.tableHead}>Type</th>
                    <th className={styles.tableHead}>Emplacement</th>
                    <th className={styles.tableHead}>Statut</th>
                    <th className={styles.tableHead}>Dernière Lecture</th>
                    <th className={`${styles.tableHead} ${styles.tableCellRight}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sensors.map((sensor) => (
                    <tr key={sensor.id} className={styles.tableRow}>
                      <td className={styles.tableCell}>
                        <Image
                          src={sensor.imageUrl || "/images/sensor-placeholder.png"}
                          alt={`Image du capteur ${sensor.name}`}
                          width={40}
                          height={40}
                          className="rounded-md object-cover"
                        />
                      </td>
                      <td className={`${styles.tableCell} ${styles.tableCellFontMedium}`}>{sensor.id}</td>
                      <td className={styles.tableCell}>{sensor.name}</td>
                      <td className={styles.tableCell}>{sensor.type}</td>
                      <td className={styles.tableCell}>{sensor.location}</td>
                      <td className={styles.tableCell}>
                        <span
                          className={`${styles.badge} ${
                            sensor.status === "Actif"
                              ? styles.badgeDefault
                              : sensor.status === "Maintenance"
                                ? styles.badgeSecondary
                                : styles.badgeOutline
                          }`}
                        >
                          {sensor.status}
                        </span>
                      </td>
                      <td className={styles.tableCell}>{sensor.last_reading_at}</td>
                      <td className={`${styles.tableCell} ${styles.tableCellRight}`}>
                        <div className={styles.dropdownMenu} ref={openDropdownId === sensor.id ? dropdownRef : null}>
                          <button
                            className={`${styles.buttonIcon}`}
                            onClick={() => setOpenDropdownId(openDropdownId === sensor.id ? null : sensor.id)}
                            aria-haspopup="true"
                            aria-expanded={openDropdownId === sensor.id}
                          >
                            <MoreHorizontal className={`${styles.h4w4}`} />
                            <span className={styles.srOnly}>Toggle menu</span>
                          </button>
                          {openDropdownId === sensor.id && (
                            <ul className={styles.dropdownContent}>
                              <li
                                className={styles.dropdownMenuItem}
                                onClick={() => {
                                  setCurrentSensor(sensor)
                                  setIsEditDialogOpen(true)
                                  setOpenDropdownId(null)
                                }}
                              >
                                Modifier
                              </li>
                              <li
                                className={styles.dropdownMenuItem}
                                onClick={() => handleStatusChange(sensor.id, "Actif")}
                              >
                                Marquer Actif
                              </li>
                              <li
                                className={styles.dropdownMenuItem}
                                onClick={() => handleStatusChange(sensor.id, "Maintenance")}
                              >
                                Marquer Maintenance
                              </li>
                              <li
                                className={styles.dropdownMenuItem}
                                onClick={() => handleStatusChange(sensor.id, "Inactif")}
                              >
                                Marquer Inactif
                              </li>
                              <li
                                className={styles.dropdownMenuItem}
                                onClick={() => {
                                  handleDeleteSensor(sensor.id)
                                  setOpenDropdownId(null)
                                }}
                              >
                                Supprimer
                              </li>
                            </ul>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dialog pour l'ajout de capteur */}
          {isAddDialogOpen && (
            <div className={styles.dialogOverlay}>
              <div className={styles.dialogContent}>
                <div className={styles.dialogHeader}>
                  <h3 className={styles.dialogTitle}>Ajouter un nouveau capteur</h3>
                  <p className={styles.dialogDescription}>Remplissez les détails du nouveau capteur.</p>
                </div>
                <SensorForm onSubmit={handleAddSensor} onCancel={() => setIsAddDialogOpen(false)} />
              </div>
            </div>
          )}

          {/* Dialog pour l'édition de capteur */}
          {isEditDialogOpen && currentSensor && (
            <div className={styles.dialogOverlay}>
              <div className={styles.dialogContent}>
                <div className={styles.dialogHeader}>
                  <h3 className={styles.dialogTitle}>Modifier le capteur</h3>
                  <p className={styles.dialogDescription}>Mettez à jour les détails du capteur.</p>
                </div>
                <SensorForm
                  sensor={currentSensor}
                  onSubmit={handleEditSensor}
                  onCancel={() => setIsEditDialogOpen(false)}
                />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// Composant de formulaire pour ajouter/modifier un capteur
interface SensorFormProps {
  sensor?: Omit<Sensor, "last_reading_at">
  onSubmit: (sensor: Omit<Sensor, "last_reading_at">) => void
  onCancel: () => void
}

function SensorForm({ sensor, onSubmit, onCancel }: SensorFormProps) {
  const [name, setName] = useState(sensor?.name || "")
  const [type, setType] = useState(sensor?.type || "")
  const [location, setLocation] = useState(sensor?.location || "")
  const [status, setStatus] = useState<Sensor["status"]>(sensor?.status || "Actif")
  const [imageUrl, setImageUrl] = useState(sensor?.imageUrl || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ id: sensor?.id || "", name, type, location, status, imageUrl })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className={`${styles.formGrid} ${styles.py4}`}>
        <div className={styles.formRow}>
          <label htmlFor="name" className={styles.label}>
            Nom
          </label>
          <input id="name" value={name} onChange={(e) => setName(e.target.value)} className={styles.input} required />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="type" className={styles.label}>
            Type
          </label>
          <input id="type" value={type} onChange={(e) => setType(e.target.value)} className={styles.input} required />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="location" className={styles.label}>
            Emplacement
          </label>
          <input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="imageUrl" className={styles.label}>
            URL de l&apos;image
          </label>
          <div className={`${styles.flexCol} ${styles.gap2}`}>
            <input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/sensor.jpg"
              className={styles.input}
            />
            {imageUrl && (
              <Image
                src={imageUrl || "/placeholder.svg"}
                alt="Aperçu de l'image du capteur"
                width={100}
                height={100}
                className="rounded-md object-cover border"
              />
            )}
            <p className="text-xs text-gray-500">
              Pour une application réelle, vous utiliseriez un champ d&apos;upload de fichier (ex: avec Vercel Blob).
            </p>
          </div>
        </div>
        {sensor && (
          <div className={styles.formRow}>
            <label htmlFor="status" className={styles.label}>
              Statut
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as Sensor["status"])}
              className={styles.select}
            >
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
              <option value="Maintenance">Maintenance</option>
            </select>
          </div>
        )}
      </div>
      <div className={styles.dialogFooter}>
        <button type="button" className={styles.button} onClick={onCancel} style={{ marginRight: "0.5rem" }}>
          Annuler
        </button>
        <button type="submit" className={styles.button}>
          {sensor ? "Enregistrer les modifications" : "Ajouter"}
        </button>
      </div>
    </form>
  )
}
