let cachedPublicKey: CryptoKey | null = null;

async function fetchPublicKeyPem(): Promise<string> {
  const response = await fetch("/api/auth/public-key");
  if (!response.ok) {
    throw new Error(`Failed to fetch public key: ${response.status}`);
  }
  const json = await response.json();
  return json.data.publicKey;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN PUBLIC KEY-----/, "")
    .replace(/-----END PUBLIC KEY-----/, "")
    .replace(/\s/g, "");
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

async function importPublicKey(pem: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "spki",
    pemToArrayBuffer(pem),
    { name: "RSA-OAEP", hash: "SHA-256" },
    false,
    ["encrypt"],
  );
}

async function ensurePublicKey(): Promise<CryptoKey> {
  if (!cachedPublicKey) {
    const pem = await fetchPublicKeyPem();
    cachedPublicKey = await importPublicKey(pem);
  }
  return cachedPublicKey;
}

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

interface EncryptionEnvelope {
  encrypted: true;
  key: string;
  iv: string;
  data: string;
}

export async function encryptPayload(plainData: unknown): Promise<EncryptionEnvelope> {
  const publicKey = await ensurePublicKey();

  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt"],
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const plaintext = new TextEncoder().encode(JSON.stringify(plainData));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    plaintext,
  );

  const aesKeyRaw = await crypto.subtle.exportKey("raw", aesKey);
  const encryptedKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    aesKeyRaw,
  );

  return {
    encrypted: true,
    key: arrayBufferToBase64(encryptedKey),
    iv: arrayBufferToBase64(iv),
    data: arrayBufferToBase64(ciphertext),
  };
}

export function clearPublicKeyCache(): void {
  cachedPublicKey = null;
}
