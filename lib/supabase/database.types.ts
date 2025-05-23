export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          weight: number | null;
          height: number | null;
          age: number | null;
          gender: string | null;
          bmi: number | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          weight?: number | null;
          height?: number | null;
          age?: number | null;
          gender?: string | null;
          bmi?: number | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          weight?: number | null;
          height?: number | null;
          age?: number | null;
          gender?: string | null;
          bmi?: number | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          date: string;
          duration: number;
          exercises: string;
          created_at: string;
          updated_at: string | null;
          is_favorite: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          date: string;
          duration: number;
          exercises: string;
          created_at?: string;
          updated_at?: string | null;
          is_favorite?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          date?: string;
          duration?: number;
          exercises?: string;
          created_at?: string;
          updated_at?: string | null;
          is_favorite?: boolean;
        };
      };
      schedules: {
        Row: {
          id: string;
          user_id: string;
          monday: string | null;
          tuesday: string | null;
          wednesday: string | null;
          thursday: string | null;
          friday: string | null;
          saturday: string | null;
          sunday: string | null;
          created_at: string;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          monday?: string | null;
          tuesday?: string | null;
          wednesday?: string | null;
          thursday?: string | null;
          friday?: string | null;
          saturday?: string | null;
          sunday?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          monday?: string | null;
          tuesday?: string | null;
          wednesday?: string | null;
          thursday?: string | null;
          friday?: string | null;
          saturday?: string | null;
          sunday?: string | null;
          created_at?: string;
          updated_at?: string | null;
        };
      };
      backups: {
        Row: {
          id: string;
          user_id: string;
          file_id: string;
          file_name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          file_id: string;
          file_name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          file_id?: string;
          file_name?: string;
          created_at?: string;
        };
      };
    };
  };
}
