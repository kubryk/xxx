import { Sidebar } from '@/components/layout/Sidebar'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            <Sidebar user={user} />
            <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
                {children}
            </main>
        </div>
    )
}
