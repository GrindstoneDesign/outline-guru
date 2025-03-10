
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://lndmmhjkbzejubovsqki.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxuZG1taGprYnplanVib3ZzcWtpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk4MjMzMzEsImV4cCI6MjA1NTM5OTMzMX0.oDYxFyv9hXiS_bFR37YGruHGpnxZQXB-_cGZlepAlao";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

// Public Stripe key for the frontend
export const STRIPE_PUBLIC_KEY = "pk_test_51OrXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
