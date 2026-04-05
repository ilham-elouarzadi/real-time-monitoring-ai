export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      measurements: {
        Row: {
          id: number
          sensor_id: string
          value: number
          created_at: string
          is_anomaly: boolean
        }
        Insert: {
          id?: number
          sensor_id: string
          value: number
          created_at?: string
          is_anomaly?: boolean
        }
        Update: {
          id?: number
          sensor_id?: string
          value?: number
          created_at?: string
          is_anomaly?: boolean
        }
      }
      alerts: {
        Row: {
          id: number
          message: string
          severity: "low" | "medium" | "high"
          created_at: string
          resolved: boolean
        }
        Insert: {
          id?: number
          message: string
          severity?: "low" | "medium" | "high"
          created_at?: string
          resolved?: boolean
        }
        Update: {
          id?: number
          message?: string
          severity?: "low" | "medium" | "high"
          created_at?: string
          resolved?: boolean
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}