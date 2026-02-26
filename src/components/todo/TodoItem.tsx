'use client'

import { useState } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2, CalendarIcon, Pencil } from 'lucide-react'
import { parseISO, format, isBefore, startOfDay } from 'date-fns'
import { cn } from '@/lib/utils'
import type { Todo } from '@/types/todo'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'

interface TodoItemProps {
    todo: Todo
    hideDate?: boolean
}

export function TodoItem({ todo, hideDate = false }: TodoItemProps) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [editTitle, setEditTitle] = useState(todo.title)
    const [editDate, setEditDate] = useState<Date>(parseISO(todo.target_date))
    const [editPriority, setEditPriority] = useState<string>(todo.priority || 'medium')

    const supabase = createClient()
    const router = useRouter()

    const targetDate = startOfDay(parseISO(todo.target_date))
    const today = startOfDay(new Date())
    const isOverdue = isBefore(targetDate, today) && !todo.is_completed

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

    const handleUpdate = async () => {
        if (!editTitle.trim()) return

        setIsUpdating(true)
        const { error } = await supabase
            .from('todos')
            .update({
                title: editTitle.trim(),
                target_date: format(editDate, 'yyyy-MM-dd'),
                priority: editPriority
            })
            .eq('id', todo.id)

        if (error) {
            toast.error('Failed to update task')
            setIsUpdating(false)
            return
        }

        toast.success('Task updated successfully')
        setIsUpdating(false)
        setIsEditing(false)
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
            <div className="flex items-center gap-3 flex-1 min-w-0">
                <Checkbox
                    checked={todo.is_completed}
                    onCheckedChange={handleToggle}
                    disabled={isUpdating || isDeleting}
                />
                <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2">
                        {!todo.is_completed && (
                            <div className={cn(
                                "h-2 w-2 rounded-full shrink-0",
                                todo.priority === 'high' ? "bg-red-500" :
                                    todo.priority === 'medium' ? "bg-orange-500" :
                                        "bg-blue-500"
                            )} title={`${todo.priority} priority`} />
                        )}
                        <span className={cn(
                            "text-sm font-medium transition-all truncate",
                            todo.is_completed && "text-muted-foreground line-through"
                        )}>
                            {todo.title}
                        </span>
                    </div>
                    {!hideDate && (
                        <div className={cn(
                            "flex items-center text-xs font-medium px-2 py-0.5 rounded-full w-fit max-w-full",
                            isOverdue
                                ? "bg-destructive/10 text-destructive"
                                : todo.is_completed
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-secondary text-secondary-foreground"
                        )}>
                            <CalendarIcon className="mr-1 h-3 w-3 shrink-0" />
                            <span className="truncate">{format(targetDate, "dd.MM.yyyy")}</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            disabled={isUpdating || isDeleting}
                            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                        >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Edit Task</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <label htmlFor="title" className="text-sm font-medium">Task Title</label>
                                <Input
                                    id="title"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    placeholder="Task title..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Target Date</label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "justify-start text-left font-normal",
                                                !editDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {editDate ? format(editDate, "dd.MM.yyyy") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={editDate}
                                            onSelect={(d) => d && setEditDate(d)}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid gap-2">
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={editPriority} onValueChange={setEditPriority}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                                <span>Low</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="medium">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-orange-500" />
                                                <span>Medium</span>
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="high">
                                            <div className="flex items-center gap-2">
                                                <div className="h-2 w-2 rounded-full bg-red-500" />
                                                <span>High</span>
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                            <Button onClick={handleUpdate} disabled={isUpdating}>
                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Save Changes
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    disabled={isUpdating || isDeleting}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    <span className="sr-only">Delete</span>
                </Button>
            </div>
        </div>
    )
}
