export function getAdminPath(): string {
    // In client-side code, this might need to be passed down or available via public env
    // NEXT_PUBLIC_ADMIN_PATH usually works for client
    // For server/middleware, standard process.env works

    // Default to /admin if not set, but the goal is to set it.
    const path = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin'

    // Ensure it starts with / and doesn't end with /
    return path.startsWith('/') ? path : `/${path}`
}
