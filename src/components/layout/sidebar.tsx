"use client";

import { Link, usePathname } from "@/i18n/navigation";
import {
    LayoutDashboard,
    Ticket,
    PlusCircle,
    Settings,
    LogOut,
    User as UserIcon,
    Search
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from "@/components/language-switcher";
import { signOut } from "next-auth/react"
import { ShieldAlert } from "lucide-react"

const sidebarItems = [
    {
        titleKey: "dashboard",
        href: "/",
        icon: LayoutDashboard,
    },
    {
        titleKey: "allTickets",
        href: "/tickets",
        icon: Ticket,
    },
    {
        titleKey: "createTicket",
        href: "/tickets/new",
        icon: PlusCircle,
    },
    {
        titleKey: "vectorInquiry",
        href: "/vector-search",
        icon: Search,
    },
    {
        titleKey: "settings",
        href: "/settings",
        icon: Settings,
    },
];

interface SidebarProps {
    session: any
}

export function Sidebar({ session }: SidebarProps) {
    const pathname = usePathname();
    const t = useTranslations('Sidebar');

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground">
            <div className="flex h-14 items-center border-b px-4 font-bold tracking-tight justify-between">
                <span>{t('brand')}</span>
                <LanguageSwitcher />
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {sidebarItems.map((item, index) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                    isActive
                                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                        : "text-muted-foreground"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                {t(item.titleKey as any)}
                            </Link>
                        );
                    })}
                    {session?.user?.role === 'ADMIN' && (
                        <Link
                            href="/admin"
                            className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                                pathname === "/admin"
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            <ShieldAlert className="h-4 w-4" />
                            {t('admin')}
                        </Link>
                    )}
                </nav>
            </div>
            <div className="mt-auto border-t p-4">
                <div className="flex items-center justify-between gap-2 px-2 py-2">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary">
                            {session?.user?.image ? (
                                <img src={session.user.image} alt={session.user.name || "User"} className="h-8 w-8 rounded-full" />
                            ) : (
                                <UserIcon className="h-4 w-4" />
                            )}
                        </div>
                        <div className="text-sm">
                            <p className="font-medium truncate max-w-[100px]">{session?.user?.name || "User"}</p>
                            <p className="text-xs text-muted-foreground">{t('user')}</p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => signOut({ redirectTo: '/login' })}
                    >
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
