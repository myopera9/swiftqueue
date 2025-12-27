"use client"

import { useState, useMemo } from "react"
import { TicketDetailModal } from "@/components/tickets/ticket-detail-modal"
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
import { Link } from "@/i18n/navigation" // Use localized Link
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useTranslations } from 'next-intl';
import { TicketFilters } from "@/components/tickets/ticket-filters"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useSession } from "next-auth/react"

export default function Dashboard() {
  const t = useTranslations('Dashboard');
  const { data: session } = useSession()
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

  const statusData = useMemo(() => {
    if (!tickets) return [];

    const counts = {
      OPEN: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      CLOSED: 0
    };

    tickets.forEach((t: any) => {
      if (counts.hasOwnProperty(t.status)) {
        // @ts-ignore
        counts[t.status]++;
      }
    });

    return [
      { name: 'Open', value: counts.OPEN, color: '#ef4444' }, // red-500
      { name: 'In Progress', value: counts.IN_PROGRESS, color: '#f59e0b' }, // amber-500
      { name: 'Resolved', value: counts.RESOLVED, color: '#10b981' }, // emerald-500
      { name: 'Closed', value: counts.CLOSED, color: '#6b7280' } // gray-500
    ];
  }, [tickets]);

  const handleClearFilters = () => {
    setStatusFilter("ALL")
    setPriorityFilter("ALL")
    setSearchQuery("")
  }

  if (isLoading) return <div className="p-8">{t('loading')}</div>
  if (isError) return <div className="p-8 text-red-500">{t('error')}</div>

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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('totalTickets')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets?.length || 0}</div>
          </CardContent>
        </Card>

        <Card style={{ overflow: 'auto', width: '850px' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('notice')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ overflow: 'auto', fontSize: '14px' }}>{t('noticeDescription')}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 lg:col-span-5">
          <CardHeader>
            <CardTitle>{t('recentTickets')}</CardTitle>
          </CardHeader>
          <CardContent style={{ overflow: 'auto', height: '400px' }}>
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
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-4 lg:col-span-2">
          <CardHeader>
            <CardTitle>{t('statusDistribution') || 'Ticket Status'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="name" type="category" width={80} />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/*<Card style={{ overflow: 'y-auto', width: '78vw' }}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('notice')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" style={{ overflow: 'auto', fontSize: '14px' }}>{t('noticeDescription')}</div>
          </CardContent>
        </Card>*/}
      </div >



      <TicketDetailModal
        ticketId={selectedTicketId}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div >
  )
}
