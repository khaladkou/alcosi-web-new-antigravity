import SystemTestClient from './SystemTestClient'

export default function SystemTestPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">System Health Check</h1>
                <p className="text-muted-foreground">
                    Run automated tests to verify core system functionality (Forms, Database, Webhooks).
                </p>
            </div>

            <SystemTestClient />
        </div>
    )
}
