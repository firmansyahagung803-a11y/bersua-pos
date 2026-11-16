export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  created_at?: string;
}

export interface MenuItem {
  id: number;
  category_id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_available: number;
  is_featured: number;
  created_at?: string;
  category_name?: string;
  category_slug?: string;
  category_icon?: string;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  menu_item_id: number;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
  notes?: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone?: string;
  table_number?: string;
  order_type: 'dine_in' | 'takeaway';
  status: 'pending' | 'processing' | 'ready' | 'completed' | 'cancelled';
  payment_method: string;
  payment_status: 'unpaid' | 'paid';
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  cashier_id?: number;
  created_at: string;
  paid_at?: string;
  items?: OrderItem[];
}

export interface Income {
  id: number;
  order_id?: number;
  description: string;
  amount: number;
  payment_method: string;
  category: string;
  date: string;
  created_at: string;
}

export interface Expense {
  id: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface User {
  id: number;
  name: string;
  username: string;
  password?: string;
  role: 'admin' | 'cashier';
  is_active: number;
  created_at?: string;
}
