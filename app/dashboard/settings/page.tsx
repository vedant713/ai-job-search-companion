"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/components/auth-provider"

export default function SettingsPage() {
    const { user } = useAuth()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" value={user?.email || ""} disabled className="bg-muted" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" placeholder="Your name" defaultValue={user?.user_metadata?.full_name || ""} />
                    </div>
                    <Button>Save Changes</Button>
                </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
                <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>Manage your app preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Email Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive daily summaries</p>
                        </div>
                        <Button variant="outline">Enabled</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
