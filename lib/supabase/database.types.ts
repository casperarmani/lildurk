export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          user_id: string
          title: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          content: string
          role: 'user' | 'assistant'
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          content: string
          role: 'user' | 'assistant'
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          content?: string
          role?: 'user' | 'assistant'
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          subscription_status: 'free' | 'basic' | 'pro'
          subscription_end_date: string | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          subscription_status?: 'free' | 'basic' | 'pro'
          subscription_end_date?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          subscription_status?: 'free' | 'basic' | 'pro'
          subscription_end_date?: string | null
          created_at?: string
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