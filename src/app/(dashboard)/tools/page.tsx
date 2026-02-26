'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { availableTools } from '@/config/tools'
import { Switch } from '@/components/ui/switch'
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function ToolsStorePage() {
    const [enabledTools, setEnabledTools] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isToggling, setIsToggling] = useState<string | null>(null)

    const supabase = createClient()

    useEffect(() => {
        async function loadUserTools() {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                setIsLoading(false)
                return
            }

            const { data, error } = await supabase
                .from('user_tools')
                .select('tool_id')
                .eq('user_id', session.user.id)

            if (error) {
                console.error('Error loading tools', error)
            } else {
                setEnabledTools(data.map(t => t.tool_id))
            }
            setIsLoading(false)
        }

        loadUserTools()
    }, [supabase])

    const handleToggle = async (toolId: string, isEnabled: boolean) => {
        setIsToggling(toolId)
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            toast.error('You must be logged in to manage tools.')
            setIsToggling(null)
            return
        }

        if (isEnabled) {
            const { error } = await supabase
                .from('user_tools')
                .insert({ user_id: session.user.id, tool_id: toolId })

            if (error) {
                toast.error('Failed to enable tool')
            } else {
                setEnabledTools((prev) => [...prev, toolId])
                toast.success('Tool enabled')
            }
        } else {
            const { error } = await supabase
                .from('user_tools')
                .delete()
                .match({ user_id: session.user.id, tool_id: toolId })

            if (error) {
                toast.error('Failed to disable tool')
            } else {
                setEnabledTools((prev) => prev.filter(id => id !== toolId))
                toast.success('Tool disabled')
            }
        }

        // Force a next/router refresh later or a full window reload if we want the sidebar to update instantly if it's a Server Component
        // Wait, since Sidebar is a Client Component now doing fetching, or we can trigger a custom event.
        // For now, next/router refresh or just reloading might be necessary if state isn't shared globally.
        window.dispatchEvent(new Event('tools_updated'))

        setIsToggling(null)
    }

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-5xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Tool Store</h1>
                <p className="text-muted-foreground mt-2">
                    Customize your dashboard. Enable the tools you need and disable the ones you don't.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableTools.map((tool) => {
                    const isEnabled = enabledTools.includes(tool.id)
                    const isProcessing = isToggling === tool.id

                    return (
                        <Card key={tool.id} className="relative overflow-hidden transition-all hover:shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                <div className={`p-2 rounded-lg ${tool.color}`}>
                                    <tool.icon className="h-6 w-6" />
                                </div>
                                <Switch
                                    checked={isEnabled}
                                    disabled={isProcessing}
                                    onCheckedChange={(checked) => handleToggle(tool.id, checked)}
                                />
                            </CardHeader>
                            <CardContent>
                                <CardTitle className="text-xl mb-2">{tool.name}</CardTitle>
                                <CardDescription>
                                    {tool.description}
                                </CardDescription>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
