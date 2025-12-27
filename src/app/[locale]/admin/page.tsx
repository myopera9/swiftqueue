
"use client"

import { useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"

export default function AdminPage() {
    const t = useTranslations('Admin')
    const [enText, setEnText] = useState("")
    const [jaText, setJaText] = useState("")

    const mutation = useMutation({
        mutationFn: async (data: { en: string; ja: string }) => {
            const res = await fetch("/api/admin/notice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Failed to update notice")
            return res.json()
        },
        onSuccess: () => {
            setEnText("")
            setJaText("")
            alert(t('success'))
            // Optional: force reload to see changes if they want to check dashboard immediately
            window.location.reload()
        },
    })

    const handleSave = () => {
        if (!enText || !jaText) return
        mutation.mutate({ en: enText, ja: jaText })
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
                <p className="text-muted-foreground">{t('description')}</p>
            </div>

            <Card className="max-w-2xl">
                <CardHeader>
                    <CardTitle>{t('noticeSettings')}</CardTitle>
                    <CardDescription>
                        Update the notice text displayed on the dashboard for both languages.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="en">{t('enNotice')}</Label>
                        <Input
                            id="en"
                            value={enText}
                            onChange={(e) => setEnText(e.target.value)}
                            placeholder="e.g. System Maintenance at 10 PM"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="ja">{t('jaNotice')}</Label>
                        <Input
                            id="ja"
                            value={jaText}
                            onChange={(e) => setJaText(e.target.value)}
                            placeholder="例: 午後10時にシステムメンテナンス"
                        />
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={mutation.isPending || !enText || !jaText}
                        className="mt-4"
                    >
                        {mutation.isPending ? "Saving..." : t('save')}
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
