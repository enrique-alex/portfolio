-- Migration number: 0004   2026-07-25T19:44:08.292Z
CREATE TABLE login_rate_limit (
    identifier TEXT PRIMARY KEY,
    failed_count INTEGER NOT NULL DEFAULT 0,
    first_failed_at TEXT NOT NULL,
    locked_until TEXT
);
