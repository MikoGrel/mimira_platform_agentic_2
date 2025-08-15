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
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          legacy_id: number | null
          name: string | null
          specifications: string | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id: string
          legacy_id?: number | null
          name?: string | null
          specifications?: string | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          legacy_id?: number | null
          name?: string | null
          specifications?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalogue_products_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_catalogues"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          created_at: string | null
          id: string
          tender_id: string | null
          text: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          tender_id?: string | null
          text?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          tender_id?: string | null
          text?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      companies_catalogues: {
        Row: {
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
          created_at?: string | null
          custom_rules?: string | null
          customer_email?: string | null
          general_information?: Json | null
          id: string
          name?: string | null
          type?: string | null
          updated_at?: string | null
        }
        Update: {
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
            foreignKeyName: "companies_catalogues_customer_email_fkey"
            columns: ["customer_email"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["company_email"]
          },
        ]
      }
      customers: {
        Row: {
          catalogue: Json | null
          company: string | null
          company_bank: string | null
          company_city: string | null
          company_email: string
          company_postcode: string | null
          company_representative_name: string | null
          company_representative_phone: string | null
          company_size: string | null
          company_street: string | null
          company_type_law: string | null
          company_voivodship: string | null
          first_time_login: boolean
          krs: number | null
          nip: number | null
          offer_rejection_feedback: string | null
          profile_feedback: string | null
          regon: number | null
          web: string | null
        }
        Insert: {
          catalogue?: Json | null
          company?: string | null
          company_bank?: string | null
          company_city?: string | null
          company_email: string
          company_postcode?: string | null
          company_representative_name?: string | null
          company_representative_phone?: string | null
          company_size?: string | null
          company_street?: string | null
          company_type_law?: string | null
          company_voivodship?: string | null
          first_time_login?: boolean
          krs?: number | null
          nip?: number | null
          offer_rejection_feedback?: string | null
          profile_feedback?: string | null
          regon?: number | null
          web?: string | null
        }
        Update: {
          catalogue?: Json | null
          company?: string | null
          company_bank?: string | null
          company_city?: string | null
          company_email?: string
          company_postcode?: string | null
          company_representative_name?: string | null
          company_representative_phone?: string | null
          company_size?: string | null
          company_street?: string | null
          company_type_law?: string | null
          company_voivodship?: string | null
          first_time_login?: boolean
          krs?: number | null
          nip?: number | null
          offer_rejection_feedback?: string | null
          profile_feedback?: string | null
          regon?: number | null
          web?: string | null
        }
        Relationships: []
      }
      document_questions: {
        Row: {
          answer: string | null
          id: number
          question: string
          tender_id: string | null
        }
        Insert: {
          answer?: string | null
          id?: number
          question: string
          tender_id?: string | null
        }
        Update: {
          answer?: string | null
          id?: number
          question?: string
          tender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_questions_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          created_at: string
          fillable: boolean | null
          id: number
          info: string | null
          s3_path: string | null
          tender_id: string | null
        }
        Insert: {
          created_at: string
          fillable?: boolean | null
          id?: number
          info?: string | null
          s3_path?: string | null
          tender_id?: string | null
        }
        Update: {
          created_at?: string
          fillable?: boolean | null
          id?: number
          info?: string | null
          s3_path?: string | null
          tender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_catalogues_categories: {
        Row: {
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id: string
          name?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_catalogues_categories_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies_catalogues"
            referencedColumns: ["id"]
          },
        ]
      }
      product_catalogues_customers: {
        Row: {
          created_at: string
          id: number
        }
        Insert: {
          created_at?: string
          id?: number
        }
        Update: {
          created_at?: string
          id?: number
        }
        Relationships: []
      }
      product_catalogues_subcategories: {
        Row: {
          category_id: string | null
          created_at: string | null
          id: string
          name: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          id: string
          name?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
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
      product_subcategory_mappings: {
        Row: {
          created_at: string | null
          id: string
          product_id: string | null
          subcategory_id: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          product_id?: string | null
          subcategory_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          product_id?: string | null
          subcategory_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_subcategory_mappings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "catalogue_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_subcategory_mappings_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "product_catalogues_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          customer: string | null
          first_name: string | null
          id: string
          last_name: string | null
          preferred_locale: string | null
        }
        Insert: {
          customer?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          preferred_locale?: string | null
        }
        Update: {
          customer?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferred_locale?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_profiles_customer"
            columns: ["customer"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["company"]
          },
        ]
      }
      tender_parts: {
        Row: {
          can_participate: boolean | null
          created_at: string
          description_part_long_llm: string | null
          met_requirements: Json[] | null
          needs_confirmation_requirements: Json[] | null
          not_met_requirements: Json[] | null
          ordercompletiondate_llm: string | null
          part_id: number | null
          part_name: string | null
          part_uuid: string
          review_criteria_llm: string | null
          status: string
          tender_id: string | null
          wadium_llm: string | null
        }
        Insert: {
          can_participate?: boolean | null
          created_at?: string
          description_part_long_llm?: string | null
          met_requirements?: Json[] | null
          needs_confirmation_requirements?: Json[] | null
          not_met_requirements?: Json[] | null
          ordercompletiondate_llm?: string | null
          part_id?: number | null
          part_name?: string | null
          part_uuid?: string
          review_criteria_llm?: string | null
          status: string
          tender_id?: string | null
          wadium_llm?: string | null
        }
        Update: {
          can_participate?: boolean | null
          created_at?: string
          description_part_long_llm?: string | null
          met_requirements?: Json[] | null
          needs_confirmation_requirements?: Json[] | null
          not_met_requirements?: Json[] | null
          ordercompletiondate_llm?: string | null
          part_id?: number | null
          part_name?: string | null
          part_uuid?: string
          review_criteria_llm?: string | null
          status?: string
          tender_id?: string | null
          wadium_llm?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tender_parts_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_products: {
        Row: {
          alternative_products: string | null
          closest_match: string | null
          created_at: string
          id: number
          part_uuid: string
          product_req_name: string | null
          product_req_quantity: string | null
          product_req_spec: string | null
          requirements_to_confirm: string | null
          tender_id: string | null
        }
        Insert: {
          alternative_products?: string | null
          closest_match?: string | null
          created_at?: string
          id?: number
          part_uuid: string
          product_req_name?: string | null
          product_req_quantity?: string | null
          product_req_spec?: string | null
          requirements_to_confirm?: string | null
          tender_id?: string | null
        }
        Update: {
          alternative_products?: string | null
          closest_match?: string | null
          created_at?: string
          id?: number
          part_uuid?: string
          product_req_name?: string | null
          product_req_quantity?: string | null
          product_req_spec?: string | null
          requirements_to_confirm?: string | null
          tender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_tender_products_tender_parts"
            columns: ["part_uuid"]
            isOneToOne: false
            referencedRelation: "tender_parts"
            referencedColumns: ["part_uuid"]
          },
          {
            foreignKeyName: "fk_tenders_tender_producs"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      tender_requirements: {
        Row: {
          created_at: string
          part_uuid: string | null
          reason: string | null
          req_id: number
          requirement_text: string
          status: string
          tender_id: string | null
        }
        Insert: {
          created_at?: string
          part_uuid?: string | null
          reason?: string | null
          req_id?: number
          requirement_text: string
          status?: string
          tender_id?: string | null
        }
        Update: {
          created_at?: string
          part_uuid?: string | null
          reason?: string | null
          req_id?: number
          requirement_text?: string
          status?: string
          tender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tender_requirements_part_uuid_fkey"
            columns: ["part_uuid"]
            isOneToOne: false
            referencedRelation: "tender_parts"
            referencedColumns: ["part_uuid"]
          },
          {
            foreignKeyName: "tender_requirements_tender_id_fkey"
            columns: ["tender_id"]
            isOneToOne: false
            referencedRelation: "tenders"
            referencedColumns: ["id"]
          },
        ]
      }
      tenders: {
        Row: {
          application_form_llm: string | null
          can_participate: boolean | null
          company: string
          contract_penalties_llm: string | null
          created_at: string | null
          deposit_llm: string | null
          description_long_llm: string | null
          has_parts: boolean | null
          id: string
          met_requirements: Json[] | null
          needs_confirmation_requirements: Json[] | null
          not_met_requirements: Json[] | null
          ordercompletiondate_llm: string | null
          orderobject: string | null
          organizationcity: string | null
          organizationname: string | null
          payment_terms_llm: string | null
          publicationdate: string | null
          review_criteria_llm: string | null
          seen_at: string | null
          status: string
          submittingoffersdate: string | null
          updated_at: string | null
          url: string | null
          url_user: string | null
          voivodship: string | null
          wadium_llm: string | null
        }
        Insert: {
          application_form_llm?: string | null
          can_participate?: boolean | null
          company: string
          contract_penalties_llm?: string | null
          created_at?: string | null
          deposit_llm?: string | null
          description_long_llm?: string | null
          has_parts?: boolean | null
          id?: string
          met_requirements?: Json[] | null
          needs_confirmation_requirements?: Json[] | null
          not_met_requirements?: Json[] | null
          ordercompletiondate_llm?: string | null
          orderobject?: string | null
          organizationcity?: string | null
          organizationname?: string | null
          payment_terms_llm?: string | null
          publicationdate?: string | null
          review_criteria_llm?: string | null
          seen_at?: string | null
          status: string
          submittingoffersdate?: string | null
          updated_at?: string | null
          url?: string | null
          url_user?: string | null
          voivodship?: string | null
          wadium_llm?: string | null
        }
        Update: {
          application_form_llm?: string | null
          can_participate?: boolean | null
          company?: string
          contract_penalties_llm?: string | null
          created_at?: string | null
          deposit_llm?: string | null
          description_long_llm?: string | null
          has_parts?: boolean | null
          id?: string
          met_requirements?: Json[] | null
          needs_confirmation_requirements?: Json[] | null
          not_met_requirements?: Json[] | null
          ordercompletiondate_llm?: string | null
          orderobject?: string | null
          organizationcity?: string | null
          organizationname?: string | null
          payment_terms_llm?: string | null
          publicationdate?: string | null
          review_criteria_llm?: string | null
          seen_at?: string | null
          status?: string
          submittingoffersdate?: string | null
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
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
