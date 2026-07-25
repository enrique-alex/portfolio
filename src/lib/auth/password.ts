/**
 * Convertit une chaîne hexadécimale en Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

/**
 * Convertit un ArrayBuffer en chaîne hexadécimale
 */
function bufferToHex(buffer: ArrayBuffer): string {
  const hashArray = Array.from(new Uint8Array(buffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hache un mot de passe en utilisant l'algorithme PBKDF2 avec SHA-256.
 * Cette fonction utilise la Web Crypto API, disponible nativement dans Cloudflare Workers.
 * 
 * @param password Le mot de passe en clair à hacher
 * @param saltHex Le sel encodé en hexadécimal
 * @param iterations Le nombre d'itérations (par défaut 210000, recommandation de l'OWASP pour PBKDF2-HMAC-SHA256)
 * @returns Le hash final encodé en chaîne hexadécimale (64 caractères pour 256 bits)
 */
export async function hashPassword(password: string, saltHex: string, iterations: number = 210000): Promise<string> {
  const encoder = new TextEncoder();
  const passwordBuffer = encoder.encode(password);
  const saltBuffer = hexToBytes(saltHex);

  // Importe le mot de passe comme clé brute pour PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    passwordBuffer,
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );

  // Dérive 256 bits (32 octets) à partir du mot de passe et du sel
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: saltBuffer,
      iterations: iterations,
      hash: "SHA-256"
    },
    keyMaterial,
    256 // 256 bits = 32 octets
  );

  return bufferToHex(derivedBits);
}

/**
 * Génère un sel cryptographique aléatoire de 16 octets (128 bits).
 * 
 * @returns Le sel encodé en chaîne hexadécimale
 */
export function generateSalt(): string {
  const salt = new Uint8Array(16);
  crypto.getRandomValues(salt);
  return bufferToHex(salt.buffer);
}

/**
 * Génère un secret de session cryptographique de 32 octets (256 bits).
 * 
 * @returns Le secret de session encodé en base64
 */
export function generateSessionSecret(): string {
  const secret = new Uint8Array(32);
  crypto.getRandomValues(secret);
  // Convertit en base64 via un tableau de charcodes
  const binaryString = String.fromCharCode(...secret);
  return btoa(binaryString);
}

/**
 * Compare deux chaînes de caractères en temps constant.
 * 
 * IMPORTANT: Cette fonction accumule les différences bit à bit (XOR) sans utiliser
 * de retour anticipé (early return) lors de la comparaison des caractères.
 * L'absence de retour anticipé garantit que le temps d'exécution ne dépend PAS
 * de la position du premier caractère différent, empêchant ainsi les attaques temporelles (timing attacks).
 * 
 * @param a Première chaîne
 * @param b Deuxième chaîne
 * @returns true si les chaînes sont strictement identiques, false sinon
 */
export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Renvoyer false immédiatement sur des longueurs différentes est acceptable 
    // car la longueur d'un hash est fixe et ne dévoile rien sur le mot de passe original.
    // Cela évite également les accès hors limites (out of bounds).
    return false;
  }

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    // On accumule les différences via un OU binaire et un XOR sur le code caractère.
    // Si les deux caractères sont identiques, le XOR donne 0.
    // Si mismatch devient différent de 0, il le restera jusqu'à la fin de la boucle.
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

/**
 * Vérifie si un mot de passe en clair correspond au hash enregistré.
 * 
 * @param password Le mot de passe en clair à vérifier
 * @param saltHex Le sel utilisé lors du hachage, en hexadécimal
 * @param expectedHashHex Le hash de référence à comparer, en hexadécimal
 * @param iterations Le nombre d'itérations utilisé lors du hachage
 * @returns true si le mot de passe est valide, false sinon
 */
export async function verifyPassword(password: string, saltHex: string, expectedHashHex: string, iterations: number = 210000): Promise<boolean> {
  const actualHashHex = await hashPassword(password, saltHex, iterations);
  return constantTimeEqual(actualHashHex, expectedHashHex);
}
