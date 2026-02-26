'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Todo } from '@/types/todo'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

interface TodoItemProps {
    todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const supabase = createClient()
    const router = useRouter()

    const handleToggle = async (checked: boolean) => {
        setIsUpdating(true)
        const { error } = await supabase
            .from('todos')
            .update({ is_completed: checked })
            .eq('id', todo.id)

        if (error) {
            toast.error('Failed to update task')
            setIsUpdating(false)
            return
        }

        toast.success(checked ? 'Task marked as completed' : 'Task marked as pending')
        setIsUpdating(false)
        router.refresh()
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        const { error } = await supabase
            .from('todos')
            .delete()
            .eq('id', todo.id)

        if (error) {
            toast.error('Failed to delete task')
            setIsDeleting(false)
            return
        }

        toast.success('Task deleted successfully')
        router.refresh()
    }

    return (
        <div className={cn(
            "group flex items-center justify-between rounded-lg border p-4 transition-all hover:shadow-md",
            todo.is_completed ? "bg-muted/50" : "bg-card",
            (isUpdating || isDeleting) && "opacity-50 pointer-events-none"
        )}>
            <div className="flex items-center gap-3">
                <Checkbox
                    checked={todo.is_completed}
                    onCheckedChange={handleToggle}
                    disabled={isUpdating || isDeleting}
                />
                <span className={cn(
                    "text-sm font-medium transition-all",
                    todo.is_completed && "text-muted-foreground line-through"
                )}>
                    {todo.title}
                </span>
            </div>

            <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isUpdating || isDeleting}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
            >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                <span className="sr-only">Delete</span>
            </Button>
        </div>
    )
}
