'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Client, ClientInteraction, ClientStatus, InteractionType } from '@/types/crm'
import { format, parseISO } from 'date-fns'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Phone, Mail, Building2, MapPin, Loader2, MessageSquare, PhoneCall, Calendar as CalendarIcon, FileText, CheckCircle2, Send, Instagram, Linkedin, Facebook, Music } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ClientDetailsContentProps {
    client: Client
    initialInteractions: ClientInteraction[]
}

const statusColors: Record<ClientStatus, string> = {
    active: 'bg-blue-500/10 text-blue-600 border-blue-200',
    lead: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    client: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
    archived: 'bg-muted text-muted-foreground border-border',
}

const interactionIconMap: Record<InteractionType, React.ElementType> = {
    note: FileText,
    call: PhoneCall,
    meeting: CalendarIcon,
    email: MessageSquare,
    agreement: CheckCircle2,
}

const interactionColorMap: Record<InteractionType, string> = {
    note: 'bg-blue-500/10 text-blue-500',
    call: 'bg-green-500/10 text-green-500',
    meeting: 'bg-purple-500/10 text-purple-500',
    email: 'bg-orange-500/10 text-orange-500',
    agreement: 'bg-rose-500/10 text-rose-500',
}

export function ClientDetailsContent({ client, initialInteractions }: ClientDetailsContentProps) {
    const [interactions, setInteractions] = useState<ClientInteraction[]>(initialInteractions)
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
    const [isAddingInteraction, setIsAddingInteraction] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    // Profile State
    const [profile, setProfile] = useState({
        name: client.name,
        company: client.company || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        notes: client.notes || '',
        status: client.status,
        telegram: client.telegram || '',
        instagram: client.instagram || '',
        linkedin: client.linkedin || '',
        facebook: client.facebook || '',
        tiktok: client.tiktok || ''
    })

    // Interaction State
    const [newInteraction, setNewInteraction] = useState({
        type: 'note' as InteractionType,
        content: '',
    })

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsUpdatingProfile(true)

        const { error } = await supabase
            .from('clients')
            .update({
                name: profile.name,
                company: profile.company || null,
                email: profile.email || null,
                phone: profile.phone || null,
                address: profile.address || null,
                notes: profile.notes || null,
                status: profile.status,
                telegram: profile.telegram || null,
                instagram: profile.instagram || null,
                linkedin: profile.linkedin || null,
                facebook: profile.facebook || null,
                tiktok: profile.tiktok || null
            })
            .eq('id', client.id)

        if (error) {
            toast.error('Failed to update profile')
        } else {
            toast.success('Profile updated successfully')
            router.refresh()
        }
        setIsUpdatingProfile(false)
    }

    const handleAddInteraction = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newInteraction.content.trim()) return

        setIsAddingInteraction(true)
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            toast.error('Not authenticated')
            setIsAddingInteraction(false)
            return
        }

        const newEntry = {
            user_id: session.user.id,
            client_id: client.id,
            type: newInteraction.type,
            content: newInteraction.content.trim(),
            date: new Date().toISOString()
        }

        const { data, error } = await supabase
            .from('client_interactions')
            .insert(newEntry)
            .select()
            .single()

        if (error || !data) {
            toast.error('Failed to add interaction')
        } else {
            setInteractions([data as ClientInteraction, ...interactions])
            setNewInteraction({ ...newInteraction, content: '' })
            toast.success('Interaction saved')
            router.refresh()
        }
        setIsAddingInteraction(false)
    }

    return (
        <div className="grid gap-6 md:grid-cols-12 items-start animate-in fade-in slide-in-from-bottom-4 duration-500 ease-in-out">
            {/* LEFT COLUMN: Profile info */}
            <div className="md:col-span-4 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-xl">Profile Info</CardTitle>
                        <CardDescription>Update client contact details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleProfileUpdate} className="grid flex-1 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="status">Status</Label>
                                <Select
                                    value={profile.status}
                                    onValueChange={(v) => setProfile({ ...profile, status: v as ClientStatus })}
                                >
                                    <SelectTrigger className={cn("border", statusColors[profile.status])}>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="lead">Lead</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="client">Client</SelectItem>
                                        <SelectItem value="archived">Archived</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    value={profile.name}
                                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="company">Company</Label>
                                <div className="relative">
                                    <Building2 className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="company"
                                        className="pl-9"
                                        value={profile.company}
                                        onChange={(e) => setProfile({ ...profile, company: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        className="pl-9"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        className="pl-9"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="address">Location / Address</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="address"
                                        className="pl-9"
                                        value={profile.address}
                                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="telegram">Telegram</Label>
                                    <div className="relative">
                                        <Send className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="telegram"
                                            className="pl-9"
                                            value={profile.telegram}
                                            onChange={(e) => setProfile({ ...profile, telegram: e.target.value })}
                                            placeholder="@username"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="instagram">Instagram</Label>
                                    <div className="relative">
                                        <Instagram className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="instagram"
                                            className="pl-9"
                                            value={profile.instagram}
                                            onChange={(e) => setProfile({ ...profile, instagram: e.target.value })}
                                            placeholder="username"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="linkedin">LinkedIn</Label>
                                    <div className="relative">
                                        <Linkedin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="linkedin"
                                            className="pl-9"
                                            value={profile.linkedin}
                                            onChange={(e) => setProfile({ ...profile, linkedin: e.target.value })}
                                            placeholder="profile link"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="facebook">Facebook</Label>
                                    <div className="relative">
                                        <Facebook className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="facebook"
                                            className="pl-9"
                                            value={profile.facebook}
                                            onChange={(e) => setProfile({ ...profile, facebook: e.target.value })}
                                            placeholder="profile link"
                                        />
                                    </div>
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="tiktok">TikTok</Label>
                                    <div className="relative">
                                        <Music className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="tiktok"
                                            className="pl-9"
                                            value={profile.tiktok}
                                            onChange={(e) => setProfile({ ...profile, tiktok: e.target.value })}
                                            placeholder="username"
                                        />
                                    </div>
                                </div>
                            </div>

                            <Button type="submit" className="w-full mt-2" disabled={isUpdatingProfile}>
                                {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Profile
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">General Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Textarea
                            placeholder="Write permanent notes about this client..."
                            className="min-h-[150px] resize-y"
                            value={profile.notes}
                            onChange={(e) => setProfile({ ...profile, notes: e.target.value })}
                            onBlur={handleProfileUpdate} // Auto-save notes roughly
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Notes are saved automatically when you click outside the box.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* RIGHT COLUMN: Interactions & Operations */}
            <div className="md:col-span-8 flex flex-col gap-6">
                <Tabs defaultValue="timeline" className="w-full relative">
                    <TabsList className="grid w-full lg:w-[400px] grid-cols-2">
                        <TabsTrigger value="timeline">History Timeline</TabsTrigger>
                        <TabsTrigger value="log">Log Interaction</TabsTrigger>
                    </TabsList>

                    <TabsContent value="log" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Log New Interaction</CardTitle>
                                <CardDescription>
                                    Record a call, meeting result, or agreement. Let's keep the history rich.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleAddInteraction} className="grid gap-4">
                                    <div className="grid gap-2">
                                        <Label>Activity Type</Label>
                                        <div className="flex gap-2 flex-wrap">
                                            {(['note', 'call', 'meeting', 'email', 'agreement'] as InteractionType[]).map((type) => {
                                                const Icon = interactionIconMap[type]
                                                return (
                                                    <Button
                                                        key={type}
                                                        type="button"
                                                        variant={newInteraction.type === type ? 'default' : 'outline'}
                                                        className={cn("capitalize rounded-full", newInteraction.type === type && interactionColorMap[type], newInteraction.type === type && "font-semibold")}
                                                        onClick={() => setNewInteraction({ ...newInteraction, type })}
                                                    >
                                                        <Icon className="mr-2 h-4 w-4 shrink-0" />
                                                        {type}
                                                    </Button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                    <div className="grid gap-2 mt-2">
                                        <Label>Details</Label>
                                        <Textarea
                                            className="min-h-[120px]"
                                            placeholder="What happened? What did you agree on?"
                                            value={newInteraction.content}
                                            onChange={(e) => setNewInteraction({ ...newInteraction, content: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="flex justify-end mt-2">
                                        <Button type="submit" disabled={isAddingInteraction || !newInteraction.content}>
                                            {isAddingInteraction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                            Save Interaction
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="timeline" className="mt-6">
                        <Card>
                            <CardContent className="pt-6">
                                {interactions.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                                        <h3 className="text-lg font-medium">No history yet</h3>
                                        <p className="text-muted-foreground mt-1">Log your first interaction with this client to begin the timeline.</p>
                                    </div>
                                ) : (
                                    <div className="relative border-l border-muted pl-6 ml-4 space-y-8 py-4">
                                        {interactions.map((interaction) => {
                                            const Icon = interactionIconMap[interaction.type]
                                            return (
                                                <div key={interaction.id} className="relative">
                                                    <div className={cn(
                                                        "absolute -left-[43px] top-1 p-1.5 rounded-full border shadow-sm bg-background",
                                                        interactionColorMap[interaction.type]
                                                    )}>
                                                        <Icon className="h-4 w-4" />
                                                    </div>
                                                    <div className="flex flex-col gap-1.5 p-4 rounded-xl border bg-card/50 shadow-sm transition-all hover:shadow-md">
                                                        <div className="flex items-center justify-between gap-4">
                                                            <span className="font-semibold capitalize text-sm">{interaction.type}</span>
                                                            <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2 py-0.5 rounded-md">
                                                                {format(parseISO(interaction.date), 'MMM d, yyyy \u2022 HH:mm')}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed mt-1">
                                                            {interaction.content}
                                                        </p>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
