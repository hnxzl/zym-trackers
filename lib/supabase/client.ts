import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export const createClient = () => {
  const supabaseUrl = "https://fmguyccbzagntdarepby.supabase.co";
  const supabaseKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtZ3V5Y2NiemFnbnRkYXJlcGJ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2MTYyNjcsImV4cCI6MjA1OTE5MjI2N30.eQhUFFLuiBFEzGSMbj33IONyW0JYTdnSXdzvukezVAc";

  return createSupabaseClient(supabaseUrl, supabaseKey);
};
