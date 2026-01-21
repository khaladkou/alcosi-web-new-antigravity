export type EventLog = {
    id: string
    type: 'WEBHOOK' | 'CONTACT' | 'SEO_AUDIT'
    status: 'SUCCESS' | 'FAILED'
    date: Date
    summary: string
    details: any
}
