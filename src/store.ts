import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

let client = null;
try {
  if (supabaseUrl.startsWith('http') && supabaseAnonKey) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.error("Failed to initialize Supabase client:", e);
}

export const supabase = client;

export async function loginWithEmail(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    return { success: false, error: 'Supabase não está configurado. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no painel da Vercel.' };
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
    const errorMsg = typeof error.message === 'string' ? error.message : JSON.stringify(error);
    
    if (errorMsg.includes('Invalid login credentials')) {
      return { success: false, error: 'Email ou senha incorretos.' };
    }
    
    if (errorMsg.includes('Email not confirmed')) {
      return { success: false, error: 'Email não confirmado.\n\nPara o painel de administração, você pode desativar a confirmação de email:\n1. Acesse o painel do Supabase\n2. Vá em Authentication > Providers > Email\n3. Desmarque a opção "Confirm email" e salve.' };
    }
    
    return { success: false, error: errorMsg || 'Erro ao realizar login.' };
  }
}

export async function checkAdminSession(): Promise<boolean> {
  if (!supabase) return false;
  
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Supabase session error:', error);
      return false;
    }
    
    if (!data?.session?.user?.email) return false;
    
    // Allow the main owner email explicitly, or check the admins table
    if (data.session.user.email === 'darciodfx@gmail.com') return true;
    
    const { data: adminData } = await supabase
      .from('admins')
      .select('email')
      .eq('email', data.session.user.email)
      .maybeSingle();
      
    return !!adminData;
  } catch (e) {
    console.error('Unexpected checkAdminSession error:', e);
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

export interface ProductSize {
  label: string;
  price: number;
  weight?: number;
  wholesalePrice?: number;
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
    weight: 500,
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
    weight: 20,
    imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    imageUrls: ['https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'],
    featured: false,
    bestSeller: true,
    createdAt: Date.now()
  }
];

class Store {
  async getProducts(): Promise<Product[]> {
    if (!supabase) return defaultProducts.sort((a, b) => (b.orderIndex || b.createdAt) - (a.orderIndex || a.createdAt));
    try {
      const { data, error } = await supabase.from('products').select('*');
      if (error) throw error;
      let products = (data?.length ? data : defaultProducts) as Product[];
      return products.sort((a, b) => (b.orderIndex ?? b.createdAt) - (a.orderIndex ?? a.createdAt));
    } catch (e) {
      console.error(e);
      return defaultProducts.sort((a, b) => (b.orderIndex || b.createdAt) - (a.orderIndex || a.createdAt));
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

  async updateProductsOrder(updates: { id: string, orderIndex: number }[]): Promise<void> {
    if (!supabase) return;
    await Promise.all(updates.map(update => 
       supabase!.from('products').update({ orderIndex: update.orderIndex }).eq('id', update.id)
    ));
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

}

export const store = new Store();
