import { Sidebar } from '@/components/layout/Sidebar'
import { Clock } from '@/components/layout/Clock'
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
            <div className="flex flex-1 flex-col overflow-hidden">
                <header className="flex h-16 items-center justify-end px-4 md:px-8 lg:px-12 border-b bg-background/50 backdrop-blur-sm z-10 shrink-0">
                    <Clock />
                </header>
                <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
                    {children}
                </main>
            </div>
        </div>
    )
}
