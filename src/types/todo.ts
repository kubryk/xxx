export type Todo = {
    id: string
    user_id: string
    title: string
    is_completed: boolean
    created_at: string
    target_date: string
    priority: 'low' | 'medium' | 'high'
}
