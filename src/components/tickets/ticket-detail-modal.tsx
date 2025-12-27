"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useTranslations } from "next-intl"

interface TicketDetailModalProps {
    ticketId: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function TicketDetailModal({ ticketId, open, onOpenChange }: TicketDetailModalProps) {
    const t = useTranslations('TicketDetail')
    const queryClient = useQueryClient()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [status, setStatus] = useState("OPEN")
    const [priority, setPriority] = useState("MEDIUM")
    const [assignedToId, setAssignedToId] = useState<string | undefined>(undefined)
    const [newComment, setNewComment] = useState("")

    // Fetch ticket details
    const { data: ticket, isLoading } = useQuery({
        queryKey: ["ticket", ticketId],
        queryFn: async () => {
            if (!ticketId) return null
            const res = await fetch(`/api/tickets/${ticketId}`)
            if (!res.ok) throw new Error("Failed to fetch ticket")
            return res.json()
        },
        enabled: !!ticketId && open,
    })

    // Fetch users for assignment
    const { data: users } = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const res = await fetch("/api/users")
            if (!res.ok) throw new Error("Failed to fetch users")
            return res.json()
        },
        enabled: open,
    })

    // Update form state when ticket data is loaded
    useEffect(() => {
        if (ticket) {
            setTitle(ticket.title)
            setDescription(ticket.description)
            setStatus(ticket.status)
            setPriority(ticket.priority)
            setAssignedToId(ticket.assignedToId || "unassigned")
        }
    }, [ticket])

    // Update ticket mutation
    const mutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch(`/api/tickets/${ticketId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })
            if (!res.ok) throw new Error("Failed to update ticket")
            return res.json()
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] })
            queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] })
            // Don't close modal on simple update if user wants to keep editing
            // onOpenChange(false) 
            alert(t('success'))
        },
    })

    // Add comment mutation
    const commentMutation = useMutation({
        mutationFn: async (content: string) => {
            const res = await fetch(`/api/tickets/${ticketId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ content }),
            })
            if (!res.ok) throw new Error("Failed to add comment")
            return res.json()
        },
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] })
            setNewComment("")

            // Append to description
            const timestamp = new Date().toLocaleString()
            // We use variables (the content) here
            const appendText = `\n\n[Update ${timestamp}]\n${variables}`
            const updatedDescription = (description || "") + appendText

            setDescription(updatedDescription)
            mutation.mutate({ description: updatedDescription })
        }
    })

    const handleSave = () => {
        mutation.mutate({
            title,
            description,
            status,
            priority,
            assignedToId: assignedToId === "unassigned" ? null : assignedToId,
        })
    }

    const handleAddComment = () => {
        if (!newComment.trim()) return
        commentMutation.mutate(newComment)
    }

    if (!ticketId) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="py-8 text-center text-muted-foreground">{t('loading')}</div>
                ) : (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="title">{t('fieldTitle')}</Label>
                            <Input
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="assignedTo">{t('assignedTo') || 'Assigned To'}</Label>
                            <Select value={assignedToId} onValueChange={setAssignedToId}>
                                <SelectTrigger id="assignedTo">
                                    <SelectValue placeholder="Select user" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="unassigned">Unassigned</SelectItem>
                                    {users?.map((user: any) => (
                                        <SelectItem key={user.id} value={user.id}>
                                            {user.name || user.username || user.email}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="status">{t('status')}</Label>
                                <Select value={status} onValueChange={setStatus}>
                                    <SelectTrigger id="status">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="OPEN">Open</SelectItem>
                                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                        <SelectItem value="RESOLVED">Resolved</SelectItem>
                                        <SelectItem value="CLOSED">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="priority">{t('priority')}</Label>
                                <Select value={priority} onValueChange={setPriority}>
                                    <SelectTrigger id="priority">
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="LOW">Low</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HIGH">High</SelectItem>
                                        <SelectItem value="CRITICAL">Critical</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">{t('description')}</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="h-32"
                            />
                        </div>

                        {ticket?.createdBy && (
                            <div className="text-sm text-muted-foreground mt-2">
                                {t('createdBy', {
                                    name: ticket.createdBy.name || ticket.createdBy.email,
                                    date: new Date(ticket.createdAt).toLocaleString()
                                })}
                            </div>
                        )}

                        <div className="border-t pt-4 mt-4">
                            <h3 className="font-semibold mb-2">{t('history')}</h3>
                            <div className="space-y-4 max-h-[300px] overflow-y-auto mb-4 p-2 border rounded-md bg-muted/20">
                                {ticket?.comments?.map((comment: any) => (
                                    <div key={comment.id} className="bg-background border p-3 rounded-lg text-sm shadow-sm">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-semibold text-xs">
                                                {comment.author?.name || comment.author?.email || t('unknownUser')}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(comment.createdAt).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="whitespace-pre-wrap">{comment.content}</p>
                                    </div>
                                ))}
                                {(!ticket?.comments || ticket.comments.length === 0) && (
                                    <p className="text-sm text-muted-foreground italic">{t('noHistory')}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-comment">{t('addResponse')}</Label>
                                <Textarea
                                    id="new-comment"
                                    placeholder={t('placeholder')}
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    className="min-h-[80px]"
                                />
                                <div className="flex justify-end">
                                    <Button
                                        size="sm"
                                        onClick={handleAddComment}
                                        disabled={commentMutation.isPending || !newComment.trim()}
                                    >
                                        {commentMutation.isPending ? t('posting') : t('post')}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        {t('close')}
                    </Button>
                    <Button onClick={handleSave} disabled={mutation.isPending || isLoading}>
                        {mutation.isPending ? t('update') : t('update')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
