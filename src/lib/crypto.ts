import 'server-only'
import crypto from 'crypto'

// Use NEXTAUTH_SECRET as the key source, or fallback (for dev only)
const SECRET_KEY = process.env.NEXTAUTH_SECRET || 'temporary-dev-secret-key-change-me-123'
const ALGORITHM = 'aes-256-cbc'

// Generate a buffer key from the secret
const key = crypto.createHash('sha256').update(SECRET_KEY).digest()

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    // Store IV with the encrypted text (iv:encrypted)
    return iv.toString('hex') + ':' + encrypted
}

export function decrypt(text: string): string {
    const textParts = text.split(':')
    const ivHex = textParts.shift()
    if (!ivHex) return text // Return original if not in format (legacy support)

    const iv = Buffer.from(ivHex, 'hex')
    const encryptedText = textParts.join(':')

    try {
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv)
        let decrypted = decipher.update(encryptedText, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    } catch (e) {
        // If decryption fails (e.g. invalid key or wrong format), return original
        // This helps if we switch keys or have legacy data
        console.error('Decryption failed:', e)
        return text
    }
}
