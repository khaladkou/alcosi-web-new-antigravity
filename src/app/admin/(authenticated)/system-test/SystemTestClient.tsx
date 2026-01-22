'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, CheckCircle2, XCircle, Loader2, Activity, Copy, Check } from 'lucide-react'
import {
    runContactTest,
    runArticleCreateTest,
    runViewTest,
    runWebhookSuccessTest,
    runWebhookErrorTest
} from '@/app/actions/system-test'

function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <button
            onClick={handleCopy}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            title="Copy to clipboard"
        >
            {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        </button>
    )
}

type TestResult = {
    name: string
    status: 'pending' | 'running' | 'success' | 'failed'
    message?: string
    action: () => Promise<{ success: boolean, message?: string, error?: string }>
}

export default function SystemTestClient() {
    const [isRunning, setIsRunning] = useState(false)
    const [results, setResults] = useState<Record<string, { status: string, message?: string }>>({})

    const tests = [
        { id: '1', name: 'Submit Contact Form', action: runContactTest },
        { id: '2', name: 'Create Test Article (Internal)', action: runArticleCreateTest },
        { id: '3', name: 'Simulate Article View', action: runViewTest },
        { id: '4', name: 'Webhook: Create Article', action: runWebhookSuccessTest },
        { id: '5', name: 'Webhook: Report Error', action: runWebhookErrorTest },
    ]

    const [allCopied, setAllCopied] = useState(false)

    const runAllTests = async () => {
        setIsRunning(true)
        setResults({}) // Clear previous

        for (const test of tests) {
            setResults(prev => ({ ...prev, [test.id]: { status: 'running' } }))

            try {
                // Short delay for visual effect
                await new Promise(r => setTimeout(r, 500))

                const res = await test.action()

                setResults(prev => ({
                    ...prev,
                    [test.id]: {
                        status: res.success ? 'success' : 'failed',
                        message: res.success ? res.message : res.error
                    }
                }))
            } catch (e: any) {
                setResults(prev => ({
                    ...prev,
                    [test.id]: { status: 'failed', message: e.message }
                }))
            }
        }
        setIsRunning(false)
    }

    const copyAllResults = async () => {
        if (Object.keys(results).length === 0) return

        const formattedResults = tests.map(test => {
            const result = results[test.id]
            if (!result) return `${test.id}. ${test.name}: [PENDING]`
            const status = result.status.toUpperCase()
            const message = result.message ? ` - ${result.message}` : ''
            return `${test.id}. ${test.name}: [${status}]${message}`
        }).join('\n')

        const finalText = `SYSTEM TEST REPORT (${new Date().toLocaleString()})\n\n${formattedResults}`

        try {
            await navigator.clipboard.writeText(finalText)
            setAllCopied(true)
            setTimeout(() => setAllCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy all:', err)
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Activity className="size-5" />
                        Test Suite
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {tests.map(test => {
                            const result = results[test.id]
                            return (
                                <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                                    <span className="font-medium text-sm">{test.id}. {test.name}</span>
                                    <div className="flex items-center gap-2">
                                        {result?.status === 'running' && <Loader2 className="size-4 animate-spin text-blue-500" />}
                                        {result?.status === 'success' && <CheckCircle2 className="size-4 text-green-500" />}
                                        {result?.status === 'failed' && <XCircle className="size-4 text-destructive" />}
                                        {!result && <div className="size-4 rounded-full border border-muted-foreground/30" />}
                                    </div>
                                </div>
                            )
                        })}

                        <Button
                            className="w-full mt-4"
                            size="lg"
                            onClick={runAllTests}
                            disabled={isRunning}
                        >
                            {isRunning ? (
                                <>
                                    <Loader2 className="mr-2 size-4 animate-spin" /> Running Tests...
                                </>
                            ) : (
                                <>
                                    <Play className="mr-2 size-4" /> Run All Tests
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="h-full bg-slate-950 text-slate-50 border-slate-800">
                <CardHeader className="flex flex-row items-center justify-between py-4">
                    <CardTitle className="text-sm font-mono text-slate-400">Execution Log</CardTitle>
                    {Object.keys(results).length > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyAllResults}
                            className="h-6 text-xs text-slate-400 hover:text-slate-100 px-2"
                        >
                            {allCopied ? <Check className="mr-1 size-3" /> : <Copy className="mr-1 size-3" />}
                            Copy Log
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 font-mono text-xs">
                        {Object.entries(results).length === 0 && (
                            <div className="text-slate-600 italic">Ready to start...</div>
                        )}
                        {tests.map(test => {
                            const result = results[test.id]
                            if (!result) return null
                            return (
                                <div key={test.id} className="border-b border-slate-800/50 pb-2 last:border-0">
                                    <div className="flex items-center gap-2 mb-1 justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className={`
                                                ${result.status === 'running' ? 'border-blue-500 text-blue-500' : ''}
                                                ${result.status === 'success' ? 'border-green-500 text-green-500' : ''}
                                                ${result.status === 'failed' ? 'border-red-500 text-red-500' : ''}
                                                bg-transparent text-[10px] h-5 px-1
                                            `}>
                                                {result.status.toUpperCase()}
                                            </Badge>
                                            <span className="text-slate-300">{test.name}</span>
                                        </div>
                                        {result.message && (
                                            <CopyButton text={result.message} />
                                        )}
                                    </div>
                                    {result.message && (
                                        <div className="pl-14 text-slate-500 break-all">
                                            {result.status === 'failed' ? 'Error: ' : '> '}{result.message}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
