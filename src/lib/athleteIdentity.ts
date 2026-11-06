/**
 * Derives the same stable UID fingerprint as build_pilot_data.py.
 * This is local demo identification only; possession of a public FF UID does not
 * prove account ownership. Production identity requires trusted verification.
 */
export async function fingerprintFreeFireUid(raw: string): Promise<string | null> {
  // Trim punctuation around a UID. Accept common "123456789 (server)" form.
  const uid = raw.replace(/[\s-]/g, '').match(/^\d{7,14}/)?.[0]?.replace(/^0+/, '');
  if (!uid || !globalThis.crypto?.subtle) return null;
  const bytes = new TextEncoder().encode('gameskii:ff:uid:v1:' + uid);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join('');
}
