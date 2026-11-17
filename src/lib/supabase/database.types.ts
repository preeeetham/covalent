
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "batch_items": {
                  Row: {
                    "batch_id": string,"candidate_id": string,"created_at": string,"id": string,"pass_reason": string | null,"position": number,"reasons": NonNullable<Json>,"score": number,"status": string,"user_id": string,"why_text": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "batch_id": string,"candidate_id": string,"created_at"?: string,"id"?: string,"pass_reason"?: string | null,"position"?: number,"reasons"?: NonNullable<Json>,"score": number,"status"?: string,"user_id": string,"why_text"?: string | null
                  }
                  Update: {
                    "batch_id"?: string,"candidate_id"?: string,"created_at"?: string,"id"?: string,"pass_reason"?: string | null,"position"?: number,"reasons"?: NonNullable<Json>,"score"?: number,"status"?: string,"user_id"?: string,"why_text"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "batch_items_batch_id_fkey"
      columns: ["batch_id"]
isOneToOne: false
      referencedRelation: "batches"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "batch_items_candidate_id_fkey"
      columns: ["candidate_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "batch_items_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"batches": {
                  Row: {
                    "batch_date": string,"created_at": string,"id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "batch_date": string,"created_at"?: string,"id"?: string,"user_id": string
                  }
                  Update: {
                    "batch_date"?: string,"created_at"?: string,"id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "batches_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"blocks": {
                  Row: {
                    "blocked_id": string,"blocker_id": string,"created_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "blocked_id": string,"blocker_id": string,"created_at"?: string
                  }
                  Update: {
                    "blocked_id"?: string,"blocker_id"?: string,"created_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "blocks_blocked_id_fkey"
      columns: ["blocked_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "blocks_blocker_id_fkey"
      columns: ["blocker_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"bonds": {
                  Row: {
                    "chemistry": number,"created_at": string,"dissolve_reason": string | null,"dissolved_by": string | null,"expires_at": string,"id": string,"last_move_at": string,"match_score": number,"nudged_by": string | null,"persona_due_at": string | null,"reasons": NonNullable<Json>,"reveal_a": boolean,"reveal_b": boolean,"round": number,"status": string,"user_a": string,"user_b": string,"why_text": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "chemistry"?: number,"created_at"?: string,"dissolve_reason"?: string | null,"dissolved_by"?: string | null,"expires_at"?: string,"id"?: string,"last_move_at"?: string,"match_score"?: number,"nudged_by"?: string | null,"persona_due_at"?: string | null,"reasons"?: NonNullable<Json>,"reveal_a"?: boolean,"reveal_b"?: boolean,"round"?: number,"status"?: string,"user_a": string,"user_b": string,"why_text"?: string | null
                  }
                  Update: {
                    "chemistry"?: number,"created_at"?: string,"dissolve_reason"?: string | null,"dissolved_by"?: string | null,"expires_at"?: string,"id"?: string,"last_move_at"?: string,"match_score"?: number,"nudged_by"?: string | null,"persona_due_at"?: string | null,"reasons"?: NonNullable<Json>,"reveal_a"?: boolean,"reveal_b"?: boolean,"round"?: number,"status"?: string,"user_a"?: string,"user_b"?: string,"why_text"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "bonds_user_a_fkey"
      columns: ["user_a"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "bonds_user_b_fkey"
      columns: ["user_b"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"date_feedback": {
                  Row: {
                    "created_at": string,"date_plan_id": string,"felt_safe": boolean,"meet_again": boolean,"note": string | null,"showed_up": boolean,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"date_plan_id": string,"felt_safe": boolean,"meet_again": boolean,"note"?: string | null,"showed_up": boolean,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"date_plan_id"?: string,"felt_safe"?: boolean,"meet_again"?: boolean,"note"?: string | null,"showed_up"?: boolean,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "date_feedback_date_plan_id_fkey"
      columns: ["date_plan_id"]
isOneToOne: false
      referencedRelation: "date_plans"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "date_feedback_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"date_plans": {
                  Row: {
                    "bond_id": string,"created_at": string,"id": string,"note": string | null,"paid_a": boolean,"paid_b": boolean,"proposed_by": string,"share_token": string,"starts_at": string,"status": string,"updated_at": string,"venue_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "bond_id": string,"created_at"?: string,"id"?: string,"note"?: string | null,"paid_a"?: boolean,"paid_b"?: boolean,"proposed_by": string,"share_token"?: string,"starts_at": string,"status"?: string,"updated_at"?: string,"venue_id": string
                  }
                  Update: {
                    "bond_id"?: string,"created_at"?: string,"id"?: string,"note"?: string | null,"paid_a"?: boolean,"paid_b"?: boolean,"proposed_by"?: string,"share_token"?: string,"starts_at"?: string,"status"?: string,"updated_at"?: string,"venue_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "date_plans_bond_id_fkey"
      columns: ["bond_id"]
isOneToOne: false
      referencedRelation: "bonds"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "date_plans_proposed_by_fkey"
      columns: ["proposed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "date_plans_venue_id_fkey"
      columns: ["venue_id"]
isOneToOne: false
      referencedRelation: "venues"
      referencedColumns: ["id"]
    }
                  ]
                },"events": {
                  Row: {
                    "created_at": string,"id": number,"name": string,"props": NonNullable<Json>,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: never,"name": string,"props"?: NonNullable<Json>,"user_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: never,"name"?: string,"props"?: NonNullable<Json>,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "events_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"messages": {
                  Row: {
                    "body": string,"bond_id": string,"created_at": string,"flagged": boolean,"id": string,"kind": string,"sender_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "body": string,"bond_id": string,"created_at"?: string,"flagged"?: boolean,"id"?: string,"kind"?: string,"sender_id": string
                  }
                  Update: {
                    "body"?: string,"bond_id"?: string,"created_at"?: string,"flagged"?: boolean,"id"?: string,"kind"?: string,"sender_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "messages_bond_id_fkey"
      columns: ["bond_id"]
isOneToOne: false
      referencedRelation: "bonds"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "messages_sender_id_fkey"
      columns: ["sender_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"payments": {
                  Row: {
                    "amount_inr": number,"created_at": string,"date_plan_id": string | null,"id": string,"kind": string,"meta": NonNullable<Json>,"paid_at": string | null,"provider": string,"ref": string | null,"status": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_inr": number,"created_at"?: string,"date_plan_id"?: string | null,"id"?: string,"kind": string,"meta"?: NonNullable<Json>,"paid_at"?: string | null,"provider"?: string,"ref"?: string | null,"status"?: string,"user_id": string
                  }
                  Update: {
                    "amount_inr"?: number,"created_at"?: string,"date_plan_id"?: string | null,"id"?: string,"kind"?: string,"meta"?: NonNullable<Json>,"paid_at"?: string | null,"provider"?: string,"ref"?: string | null,"status"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "payments_date_plan_id_fkey"
      columns: ["date_plan_id"]
isOneToOne: false
      referencedRelation: "date_plans"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "payments_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"photos": {
                  Row: {
                    "created_at": string,"id": string,"path_blur": (string)[],"path_original": string,"position": number,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"path_blur": (string)[],"path_original": string,"position"?: number,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"path_blur"?: (string)[],"path_original"?: string,"position"?: number,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "photos_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "archetype": string | null,"catalysts": number,"city": string | null,"company": string | null,"consent_marketing": boolean,"consent_privacy_at": string | null,"consent_terms_at": string | null,"created_at": string,"deleted_at": string | null,"dob": string | null,"email": string | null,"extra_slot_until": string | null,"first_name": string | null,"gender": string | null,"hometown": string | null,"id": string,"intent": string | null,"interested_in": (string)[],"is_admin": boolean,"is_demo": boolean,"is_evaluator": boolean,"last_active_at": string,"onboarded_at": string | null,"onboarding_step": number,"persona": Json | null,"reliability": number,"role": string | null,"verified": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "archetype"?: string | null,"catalysts"?: number,"city"?: string | null,"company"?: string | null,"consent_marketing"?: boolean,"consent_privacy_at"?: string | null,"consent_terms_at"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"dob"?: string | null,"email"?: string | null,"extra_slot_until"?: string | null,"first_name"?: string | null,"gender"?: string | null,"hometown"?: string | null,"id": string,"intent"?: string | null,"interested_in"?: (string)[],"is_admin"?: boolean,"is_demo"?: boolean,"is_evaluator"?: boolean,"last_active_at"?: string,"onboarded_at"?: string | null,"onboarding_step"?: number,"persona"?: Json | null,"reliability"?: number,"role"?: string | null,"verified"?: boolean
                  }
                  Update: {
                    "archetype"?: string | null,"catalysts"?: number,"city"?: string | null,"company"?: string | null,"consent_marketing"?: boolean,"consent_privacy_at"?: string | null,"consent_terms_at"?: string | null,"created_at"?: string,"deleted_at"?: string | null,"dob"?: string | null,"email"?: string | null,"extra_slot_until"?: string | null,"first_name"?: string | null,"gender"?: string | null,"hometown"?: string | null,"id"?: string,"intent"?: string | null,"interested_in"?: (string)[],"is_admin"?: boolean,"is_demo"?: boolean,"is_evaluator"?: boolean,"last_active_at"?: string,"onboarded_at"?: string | null,"onboarding_step"?: number,"persona"?: Json | null,"reliability"?: number,"role"?: string | null,"verified"?: boolean
                  }
                  Relationships: [
                    
                  ]
                },"quiz_answers": {
                  Row: {
                    "question_id": string,"user_id": string,"value": number
                  }
                  ComputedFields: never
                  Insert: {
                    "question_id": string,"user_id": string,"value": number
                  }
                  Update: {
                    "question_id"?: string,"user_id"?: string,"value"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "quiz_answers_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"rate_limits": {
                  Row: {
                    "count": number,"key": string,"window_start": string
                  }
                  ComputedFields: never
                  Insert: {
                    "count"?: number,"key": string,"window_start"?: string
                  }
                  Update: {
                    "count"?: number,"key"?: string,"window_start"?: string
                  }
                  Relationships: [
                    
                  ]
                },"reports": {
                  Row: {
                    "bond_id": string | null,"created_at": string,"detail": string | null,"id": string,"reason": string,"reporter_id": string | null,"resolved_at": string | null,"source": string,"status": string,"target_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "bond_id"?: string | null,"created_at"?: string,"detail"?: string | null,"id"?: string,"reason": string,"reporter_id"?: string | null,"resolved_at"?: string | null,"source"?: string,"status"?: string,"target_id"?: string | null
                  }
                  Update: {
                    "bond_id"?: string | null,"created_at"?: string,"detail"?: string | null,"id"?: string,"reason"?: string,"reporter_id"?: string | null,"resolved_at"?: string | null,"source"?: string,"status"?: string,"target_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "reports_bond_id_fkey"
      columns: ["bond_id"]
isOneToOne: false
      referencedRelation: "bonds"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reports_reporter_id_fkey"
      columns: ["reporter_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reports_target_id_fkey"
      columns: ["target_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"round_responses": {
                  Row: {
                    "bond_id": string,"created_at": string,"id": string,"payload": NonNullable<Json>,"round": number,"submitted_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "bond_id": string,"created_at"?: string,"id"?: string,"payload": NonNullable<Json>,"round": number,"submitted_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "bond_id"?: string,"created_at"?: string,"id"?: string,"payload"?: NonNullable<Json>,"round"?: number,"submitted_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "round_responses_bond_id_fkey"
      columns: ["bond_id"]
isOneToOne: false
      referencedRelation: "bonds"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "round_responses_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"user_elements": {
                  Row: {
                    "element_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "element_id": string,"user_id": string
                  }
                  Update: {
                    "element_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_elements_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"user_prompts": {
                  Row: {
                    "answer": string,"position": number,"prompt_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "answer": string,"position"?: number,"prompt_id": string,"user_id": string
                  }
                  Update: {
                    "answer"?: string,"position"?: number,"prompt_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_prompts_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"venues": {
                  Row: {
                    "area": string,"blurb": string | null,"city": string,"id": string,"kind": string,"map_url": string | null,"name": string,"offer_text": string | null,"partner": boolean,"price_band": string | null,"slug": string
                  }
                  ComputedFields: never
                  Insert: {
                    "area": string,"blurb"?: string | null,"city": string,"id"?: string,"kind": string,"map_url"?: string | null,"name": string,"offer_text"?: string | null,"partner"?: boolean,"price_band"?: string | null,"slug": string
                  }
                  Update: {
                    "area"?: string,"blurb"?: string | null,"city"?: string,"id"?: string,"kind"?: string,"map_url"?: string | null,"name"?: string,"offer_text"?: string | null,"partner"?: boolean,"price_band"?: string | null,"slug"?: string
                  }
                  Relationships: [
                    
                  ]
                },"waitlist": {
                  Row: {
                    "city": string,"created_at": string,"email": string,"gender": string | null,"id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "city": string,"created_at"?: string,"email": string,"gender"?: string | null,"id"?: string
                  }
                  Update: {
                    "city"?: string,"created_at"?: string,"email"?: string,"gender"?: string | null,"id"?: string
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "hit_rate_limit":
{ Args: { "p_key": string,"p_limit": number,"p_window_seconds": number }; Returns: boolean
                           },
"i_submitted_round":
{ Args: { "b": string,"r": number }; Returns: boolean
                           },
"is_blocked_pair":
{ Args: { "x": string,"y": string }; Returns: boolean
                           },
"is_bond_member":
{ Args: { "b": string }; Returns: boolean
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            
          }
        }
} as const
