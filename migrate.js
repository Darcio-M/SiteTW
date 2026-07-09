import { createClient } from "@supabase/supabase-js";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

// --- CONFIGURAÇÕES ---
const SUPABASE_URL = "SUA_URL_DO_SUPABASE";
const SUPABASE_KEY = "SUA_CHAVE_DO_SUPABASE";

const FIREBASE_CONFIG = {
  projectId: "iron-hull-2lsxp",
  appId: "1:874367985214:web:c086c100b984298afb536f",
  apiKey: "AIzaSyCfYfuyCrze3OqnmdiGurHlf3hFPN8ASMQ",
  authDomain: "iron-hull-2lsxp.firebaseapp.com",
};
const FIREBASE_DB_ID = "ai-studio-90af5963-aa9c-4ddb-a1e4-b6e2d3bc3442";

// --- INICIALIZAÇÃO ---
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const app = initializeApp(FIREBASE_CONFIG);
const db = getFirestore(app, FIREBASE_DB_ID);

async function migrate() {
  console.log("Iniciando migração dos produtos...");

  // 1. Busca os dados no Supabase
  const { data: products, error } = await supabase.from("products").select("*");
  if (error) {
    console.error("Erro ao buscar no Supabase:", error.message);
    return;
  }

  console.log(`Encontrados ${products.length} produtos. Copiando para o Firebase...`);

  // 2. Salva no Firebase
  for (const p of products) {
    try {
      await setDoc(doc(db, "products", p.id), p);
      console.log(`✅ Produto copiado: ${p.name}`);
    } catch (err) {
      console.error(`❌ Erro ao copiar ${p.name}:`, err.message);
    }
  }

  console.log("Migração das categorias...");
  const { data: categories, error: catError } = await supabase.from("categories").select("*");
  if (!catError && categories) {
    for (const c of categories) {
      await setDoc(doc(db, "categories", c.id), c);
      console.log(`✅ Categoria copiada: ${c.name}`);
    }
  }

  console.log("Migração concluída com sucesso!");
}

migrate();
