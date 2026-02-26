'use client'

import { useState, useEffect } from 'react'
import { Clock as ClockIcon, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Clock() {
    const [time, setTime] = useState<Date | null>(null)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        setTime(new Date())
        const timer = setInterval(() => {
            setTime(new Date())
        }, 1000)

        return () => clearInterval(timer)
    }, [])

    if (!mounted || !time) {
        return <div className="h-10 w-32" /> // Placeholder to prevent layout jump
    }

    const timeString = time.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    })

    const dateString = time.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    })

    return (
        <div className="flex items-center gap-4 bg-muted/30 hover:bg-muted/50 transition-colors px-4 py-1.5 rounded-full border border-border/50 backdrop-blur-md shadow-sm group select-none">
            <div className="flex items-center gap-2 pr-4 border-r border-border/50">
                <div className="relative flex items-center justify-center">
                    <ClockIcon className="h-4 w-4 text-primary relative z-10" />
                    <div className="absolute inset-0 bg-primary/20 blur-md rounded-full scale-150 animate-pulse" />
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground tabular-nums">
                    {timeString}
                </span>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest group-hover:text-foreground transition-colors">
                <CalendarIcon className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                <span>{dateString}</span>
            </div>
        </div>
    )
}
