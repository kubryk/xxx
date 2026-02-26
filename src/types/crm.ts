export type ClientStatus = 'active' | 'lead' | 'client' | 'archived'

export interface Client {
    id: string
    user_id: string
    name: string
    company: string | null
    email: string | null
    phone: string | null
    address: string | null
    status: ClientStatus
    notes: string | null
    telegram: string | null
    instagram: string | null
    linkedin: string | null
    facebook: string | null
    tiktok: string | null
    created_at: string
    updated_at: string
}

export type InteractionType = 'note' | 'call' | 'meeting' | 'email' | 'agreement'

export interface ClientInteraction {
    id: string
    user_id: string
    client_id: string
    type: InteractionType
    date: string
    content: string
    created_at: string
}
