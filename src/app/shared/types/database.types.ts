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
      profiles: {
        Row: {
          id: string
          auth_id: string | null
          first_name: string
          last_name: string
          email: string
          role: 'ADMINISTRATOR' | 'COORDINATOR' | 'NURSE' | 'ATTENDANT' | 'MIDWIFE' | 'MEDICAL_TECHNOLOGIST'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string, created_at?: string, updated_at?: string }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      applicants: {
        Row: {
          id: string
          first_name: string
          last_name: string
          age: number | null
          civil_status: string | null
          occupation: string | null
          email: string
          contact_number: string
          address: string
          emergency_contact_name: string | null
          emergency_contact_number: string | null
          medical_history: Json
          lifestyle_history: Json
          donation_preferences: Json
          status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
          review_notes: string | null
          reviewed_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['applicants']['Row'], 'id' | 'created_at' | 'updated_at' | 'medical_history' | 'lifestyle_history' | 'donation_preferences' | 'status'> & { id?: string, created_at?: string, updated_at?: string, medical_history?: Json, lifestyle_history?: Json, donation_preferences?: Json, status?: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' }
        Update: Partial<Database['public']['Tables']['applicants']['Insert']>
      }
      donors: {
        Row: {
          id: string
          applicant_id: string
          donor_number: string
          blood_type: string | null
          status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['donors']['Row'], 'id' | 'created_at' | 'updated_at' | 'status'> & { id?: string, created_at?: string, updated_at?: string, status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' }
        Update: Partial<Database['public']['Tables']['donors']['Insert']>
      }
      collection_schedules: {
        Row: {
          id: string
          donor_id: string
          scheduled_date: string
          location: string
          type: 'HOSPITAL' | 'OUTREACH' | 'HOME'
          status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['collection_schedules']['Row'], 'id' | 'created_at' | 'updated_at' | 'status'> & { id?: string, created_at?: string, updated_at?: string, status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' }
        Update: Partial<Database['public']['Tables']['collection_schedules']['Insert']>
      }
      milk_collections: {
        Row: {
          id: string
          donor_id: string
          schedule_id: string | null
          collection_date: string
          volume_ml: number
          temperature_celsius: number | null
          barcode: string
          collected_by: string | null
          status: 'PENDING_LAB' | 'CLEARED' | 'REJECTED' | 'PASTEURIZED'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['milk_collections']['Row'], 'id' | 'created_at' | 'updated_at' | 'status'> & { id?: string, created_at?: string, updated_at?: string, status?: 'PENDING_LAB' | 'CLEARED' | 'REJECTED' | 'PASTEURIZED' }
        Update: Partial<Database['public']['Tables']['milk_collections']['Insert']>
      }
      laboratory_tests: {
        Row: {
          id: string
          collection_id: string
          test_date: string
          bacterial_count: number | null
          pathogens_detected: boolean | null
          test_notes: string | null
          tested_by: string | null
          status: 'PENDING' | 'PASSED' | 'FAILED'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['laboratory_tests']['Row'], 'id' | 'created_at' | 'updated_at' | 'status'> & { id?: string, created_at?: string, updated_at?: string, status?: 'PENDING' | 'PASSED' | 'FAILED' }
        Update: Partial<Database['public']['Tables']['laboratory_tests']['Insert']>
      }
      pasteurization_batches: {
        Row: {
          id: string
          collection_id: string
          batch_number: string
          start_time: string
          end_time: string | null
          cycle_temperature: number | null
          cycle_duration_minutes: number | null
          operator_id: string | null
          status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['pasteurization_batches']['Row'], 'id' | 'created_at' | 'updated_at' | 'status'> & { id?: string, created_at?: string, updated_at?: string, status?: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' }
        Update: Partial<Database['public']['Tables']['pasteurization_batches']['Insert']>
      }
      inventory: {
        Row: {
          id: string
          pasteurization_batch_id: string
          barcode: string
          volume_ml: number
          storage_location: string
          expiry_date: string
          status: 'QUARANTINED' | 'AVAILABLE' | 'DISPENSED' | 'EXPIRED' | 'DISCARDED'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['inventory']['Row'], 'id' | 'created_at' | 'updated_at' | 'status'> & { id?: string, created_at?: string, updated_at?: string, status?: 'QUARANTINED' | 'AVAILABLE' | 'DISPENSED' | 'EXPIRED' | 'DISCARDED' }
        Update: Partial<Database['public']['Tables']['inventory']['Insert']>
      }
      hospitals: {
        Row: {
          id: string
          name: string
          contact_person: string | null
          contact_email: string | null
          contact_number: string | null
          address: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['hospitals']['Row'], 'id' | 'created_at' | 'updated_at'> & { id?: string, created_at?: string, updated_at?: string }
        Update: Partial<Database['public']['Tables']['hospitals']['Insert']>
      }
      beneficiaries: {
        Row: {
          id: string
          hospital_id: string
          patient_name: string
          parent_name: string | null
          diagnosis: string | null
          required_volume_ml: number
          prescription_date: string
          status: 'PENDING' | 'APPROVED' | 'FULFILLED' | 'REJECTED'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['beneficiaries']['Row'], 'id' | 'created_at' | 'updated_at' | 'status'> & { id?: string, created_at?: string, updated_at?: string, status?: 'PENDING' | 'APPROVED' | 'FULFILLED' | 'REJECTED' }
        Update: Partial<Database['public']['Tables']['beneficiaries']['Insert']>
      }
      dispensing_records: {
        Row: {
          id: string
          beneficiary_id: string
          inventory_id: string
          volume_dispensed_ml: number
          dispensed_date: string
          dispensed_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['dispensing_records']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string }
        Update: Partial<Database['public']['Tables']['dispensing_records']['Insert']>
      }
      hotline_inquiries: {
        Row: {
          id: string
          caller_name: string
          contact_number: string
          inquiry_type: string | null
          message: string
          status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED'
          logged_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['hotline_inquiries']['Row'], 'id' | 'created_at' | 'updated_at' | 'status'> & { id?: string, created_at?: string, updated_at?: string, status?: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' }
        Update: Partial<Database['public']['Tables']['hotline_inquiries']['Insert']>
      }
      audit_logs: {
        Row: {
          id: string
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          changed_by: string | null
          old_data: Json | null
          new_data: Json | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['audit_logs']['Row'], 'id' | 'created_at'> & { id?: string, created_at?: string }
        Update: Partial<Database['public']['Tables']['audit_logs']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      user_role: 'ADMINISTRATOR' | 'COORDINATOR' | 'NURSE' | 'ATTENDANT' | 'MIDWIFE' | 'MEDICAL_TECHNOLOGIST'
      applicant_status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED'
      donor_status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
      schedule_status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
      collection_type: 'HOSPITAL' | 'OUTREACH' | 'HOME'
      collection_status: 'PENDING_LAB' | 'CLEARED' | 'REJECTED' | 'PASTEURIZED'
      test_status: 'PENDING' | 'PASSED' | 'FAILED'
      pasteurization_status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
      inventory_status: 'QUARANTINED' | 'AVAILABLE' | 'DISPENSED' | 'EXPIRED' | 'DISCARDED'
      beneficiary_status: 'PENDING' | 'APPROVED' | 'FULFILLED' | 'REJECTED'
      inquiry_status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED'
      audit_action: 'INSERT' | 'UPDATE' | 'DELETE'
    }
  }
}
