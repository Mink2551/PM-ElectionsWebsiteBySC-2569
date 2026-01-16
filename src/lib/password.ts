/**
 * Password utilities for client-side authentication
 * Note: For production, use Firebase Authentication or a backend with bcrypt
 */

/**
 * Hash a password using SHA-256
 * This is a demo implementation - use proper hashing in production
 */
export async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
    return hashHex;
}

/**
 * Verify a password against a stored hash
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const inputHash = await hashPassword(password);
    return inputHash === storedHash;
}

/**
 * Validate password strength
 */
export function validatePasswordStrength(password: string): { valid: boolean; message: string } {
    if (password.length < 6) {
        return { valid: false, message: "Password must be at least 6 characters" };
    }
    return { valid: true, message: "" };
}
