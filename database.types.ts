export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type Database = {
    public: {
        Tables: {
            active_instances: {
                Row: {
                    challenge_id: string
                    created_at: string | null
                    docker_container_id: string | null
                    expires_at: string
                    flag_root: string | null
                    flag_user: string | null
                    id: string
                    ip_address: unknown
                    status: Database["public"]["Enums"]["instance_status"] | null
                    user_id: string
                    vm_id: string | null
                }
                Insert: {
                    challenge_id: string
                    created_at?: string | null
                    docker_container_id?: string | null
                    expires_at: string
                    flag_root?: string | null
                    flag_user?: string | null
                    id?: string
                    ip_address?: unknown
                    status?: Database["public"]["Enums"]["instance_status"] | null
                    user_id: string
                    vm_id?: string | null
                }
                Update: {
                    challenge_id?: string
                    created_at?: string | null
                    docker_container_id?: string | null
                    expires_at?: string
                    flag_root?: string | null
                    flag_user?: string | null
                    id?: string
                    ip_address?: unknown
                    status?: Database["public"]["Enums"]["instance_status"] | null
                    user_id?: string
                    vm_id?: string | null
                }
                Relationships: [
                    {
                        foreignKeyName: "active_instances_challenge_id_fkey"
                        columns: ["challenge_id"]
                        isOneToOne: false
                        referencedRelation: "challenges"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "active_instances_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: true
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            challenges: {
                Row: {
                    category: Database["public"]["Enums"]["challenge_category"]
                    config: Json
                    created_at: string | null
                    description: string | null
                    difficulty: Database["public"]["Enums"]["difficulty_level"]
                    estimated_time: string | null
                    id: string
                    image_id: string | null
                    is_active: boolean | null
                    name: string
                    points: number | null
                    type: Database["public"]["Enums"]["challenge_type"]
                }
                Insert: {
                    category: Database["public"]["Enums"]["challenge_category"]
                    config?: Json
                    created_at?: string | null
                    description?: string | null
                    difficulty: Database["public"]["Enums"]["difficulty_level"]
                    estimated_time?: string | null
                    id: string
                    image_id?: string | null
                    is_active?: boolean | null
                    name: string
                    points?: number | null
                    type: Database["public"]["Enums"]["challenge_type"]
                }
                Update: {
                    category?: Database["public"]["Enums"]["challenge_category"]
                    config?: Json
                    created_at?: string | null
                    description?: string | null
                    difficulty?: Database["public"]["Enums"]["difficulty_level"]
                    estimated_time?: string | null
                    id?: string
                    image_id?: string | null
                    is_active?: boolean | null
                    name?: string
                    points?: number | null
                    type?: Database["public"]["Enums"]["challenge_type"]
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    created_at: string | null
                    id: string
                    score: number | null
                    updated_at: string | null
                    username: string
                    vpn_ip: unknown | null
                }
                Insert: {
                    created_at?: string | null
                    id: string
                    score?: number | null
                    updated_at?: string | null
                    username: string
                    vpn_ip?: unknown | null
                }
                Update: {
                    created_at?: string | null
                    id?: string
                    score?: number | null
                    updated_at?: string | null
                    username?: string
                    vpn_ip?: unknown | null
                }
                Relationships: []
            }
            roadmap_levels: {
                Row: {
                    color: string | null
                    created_at: string | null
                    description: string | null
                    icon: string | null
                    id: number
                    is_active: boolean | null
                    order_index: number
                    title: string
                }
                Insert: {
                    color?: string | null
                    created_at?: string | null
                    description?: string | null
                    icon?: string | null
                    id?: number
                    is_active?: boolean | null
                    order_index: number
                    title: string
                }
                Update: {
                    color?: string | null
                    created_at?: string | null
                    description?: string | null
                    icon?: string | null
                    id?: number
                    is_active?: boolean | null
                    order_index?: number
                    title?: string
                }
                Relationships: []
            }
            roadmap_modules: {
                Row: {
                    created_at: string | null
                    description: string | null
                    id: number
                    level_id: number | null
                    order_index: number
                    title: string
                }
                Insert: {
                    created_at?: string | null
                    description?: string | null
                    id?: number
                    level_id?: number | null
                    order_index: number
                    title: string
                }
                Update: {
                    created_at?: string | null
                    description?: string | null
                    id?: number
                    level_id?: number | null
                    order_index?: number
                    title?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "roadmap_modules_level_id_fkey"
                        columns: ["level_id"]
                        isOneToOne: false
                        referencedRelation: "roadmap_levels"
                        referencedColumns: ["id"]
                    },
                ]
            }
            roadmap_topics: {
                Row: {
                    content: string | null
                    created_at: string | null
                    id: number
                    module_id: number | null
                    order_index: number
                    title: string
                }
                Insert: {
                    content?: string | null
                    created_at?: string | null
                    id?: number
                    module_id?: number | null
                    order_index: number
                    title: string
                }
                Update: {
                    content?: string | null
                    created_at?: string | null
                    id?: number
                    module_id?: number | null
                    order_index?: number
                    title?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "roadmap_topics_module_id_fkey"
                        columns: ["module_id"]
                        isOneToOne: false
                        referencedRelation: "roadmap_modules"
                        referencedColumns: ["id"]
                    },
                ]
            }
            solves: {
                Row: {
                    challenge_id: string
                    flag_type: Database["public"]["Enums"]["flag_type"]
                    id: string
                    points_awarded: number
                    submitted_at: string | null
                    submitted_flag: string
                    user_id: string
                }
                Insert: {
                    challenge_id: string
                    flag_type: Database["public"]["Enums"]["flag_type"]
                    id?: string
                    points_awarded: number
                    submitted_at?: string | null
                    submitted_flag: string
                    user_id: string
                }
                Update: {
                    challenge_id?: string
                    flag_type?: Database["public"]["Enums"]["flag_type"]
                    id?: string
                    points_awarded?: number
                    submitted_at?: string | null
                    submitted_flag?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "solves_challenge_id_fkey"
                        columns: ["challenge_id"]
                        isOneToOne: false
                        referencedRelation: "challenges"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "solves_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: false
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
            user_roadmap_progress: {
                Row: {
                    completed_at: string | null
                    id: string
                    status: string | null
                    topic_id: number
                    user_id: string
                }
                Insert: {
                    completed_at?: string | null
                    id?: string
                    status?: string | null
                    topic_id: number
                    user_id: string
                }
                Update: {
                    completed_at?: string | null
                    id?: string
                    status?: string | null
                    topic_id?: number
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "user_roadmap_progress_topic_id_fkey"
                        columns: ["topic_id"]
                        isOneToOne: false
                        referencedRelation: "roadmap_topics"
                        referencedColumns: ["id"]
                    },
                ]
            }
            vpn_configs: {
                Row: {
                    assigned_ip: unknown
                    config_content: string | null
                    created_at: string | null
                    public_key: string
                    user_id: string
                }
                Insert: {
                    assigned_ip: unknown
                    config_content?: string | null
                    created_at?: string | null
                    public_key: string
                    user_id: string
                }
                Update: {
                    assigned_ip?: unknown
                    config_content?: string | null
                    created_at?: string | null
                    public_key?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "vpn_configs_user_id_fkey"
                        columns: ["user_id"]
                        isOneToOne: true
                        referencedRelation: "profiles"
                        referencedColumns: ["id"]
                    },
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            challenge_category:
            | "web"
            | "pwn"
            | "reversing"
            | "crypto"
            | "forensics"
            | "mobile"
            | "cloud"
            | "osint"
            | "misc"
            | "active_directory"
            challenge_type: "docker" | "vm"
            difficulty_level: "easy" | "medium" | "hard" | "insane"
            flag_type: "user" | "root"
            instance_status: "spawning" | "running" | "stopping" | "error"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
