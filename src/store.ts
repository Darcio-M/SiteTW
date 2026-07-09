import { createClient } from "@supabase/supabase-js";

const rawUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, "");
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export async function loginWithEmail(
  email: string,
  password: string,
): Promise<{ success: boolean; error?: string }> {
  if (!supabase) return { success: false, error: "Supabase not configured." };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    if (error.message.includes("Invalid login credentials")) {
      return { success: false, error: "Email ou senha incorretos." };
    }
    return { success: false, error: "Erro ao realizar login." };
  }
  return { success: true };
}

export async function checkAdminSession(): Promise<boolean> {
  if (!supabase) return false;
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session?.user?.email) return false;

  // Check hardcoded admin
  if (session.user.email === "darciodfx@gmail.com") return true;

  try {
    const { data } = await supabase
      .from("admins")
      .select("email")
      .eq("email", session.user.email)
      .single();
    return !!data;
  } catch (e) {
    return false;
  }
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

export const defaultCategories: Category[] = [
  { id: "1", name: "Convites Especiais" },
  { id: "2", name: "Lembrancinhas" },
  { id: "3", name: "Placas Decorativas" },
  { id: "4", name: "Itens Personalizados" },
];

class Store {
  async getCatalogProducts(): Promise<Partial<Product>[]> {
    if (!supabase) throw new Error("Falha na conexão com o banco de dados.");
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, imageUrl, category, createdAt")
        .order("createdAt", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error(e);
      throw new Error("Falha ao carregar os produtos do catálogo.");
    }
  }

  async getAllProducts(): Promise<Partial<Product>[]> {
    if (!supabase) throw new Error("Falha na conexão com o banco de dados.");
    try {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, price, imageUrl, category, createdAt, orderIndex, featured, bestSeller, minQuantity")
        .order("createdAt", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (e) {
      console.error("Erro ao buscar todos os produtos:", e);
      throw new Error("Falha ao carregar os produtos.");
    }
  }

  async getProducts(page: number = 1, pageSize: number = 5): Promise<Product[]> {
    if (!supabase) throw new Error("Falha na conexão com o banco de dados.");
    try {
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("createdAt", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return (data || []) as Product[];
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
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data as Product;
    } catch (e) {
      console.error(e);
      throw new Error("Falha ao carregar o produto.");
    }
  }

  async uploadImage(base64Data: string, fileName: string): Promise<string> {
    if (!supabase) throw new Error("Falha na conexão com o banco de dados.");
    try {
      const isDataUrl = base64Data.startsWith('data:');
      
      if (!isDataUrl) {
         // Já é uma URL externa
         return base64Data;
      }

      // Converte data url base64 para Blob para subir via Storage API
      const response = await fetch(base64Data);
      const blob = await response.blob();

      const filePath = `${Date.now()}-${fileName}`;
      const { error } = await supabase.storage
        .from("product-images")
        .upload(filePath, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        throw error;
      }

      const { data: publicUrlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("Erro ao fazer upload da imagem", err);
      throw err;
    }
  }

  async deleteProductImage(fileName: string): Promise<void> {
    if (!supabase) return;
    try {
       await supabase.storage.from("product-images").remove([fileName]);
    } catch (err) {
       console.error("Erro ao deletar imagem", err);
    }
  }

  async saveProduct(product: Product): Promise<void> {
    if (!supabase) throw new Error("Falha na conexão com o banco de dados.");
    const { error } = await supabase.from("products").upsert(product);
    if (error) throw error;
  }

  async updateProductsOrder(
    updates: { id: string; orderIndex: number }[],
  ): Promise<void> {
    if (!supabase) throw new Error("Falha na conexão com o banco de dados.");
    await Promise.all(
      updates.map((update) =>
        supabase
          .from("products")
          .update({ orderIndex: update.orderIndex })
          .eq("id", update.id),
      ),
    );
  }

  async deleteProduct(id: string): Promise<void> {
    if (!supabase) throw new Error("Falha na conexão com o banco de dados.");
    try {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async clearProducts(): Promise<void> {
    if (!supabase) throw new Error("Falha na conexão com o banco de dados.");
    try {
      const { error } = await supabase.from("products").delete().neq("id", "");
      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message);
    }
  }

  async getCategories(): Promise<Category[]> {
    if (!supabase) return defaultCategories;
    try {
      const { data, error } = await supabase.from("categories").select("*");
      if (error) throw error;
      if (!data || data.length === 0) return defaultCategories;
      return data as Category[];
    } catch (e) {
      console.error(e);
      return defaultCategories;
    }
  }

  async saveCategory(category: Category): Promise<void> {
    if (!supabase) throw new Error("Falha na conexão com o banco de dados.");
    const { error } = await supabase.from("categories").upsert(category);
    if (error) throw error;
  }

  async deleteCategory(id: string): Promise<void> {
    if (!supabase) throw new Error("Falha na conexão com o banco de dados.");
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
  }
}

export const store = new Store();
