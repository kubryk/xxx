'use client'

import { TodoItem } from './TodoItem'
import type { Todo } from '@/types/todo'

interface TodoListProps {
    todos: Todo[]
}

export function TodoList({ todos }: TodoListProps) {
    if (todos.length === 0) {
        return (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground p-8 text-center">
                <p>No tasks found.</p>
                <p className="text-sm">Add one above to get started!</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-2">
            {todos.map((todo) => (
                <TodoItem key={todo.id} todo={todo} />
            ))}
        </div>
    )
}
