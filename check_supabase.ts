import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.log("No env");
  process.exit(1);
}
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from("products").select("id").limit(1);
  if (error) {
    console.error(error.message);
  } else {
    console.log("Supabase connected! Found data:", data);
  }
}
run();
