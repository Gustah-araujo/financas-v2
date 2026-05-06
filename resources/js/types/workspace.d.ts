export interface WorkspaceProps {
    id: number
    name: string
    slug: string
    role: 'owner' | 'editor'
}

export interface Member {
    id: number
    name: string
    email: string
    role: 'owner' | 'editor'
    joined_at: string
}

export interface Invitation {
    id: number
    email: string | null
    token: string
    created_at: string
    expires_at: string
}
