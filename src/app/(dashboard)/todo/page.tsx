import { TodoList } from '@/components/todo/TodoList'
import { NewTodoForm } from '@/components/todo/NewTodoForm'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function TodoPage() {
    const supabase = await createClient()

    // For testing, we might not force Auth, but the RLS policies
    // require an authenticated user to insert/update.

    // Let's get the user session
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (!session) redirect('/login')

    const { data: todos, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching todos:', error)
    }

    return (
        <div className="mx-auto max-w-4xl flex h-full flex-col space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">TODO List</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your tasks effectively. Your tasks are saved securely to Supabase.
                </p>
            </div>

            <div className="grid gap-8">
                <NewTodoForm />
                <TodoList todos={todos || []} />
            </div>
        </div>
    )
}
