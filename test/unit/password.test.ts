import { describe, it, expect } from "vitest";
import {
  hashPassword,
  verifyPassword,
  generateSalt,
  generateSessionSecret,
  constantTimeEqual,
} from "@/lib/auth/password";

describe("Password and Cryptographic Utilities", () => {
  describe("hashPassword", () => {
    it("should be deterministic for the same password, salt and iterations", async () => {
      const password = "SuperSecretPassword123!";
      const salt = "0123456789abcdef0123456789abcdef";
      const iterations = 1000;

      const hash1 = await hashPassword(password, salt, iterations);
      const hash2 = await hashPassword(password, salt, iterations);

      expect(hash1).toBe(hash2);
    });

    it("should produce a 64-character hexadecimal hash (256 bits)", async () => {
      const password = "TestPassword";
      const salt = generateSalt();
      const hash = await hashPassword(password, salt, 1000);

      expect(hash).toHaveLength(64);
      expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
    });

    it("should produce different hashes for different salts with the same password", async () => {
      const password = "IdenticalPassword";
      const salt1 = "0123456789abcdef0123456789abcdef";
      const salt2 = "fedcba9876543210fedcba9876543210";

      const hash1 = await hashPassword(password, salt1, 1000);
      const hash2 = await hashPassword(password, salt2, 1000);

      expect(hash1).not.toBe(hash2);
    });

    it("should produce different hashes for different passwords with the same salt", async () => {
      const salt = generateSalt();
      const hash1 = await hashPassword("PasswordOne", salt, 1000);
      const hash2 = await hashPassword("PasswordTwo", salt, 1000);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    it("should return true when password matches the salt and expected hash", async () => {
      const password = "CorrectAdminPassword2026!";
      const salt = generateSalt();
      const iterations = 1000;
      const expectedHash = await hashPassword(password, salt, iterations);

      const isValid = await verifyPassword(password, salt, expectedHash, iterations);
      expect(isValid).toBe(true);
    });

    it("should return false when password does not match", async () => {
      const password = "CorrectAdminPassword2026!";
      const salt = generateSalt();
      const iterations = 1000;
      const expectedHash = await hashPassword(password, salt, iterations);

      const isValid = await verifyPassword("WrongPassword", salt, expectedHash, iterations);
      expect(isValid).toBe(false);
    });

    it("should return false when salt differs", async () => {
      const password = "CorrectAdminPassword2026!";
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      const iterations = 1000;
      const expectedHash = await hashPassword(password, salt1, iterations);

      const isValid = await verifyPassword(password, salt2, expectedHash, iterations);
      expect(isValid).toBe(false);
    });
  });

  describe("constantTimeEqual", () => {
    it("should return true for identical strings", () => {
      expect(constantTimeEqual("abcdef", "abcdef")).toBe(true);
      expect(constantTimeEqual("", "")).toBe(true);
      expect(
        constantTimeEqual(
          "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08",
          "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08"
        )
      ).toBe(true);
    });

    it("should return false for strings of different lengths without throwing", () => {
      expect(constantTimeEqual("", "a")).toBe(false);
      expect(constantTimeEqual("abc", "abcd")).toBe(false);
      expect(constantTimeEqual("longstringhere", "short")).toBe(false);
    });

    it("should return false when strings differ only at the first character", () => {
      expect(constantTimeEqual("Xbcdef", "abcdef")).toBe(false);
    });

    it("should return false when strings differ in the middle", () => {
      expect(constantTimeEqual("abXdef", "abcdef")).toBe(false);
    });

    it("should return false when strings differ only at the last character", () => {
      expect(constantTimeEqual("abcdeX", "abcdef")).toBe(false);
    });

    it("should return false for every single character variation in a fixed-length string", () => {
      const base = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
      for (let i = 0; i < base.length; i++) {
        const altered =
          base.substring(0, i) +
          (base[i] === "a" ? "b" : "a") +
          base.substring(i + 1);
        expect(constantTimeEqual(base, altered)).toBe(false);
      }
    });
  });

  describe("generateSalt", () => {
    it("should return a 32-character hexadecimal string (16 bytes)", () => {
      const salt = generateSalt();
      expect(salt).toHaveLength(32);
      expect(/^[0-9a-f]{32}$/.test(salt)).toBe(true);
    });

    it("should generate different values on successive calls", () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1).not.toBe(salt2);
    });
  });

  describe("generateSessionSecret", () => {
    it("should return a valid base64 encoded string", () => {
      const secret = generateSessionSecret();
      expect(typeof secret).toBe("string");
      expect(secret.length).toBeGreaterThanOrEqual(40);
      expect(() => atob(secret)).not.toThrow();
    });

    it("should generate different values on successive calls", () => {
      const secret1 = generateSessionSecret();
      const secret2 = generateSessionSecret();
      expect(secret1).not.toBe(secret2);
    });
  });
});
