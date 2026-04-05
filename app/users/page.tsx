"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { MoreHorizontal, UserPlus } from "lucide-react"
import styles from "./users.module.css" // Importez le module CSS

interface User {
  id: string
  name: string
  email: string
  role: "Administrateur" | "Opérateur" | "Observateur"
  status: "Actif" | "Inactif"
  last_login: string
}

const initialUsers: User[] = [
  {
    id: "user_001",
    name: "Ilham ELOUARZADI ",
    email: "ilham.elouarzadi@example.com",
    role: "Administrateur",
    status: "Actif",
    last_login: "2025-08-11 15:00:00",
  },
  {
    id: "user_002",
    name: "Sandia SABIRI",
    email: "sandia.sabiri@example.com",
    role: "Opérateur",
    status: "Actif",
    last_login: "2025-08-11 14:30:00",
  },
  {
    id: "user_003",
    name: "Walid Bennani",
    email: "walid.bennani@example.com",
    role: "Observateur",
    status: "Actif",
    last_login: "2025-08-10 09:00:00",
  },
  {
    id: "user_004",
    name: "Diana Rossi",
    email: "diana.rossi@example.com",
    role: "Opérateur",
    status: "Inactif",
    last_login: "2025-08-05 11:00:00",
  },
]

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null) // Pour gérer l'ouverture des dropdowns

  const handleAddUser = (newUser: Omit<User, "id" | "last_login" | "status">) => {
    const id = `user_${Date.now()}`
    setUsers([...users, { ...newUser, id, status: "Actif", last_login: "Jamais" }])
    setIsAddDialogOpen(false)
  }

  const handleEditUser = (updatedUser: User) => {
    setUsers(users.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
    setIsEditDialogOpen(false)
    setCurrentUser(null)
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((u) => u.id !== id))
  }

  const handleStatusChange = (id: string, newStatus: User["status"]) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, status: newStatus } : u)))
    setOpenDropdownId(null) // Fermer le dropdown après action
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
      <div className={`${styles.flexCol} sm:gap-4 sm:py-4 sm:pl-14`}>
        <main className={styles.mainContent}>
          <div className={styles.card}>
            <div className={`${styles.cardHeader} ${styles.flexRow} ${styles.itemsCenter} ${styles.justifyBetween}`}>
              <h2 className={styles.cardTitle}>Gestion des Utilisateurs</h2>
              <button
                className={`${styles.button} ${styles.buttonSmall} ${styles.gap1}`}
                onClick={() => setIsAddDialogOpen(true)}
              >
                <UserPlus className={`${styles.h35w35}`} />
                <span className={`${styles.srOnly} ${styles.smNotSrOnly} ${styles.smWhitespaceNowrap}`}>
                  Ajouter un utilisateur
                </span>
              </button>
            </div>
            <div className={styles.cardContent}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.tableHead}>Nom</th>
                    <th className={styles.tableHead}>Email</th>
                    <th className={styles.tableHead}>Rôle</th>
                    <th className={styles.tableHead}>Statut</th>
                    <th className={styles.tableHead}>Dernière Connexion</th>
                    <th className={`${styles.tableHead} ${styles.tableCellRight}`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className={styles.tableRow}>
                      <td className={`${styles.tableCell} ${styles.tableCellFontMedium}`}>{user.name}</td>
                      <td className={styles.tableCell}>{user.email}</td>
                      <td className={styles.tableCell}>
                        <span
                          className={`${styles.badge} ${
                            user.role === "Administrateur"
                              ? styles.badgeDefault
                              : user.role === "Opérateur"
                                ? styles.badgeSecondary
                                : styles.badgeOutline
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <span
                          className={`${styles.badge} ${
                            user.status === "Actif" ? styles.badgeDefault : styles.badgeDestructive
                          }`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className={styles.tableCell}>{user.last_login}</td>
                      <td className={`${styles.tableCell} ${styles.tableCellRight}`}>
                        <div className={styles.dropdownMenu} ref={openDropdownId === user.id ? dropdownRef : null}>
                          <button
                            className={`${styles.buttonIcon}`}
                            onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                            aria-haspopup="true"
                            aria-expanded={openDropdownId === user.id}
                          >
                            <MoreHorizontal className={`${styles.h4w4}`} />
                            <span className={styles.srOnly}>Toggle menu</span>
                          </button>
                          {openDropdownId === user.id && (
                            <ul className={styles.dropdownContent}>
                              <li
                                className={styles.dropdownMenuItem}
                                onClick={() => {
                                  setCurrentUser(user)
                                  setIsEditDialogOpen(true)
                                  setOpenDropdownId(null)
                                }}
                              >
                                Modifier
                              </li>
                              <li
                                className={styles.dropdownMenuItem}
                                onClick={() => handleStatusChange(user.id, "Actif")}
                              >
                                Activer
                              </li>
                              <li
                                className={styles.dropdownMenuItem}
                                onClick={() => handleStatusChange(user.id, "Inactif")}
                              >
                                Désactiver
                              </li>
                              <li
                                className={styles.dropdownMenuItem}
                                onClick={() => {
                                  handleDeleteUser(user.id)
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

          {/* Dialog pour l'ajout d'utilisateur */}
          {isAddDialogOpen && (
            <div className={styles.dialogOverlay}>
              <div className={styles.dialogContent}>
                <div className={styles.dialogHeader}>
                  <h3 className={styles.dialogTitle}>Ajouter un nouvel utilisateur</h3>
                  <p className={styles.dialogDescription}>Remplissez les détails du nouvel utilisateur.</p>
                </div>
                <UserForm onSubmit={handleAddUser} onCancel={() => setIsAddDialogOpen(false)} />
              </div>
            </div>
          )}

          {/* Dialog pour l'édition d'utilisateur */}
          {isEditDialogOpen && currentUser && (
            <div className={styles.dialogOverlay}>
              <div className={styles.dialogContent}>
                <div className={styles.dialogHeader}>
                  <h3 className={styles.dialogTitle}>Modifier l&apos;utilisateur</h3>
                  <p className={styles.dialogDescription}>Mettez à jour les détails de l&apos;utilisateur.</p>
                </div>
                <UserForm user={currentUser} onSubmit={handleEditUser} onCancel={() => setIsEditDialogOpen(false)} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// Composant de formulaire pour ajouter/modifier un utilisateur
interface UserFormProps {
  user?: Omit<User, "last_login" | "status"> // Pour l'édition, l'ID est présent
  onSubmit: (user: Omit<User, "last_login" | "status">) => void
  onCancel: () => void
}

function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const [name, setName] = useState(user?.name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [role, setRole] = useState<User["role"]>(user?.role || "Observateur")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ id: user?.id || "", name, email, role })
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
          <label htmlFor="email" className={styles.label}>
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.formRow}>
          <label htmlFor="role" className={styles.label}>
            Rôle
          </label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as User["role"])}
            className={styles.select}
          >
            <option value="Administrateur">Administrateur</option>
            <option value="Opérateur">Opérateur</option>
            <option value="Observateur">Observateur</option>
          </select>
        </div>
        {!user && ( // Champ mot de passe uniquement pour l'ajout
          <div className={styles.formRow}>
            <label htmlFor="password" className={styles.label}>
              Mot de passe
            </label>
            <input id="password" type="password" className={styles.input} required />
          </div>
        )}
      </div>
      <div className={styles.dialogFooter}>
        <button type="button" className={styles.button} onClick={onCancel} style={{ marginRight: "0.5rem" }}>
          Annuler
        </button>
        <button type="submit" className={styles.button}>
          {user ? "Enregistrer les modifications" : "Ajouter"}
        </button>
      </div>
    </form>
  )
}
