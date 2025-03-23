import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL e Anon Key são necessários');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para as tabelas
export type CompletedContract = {
  id: number;
  title: string;
  customer_name: string;
  salesperson_name: string;
  value: number;
  currency: string;
  completed_at: string;
  completed_by: string;
  created_at: string;
};

export type ActiveSession = {
  id: string;
  user_id: string;
  last_active: string;
  created_at: string;
}; 