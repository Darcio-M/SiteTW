import { createClient } from "@supabase/supabase-js";

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.log("No env");
  process.exit(1);
}
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from("products").select("id, name, imageUrl, imageUrls, description");
  if (error) {
    console.error(error);
    return;
  }
  let totalLength = 0;
  for (const p of data) {
    const len = (p.imageUrl?.length || 0) + JSON.stringify(p.imageUrls || []).length + (p.description?.length || 0);
    totalLength += len;
    if (len > 1000) {
      console.log(`Product ${p.id} (${p.name}) has large data! Length: ${len}`);
      if (p.imageUrl?.startsWith("data:image")) {
        console.log(`- imageUrl is a base64 string!`);
      }
    }
  }
  console.log("Total products:", data.length);
  console.log("Total characters in data:", totalLength);
}
run();
