'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Building2, Mail, Phone, MoreVertical, Send, Instagram, Linkedin, Facebook, Music } from 'lucide-react'
import { Client } from '@/types/crm'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

interface ClientListProps {
    initialClients: Client[]
}

type SortOption = 'name-asc' | 'name-desc' | 'newest' | 'oldest' | 'status'

export function ClientList({ initialClients }: ClientListProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [sortBy, setSortBy] = useState<SortOption>('newest')
    const [statusFilter, setStatusFilter] = useState<string>('all')
    const router = useRouter()

    const filteredClients = initialClients.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesStatus = statusFilter === 'all' || c.status === statusFilter

        return matchesSearch && matchesStatus
    }).sort((a, b) => {
        switch (sortBy) {
            case 'name-asc':
                return a.name.localeCompare(b.name)
            case 'name-desc':
                return b.name.localeCompare(a.name)
            case 'newest':
                return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            case 'oldest':
                return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            case 'status':
                return a.status.localeCompare(b.status)
            default:
                return 0
        }
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'lead':
                return <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 py-0 h-4 text-[10px] px-1.5 uppercase font-bold tracking-wider">Lead</Badge>
            case 'active':
                return <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 py-0 h-4 text-[10px] px-1.5 uppercase font-bold tracking-wider">Active</Badge>
            case 'client':
                return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 py-0 h-4 text-[10px] px-1.5 uppercase font-bold tracking-wider">Client</Badge>
            case 'archived':
                return <Badge variant="secondary" className="bg-muted text-muted-foreground py-0 h-4 text-[10px] px-1.5 uppercase font-bold tracking-wider">Archived</Badge>
            default:
                return null
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients..."
                        className="pl-9 w-full bg-card"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-3">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px] bg-card">
                            <SelectValue placeholder="All Statuses" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Statuses</SelectItem>
                            <SelectItem value="lead">Leads</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="client">Clients</SelectItem>
                            <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                        <SelectTrigger className="w-[160px] bg-card">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="newest">Newest first</SelectItem>
                            <SelectItem value="oldest">Oldest first</SelectItem>
                            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                            <SelectItem value="status">By status</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {filteredClients.length === 0 ? (
                <div className="text-center py-12 border rounded-lg bg-card/50 border-dashed">
                    <p className="text-muted-foreground">No clients found matching your search.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-1.5">
                    {filteredClients.map((client) => (
                        <div
                            key={client.id}
                            onClick={() => router.push(`/crm/${client.id}`)}
                            className="group transition-all hover:bg-card hover:border-primary/30 border border-border/40 bg-card/40 cursor-pointer flex flex-row items-center gap-4 px-3 py-1.5 rounded-md shadow-sm"
                        >
                            {/* Name and Notes */}
                            <div className="flex-1 min-w-0 flex items-center gap-3">
                                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0 text-[10px]">
                                    {client.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-medium text-sm truncate group-hover:text-primary transition-colors leading-tight">
                                        {client.name}
                                    </h3>
                                    {client.notes && (
                                        <div className="mt-0.5 max-w-[250px]">
                                            <div className="text-[10px] text-muted-foreground/60 leading-none italic truncate overflow-hidden">
                                                {client.notes}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Status Badge */}
                            <div className="hidden sm:block shrink-0 scale-75 origin-right">
                                {getStatusBadge(client.status)}
                            </div>

                            {/* Contact & Socials */}
                            <div className="hidden md:flex flex-row items-center gap-8 text-[12px] text-muted-foreground flex-[2]">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    {client.email && (
                                        <div className="flex items-center min-w-0 opacity-80">
                                            <Mail className="mr-1.5 h-3 w-3 shrink-0 opacity-50" />
                                            <span className="truncate">{client.email}</span>
                                        </div>
                                    )}
                                    {client.phone && (
                                        <div className="flex items-center shrink-0 opacity-80">
                                            <Phone className="mr-1.5 h-3 w-3 shrink-0 opacity-50" />
                                            <span className="truncate">{client.phone}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Social Icons Strip with Tooltips */}
                                <div className="flex items-center gap-2.5 shrink-0 px-2 border-l border-border/30 h-4">
                                    {client.telegram && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <a
                                                    href={client.telegram.startsWith('http') ? client.telegram : `https://t.me/${client.telegram.replace('@', '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="hover:opacity-100 opacity-60 transition-opacity"
                                                >
                                                    <Send className="h-3 w-3 text-sky-500" />
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-[10px] py-1 px-2">{client.telegram}</TooltipContent>
                                        </Tooltip>
                                    )}
                                    {client.instagram && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <a
                                                    href={client.instagram.startsWith('http') ? client.instagram : `https://instagram.com/${client.instagram.replace('@', '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="hover:opacity-100 opacity-60 transition-opacity"
                                                >
                                                    <Instagram className="h-3 w-3 text-pink-500" />
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-[10px] py-1 px-2">{client.instagram}</TooltipContent>
                                        </Tooltip>
                                    )}
                                    {client.linkedin && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <a
                                                    href={client.linkedin.startsWith('http') ? client.linkedin : `https://linkedin.com/in/${client.linkedin}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="hover:opacity-100 opacity-60 transition-opacity"
                                                >
                                                    <Linkedin className="h-3 w-3 text-blue-600" />
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-[10px] py-1 px-2">{client.linkedin}</TooltipContent>
                                        </Tooltip>
                                    )}
                                    {client.facebook && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <a
                                                    href={client.facebook.startsWith('http') ? client.facebook : `https://facebook.com/${client.facebook}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="hover:opacity-100 opacity-60 transition-opacity"
                                                >
                                                    <Facebook className="h-3 w-3 text-blue-500" />
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-[10px] py-1 px-2">{client.facebook}</TooltipContent>
                                        </Tooltip>
                                    )}
                                    {client.tiktok && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <a
                                                    href={client.tiktok.startsWith('http') ? client.tiktok : `https://tiktok.com/@${client.tiktok.replace('@', '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="hover:opacity-100 opacity-60 transition-opacity"
                                                    title={client.tiktok}
                                                >
                                                    <Music className="h-3 w-3 text-foreground" />
                                                </a>
                                            </TooltipTrigger>
                                            <TooltipContent side="top" className="text-[10px] py-1 px-2">{client.tiktok}</TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex items-center shrink-0">
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground/30 group-hover:text-muted-foreground group-hover:bg-muted transition-colors"
                                >
                                    <MoreVertical className="h-3.5 w-3.5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
