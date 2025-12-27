import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Search } from "lucide-react"
import { useTranslations } from "next-intl"

interface TicketFiltersProps {
    status: string
    priority: string
    search?: string
    onStatusChange: (value: string) => void
    onPriorityChange: (value: string) => void
    onSearchChange?: (value: string) => void
    onClear: () => void
}

export function TicketFilters({
    status,
    priority,
    search = "",
    onStatusChange,
    onPriorityChange,
    onSearchChange,
    onClear
}: TicketFiltersProps) {
    const t = useTranslations('Filters')

    const hasFilters = status !== "ALL" || priority !== "ALL" || (search && search.length > 0)

    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-4 items-start sm:items-center">
            <div className="flex gap-2 w-full sm:w-auto items-center">
                {onSearchChange && (
                    <div className="relative w-full sm:w-[200px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('search')}
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                )}
                <Select value={status} onValueChange={onStatusChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t('status')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">{t('allStatuses')}</SelectItem>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                </Select>

                <Select value={priority} onValueChange={onPriorityChange}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder={t('priority')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ALL">{t('allPriorities')}</SelectItem>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                        <SelectItem value="CRITICAL">Critical</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {hasFilters && (
                <Button variant="ghost" onClick={onClear} size="sm" className="h-8 px-2 lg:px-3">
                    {t('clear')}
                    <X className="ml-2 h-4 w-4" />
                </Button>
            )}
        </div>
    )
}
