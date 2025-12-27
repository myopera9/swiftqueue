"use client"

import { useState, useMemo } from "react"
import { useTranslations } from "next-intl"
import { TicketDetailModal } from "@/components/tickets/ticket-detail-modal"
import { TicketFilters } from "@/components/tickets/ticket-filters"

import { useQuery } from "@tanstack/react-query"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function TicketsPage() {
    const t = useTranslations('TicketList');
    const tCommon = useTranslations('Dashboard'); // Reuse loading/error messages

    const { data: tickets, isLoading, isError } = useQuery({
        queryKey: ['tickets'],
        queryFn: async () => {
            const res = await fetch('/api/tickets')
            if (!res.ok) throw new Error('Network response was not ok')
            return res.json()
        }
    })

    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [statusFilter, setStatusFilter] = useState("ALL")
    const [priorityFilter, setPriorityFilter] = useState("ALL")
    const [searchQuery, setSearchQuery] = useState("")

    const handleTicketClick = (id: string) => {
        setSelectedTicketId(id)
        setIsModalOpen(true)
    }

    const filteredTickets = useMemo(() => {
        if (!tickets) return []
        return tickets.filter((ticket: any) => {
            const statusMatch = statusFilter === "ALL" || ticket.status === statusFilter
            const priorityMatch = priorityFilter === "ALL" || ticket.priority === priorityFilter

            const searchLower = searchQuery.toLowerCase()
            const searchMatch = !searchQuery ||
                ticket.title.toLowerCase().includes(searchLower) ||
                ticket.id.toLowerCase().includes(searchLower) ||
                (ticket.description && ticket.description.toLowerCase().includes(searchLower))

            return statusMatch && priorityMatch && searchMatch
        })
    }, [tickets, statusFilter, priorityFilter, searchQuery])

    const handleClearFilters = () => {
        setStatusFilter("ALL")
        setPriorityFilter("ALL")
        setSearchQuery("")
    }

    if (isLoading) return <div className="p-8">{tCommon('loading')}</div>
    if (isError) return <div className="p-8 text-red-500">{tCommon('error')}</div>

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
                <div className="flex items-center space-x-2">
                    <Link href="/tickets/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> {t('createTicket')}
                        </Button>
                    </Link>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{t('title')}</CardTitle>
                </CardHeader>
                <CardContent style={{ overflow: 'auto', height: '600px' }}>
                    <TicketFilters
                        status={statusFilter}
                        priority={priorityFilter}
                        search={searchQuery}
                        onStatusChange={setStatusFilter}
                        onPriorityChange={setPriorityFilter}
                        onSearchChange={setSearchQuery}
                        onClear={handleClearFilters}
                    />
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>{t('table.id')}</TableHead>
                                <TableHead>{t('table.title')}</TableHead>
                                <TableHead>{t('table.status')}</TableHead>
                                <TableHead>{t('table.priority')}</TableHead>
                                <TableHead>{t('table.assignedTo')}</TableHead>
                                <TableHead>{t('table.created')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTickets.map((ticket: any) => (
                                <TableRow key={ticket.id}>
                                    <TableCell
                                        className="font-medium cursor-pointer text-primary hover:underline"
                                        onClick={() => handleTicketClick(ticket.id)}
                                    >
                                        {ticket.id.slice(-5)}
                                    </TableCell>
                                    <TableCell>{ticket.title}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            ticket.status === 'OPEN' ? 'default' :
                                                ticket.status === 'IN_PROGRESS' ? 'secondary' :
                                                    'outline'
                                        }>
                                            {ticket.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{ticket.priority}</TableCell>
                                    <TableCell>{ticket.assignedTo?.name || ticket.assignedTo?.email || '-'}</TableCell>
                                    <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                            {filteredTickets.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        {t('noTickets')}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <TicketDetailModal
                ticketId={selectedTicketId}
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </div >
    )
}
