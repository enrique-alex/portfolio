import { constantTimeEqual } from "@/lib/auth/password";

/**
 * Payload stocké dans le cookie de session signé.
 * Le rôle est toujours 'admin' car c'est le seul rôle existant.
 */
export interface SessionPayload {
  role: "admin";
  issuedAt: number;
  expiresAt: number;
}

/**
 * Encode un ArrayBuffer en base64url (RFC 4648 §5).
 * Contrairement au base64 standard, le base64url n'utilise pas les caractères
 * + / = qui sont problématiques dans les cookies sans encodage additionnel.
 */
function arrayBufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/**
 * Encode une chaîne UTF-8 en base64url.
 */
function stringToBase64url(str: string): string {
  const encoded = new TextEncoder().encode(str);
  return arrayBufferToBase64url(encoded.buffer);
}

/**
 * Décode une chaîne base64url en chaîne UTF-8.
 */
function base64urlToString(b64url: string): string {
  // Restaure le base64 standard : remplace les caractères url-safe et ajoute le padding
  let b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) {
    b64 += "=";
  }
  const binaryString = atob(b64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

/**
 * Importe un secret de session comme clé HMAC-SHA256 pour la Web Crypto API.
 */
async function importHmacKey(secret: string): Promise<CryptoKey> {
  const keyData = new TextEncoder().encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Crée la valeur d'un cookie de session signé (format : payload_b64url.signature_b64url).
 *
 * Le payload contient le rôle, l'horodatage d'émission et l'expiration (24h).
 * La signature HMAC-SHA256 garantit l'intégrité et l'authenticité du payload :
 * toute modification du payload invalide la signature, ce qui empêche la falsification.
 *
 * @param sessionSecret Le secret partagé utilisé pour signer le cookie
 * @returns La valeur du cookie (PAS le header Set-Cookie complet)
 */
export async function createSessionCookie(sessionSecret: string): Promise<string> {
  const now = Date.now();
  const payload: SessionPayload = {
    role: "admin",
    issuedAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000, // 24 heures en ms
  };

  const payloadB64url = stringToBase64url(JSON.stringify(payload));

  const hmacKey = await importHmacKey(sessionSecret);
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    new TextEncoder().encode(payloadB64url)
  );
  const signatureB64url = arrayBufferToBase64url(signatureBuffer);

  return `${payloadB64url}.${signatureB64url}`;
}

/**
 * Vérifie qu'un cookie de session est authentique et non expiré.
 *
 * Étapes :
 * 1. Sépare payload et signature sur le premier "."
 * 2. Recalcule la signature attendue via HMAC-SHA256
 * 3. Compare les signatures avec constantTimeEqual pour prévenir les timing attacks
 * 4. Si la signature est valide, décode et vérifie que le payload n'est pas expiré
 *
 * Toute exception (JSON malformé, structure inattendue) est interceptée et
 * retourne false, jamais de propagation d'erreur vers l'appelant.
 *
 * @param cookieValue La valeur brute du cookie
 * @param sessionSecret Le secret partagé
 * @returns true si le cookie est valide et non expiré
 */
export async function verifySessionCookie(cookieValue: string, sessionSecret: string): Promise<boolean> {
  try {
    const dotIndex = cookieValue.indexOf(".");
    if (dotIndex === -1) {
      return false;
    }

    const payloadB64url = cookieValue.substring(0, dotIndex);
    const receivedSignature = cookieValue.substring(dotIndex + 1);

    if (!payloadB64url || !receivedSignature) {
      return false;
    }

    // Recalcule la signature attendue
    const hmacKey = await importHmacKey(sessionSecret);
    const expectedSignatureBuffer = await crypto.subtle.sign(
      "HMAC",
      hmacKey,
      new TextEncoder().encode(payloadB64url)
    );
    const expectedSignature = arrayBufferToBase64url(expectedSignatureBuffer);

    // Comparaison en temps constant pour prévenir les timing attacks
    if (!constantTimeEqual(expectedSignature, receivedSignature)) {
      return false;
    }

    // Signature valide : on peut maintenant faire confiance au payload
    const payloadJson = base64urlToString(payloadB64url);
    const payload = JSON.parse(payloadJson) as SessionPayload;

    // Vérifie la structure minimale attendue
    if (payload.role !== "admin" || typeof payload.expiresAt !== "number") {
      return false;
    }

    // Vérifie que le cookie n'est pas expiré
    return payload.expiresAt > Date.now();
  } catch {
    // JSON malformé, base64 invalide, structure inattendue : tout est rejeté silencieusement
    return false;
  }
}
