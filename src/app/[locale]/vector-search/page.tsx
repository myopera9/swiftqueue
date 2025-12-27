"use client"

import { useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { processVectorSearch } from "./actions"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
}

export default function VectorSearchPage() {
    const t = useTranslations('VectorSearch');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: t('initialMessage')
        }
    ])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const locale = useLocale();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input
        }

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput("")
        setIsLoading(true)

        try {
            const responseContent = await processVectorSearch(input, locale);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: responseContent
            }
            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {

            console.error("Error sending message:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: t('errorMessage')
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex-1 p-8 pt-6 h-[calc(100vh-4rem)] flex flex-col">
            <div className="mb-8">
                <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
                <p className="text-muted-foreground">{t('description')}</p>
            </div>

            <Card className="flex-1 flex flex-col min-h-0">
                <CardHeader className="py-3 px-4 border-b">
                    <CardTitle className="text-sm font-medium">{t('chatSession')}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                    <ScrollArea className="flex-1 p-4">
                        <div className="space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.role === "user" ? "flex-row-reverse" : "flex-row"
                                        }`}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>
                                            {message.role === "user" ? "ME" : "AI"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={`rounded-lg p-3 max-w-[80%] text-sm ${message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-muted"
                                            }`}
                                    >
                                        {message.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback>AI</AvatarFallback>
                                    </Avatar>
                                    <div className="bg-muted rounded-lg p-3 text-sm">
                                        {t('thinking')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t">
                        <form onSubmit={handleSubmit} className="flex gap-2">
                            <Input
                                placeholder={t('placeholder')}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                            />
                            <Button type="submit" size="icon" disabled={isLoading}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
