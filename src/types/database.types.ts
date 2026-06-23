/**
 * Supabase Database type definitions.
 *
 * This is a minimal scaffold. For full type safety, generate these types
 * from your actual Supabase schema by running:
 *
 *   npx supabase gen types typescript --project-id <your-project-id> > src/types/database.types.ts
 *
 * The profiles table definition below matches the expected schema
 * and is used to type the Supabase client and profile queries.
 */

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          role: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          role?: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          first_name?: string;
          last_name?: string;
          email?: string;
          role?: string;
          is_active?: boolean;
          created_at?: string;
        };
      };
      donors: {
        Row: {
          donor_id: string;
          first_name: string;
          last_name: string;
          age: number | null;
          civil_status: string | null;
          occupation: string | null;
          email: string | null;
          contact_number: string | null;
          address: string | null;
          emergency_contact_name: string | null;
          emergency_contact_number: string | null;
          status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'INACTIVE';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['donors']['Row'], 'donor_id' | 'status' | 'created_at' | 'updated_at'> & {
          donor_id?: string;
          status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'INACTIVE';
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['donors']['Row']>;
      };
      donor_applications: {
        Row: {
          application_id: string;
          donor_id: string;
          form_data: Record<string, unknown>;
          review_status: 'PENDING' | 'APPROVED' | 'REJECTED';
          review_notes: string | null;
          reviewed_by: string | null;
          submitted_at: string;
          reviewed_at: string | null;
        };
        Insert: Omit<Database['public']['Tables']['donor_applications']['Row'], 'application_id' | 'review_status' | 'submitted_at' | 'reviewed_at'> & {
          application_id?: string;
          review_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
          submitted_at?: string;
          reviewed_at?: string | null;
        };
        Update: Partial<Database['public']['Tables']['donor_applications']['Row']>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
