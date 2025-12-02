import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://doszhbvpoawlgsezbkiz.supabase.co";
const SUPABASE_ANON = "YOUR_ANON_KEY"; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);
