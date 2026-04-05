'use client'

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import styles from "./login-form.module.css"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const supabase = createClient()

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setMessage(null)

    console.log("Tentative de connexion avec:", { email, password });

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log("Réponse de Supabase - Erreur:", error);

    if (error) {
      setMessage({ type: "error", text: error.message })
      console.error("Erreur de connexion:", error.message);
    } else {
      setMessage({ type: "success", text: "Connexion réussie ! Redirection..." })
      console.log("Connexion réussie. Redirection en cours...");
      setTimeout(() => {
        window.location.href = "/"
      }, 1500)
    }
    setLoading(false)
    console.log("Loading state après connexion:", false);
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Nouveau titre pour l'application sur la page de connexion */}
        <h1 className={styles.appTitle}>StreamWatch</h1> {/* <-- AJOUTÉ ICI */}
        <h2 className={styles.title}>Connexion</h2> {/* <-- MODIFIÉ EN H2 */}
        <form onSubmit={handleSignIn} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
              disabled={loading}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              disabled={loading}
            />
          </div>
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>
        {message && (
          <div className={`${styles.message} ${message.type === "success" ? styles.success : styles.error}`}>
            {message.text}
          </div>
        )}
      </div>
    </div>
  )
}
