'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AdminLoginPage() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        })

        if (res.ok) {
            router.push('/admin/dashboard')
        } else {
            setError('Invalid password')
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="w-full max-w-sm p-8 bg-card border border-border rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-center">Admin Access</h1>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password..."
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <Button type="submit" className="w-full">
                        Login
                    </Button>
                </form>
            </div>
        </div>
    )
}
