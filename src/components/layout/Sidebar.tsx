'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Home, Settings, LayoutDashboard, LogOut, User as UserIcon, Store } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'sonner'
import { availableTools } from '@/config/tools'

const baseNavigation = [
    { name: 'Dashboard', href: '/', icon: Home, id: 'home' },
]

interface SidebarProps {
    user: User | null
}

export function Sidebar({ user }: SidebarProps) {
    const pathname = usePathname()
    const router = useRouter()
    const supabase = createClient()
    const [enabledToolsIds, setEnabledToolsIds] = useState<string[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchTools = async () => {
        if (!user) {
            setIsLoading(false)
            return
        }
        setIsLoading(true)
        const { data, error } = await supabase
            .from('user_tools')
            .select('tool_id')
            .eq('user_id', user.id)
        if (!error && data) {
            setEnabledToolsIds(data.map(t => t.tool_id))
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchTools()

        const handleToolsUpdated = () => fetchTools()
        window.addEventListener('tools_updated', handleToolsUpdated)
        return () => window.removeEventListener('tools_updated', handleToolsUpdated)
    }, [user])

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut()
        if (error) {
            toast.error('Error signing out', { description: error.message })
        } else {
            toast.success('Signed out successfully')
            router.refresh()
            router.push('/login')
        }
    }

    return (
        <div className="flex h-full w-64 flex-col gap-4 border-r bg-muted/40 p-4 transition-all duration-300">
            <div className="flex h-14 items-center gap-2 px-2 font-semibold hover:opacity-80 transition-opacity">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <LayoutDashboard className="h-5 w-5" />
                </div>
                <span className="text-lg">Tools Hub</span>
            </div>

            <div className="flex-1 overflow-auto py-2">
                <nav className="grid gap-1 px-2">
                    {baseNavigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.name}
                            </Link>
                        )
                    })}

                    {user && (
                        <div className="mt-4 mb-1 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            My Tools
                        </div>
                    )}

                    {isLoading && user ? (
                        <div className="space-y-2 px-2 py-1 relative">
                            <Skeleton className="h-9 w-full rounded-lg" />
                            <Skeleton className="h-9 w-full rounded-lg" />
                        </div>
                    ) : (
                        availableTools
                            .filter(tool => enabledToolsIds.includes(tool.id))
                            .map((tool) => {
                                const isActive = pathname === tool.href
                                return (
                                    <Link
                                        key={tool.id}
                                        href={tool.href}
                                        className={cn(
                                            "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        )}
                                    >
                                        <tool.icon className="h-4 w-4" />
                                        {tool.name}
                                    </Link>
                                )
                            })
                    )}
                </nav>
            </div>

            <div className="mt-auto px-2 pb-4">
                <Link
                    href="/tools"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
                >
                    <Store className="h-4 w-4" />
                    Tool Store
                </Link>
                <Link
                    href="/settings"
                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground mb-4"
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </Link>

                {user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-muted outline-none">
                                <Avatar className="h-8 w-8 rounded-full">
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {user.email?.charAt(0).toUpperCase() || 'U'}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col items-start truncate overflow-hidden text-left">
                                    <span className="truncate w-full font-semibold">{user.email}</span>
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[200px]">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer" asChild>
                                <Link href="/settings">
                                    <UserIcon className="mr-2 h-4 w-4" />
                                    <span>Profile</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10" onClick={handleSignOut}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Sign out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Link
                        href="/login"
                        className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                        Sign In
                    </Link>
                )}
            </div>
        </div>
    )
}
