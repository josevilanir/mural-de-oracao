/**
 * Escapes dangerous HTML characters in user-supplied text before persisting
 * to the database, preventing stored XSS attacks.
 */
export function sanitizeUserInput(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}
