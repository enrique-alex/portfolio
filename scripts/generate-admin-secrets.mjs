import crypto from 'node:crypto';
import readline from 'node:readline';
import { Writable } from 'node:stream';

const ITERATIONS = 100000;
const KEY_LENGTH = 32;

// Flux de sortie muté pour cacher la saisie du mot de passe
const mutableStdout = new Writable({
  write: function(chunk, encoding, callback) {
    if (!this.muted) {
      process.stdout.write(chunk, encoding);
    }
    callback();
  }
});

mutableStdout.muted = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: mutableStdout,
  terminal: true
});

/**
 * Demande une entrée utilisateur de façon cachée
 */
function askHidden(query) {
  return new Promise((resolve) => {
    mutableStdout.muted = false;
    process.stdout.write(query);
    mutableStdout.muted = true;
    
    rl.question('', (answer) => {
      mutableStdout.muted = false;
      console.log(); // Saut de ligne après la saisie
      resolve(answer);
    });
  });
}

async function main() {
  console.log("=== Génération des secrets d'administration ===\n");
  
  const p1 = await askHidden("Entrez le nouveau mot de passe administrateur : ");
  const p2 = await askHidden("Confirmez le mot de passe : ");
  
  if (p1 !== p2) {
    console.error("\n[Erreur] Les mots de passe ne correspondent pas. Annulation.");
    rl.close();
    process.exit(1);
  }
  
  if (p1.length < 16) {
    console.warn("\n[Attention] Le mot de passe fait moins de 16 caractères. Il est fortement recommandé d'utiliser une phrase de passe longue pour plus de sécurité.");
  }
  
  console.log("\nGénération en cours...");
  
  // 1. Sel cryptographique (16 octets)
  const saltBuffer = crypto.randomBytes(16);
  const saltHex = saltBuffer.toString('hex');
  
  // 2. Hash (PBKDF2-SHA256, 100000 itérations, 32 octets = 256 bits)
  const hashBuffer = crypto.pbkdf2Sync(p1, saltBuffer, ITERATIONS, KEY_LENGTH, 'sha256');
  const hashHex = hashBuffer.toString('hex');
  
  // 3. Secret de session aléatoire (32 octets encodés en base64)
  const sessionSecretBuffer = crypto.randomBytes(32);
  const sessionSecretBase64 = sessionSecretBuffer.toString('base64');
  
  console.log("\n=== SECRETS GÉNÉRÉS AVEC SUCCÈS ===\n");
  console.log("Copiez manuellement ces valeurs dans vos variables d'environnement (ex: via wrangler secret put et dans .dev.vars) :\n");
  console.log(`ADMIN_PASSWORD_SALT="${saltHex}"`);
  console.log(`ADMIN_PASSWORD_HASH="${hashHex}"`);
  console.log(`SESSION_SECRET="${sessionSecretBase64}"\n`);
  
  console.log("NE COMMITEZ JAMAIS CES VALEURS.\n");
  
  rl.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
