import { createClient } from "@supabase/supabase-js";

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "");
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

let client = null;
try {
  if (supabaseUrl.startsWith("http") && supabaseAnonKey) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.error("Failed to initialize Supabase client:", e);
}

export const supabase = client;

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return {
      success: false,
      error:
        "Supabase não está configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel da Vercel.",
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return { success: true };
  } catch (error: any) {
    console.error(error);
    const errorMsg =
      typeof error.message === "string" ? error.message : JSON.stringify(error);

    if (errorMsg.includes("Invalid login credentials")) {
      return { success: false, error: "Email ou senha incorretos." };
    }

    if (errorMsg.includes("Email not confirmed")) {
      return {
        success: false,
        error:
          'Email não confirmado.\n\nPara o painel de administração, você pode desativar a confirmação de email:\n1. Acesse o painel do Supabase\n2. Vá em Authentication > Providers > Email\n3. Desmarque a opção "Confirm email" e salve.',
      };
    }

    return { success: false, error: errorMsg || "Erro ao realizar login." };
  }
}

export async function checkAdminSession(): Promise<boolean> {
  if (!supabase) return false;

  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("Supabase session error:", error);
      return false;
    }

    if (!data?.session?.user?.email) return false;

    // Allow the main owner email explicitly, or check the admins table
    if (data.session.user.email === "darciodfx@gmail.com") return true;

    const { data: adminData } = await supabase
      .from("admins")
      .select("email")
      .eq("email", data.session.user.email)
      .maybeSingle();

    return !!adminData;
  } catch (e) {
    console.error("Unexpected checkAdminSession error:", e);
    return false;
  }
}

export interface Admin {
  email: string;
}

export async function logoutAdmin(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export interface PriceTier {
  quantity: number;
  price: number;
}

export interface ProductSize {
  label: string;
  price: number;
  weight?: number;
  wholesalePrice?: number;
  priceTiers?: PriceTier[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  minQuantity: number;
  wholesalePrice: number;
  wholesaleMinQuantity: number;
  category: string;
  weight: number;
  imageUrl: string;
  imageUrls: string[];
  featured: boolean;
  bestSeller: boolean;
  createdAt: number;
  sizes?: ProductSize[];
  orderIndex?: number;
}

export interface Category {
  id: string;
  name: string;
}

// Mock Data
export const defaultCategories: Category[] = [
  { id: "1", name: "Convites Especiais" },
  { id: "2", name: "Lembrancinhas" },
  { id: "3", name: "Placas Decorativas" },
  { id: "4", name: "Itens Personalizados" },
];

class Store {
  async getAllProducts(): Promise<Product[]> {
    if (!supabase) throw new Error("Falha na conexão com o banco de dados.");
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("createdAt", { ascending: false });

      if (error) throw error;
      return (data || []) as Product[];
    } catch (e) {
      console.error("Erro ao buscar todos os produtos:", e);
      throw new Error("Falha ao carregar os produtos.");
    }
  }

  async getProducts(page: number = 1, limit: number = 5): Promise<Product[]> {
    if (!supabase) throw new Error("Falha na conexão com o banco de dados.");
    try {
      const from = (page - 1) * limit;
      const to = from + limit - 1;

      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("createdAt", { ascending: false })
        .range(from, to);

      if (error) throw error;
      let products = (data || []) as Product[];
      return products;
    } catch (e) {
      console.error("Erro ao buscar produtos:", e);
      throw new Error("Falha ao carregar os produtos.");
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    if (!supabase) throw new Error("Falha na conexão com o banco de dados.");
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      return (data || null) as Product | null;
    } catch (e) {
      console.error(e);
      throw new Error("Falha ao carregar o produto.");
    }
  }

  async uploadImage(base64Data: string, fileName: string): Promise<string> {
    if (!supabase) throw new Error("Supabase não está configurado.");
    
    // Convert base64 to Blob
    const base64Parts = base64Data.split(',');
    const mimeMatch = base64Parts[0].match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
    const byteCharacters = atob(base64Parts[1]);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    
    const blob = new Blob(byteArrays, { type: mimeType });
    const fileExt = mimeType.split('/')[1] || 'jpeg';
    const uniqueFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(uniqueFileName, blob, {
        contentType: mimeType,
        upsert: false
      });

    if (error) {
      console.error("Upload error:", error);
      throw error;
    }

    const { data: publicUrlData } = supabase.storage
      .from('product-images')
      .getPublicUrl(uniqueFileName);

    return publicUrlData.publicUrl;
  }

  async saveProduct(product: Product): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from("products").upsert(product);
    if (error) throw error;
  }

  async updateProductsOrder(
    updates: { id: string; orderIndex: number }[],
  ): Promise<void> {
    if (!supabase) return;
    await Promise.all(
      updates.map((update) =>
        supabase!
          .from("products")
          .update({ orderIndex: update.orderIndex })
          .eq("id", update.id),
      ),
    );
  }

  async deleteProduct(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
  }

  async clearProducts(): Promise<void> {
    if (!supabase) throw new Error("Supabase não está configurado.");
    const { error } = await supabase.from("products").delete().neq('id', 'dummy_id_never_matches');
    if (error) {
      console.error("Erro ao limpar banco:", error);
      throw error;
    }
  }

  async getCategories(): Promise<Category[]> {
    if (!supabase) return defaultCategories;
    try {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      return (data?.length ? data : defaultCategories) as Category[];
    } catch (e) {
      console.error(e);
      return defaultCategories;
    }
  }

  async saveCategory(category: Category): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from("categories").upsert(category);
    if (error) throw error;
  }

  async deleteCategory(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  }
}

export const store = new Store();
