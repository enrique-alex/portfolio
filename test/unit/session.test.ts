import { describe, it, expect } from "vitest";
import { createSessionCookie, verifySessionCookie } from "@/lib/auth/session";

function arrayBufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function stringToBase64url(str: string): string {
  const encoded = new TextEncoder().encode(str);
  return arrayBufferToBase64url(encoded.buffer);
}

async function createCustomSignedCookie(
  payload: Record<string, unknown>,
  secret: string
): Promise<string> {
  const payloadB64url = stringToBase64url(JSON.stringify(payload));
  const keyData = new TextEncoder().encode(secret);
  const hmacKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    new TextEncoder().encode(payloadB64url)
  );
  const signatureB64url = arrayBufferToBase64url(signatureBuffer);
  return `${payloadB64url}.${signatureB64url}`;
}

describe("Session Cookie Management", () => {
  const secretA = "very-secure-secret-key-A-12345678901234567890";
  const secretB = "different-secret-key-B-98765432109876543210";

  describe("createSessionCookie and verifySessionCookie lifecycle", () => {
    it("should create a valid cookie that verifies successfully immediately", async () => {
      const cookie = await createSessionCookie(secretA);
      expect(cookie).toContain(".");

      const isValid = await verifySessionCookie(cookie, secretA);
      expect(isValid).toBe(true);
    });

    it("should reject a cookie created with secret A when verified with secret B", async () => {
      const cookie = await createSessionCookie(secretA);
      const isValid = await verifySessionCookie(cookie, secretB);
      expect(isValid).toBe(false);
    });

    it("should reject a cookie when the payload has been tampered with", async () => {
      const cookie = await createSessionCookie(secretA);
      const [payloadB64url, signatureB64url] = cookie.split(".");

      // Tamper with the first character of the payload
      const tamperedPayload =
        (payloadB64url[0] === "a" ? "b" : "a") + payloadB64url.substring(1);
      const tamperedCookie = `${tamperedPayload}.${signatureB64url}`;

      const isValid = await verifySessionCookie(tamperedCookie, secretA);
      expect(isValid).toBe(false);
    });

    it("should reject a cookie when the signature has been tampered with", async () => {
      const cookie = await createSessionCookie(secretA);
      const [payloadB64url, signatureB64url] = cookie.split(".");

      const tamperedSignature =
        signatureB64url.substring(0, signatureB64url.length - 1) +
        (signatureB64url.slice(-1) === "x" ? "y" : "x");
      const tamperedCookie = `${payloadB64url}.${tamperedSignature}`;

      const isValid = await verifySessionCookie(tamperedCookie, secretA);
      expect(isValid).toBe(false);
    });

    it("should reject an expired cookie even with valid signature", async () => {
      const expiredPayload = {
        role: "admin",
        issuedAt: Date.now() - 100000,
        expiresAt: Date.now() - 1000, // Expired 1 second ago
      };

      const expiredCookie = await createCustomSignedCookie(expiredPayload, secretA);
      const isValid = await verifySessionCookie(expiredCookie, secretA);
      expect(isValid).toBe(false);
    });
  });

  describe("verifySessionCookie malformed inputs robustness", () => {
    it("should return false without throwing for empty string", async () => {
      expect(await verifySessionCookie("", secretA)).toBe(false);
    });

    it("should return false without throwing when no dot is present", async () => {
      expect(await verifySessionCookie("invalidcookiecontentwithoutdot", secretA)).toBe(false);
    });

    it("should return false without throwing when only dot is present", async () => {
      expect(await verifySessionCookie(".", secretA)).toBe(false);
    });

    it("should return false without throwing when payload part is empty", async () => {
      expect(await verifySessionCookie(".somesignature", secretA)).toBe(false);
    });

    it("should return false without throwing when signature part is empty", async () => {
      expect(await verifySessionCookie("somepayload.", secretA)).toBe(false);
    });

    it("should return false without throwing for invalid JSON payload", async () => {
      const invalidJsonPayload = "not-a-json-string";
      const keyData = new TextEncoder().encode(secretA);
      const hmacKey = await crypto.subtle.importKey(
        "raw",
        keyData,
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const signature = await crypto.subtle.sign(
        "HMAC",
        hmacKey,
        new TextEncoder().encode(invalidJsonPayload)
      );
      const cookie = `${invalidJsonPayload}.${arrayBufferToBase64url(signature)}`;

      expect(await verifySessionCookie(cookie, secretA)).toBe(false);
    });

    it("should return false without throwing when role is not admin", async () => {
      const nonAdminPayload = {
        role: "user",
        issuedAt: Date.now(),
        expiresAt: Date.now() + 3600000,
      };
      const cookie = await createCustomSignedCookie(nonAdminPayload, secretA);
      expect(await verifySessionCookie(cookie, secretA)).toBe(false);
    });

    it("should return false without throwing when expiresAt is not a number", async () => {
      const invalidExpiryPayload = {
        role: "admin",
        issuedAt: Date.now(),
        expiresAt: "never",
      };
      const cookie = await createCustomSignedCookie(invalidExpiryPayload, secretA);
      expect(await verifySessionCookie(cookie, secretA)).toBe(false);
    });
  });
});
