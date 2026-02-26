import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NewClientModal } from '@/components/crm/NewClientModal'
import { ClientList } from '@/components/crm/ClientList'
import { Client } from '@/types/crm'

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export default async function CRMPage() {
    const supabase = await createClient()

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) redirect('/login')

    const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching clients:', error)
    }

    const typedClients = (clients || []) as Client[]

    const activeCount = typedClients.filter(c => c.status === 'active').length
    const clientCount = typedClients.filter(c => c.status === 'client').length
    const leadCount = typedClients.filter(c => c.status === 'lead').length
    const archivedCount = typedClients.filter(c => c.status === 'archived').length

    return (
        <div className="mx-auto max-w-6xl flex h-full flex-col space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold tracking-tight">CRM Dashboard</h1>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-help">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/60">Total</span>
                                    <span className="text-xs font-semibold">{typedClients.length}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-[200px] text-center">Total number of all contacts in your database.</TooltipContent>
                        </Tooltip>

                        <div className="w-[1px] h-3 bg-border/40" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-help">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-yellow-500/60">Leads</span>
                                    <span className="text-xs font-semibold text-yellow-600">{leadCount}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-[200px] text-center">Potential clients who have shown interest.</TooltipContent>
                        </Tooltip>

                        <div className="w-[1px] h-3 bg-border/40" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-help">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-blue-500/60">Active</span>
                                    <span className="text-xs font-semibold text-blue-600">{activeCount}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-[200px] text-center">Clients currently being actively worked on.</TooltipContent>
                        </Tooltip>

                        <div className="w-[1px] h-3 bg-border/40" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-help">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-500/60">Clients</span>
                                    <span className="text-xs font-semibold text-emerald-600">{clientCount}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-[200px] text-center">Regular clients or those with successfully closed deals.</TooltipContent>
                        </Tooltip>

                        <div className="w-[1px] h-3 bg-border/40" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-help">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground/40">Archived</span>
                                    <span className="text-xs font-semibold text-muted-foreground/60">{archivedCount}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="max-w-[200px] text-center">Former contacts or inactive records.</TooltipContent>
                        </Tooltip>
                    </div>
                </div>
                <NewClientModal />
            </div>

            <ClientList initialClients={typedClients} />
        </div>
    )
}
