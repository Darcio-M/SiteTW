import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export async function loginWithGoogle(): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase não está configurado. Adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.' };
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });

    if (error) throw error;
    
    // Note: OAuth sign-in is typically a redirect, so the session is established after return.
    // However, if the user is already signed in (we should check session).
    
    return { success: true };
  } catch (error: any) {
    console.error(error);
    return { success: false, error: error.message || 'Erro ao realizar login.' };
  }
}

export async function checkAdminSession(): Promise<boolean> {
  if (!supabase) return false;
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user?.email) return false;
  
  if (session.user.email === 'darciodfx@gmail.com') return true;
  
  const { data, error } = await supabase
    .from('admins')
    .select('email')
    .eq('email', session.user.email)
    .maybeSingle();
    
  return !!data;
}

export interface Admin {
  email: string;
}

export async function logoutAdmin(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
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
}

export interface Category {
  id: string;
  name: string;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'PROCESSED';

export interface Order {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  cep: string;
  contact: string;
  totalWeight: number;
  totalValue: number;
  status: OrderStatus;
  shippingCost?: number;
  createdAt: number;
}

// Initial Mock Data
export const defaultCategories: Category[] = [
  { id: '1', name: 'Convites Especiais' },
  { id: '2', name: 'Lembrancinhas' },
  { id: '3', name: 'Placas Decorativas' },
  { id: '4', name: 'Itens Personalizados' }
];

export const defaultProducts: Product[] = [
  {
    id: '1',
    name: 'Convite Personalizado Floral',
    description: 'Lindo convite de luxo transparente com estampa floral em dourado. Perfeito para casamentos e grandes eventos.',
    price: 35.90,
    minQuantity: 10,
    wholesalePrice: 29.90,
    wholesaleMinQuantity: 50,
    category: '1',
    weight: 100,
    imageUrl: 'https://images.unsplash.com/photo-1543881477-834acdc48671?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1543881477-834acdc48671?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    featured: true,
    bestSeller: true,
    createdAt: Date.now()
  },
  {
    id: '2',
    name: 'Placa Bem-Vindos Casamento',
    description: 'Placa personalizada A3 com pintura no fundo e letras espelhadas.',
    price: 250.00,
    minQuantity: 1,
    wholesalePrice: 220.00,
    wholesaleMinQuantity: 3,
    category: '3',
    imageUrl: 'https://images.unsplash.com/photo-1620612396349-8e70a1e0b59b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1620612396349-8e70a1e0b59b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    featured: true,
    bestSeller: false,
    createdAt: Date.now()
  },
  {
    id: '3',
    name: 'Chaveiro Lembrancinha',
    description: 'Chaveiro personalizado com as iniciais.',
    price: 8.50,
    minQuantity: 20,
    wholesalePrice: 6.50,
    wholesaleMinQuantity: 100,
    category: '2',
    imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    featured: false,
    bestSeller: true,
    createdAt: Date.now()
  }
];

class Store {
  async getProducts(): Promise<Product[]> {
    if (!supabase) return defaultProducts;
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      return (data?.length ? data : defaultProducts) as Product[];
    } catch (e) {
      console.error(e);
      return defaultProducts;
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    if (!supabase) return defaultProducts.find(p => p.id === id) || null;
    try {
      const { data, error } = await supabase.from('products').select('*').eq('id', id).maybeSingle();
      if (error) throw error;
      return (data || null) as Product | null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async saveProduct(product: Product): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('products').upsert(product);
    if (error) throw error;
  }

  async deleteProduct(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  }

  async getCategories(): Promise<Category[]> {
    if (!supabase) return defaultCategories;
    try {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return (data?.length ? data : defaultCategories) as Category[];
    } catch (e) {
      console.error(e);
      return defaultCategories; 
    }
  }

  async saveCategory(category: Category): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('categories').upsert(category);
    if (error) throw error;
  }

  async deleteCategory(id: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  }

  // --- Admins ---

  async getAdmins(): Promise<Admin[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase.from('admins').select('*');
      if (error) throw error;
      return (data || []) as Admin[];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async addAdmin(email: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('admins').upsert({ email });
    if (error) throw error;
  }

  async deleteAdmin(email: string): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('admins').delete().eq('email', email);
    if (error) throw error;
  }

  // --- Orders ---
  
  async createOrder(order: Order): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('orders').upsert(order);
    if (error) throw error;
  }

  async getOrders(): Promise<Order[]> {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase.from('orders').select('*');
      if (error) throw error;
      return (data || []) as Order[];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async updateOrder(order: Order): Promise<void> {
    if (!supabase) return;
    const { error } = await supabase.from('orders').upsert(order);
    if (error) throw error;
  }
}

export const store = new Store();
