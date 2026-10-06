export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      staff_members: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: 'owner' | 'admin' | 'staff';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: 'owner' | 'admin' | 'staff';
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: 'owner' | 'admin' | 'staff';
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      packages: {
        Row: {
          id: string;
          slug: string;
          name: string;
          subtitle: string | null;
          description: string;
          features: Json;
          price_type: 'fixed' | 'on-request' | 'from';
          base_price: number | null;
          currency: string;
          cta_text: string;
          cta_action: 'book' | 'whatsapp' | 'contact-form';
          is_visible: boolean;
          category: 'standard' | 'group' | 'corporate';
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          subtitle?: string | null;
          description: string;
          features?: Json;
          price_type: 'fixed' | 'on-request' | 'from';
          base_price?: number | null;
          currency?: string;
          cta_text?: string;
          cta_action?: 'book' | 'whatsapp' | 'contact-form';
          is_visible?: boolean;
          category?: 'standard' | 'group' | 'corporate';
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          subtitle?: string | null;
          description?: string;
          features?: Json;
          price_type?: 'fixed' | 'on-request' | 'from';
          base_price?: number | null;
          currency?: string;
          cta_text?: string;
          cta_action?: 'book' | 'whatsapp' | 'contact-form';
          is_visible?: boolean;
          category?: 'standard' | 'group' | 'corporate';
          display_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      time_slots: {
        Row: {
          id: string;
          date: string;
          start_time: string;
          end_time: string;
          service_id: string;
          max_capacity: number;
          booked_count: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          start_time: string;
          end_time: string;
          service_id: string;
          max_capacity?: number;
          booked_count?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          start_time?: string;
          end_time?: string;
          service_id?: string;
          max_capacity?: number;
          booked_count?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          reference_code: string;
          cancellation_token: string;
          token_expires_at: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          date: string;
          time_slot: string;
          service_id: string;
          service_name: string;
          num_children: number;
          num_adults: number;
          total_price: number;
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status: 'pending' | 'paid_on_arrival' | 'refunded';
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reference_code?: string;
          cancellation_token?: string;
          token_expires_at?: string;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          date: string;
          time_slot: string;
          service_id: string;
          service_name: string;
          num_children: number;
          num_adults: number;
          total_price?: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status?: 'pending' | 'paid_on_arrival' | 'refunded';
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reference_code?: string;
          cancellation_token?: string;
          token_expires_at?: string;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          date?: string;
          time_slot?: string;
          service_id?: string;
          service_name?: string;
          num_children?: number;
          num_adults?: number;
          total_price?: number;
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
          payment_status?: 'pending' | 'paid_on_arrival' | 'refunded';
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          staff_id: string | null;
          action: string;
          resource_type: string;
          resource_id: string | null;
          details: Json;
          ip_address: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          staff_id?: string | null;
          action: string;
          resource_type: string;
          resource_id?: string | null;
          details?: Json;
          ip_address?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          staff_id?: string | null;
          action?: string;
          resource_type?: string;
          resource_id?: string | null;
          details?: Json;
          ip_address?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_booking_atomic: {
        Args: {
          p_customer_name: string;
          p_customer_email: string;
          p_customer_phone: string;
          p_date: string;
          p_time_slot: string;
          p_service_id: string;
          p_num_children: number;
          p_num_adults: number;
          p_include_salt_room?: boolean;
          p_notes?: string;
        };
        Returns: Json;
      };
      cancel_booking_by_token: {
        Args: {
          p_cancellation_token: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
