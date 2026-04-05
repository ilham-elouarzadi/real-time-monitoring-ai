"use client"

import type React from "react"
import { Inter } from "next/font/google"
import Link from "next/link"
import { usePathname } from "next/navigation"
import styles from "./layout.module.css"
import "./globals.css" // Assurez-vous que ce fichier existe pour les styles globaux

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const showSidebar = pathname !== "/login" // La sidebar n'apparaît pas sur la page de connexion

  return (
    <html lang="fr">
      <body className={inter.className}>
        <div className={styles.appContainer}>
          {showSidebar && (
            <aside className={styles.sidebar}>
              <div className={styles.sidebarHeader}>
                <h1 className={styles.sidebarTitle}>StreamWatch App</h1> {/* Titre mis à jour */}
              </div>
              <nav className={styles.sidebarNav}>
                <Link
                  href="/dashboard"
                  className={`${styles.navLink} ${pathname === "/dashboard" ? styles.navLinkActive : ""}`}
                >
                  Tableau de bord
                </Link>
                {/*<Link
                  href="/alerts"
                  className={`${styles.navLink} ${pathname === "/alerts" ? styles.navLinkActive : ""}`}
                >
                  Alertes
                </Link>*/}
                <Link
                  href="/sensors"
                  className={`${styles.navLink} ${pathname === "/sensors" ? styles.navLinkActive : ""}`}
                >
                  Capteurs
                </Link>
                <Link
                  href="/predictive-insights"
                  className={`${styles.navLink} ${pathname === "/predictive-insights" ? styles.navLinkActive : ""}`}
                >
                  Insights Prédictifs
                </Link>
                <Link
                  href="/users"
                  className={`${styles.navLink} ${pathname === "/users" ? styles.navLinkActive : ""}`}
                >
                  Utilisateurs
                </Link>
              </nav>
              <div className={styles.sidebarFooter}>
                <span className={styles.statusText}>Connecté</span>
                <button className={styles.disconnectButton}>Se déconnecter</button>
              </div>
            </aside>
          )}
          <main className={styles.mainContentWrapper}>{children}</main>
        </div>
      </body>
    </html>
  )
}