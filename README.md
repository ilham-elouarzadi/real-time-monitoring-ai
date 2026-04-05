# Monitoring System - IA de surveillance en temps réel

## Description
**Monitoring System** est une application web de surveillance en temps réel intégrant l’IA pour l’analyse, la visualisation et l’aide à la décision des données critiques.  
Elle permet de suivre des flux de données en direct, générer des graphiques dynamiques et alerter les utilisateurs en cas d’anomalies.

---

## Fonctionnalités principales
- Surveillance en temps réel des données via WebSocket (Socket.io)  
- Visualisation graphique des données avec **Recharts**  
- Gestion et authentification des utilisateurs avec **Supabase**  
- Interface utilisateur moderne et responsive avec **Next.js**, **React** et **Tailwind CSS**  
- Support des dates et calendriers avec **date-fns** et **react-day-picker**  
- Icônes et composants UI avec **lucide-react** et **react-icons**  

---

## Stack technique
- **Frontend :** Next.js (React 18) + TypeScript  
- **Styling :** Tailwind CSS + tailwind-merge + tailwindcss-animate  
- **Graphiques :** Recharts  
- **Backend / Base de données :** Supabase (authentification, stockage, realtime)  
- **Temps réel :** Socket.io-client  
- **Utilitaires :** date-fns, clsx, class-variance-authority  
- **Linting :** ESLint, eslint-config-next  

---

## Installation et démarrage

1. **Cloner le dépôt**
```bash
git clone https://github.com/<ilham-elouarzadi>/monitoring-system.git
cd monitoring-system
