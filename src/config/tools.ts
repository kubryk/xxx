import { CheckSquare, TypeIcon as type, LucideIcon, PenTool } from 'lucide-react'

export type ToolConfig = {
    id: string
    name: string
    description: string
    href: string
    icon: LucideIcon
    color: string
}

export const availableTools: ToolConfig[] = [
    {
        id: 'todo',
        name: 'TODO',
        description: 'Manage your tasks with a simple and clean interface.',
        href: '/todo',
        icon: CheckSquare,
        color: 'bg-emerald-500/10 text-emerald-500',
    },
    {
        id: 'notes',
        name: 'Notes',
        description: 'Jot down your thoughts, ideas, and meeting summaries.',
        href: '/notes',
        icon: PenTool,
        color: 'bg-blue-500/10 text-blue-500',
    }
    // Future tools can be added here
]
