'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Loader2, CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

export function NewTodoForm() {
    const [title, setTitle] = useState('')
    const [date, setDate] = useState<Date>(new Date())
    const [priority, setPriority] = useState<string>('medium')
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

        const targetDateFormatted = format(date, 'yyyy-MM-dd')

        const { error } = await supabase
            .from('todos')
            .insert({
                title: title.trim(),
                user_id: session.user.id,
                target_date: targetDateFormatted,
                priority: priority
            })

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

                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn(
                                    "w-[140px] justify-start text-left font-normal shrink-0 px-3",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                <span className="truncate">
                                    {date ? format(date, "dd.MM.yyyy") : <span>Pick a date</span>}
                                </span>
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => d && setDate(d)}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>

                    <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="w-[110px] shrink-0">
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

                    <Button type="submit" disabled={!title.trim() || isSubmitting} className="shrink-0">
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
