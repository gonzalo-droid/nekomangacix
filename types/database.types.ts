export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type StockStatus = 'in_stock' | 'on_demand' | 'preorder' | 'out_of_stock';
export type OrderStatus = 'pending' | 'confirmed' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
export type UserRole = 'customer' | 'admin';
export type CountryGroup = 'Argentina' | 'México';

export interface Database {
  // Requerido por Supabase JS v2 para inferencia estricta
  PostgrestVersion: '12';
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          address: Json | null;
          role: UserRole;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          address?: Json | null;
          role?: UserRole;
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          address?: Json | null;
          role?: UserRole;
        };
      };
      products: {
        Row: {
          id: string;
          sku: string;
          slug: string;
          title: string;
          editorial: string;
          author: string | null;
          price_pen: number;
          stock: number;
          stock_status: StockStatus;
          estimated_arrival: string | null;
          preorder_deposit: number | null;
          description: string | null;
          full_description: string | null;
          specifications: Json | null;
          images: string[];
          category: string;
          country_group: CountryGroup;
          tags: string[];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          sku: string;
          slug: string;
          title: string;
          editorial: string;
          author?: string | null;
          price_pen: number;
          stock?: number;
          stock_status?: StockStatus;
          estimated_arrival?: string | null;
          preorder_deposit?: number | null;
          description?: string | null;
          full_description?: string | null;
          specifications?: Json | null;
          images?: string[];
          category: string;
          country_group: CountryGroup;
          tags?: string[];
          is_active?: boolean;
        };
        Update: {
          title?: string;
          editorial?: string;
          author?: string | null;
          price_pen?: number;
          stock?: number;
          stock_status?: StockStatus;
          estimated_arrival?: string | null;
          preorder_deposit?: number | null;
          description?: string | null;
          full_description?: string | null;
          specifications?: Json | null;
          images?: string[];
          category?: string;
          country_group?: CountryGroup;
          tags?: string[];
          is_active?: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          status: OrderStatus;
          total_pen: number;
          shipping_cost: number;
          shipping_address: Json | null;
          payment_method: string | null;
          payment_proof: string | null;
          customer_name: string | null;
          customer_phone: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          status?: OrderStatus;
          total_pen: number;
          shipping_cost?: number;
          shipping_address?: Json | null;
          payment_method?: string | null;
          payment_proof?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          notes?: string | null;
        };
        Update: {
          status?: OrderStatus;
          shipping_address?: Json | null;
          payment_method?: string | null;
          payment_proof?: string | null;
          notes?: string | null;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          quantity: number;
          unit_price: number;
          title: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          quantity: number;
          unit_price: number;
          title: string;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Helper types for convenience
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type DBProduct = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderWithItems = Order & { order_items: (OrderItem & { products: DBProduct | null })[] };
