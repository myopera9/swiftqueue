"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useTheme } from "next-themes"
import { Moon, Sun, Smartphone, UserPlus, Save } from "lucide-react"

interface UserProfile {
    id: string
    username: string
    name: string | null
    email: string | null
    role: string
}

export default function SettingsPage() {
    const t = useTranslations('Settings');
    const { setTheme, theme } = useTheme()
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [password, setPassword] = useState("")

    // New User State
    const [newUserUsername, setNewUserUsername] = useState("")
    const [newUserPassword, setNewUserPassword] = useState("")
    const [newUserName, setNewUserName] = useState("")
    const [newUserEmail, setNewUserEmail] = useState("")
    const [newUserRole, setNewUserRole] = useState("USER")
    const [creatingUser, setCreatingUser] = useState(false)

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const res = await fetch('/api/users/me')
            if (res.ok) {
                const data = await res.json()
                setProfile(data)
            }
        } catch (error) {
            console.error("Failed to fetch profile", error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdateProfile = async () => {
        if (!profile) return
        setSaving(true)
        try {
            const res = await fetch('/api/users/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: profile.name,
                    email: profile.email,
                    password: password || undefined
                })
            })
            if (res.ok) {
                alert("Profile updated successfully")
                setPassword("") // Clear password field
            } else {
                alert("Failed to update profile")
            }
        } catch (error) {
            console.error("Error updating profile", error)
            alert("Error updating profile")
        } finally {
            setSaving(false)
        }
    }

    const handleCreateUser = async () => {
        if (!newUserUsername || !newUserPassword) {
            alert("Username and password are required")
            return
        }
        setCreatingUser(true)
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: newUserUsername,
                    password: newUserPassword,
                    name: newUserName,
                    email: newUserEmail,
                    role: newUserRole
                })
            })
            if (res.ok) {
                alert("User created successfully")
                // Reset form
                setNewUserUsername("")
                setNewUserPassword("")
                setNewUserName("")
                setNewUserEmail("")
                setNewUserRole("USER")
            } else {
                const data = await res.json()
                alert(`Failed to create user: ${data.error}`)
            }
        } catch (error) {
            console.error("Error creating user", error)
            alert("Error creating user")
        } finally {
            setCreatingUser(false)
        }
    }

    if (loading) {
        return <div className="p-8">Loading settings...</div> // This could be translated too
    }

    return (
        <div className="flex flex-col space-y-8 p-8 md:flex-row md:space-x-8 md:space-y-0">
            <div className="flex-1 space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">{t('title')}</h2>
                <p className="text-muted-foreground">
                    {t('description')}
                </p>

                <div className="grid gap-6">
                    {/* Profile Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('profile')}</CardTitle>
                            <CardDescription>
                                Update your personal information.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">Username</Label>
                                <Input id="username" value={profile?.username || ''} disabled />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">{t('name')}</Label>
                                <Input
                                    id="name"
                                    value={profile?.name || ''}
                                    onChange={(e) => setProfile(prev => prev ? { ...prev, name: e.target.value } : null)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">{t('email')}</Label>
                                <Input
                                    id="email"
                                    value={profile?.email || ''}
                                    onChange={(e) => setProfile(prev => prev ? { ...prev, email: e.target.value } : null)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Change Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Leave blank to keep current password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Role</Label>
                                <Input id="role" value={profile?.role || ''} disabled />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleUpdateProfile} disabled={saving}>
                                <Save className="mr-2 h-4 w-4" />
                                {saving ? "Saving..." : t('save')}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Create User Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Create User</CardTitle>
                            <CardDescription>
                                Add a new user to the system.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="new-username">Username *</Label>
                                    <Input
                                        id="new-username"
                                        value={newUserUsername}
                                        onChange={(e) => setNewUserUsername(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-password">Password *</Label>
                                    <Input
                                        id="new-password"
                                        type="password"
                                        value={newUserPassword}
                                        onChange={(e) => setNewUserPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-name">Display Name</Label>
                                <Input
                                    id="new-name"
                                    value={newUserName}
                                    onChange={(e) => setNewUserName(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-email">Email</Label>
                                <Input
                                    id="new-email"
                                    type="email"
                                    value={newUserEmail}
                                    onChange={(e) => setNewUserEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-role">Role</Label>
                                <Select value={newUserRole} onValueChange={setNewUserRole}>
                                    <SelectTrigger id="new-role">
                                        <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="USER">User</SelectItem>
                                        <SelectItem value="ADMIN">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleCreateUser} disabled={creatingUser}>
                                <UserPlus className="mr-2 h-4 w-4" />
                                {creatingUser ? "Creating..." : "Create User"}
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Appearance Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>
                                Customize the interface look and feel.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center space-x-4 rounded-md border p-4">
                                <Smartphone className="px-1" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        System
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Matches your device&apos;s system settings.
                                    </p>
                                </div>
                                <Switch
                                    checked={theme === 'system'}
                                    onCheckedChange={() => setTheme("system")}
                                />
                            </div>
                            <div className="flex items-center space-x-4 rounded-md border p-4">
                                <Sun className="px-1" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Light Mode
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Use light colors for the interface.
                                    </p>
                                </div>
                                <Switch
                                    checked={theme === 'light'}
                                    onCheckedChange={() => setTheme("light")}
                                />
                            </div>
                            <div className="flex items-center space-x-4 rounded-md border p-4">
                                <Moon className="px-1" />
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Dark Mode
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Use dark colors for the interface.
                                    </p>
                                </div>
                                <Switch
                                    checked={theme === 'dark'}
                                    onCheckedChange={() => setTheme("dark")}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
