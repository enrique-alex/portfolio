/// <reference types="@cloudflare/vitest-plugin/types" />
/// <reference path="../../worker-configuration.d.ts" />
import { describe, it, expect, beforeEach } from "vitest";
import { env } from "cloudflare:test";
import {
  checkRateLimit,
  recordFailedAttempt,
  resetRateLimit,
} from "@/lib/auth/rate-limit";

interface RateLimitRow {
  identifier: string;
  failed_count: number;
  first_failed_at: string;
  locked_until: string | null;
}

describe("Rate Limiting and Anti-Brute-Force Integration Tests", () => {
  const testIp = "192.168.1.42";

  beforeEach(async () => {
    // Isolate tests by emptying the rate limit table
    await env.portfolio_db.prepare("DELETE FROM login_rate_limit").run();
  });

  describe("checkRateLimit", () => {
    it("should allow a never-seen identifier", async () => {
      const result = await checkRateLimit(env.portfolio_db, "10.0.0.1");
      expect(result.allowed).toBe(true);
      expect(result.retryAfterSeconds).toBeUndefined();
    });

    it("should allow an identifier with failed attempts under the threshold (< 5)", async () => {
      // Record 3 failures
      await recordFailedAttempt(env.portfolio_db, testIp);
      await recordFailedAttempt(env.portfolio_db, testIp);
      await recordFailedAttempt(env.portfolio_db, testIp);

      const result = await checkRateLimit(env.portfolio_db, testIp);
      expect(result.allowed).toBe(true);
      expect(result.retryAfterSeconds).toBeUndefined();
    });
  });

  describe("recordFailedAttempt", () => {
    it("should create a row with failed_count=1 and locked_until=null on first failure", async () => {
      await recordFailedAttempt(env.portfolio_db, testIp);

      const row = await env.portfolio_db
        .prepare("SELECT identifier, failed_count, locked_until FROM login_rate_limit WHERE identifier = ?")
        .bind(testIp)
        .first<RateLimitRow>();

      expect(row).not.toBeNull();
      expect(row?.identifier).toBe(testIp);
      expect(row?.failed_count).toBe(1);
      expect(row?.locked_until).toBeNull();
    });

    it("should lock the IP after 5 consecutive failures and return retryAfterSeconds in checkRateLimit", async () => {
      for (let i = 1; i <= 5; i++) {
        await recordFailedAttempt(env.portfolio_db, testIp);
      }

      // Verify row in database
      const row = await env.portfolio_db
        .prepare("SELECT failed_count, locked_until FROM login_rate_limit WHERE identifier = ?")
        .bind(testIp)
        .first<RateLimitRow>();

      expect(row?.failed_count).toBe(5);
      expect(row?.locked_until).not.toBeNull();

      const lockTime = new Date(row!.locked_until!).getTime();
      expect(lockTime).toBeGreaterThan(Date.now());

      // Verify checkRateLimit blocks the user
      const check = await checkRateLimit(env.portfolio_db, testIp);
      expect(check.allowed).toBe(false);
      expect(typeof check.retryAfterSeconds).toBe("number");
      expect(check.retryAfterSeconds).toBeGreaterThan(0);
      expect(check.retryAfterSeconds).toBeLessThanOrEqual(900); // 15 minutes lockout
    });

    it("HISTORICAL BUG FIX: should reset failed_count to 1 and unlock when a new failure occurs after lockout expiration", async () => {
      // Simulate an expired lockout directly in database: failed_count=5 and locked_until in the PAST
      const expiredTime = new Date(Date.now() - 60000).toISOString(); // 1 minute in the past
      const pastCreatedTime = new Date(Date.now() - 1000000).toISOString();

      await env.portfolio_db
        .prepare(
          `INSERT INTO login_rate_limit (identifier, failed_count, first_failed_at, locked_until)
           VALUES (?, 5, ?, ?)`
        )
        .bind(testIp, pastCreatedTime, expiredTime)
        .run();

      // Before recording new failure: checkRateLimit sees the lock has expired and allows
      const preCheck = await checkRateLimit(env.portfolio_db, testIp);
      expect(preCheck.allowed).toBe(true);

      // Record a new failed attempt: this MUST reset failed_count back to 1 (not 6)
      await recordFailedAttempt(env.portfolio_db, testIp);

      // Verify the database row
      const row = await env.portfolio_db
        .prepare("SELECT failed_count, locked_until FROM login_rate_limit WHERE identifier = ?")
        .bind(testIp)
        .first<RateLimitRow>();

      expect(row?.failed_count).toBe(1); // RESET TO 1, NOT 6!
      expect(row?.locked_until).toBeNull(); // NOT RE-LOCKED!

      // checkRateLimit must still allow attempts (since failed_count is 1 < 5)
      const postCheck = await checkRateLimit(env.portfolio_db, testIp);
      expect(postCheck.allowed).toBe(true);
    });
  });

  describe("resetRateLimit", () => {
    it("should completely remove the rate limit row upon successful login reset", async () => {
      // Record 3 failures
      await recordFailedAttempt(env.portfolio_db, testIp);
      await recordFailedAttempt(env.portfolio_db, testIp);
      await recordFailedAttempt(env.portfolio_db, testIp);

      // Reset upon successful authentication
      await resetRateLimit(env.portfolio_db, testIp);

      // Verify row is deleted
      const row = await env.portfolio_db
        .prepare("SELECT identifier FROM login_rate_limit WHERE identifier = ?")
        .bind(testIp)
        .first<RateLimitRow>();

      expect(row).toBeNull();

      // checkRateLimit continues to allow
      const check = await checkRateLimit(env.portfolio_db, testIp);
      expect(check.allowed).toBe(true);
    });
  });
});
