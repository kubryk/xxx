'use client'

import { useState } from 'react'
import { isBefore, isToday, isTomorrow, startOfDay, parseISO, format, addDays } from 'date-fns'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { TodoItem } from './TodoItem'
import type { Todo } from '@/types/todo'
import { cn } from '@/lib/utils'

interface TodoListProps {
    todos: Todo[]
}

export function TodoList({ todos }: TodoListProps) {
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
        'Overdue': false,
        'Today': false,
        'Tomorrow': false,
        'Upcoming': false
    })

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

    todos.forEach((todo) => {
        const targetDate = startOfDay(parseISO(todo.target_date))

        if (isBefore(targetDate, today)) {
            if (!todo.is_completed) {
                overdue.push(todo)
            }
        } else if (isToday(targetDate)) {
            todayTodos.push(todo)
        } else if (isTomorrow(targetDate)) {
            tomorrowTodos.push(todo)
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
        // First: Incomplete tasks before completed tasks
        if (a.is_completed !== b.is_completed) {
            return a.is_completed ? 1 : -1
        }

        // Second: Sort by priority (High -> Medium -> Low)
        const priorityA = PRIORITY_ORDER[a.priority] || 2
        const priorityB = PRIORITY_ORDER[b.priority] || 2
        return priorityB - priorityA
    }

    // Sort arrays after grouping
    overdue.sort(sortTodos)
    todayTodos.sort(sortTodos)
    tomorrowTodos.sort(sortTodos)
    upcomingTodos.sort(sortTodos)

    const toggleSection = (title: string) => {
        setCollapsedSections(prev => ({
            ...prev,
            [title]: !prev[title]
        }))
    }

    const renderGroup = (title: string, list: Todo[], isOverdue = false, subtitle?: string, hideItemDate = false) => {
        if (list.length === 0) return null

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
                        {list.map((todo) => (
                            <TodoItem key={todo.id} todo={todo} hideDate={hideItemDate} />
                        ))}
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full">
            {renderGroup('Overdue', overdue, true)}
            {renderGroup('Today', todayTodos, false, format(today, "dd.MM.yyyy"), true)}
            {renderGroup('Tomorrow', tomorrowTodos, false, format(addDays(today, 1), "dd.MM.yyyy"), true)}
            {renderGroup('Upcoming', upcomingTodos)}

            {overdue.length === 0 && todayTodos.length === 0 && tomorrowTodos.length === 0 && upcomingTodos.length === 0 && (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground p-8 text-center mt-4">
                    <p>No active tasks found.</p>
                </div>
            )}
        </div>
    )
}
