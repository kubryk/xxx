'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'

export function NewTodoForm() {
    const [title, setTitle] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!title.trim()) return

        setIsSubmitting(true)

        // For now we get the user session, but if RLS requires auth
        // and no user is signed in, this will fail.
        // In a real app we'd ensure the user is logged in first.
        // For local testing, we might need a test user or disable RLS.
        // Let's assume auth is handled or we use a public approach for now.
        // *If RLS is enabled, you MUST be authenticated to insert.*

        const { data: { session } } = await supabase.auth.getSession()

        if (!session?.user) {
            toast.error('You must be logged in to create a task.', {
                description: 'For testing, you might need to sign in or disable RLS.'
            })
            setIsSubmitting(false)
            return
        }

        const { error } = await supabase
            .from('todos')
            .insert({ title: title.trim(), user_id: session.user.id })

        if (error) {
            toast.error('Failed to create task')
            console.error(error)
        } else {
            toast.success('Task created successfully')
            setTitle('')
            router.refresh()
        }

        setIsSubmitting(false)
    }

    return (
        <Card className="shadow-sm border-dashed">
            <CardContent className="p-4">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Add a new task..."
                        disabled={isSubmitting}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={!title.trim() || isSubmitting}>
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        ) : (
                            <Plus className="h-4 w-4 mr-2" />
                        )}
                        Add Task
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
