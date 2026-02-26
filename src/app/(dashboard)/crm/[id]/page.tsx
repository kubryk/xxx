import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Client, ClientInteraction } from '@/types/crm'
import { ClientDetailsContent } from '@/components/crm/ClientDetailsContent'
import { Button } from '@/components/ui/button'

interface PageProps {
    params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
    const { id } = await params
    return {
        title: `Client Profile | CRM`,
    }
}

export default async function ClientDetailPage({ params }: PageProps) {
    const supabase = await createClient()
    const { id } = await params

    const { data: { session } } = await supabase.auth.getSession()

    if (!session) redirect('/login')

    // Fetch client
    const { data: client, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', id)
        .single()

    if (clientError || !client) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <h1 className="text-2xl font-bold">Client Not Found</h1>
                <p className="text-muted-foreground">The client you are looking for does not exist or you don't have access.</p>
                <Link href="/crm">
                    <Button>Return to CRM</Button>
                </Link>
            </div>
        )
    }

    // Fetch interactions
    const { data: interactions, error: interactionsError } = await supabase
        .from('client_interactions')
        .select('*')
        .eq('client_id', id)
        .order('date', { ascending: false })

    return (
        <div className="mx-auto max-w-6xl flex flex-col space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/crm">
                    <Button variant="ghost" size="icon" className="shrink-0">
                        <ArrowLeft className="h-5 w-5" />
                        <span className="sr-only">Back to CRM</span>
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
                    <p className="text-muted-foreground mt-1">
                        Client Profile & History
                    </p>
                </div>
            </div>

            <ClientDetailsContent
                client={client as Client}
                initialInteractions={(interactions || []) as ClientInteraction[]}
            />
        </div>
    )
}
