import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./ClientLayout"
import "./globals.css" // Import globals.css at the top of the file

export const metadata: Metadata = {
  title: "Real-time Monitoring App",
  description: "A real-time monitoring application with AI capabilities.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <ClientLayout>{children}</ClientLayout>
}