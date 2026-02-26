'use client'

import { useState } from 'react'
import { isBefore, isToday, isTomorrow, startOfDay, parseISO, format, addDays } from 'date-fns'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { TodoItem } from './TodoItem'
import type { Todo } from '@/types/todo'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

type SortOption = 'priority' | 'time' | 'alphabetical'

interface TodoListProps {
    todos: Todo[]
}

export function TodoList({ todos }: TodoListProps) {
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
        'Overdue': false,
        'Today': false,
        'Tomorrow': true,
        'Upcoming': true,
        'Earlier': true // Default collapsed
    })
    const [sortBy, setSortBy] = useState<SortOption>('priority')

    if (todos.length === 0) {
        return (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground p-8 text-center">
                <p>No tasks found.</p>
                <p className="text-sm">Add one above to get started!</p>
            </div>
        )
    }

    const today = startOfDay(new Date())

    // Grouping Logic
    const overdue: Todo[] = []
    const todayTodos: Todo[] = []
    const tomorrowTodos: Todo[] = []
    const upcomingTodos: Todo[] = []
    const earlierTodos: Todo[] = []

    todos.forEach((todo) => {
        const targetDate = startOfDay(parseISO(todo.target_date))
        let targetDatetime = new Date(targetDate)

        if (todo.target_time) {
            // Combine date and time
            const [hours, minutes] = todo.target_time.split(':').map(Number)
            targetDatetime.setHours(hours, minutes, 0, 0)
        } else {
            // If no specific time, the deadline is the very end of the target day
            targetDatetime.setHours(23, 59, 59, 999)
        }

        const now = new Date()

        if (isBefore(targetDatetime, now) && !todo.is_completed) {
            // Past the exact deadline and not completed
            overdue.push(todo)
        } else if (isToday(targetDate)) {
            todayTodos.push(todo)
        } else if (isTomorrow(targetDate)) {
            tomorrowTodos.push(todo)
        } else if (isBefore(targetDate, startOfDay(now))) {
            // Completed tasks from yesterday or older
            earlierTodos.push(todo)
        } else {
            upcomingTodos.push(todo)
        }
    })

    const PRIORITY_ORDER: Record<string, number> = {
        'high': 3,
        'medium': 2,
        'low': 1
    }

    const sortTodos = (a: Todo, b: Todo) => {
        // 1. Always: Incomplete tasks before completed tasks
        if (a.is_completed !== b.is_completed) {
            return a.is_completed ? 1 : -1
        }

        // 2. Sort based on selected option
        if (sortBy === 'priority') {
            const priorityA = PRIORITY_ORDER[a.priority] || 2
            const priorityB = PRIORITY_ORDER[b.priority] || 2
            if (priorityA !== priorityB) {
                return priorityB - priorityA // High -> Low
            }
        } else if (sortBy === 'time') {
            // Tasks with a time come before tasks without a time (for incomplete tasks)
            if (a.target_time && !b.target_time) return -1
            if (!a.target_time && b.target_time) return 1

            // Both have time, sort earliest first
            if (a.target_time && b.target_time) {
                return a.target_time.localeCompare(b.target_time)
            }
        } else if (sortBy === 'alphabetical') {
            return a.title.localeCompare(b.title)
        }

        // 3. Fallback/Tie-breaker: Alphabetical by title
        return a.title.localeCompare(b.title)
    }

    // Sort arrays after grouping
    overdue.sort(sortTodos)
    todayTodos.sort(sortTodos)
    tomorrowTodos.sort(sortTodos)
    upcomingTodos.sort(sortTodos)
    earlierTodos.sort(sortTodos)

    const toggleSection = (title: string) => {
        setCollapsedSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }))
    }

    const renderGroup = (title: string, list: Todo[], isOverdue = false, subtitle?: string, hideItemDate = false, alwaysShow = false) => {
        if (list.length === 0 && !alwaysShow) return null

        const isCollapsed = collapsedSections[title]

        return (
            <div className="mb-4 space-y-2">
                <button
                    onClick={() => toggleSection(title)}
                    className="flex w-full items-center justify-between group transition-colors hover:bg-muted/30 p-1 rounded-md -ml-1"
                >
                    <div className="flex items-center gap-2">
                        {isCollapsed ? (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                        <h3 className={cn(
                            "text-sm font-semibold uppercase tracking-wider",
                            isOverdue ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                            {title} ({list.length})
                        </h3>
                    </div>
                    {subtitle && (
                        <span className="text-xs text-muted-foreground font-medium opacity-60 group-hover:opacity-100 transition-opacity">
                            {subtitle}
                        </span>
                    )}
                </button>

                {!isCollapsed && (
                    <div className="flex flex-col gap-2 pt-1">
                        {list.length > 0 ? (
                            list.map((todo) => (
                                <TodoItem key={todo.id} todo={todo} hideDate={hideItemDate} />
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground/60 italic pl-6 py-3">
                                No tasks for this section.
                            </p>
                        )}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex justify-end mb-4">
                <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Sort by</span>
                    <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                        <SelectTrigger className="h-8 w-[140px] text-xs">
                            <SelectValue placeholder="Sort order" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="priority" className="text-xs">High Priority</SelectItem>
                            <SelectItem value="time" className="text-xs">Time (Earliest)</SelectItem>
                            <SelectItem value="alphabetical" className="text-xs">Alphabetical (A-Z)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {renderGroup('Overdue', overdue, true)}
            {renderGroup('Today', todayTodos, false, format(today, "dd.MM.yyyy"), true, true)}
            {renderGroup('Tomorrow', tomorrowTodos, false, format(addDays(today, 1), "dd.MM.yyyy"), true)}
            {renderGroup('Upcoming', upcomingTodos)}
            {renderGroup('Earlier', earlierTodos, false, 'Completed past tasks')}

            {overdue.length === 0 && todayTodos.length === 0 && tomorrowTodos.length === 0 && upcomingTodos.length === 0 && earlierTodos.length === 0 && (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground p-8 text-center mt-4">
                    <p>No active tasks found.</p>
                </div>
            )}
        </div>
    )
}
