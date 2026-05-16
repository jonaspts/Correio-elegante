import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://ttepxixmaegnkeucodgq.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0ZXB4aXhtYWVnbmtldWNvZGdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg4NjQ2MjAsImV4cCI6MjA5NDQ0MDYyMH0.Sd28kkHguzGUAEcy0jZ529Xg8PJnApHj4v_PURDVMfw";

export const supabase = createClient(supabaseUrl, supabaseKey);