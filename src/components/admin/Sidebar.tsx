'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    FileText,
    Activity,
    Settings,
    LogOut,
    Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_ITEMS = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Articles', href: '/admin/articles', icon: FileText },
    { label: 'Portfolio', href: '/admin/projects', icon: Briefcase },
    { label: 'Events', href: '/admin/events', icon: Activity },
    { label: 'Webhooks', href: '/admin/webhooks', icon: Activity },
    { label: 'Legal', href: '/admin/legal', icon: FileText }, // Reusing FileText or finding better icon
    { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col fixed left-0 top-0 h-full">
            <div className="p-6 border-b border-border">
                <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl">
                    <span>Admin Panel</span>
                </Link>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {NAV_ITEMS.map(item => {
                    const isActive = pathname === item.href
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium ${isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-accent text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            <Icon className="size-4" />
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-border">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-destructive"
                    asChild
                >
                    <Link href="/admin/login">
                        <LogOut className="mr-2 size-4" /> Logout
                    </Link>
                </Button>
            </div>
        </aside>
    )
}
