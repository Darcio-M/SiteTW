import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export async function loginWithGoogle(): Promise<boolean> {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    if (!result.user.email) {
      await signOut(auth);
      return false;
    }
    
    if (result.user.email === 'darciodfx@gmail.com') {
      return true;
    } 

    // Check if user is in admins collection
    const adminDoc = await getDoc(doc(db, 'admins', result.user.email));
    if (adminDoc.exists()) {
      return true;
    } else {
      await signOut(auth);
      return false; // Not admin
    }
  } catch (error) {
    console.error(error);
    return false;
  }
}

export interface Admin {
  email: string;
}

export async function logoutAdmin(): Promise<void> {
  await signOut(auth);
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
  weight: number; // Peso em gramas ou kg (ex: 0.5 para 500g)
  imageUrl: string; // Keep for backward compatibility/main image
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
    try {
      const snap = await getDocs(collection(db, 'products'));
      if (snap.empty) {
        // If empty, return default products (you can also just return [])
        return defaultProducts;
      }
      return snap.docs.map(doc => doc.data() as Product);
    } catch (e) {
      console.error(e);
      return defaultProducts;
    }
  }

  async getProduct(id: string): Promise<Product | null> {
    try {
      const ref = doc(db, 'products', id);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        return snap.data() as Product;
      }
      return null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async saveProduct(product: Product): Promise<void> {
    const ref = doc(db, 'products', product.id);
    await setDoc(ref, product);
  }

  async deleteProduct(id: string): Promise<void> {
    const ref = doc(db, 'products', id);
    await deleteDoc(ref);
  }

  async getCategories(): Promise<Category[]> {
    try {
      const snap = await getDocs(collection(db, 'categories'));
      if (snap.empty) {
        return defaultCategories; // Return defaults if db is empty
      }
      return snap.docs.map(doc => doc.data() as Category);
    } catch (e) {
      console.error(e);
      return defaultCategories; 
    }
  }

  async saveCategory(category: Category): Promise<void> {
    const ref = doc(db, 'categories', category.id);
    await setDoc(ref, category);
  }

  async deleteCategory(id: string): Promise<void> {
    const ref = doc(db, 'categories', id);
    await deleteDoc(ref);
  }

  // --- Admins ---

  async getAdmins(): Promise<Admin[]> {
    try {
      const snap = await getDocs(collection(db, 'admins'));
      if (snap.empty) return [];
      return snap.docs.map(doc => doc.data() as Admin);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async addAdmin(email: string): Promise<void> {
    const ref = doc(db, 'admins', email);
    await setDoc(ref, { email });
  }

  async deleteAdmin(email: string): Promise<void> {
    const ref = doc(db, 'admins', email);
    await deleteDoc(ref);
  }

  // --- Orders ---
  
  async createOrder(order: Order): Promise<void> {
    const ref = doc(db, 'orders', order.id);
    await setDoc(ref, order);
  }

  async getOrders(): Promise<Order[]> {
    try {
      const snap = await getDocs(collection(db, 'orders'));
      if (snap.empty) {
        return [];
      }
      return snap.docs.map(doc => doc.data() as Order);
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async updateOrder(order: Order): Promise<void> {
    const ref = doc(db, 'orders', order.id);
    await setDoc(ref, order);
  }
}

export const store = new Store();
