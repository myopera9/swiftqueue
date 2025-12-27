'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { authenticate } from '@/app/lib/actions'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { useTranslations } from 'next-intl'

function LoginButton() {
    const { pending } = useFormStatus()
    const t = useTranslations('Login')

    return (
        <Button className="w-full" aria-disabled={pending} type="submit">
            {pending ? t('signingIn') : t('signIn')}
        </Button>
    )
}

export default function LoginPage() {
    const [errorMessage, dispatch, isPending] = useActionState(authenticate, undefined)
    const t = useTranslations('Login')

    return (
        <>
            <div className="bg-gray-50 dark:bg-gray-950"><img style={{ width: '60px', height: '50px', float: 'right', marginRight: '20px', marginTop: '10px', backgroundColor: 'transparent' }} src="https://www.ryhintl.com/images/ryhlogo/ryhlogo.png" alt="RyHintl Logo" /></div>
            <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
                <Card className="w-full max-w-sm">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">{t('title')}</CardTitle>
                        <CardDescription>
                            {t('description')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={dispatch} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">{t('emailLabel')}</Label>
                                <Input id="username" name="username" type="text" required placeholder={t('emailPlaceholder')} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">{t('passwordLabel')}</Label>
                                <Input id="password" name="password" type="password" required placeholder="password" />
                            </div>
                            <LoginButton />
                            <div
                                className="flex h-8 items-end space-x-1"
                                aria-live="polite"
                                aria-atomic="true"
                            >
                                {errorMessage && (
                                    <p className="text-sm text-red-500">
                                        {t('error')}
                                    </p>
                                )}
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-2">
                        <div className="text-xs text-muted-foreground text-center">
                            All rights reserved &copy; {new Date().getFullYear()} SwiftQueue
                        </div>
                    </CardFooter>
                </Card>
            </div>
        </>
    )
}
