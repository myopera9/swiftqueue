"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export default function NewTicketPage() {
    const t = useTranslations('NewTicket')
    const router = useRouter()
    const queryClient = useQueryClient()
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        priority: "MEDIUM"
    })

    const { isPending, mutate } = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch('/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error('Failed to create ticket')
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tickets'] })
            router.push('/')
        },
    })

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        mutate(formData)
    }

    return (
        <div className="flex-1 p-8 pt-6">
            <div className="mb-6 flex items-center space-x-2">
                <Link href="/">
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" /> {t('backToDashboard')}
                    </Button>
                </Link>
            </div>

            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('title')}</CardTitle>
                    </CardHeader>
                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="title" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {t('topicLabel')}
                                </label>
                                <Input
                                    id="title"
                                    placeholder={t('topicPlaceholder')}
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="priority" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {t('priorityLabel')}
                                </label>
                                <select
                                    id="priority"
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                    <option value="CRITICAL">Critical</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="description" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                    {t('descriptionLabel')}
                                </label>
                                <textarea
                                    id="description"
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder={t('descriptionPlaceholder')}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button type="submit" disabled={isPending}>
                                {isPending ? t('creating') : t('submit')}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    )
}
