export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type StockStatus = 'in_stock' | 'preorder' | 'out_of_stock';
export type OrderStatus =
  | 'pending_deposit'
  | 'confirmed'
  | 'in_transit_to_pe'
  | 'available'
  | 'pending_balance'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  // Legacy values (still in DB until 008 cleanup migration)
  | 'pending'
  | 'paid';
export type UserRole = 'customer' | 'admin';
/** @deprecated use CountryCode from lib/constants/countries */
export type CountryGroup = 'Argentina' | 'México' | 'España' | 'Japón';
export type CountryCode = 'AR' | 'MX' | 'ES' | 'JP';
export type ProductTypeDB = 'manga' | 'figure' | 'special_edition' | 'merch';
export type LanguageDB = 'es' | 'jp';
export type DemographicDB = 'shonen' | 'seinen' | 'shojo' | 'josei' | 'kodomo';
export type PaymentType = 'full' | 'split_preorder';
export type OrderItemType = 'stock' | 'preorder';

export interface Database {
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
          has_used_first_purchase_discount: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          address?: Json | null;
          role?: UserRole;
          has_used_first_purchase_discount?: boolean;
          created_at?: string;
        };
        Update: {
          full_name?: string | null;
          phone?: string | null;
          address?: Json | null;
          role?: UserRole;
          has_used_first_purchase_discount?: boolean;
        };
      };
      products: {
        Row: {
          id: string;
          sku: string;
          slug: string;
          title: string;
          type: ProductTypeDB;
          editorial: string;
          author: string | null;
          price_pen: number;
          stock: number;
          stock_status: StockStatus;
          estimated_arrival: string | null;
          eta_text: string | null;
          preorder_deposit: number | null;
          description: string | null;
          full_description: string | null;
          specifications: Json | null;
          images: string[];
          category: string;
          country_code: CountryCode;
          /** @deprecated kept for back-compat until migration 008 */
          country_group: CountryGroup | null;
          series: string | null;
          volume_number: number | null;
          demographic: DemographicDB | null;
          language: LanguageDB;
          figure_scale: string | null;
          manufacturer: string | null;
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
          type?: ProductTypeDB;
          editorial: string;
          author?: string | null;
          price_pen: number;
          stock?: number;
          stock_status?: StockStatus;
          estimated_arrival?: string | null;
          eta_text?: string | null;
          preorder_deposit?: number | null;
          description?: string | null;
          full_description?: string | null;
          specifications?: Json | null;
          images?: string[];
          category: string;
          country_code?: CountryCode;
          country_group?: CountryGroup | null;
          series?: string | null;
          volume_number?: number | null;
          demographic?: DemographicDB | null;
          language?: LanguageDB;
          figure_scale?: string | null;
          manufacturer?: string | null;
          tags?: string[];
          is_active?: boolean;
        };
        Update: {
          title?: string;
          type?: ProductTypeDB;
          editorial?: string;
          author?: string | null;
          price_pen?: number;
          stock?: number;
          stock_status?: StockStatus;
          estimated_arrival?: string | null;
          eta_text?: string | null;
          preorder_deposit?: number | null;
          description?: string | null;
          full_description?: string | null;
          specifications?: Json | null;
          images?: string[];
          category?: string;
          country_code?: CountryCode;
          country_group?: CountryGroup | null;
          series?: string | null;
          volume_number?: number | null;
          demographic?: DemographicDB | null;
          language?: LanguageDB;
          figure_scale?: string | null;
          manufacturer?: string | null;
          tags?: string[];
          is_active?: boolean;
        };
      };
      orders: {
        Row: {
          id: string;
          user_id: string | null;
          status: OrderStatus;
          payment_type: PaymentType;
          total_pen: number;
          subtotal_pen: number | null;
          discount_pen: number;
          shipping_cost: number;
          deposit_pen: number;
          balance_pen: number;
          deposit_paid_at: string | null;
          balance_paid_at: string | null;
          estimated_arrival: string | null;
          shipping_address: Json | null;
          payment_method: string | null;
          payment_proof: string | null;
          payment_proof_url: string | null;
          payment_proof_confirmed_at: string | null;
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
          payment_type?: PaymentType;
          total_pen: number;
          subtotal_pen?: number | null;
          discount_pen?: number;
          shipping_cost?: number;
          deposit_pen?: number;
          balance_pen?: number;
          deposit_paid_at?: string | null;
          balance_paid_at?: string | null;
          estimated_arrival?: string | null;
          shipping_address?: Json | null;
          payment_method?: string | null;
          payment_proof?: string | null;
          payment_proof_url?: string | null;
          payment_proof_confirmed_at?: string | null;
          customer_name?: string | null;
          customer_phone?: string | null;
          notes?: string | null;
        };
        Update: {
          status?: OrderStatus;
          payment_type?: PaymentType;
          subtotal_pen?: number | null;
          discount_pen?: number;
          shipping_cost?: number;
          deposit_pen?: number;
          balance_pen?: number;
          deposit_paid_at?: string | null;
          balance_paid_at?: string | null;
          estimated_arrival?: string | null;
          shipping_address?: Json | null;
          payment_method?: string | null;
          payment_proof?: string | null;
          payment_proof_url?: string | null;
          payment_proof_confirmed_at?: string | null;
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
          item_type: OrderItemType;
          estimated_arrival: string | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          quantity: number;
          unit_price: number;
          title: string;
          item_type?: OrderItemType;
          estimated_arrival?: string | null;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type DBProduct = Database['public']['Tables']['products']['Row'];
export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type OrderWithItems = Order & { order_items: (OrderItem & { products: DBProduct | null })[] };
