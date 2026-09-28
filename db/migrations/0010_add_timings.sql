-- Migration 0010: Add timings column to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS timings TEXT;
