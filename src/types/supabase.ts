export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      catalogue_products: {
        Row: {
          catalogue_id: string | null
          created_at: string | null
          description: string | null
          id: string
          legacy_id: number | null
          name: string | null
          specifications: string | null
          subcategory_id: string | null
          updated_at: string | null
        }
        Insert: {
          catalogue_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          legacy_id?: number | null
          name?: string | null
          specifications?: string | null
          subcategory_id?: string | null
          updated_at?: string | null
        }
        Update: {
          catalogue_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          legacy_id?: number | null
          name?: string | null
          specifications?: string | null
          subcategory_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalogue_products_catalogue_id_fkey"
            columns: ["catalogue_id"]
            isOneToOne: false
            referencedRelation: "companies_catalogues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalogue_products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "product_catalogues_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          company_mapping_id: string | null
          created_at: string | null
          id: string
          text: string | null
          user_id: string | null
        }
        Insert: {
          company_mapping_id?: string | null
          created_at?: string | null
          id?: string
          text?: string | null
          user_id?: string | null
        }
        Update: {
          company_mapping_id?: string | null
          created_at?: string | null
          id?: string
          text?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_company_mapping_id_fkey"
            columns: ["company_mapping_id"]
            isOneToOne: false
            referencedRelation: "companies_tenders_mappings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          company_bank: string | null
          company_city: string | null
          company_name: string | null
          company_postcode: string | null
          company_representative_name: string | null
          company_representative_phone: string | null
          company_size: string | null
          company_street: string | null
          company_type_law: string | null
          company_voivodship: string | null
          first_time_login: boolean
          id: string
          krs: number | null
          nip: number | null
          offer_rejection_feedback: string | null
          profile_feedback: string | null
          regon: number | null
          web: string | null
        }
        Insert: {
          company_bank?: string | null
          company_city?: string | null
          company_name?: string | null
          company_postcode?: string | null
          company_representative_name?: string | null
          company_representative_phone?: string | null
          company_size?: string | null
          company_street?: string | null
          company_type_law?: string | null
          company_voivodship?: string | null
          first_time_login?: boolean
          id?: string
          krs?: number | null
          nip?: number | null
          offer_rejection_feedback?: string | null
          profile_feedback?: string | null
          regon?: number | null
          web?: string | null
        }
        Update: {
          company_bank?: string | null
          company_city?: string | null
          company_name?: string | null
          company_postcode?: string | null
          company_representative_name?: string | null
          company_representative_phone?: string | null
          company_size?: string | null
          company_street?: string | null
          company_type_law?: string | null
          company_voivodship?: string | null
          first_time_login?: boolean
          id?: string
          krs?: number | null
          nip?: number | null
          offer_rejection_feedback?: string | null
          profile_feedback?: string | null
          regon?: number | null
          web?: string | null
        }
        Relationships: []
      }
      companies_catalogues: {
        Row: {
          company_id: string | null
          created_at: string | null
          custom_rules: string | null
          customer_email: string | null
          general_information: Json | null
          id: string
          name: string | null
          type: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          custom_rules?: string | null
          customer_email?: string | null
          general_information?: Json | null
          id?: string
          name?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          custom_rules?: string | null
          customer_email?: string | null
          general_information?: Json | null
          id?: string
          name?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_catalogues_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      companies_tenders_mappings: {
        Row: {
          can_participate: boolean | null
          company_id: string | null
          created_at: string
          id: string
          seen_at: string | null
          status: string | null
          tender_id: string | null
          updated_at: string | null
        }
        Insert: {
          can_participate?: boolean | null
          company_id?: string | null
          created_at?: string
          id?: string
          seen_at?: string | null
          status?: string | null
          tender_id?: string | null
          updated_at?: string | null
        }
        Update: {
          can_participate?: boolean | null
          company_id?: string | null
          created_at?: string
          id?: string
          seen_at?: string | null
          status?: string | null
          tender_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "companies_tenders_mappings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "companies_tenders_mappings_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      document_questions: {
        Row: {
          answer: string | null
          company_mapping_id: string | null
          id: string
          question: string
        }
        Insert: {
          answer?: string | null
          company_mapping_id?: string | null
          id?: string
          question: string
        }
        Update: {
          answer?: string | null
          company_mapping_id?: string | null
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_questions_company_mapping_id_fkey"
            columns: ["company_mapping_id"]
            isOneToOne: false
            referencedRelation: "companies_tenders_mappings"
            referencedColumns: ["id"]
          },
        ]
      }
      product_catalogues_categories: {
        Row: {
          catalogue_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string | null
        }
        Insert: {
          catalogue_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          catalogue_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_catalogues_categories_catalogue_id_fkey"
            columns: ["catalogue_id"]
            isOneToOne: false
            referencedRelation: "companies_catalogues"
            referencedColumns: ["id"]
          },
        ]
      }
      product_catalogues_subcategories: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_catalogues_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_catalogues_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          company_id: string | null
          first_name: string | null
          id: string
          last_name: string | null
          preferred_locale: string | null
        }
        Insert: {
          company_id?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          preferred_locale?: string | null
        }
        Update: {
          company_id?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferred_locale?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_company_file: {
        Row: {
          comment: string | null
          company_tender_mapping_id: string | null
          created_at: string
          file_type: string | null
          id: string
          s3path: string | null
          signable: boolean
          signature_type: string[] | null
        }
        Insert: {
          comment?: string | null
          company_tender_mapping_id?: string | null
          created_at?: string
          file_type?: string | null
          id?: string
          s3path?: string | null
          signable?: boolean
          signature_type?: string[] | null
        }
        Update: {
          comment?: string | null
          company_tender_mapping_id?: string | null
          created_at?: string
          file_type?: string | null
          id?: string
          s3path?: string | null
          signable?: boolean
          signature_type?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "tender_company_file_company_tender_mapping_id_fkey"
            columns: ["company_tender_mapping_id"]
            isOneToOne: false
            referencedRelation: "companies_tenders_mappings"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_parts: {
        Row: {
          can_participate: boolean | null
          company_mapping_id: string | null
          created_at: string
          description_part_long_llm: string | null
          id: string
          order_number: number | null
          ordercompletiondate_llm: string | null
          part_name: string | null
          payment_terms_llm: string | null
          review_criteria_llm: string | null
          status: string
          updated_at: string | null
          wadium_llm: string | null
        }
        Insert: {
          can_participate?: boolean | null
          company_mapping_id?: string | null
          created_at?: string
          description_part_long_llm?: string | null
          id?: string
          order_number?: number | null
          ordercompletiondate_llm?: string | null
          part_name?: string | null
          payment_terms_llm?: string | null
          review_criteria_llm?: string | null
          status: string
          updated_at?: string | null
          wadium_llm?: string | null
        }
        Update: {
          can_participate?: boolean | null
          company_mapping_id?: string | null
          created_at?: string
          description_part_long_llm?: string | null
          id?: string
          order_number?: number | null
          ordercompletiondate_llm?: string | null
          part_name?: string | null
          payment_terms_llm?: string | null
          review_criteria_llm?: string | null
          status?: string
          updated_at?: string | null
          wadium_llm?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tender_parts_company_mapping_id_fkey"
            columns: ["company_mapping_id"]
            isOneToOne: false
            referencedRelation: "companies_tenders_mappings"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_products: {
        Row: {
          alternative_products: Json | null
          closest_match: string | null
          created_at: string
          id: string
          part_id: string
          product_req_name: string | null
          product_req_quantity: string | null
          product_req_spec: string | null
          requirements_to_confirm: string | null
        }
        Insert: {
          alternative_products?: Json | null
          closest_match?: string | null
          created_at?: string
          id?: string
          part_id: string
          product_req_name?: string | null
          product_req_quantity?: string | null
          product_req_spec?: string | null
          requirements_to_confirm?: string | null
        }
        Update: {
          alternative_products?: Json | null
          closest_match?: string | null
          created_at?: string
          id?: string
          part_id?: string
          product_req_name?: string | null
          product_req_quantity?: string | null
          product_req_spec?: string | null
          requirements_to_confirm?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tender_products_closest_match_fkey"
            columns: ["closest_match"]
            isOneToOne: false
            referencedRelation: "catalogue_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tender_products_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "tender_parts"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_requirements: {
        Row: {
          created_at: string
          id: string
          part_id: string | null
          reason: string | null
          requirement_text: string
          status: string
          tender_product_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          part_id?: string | null
          reason?: string | null
          requirement_text: string
          status?: string
          tender_product_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          part_id?: string | null
          reason?: string | null
          requirement_text?: string
          status?: string
          tender_product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tender_requirements_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "tender_parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tender_requirements_tender_product_id_fkey"
            columns: ["tender_product_id"]
            isOneToOne: false
            referencedRelation: "tender_products"
            referencedColumns: ["id"]
          },
        ]
      }
      tenders: {
        Row: {
          application_form_llm: string | null
          contract_penalties_llm: string | null
          created_at: string | null
          deposit_llm: string | null
          description_long_llm: string | null
          id: string
          order_completion_date_llm: string | null
          order_object: string | null
          organization_city: string | null
          organization_name: string | null
          payment_terms_llm: string | null
          publication_date: string | null
          review_criteria_llm: string | null
          submitting_offers_date: string | null
          updated_at: string | null
          url: string | null
          url_user: string | null
          voivodship: string | null
          wadium_llm: string | null
        }
        Insert: {
          application_form_llm?: string | null
          contract_penalties_llm?: string | null
          created_at?: string | null
          deposit_llm?: string | null
          description_long_llm?: string | null
          id?: string
          order_completion_date_llm?: string | null
          order_object?: string | null
          organization_city?: string | null
          organization_name?: string | null
          payment_terms_llm?: string | null
          publication_date?: string | null
          review_criteria_llm?: string | null
          submitting_offers_date?: string | null
          updated_at?: string | null
          url?: string | null
          url_user?: string | null
          voivodship?: string | null
          wadium_llm?: string | null
        }
        Update: {
          application_form_llm?: string | null
          contract_penalties_llm?: string | null
          created_at?: string | null
          deposit_llm?: string | null
          description_long_llm?: string | null
          id?: string
          order_completion_date_llm?: string | null
          order_object?: string | null
          organization_city?: string | null
          organization_name?: string | null
          payment_terms_llm?: string | null
          publication_date?: string | null
          review_criteria_llm?: string | null
          submitting_offers_date?: string | null
          updated_at?: string | null
          url?: string | null
          url_user?: string | null
          voivodship?: string | null
          wadium_llm?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fill_tender_id_for_products: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      generate_uuid: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_categories_with_products: {
        Args: { p_company_uuid: string; p_search?: string }
        Returns: {
          catalogue_id: string
          created_at: string
          description: string
          id: string
          name: string
          product_count: number
        }[]
      }
      get_company_mapping_status_counts: {
        Args: { p_company_id: string }
        Returns: {
          count: number
          status: string
        }[]
      }
      get_deadline_due_in_2_days: {
        Args: Record<PropertyKey, never>
        Returns: {
          company_id: string
          deadline: string
          order_object: string
          organization_name: string
          recipient_email: string
          tender_id: string
          tender_url: string
        }[]
      }
      get_tenders_summary: {
        Args: { p_company_id: string }
        Returns: Database["public"]["CompositeTypes"]["tenders_summary_type"]
      }
      get_weekly_company_mappings: {
        Args: { p_company_id?: string; p_no_of_weeks?: number }
        Returns: {
          result: Json
        }[]
      }
      get_weekly_tenders_by_company: {
        Args: { p_company?: string; p_no_of_weeks?: number }
        Returns: {
          json_response: Json
        }[]
      }
      send_deadline_2days_min: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      tenders_summary_type: {
        found_today: number | null
        expiring_this_week: number | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
