-- =========================================================
-- Good Maps - PostgreSQL Schema
-- Run automatically on first Docker start
-- =========================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis; -- Optional: for spatial queries

-- ─── Users ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id   TEXT UNIQUE NOT NULL,           -- anonymous device fingerprint
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── User Preferences ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id     UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  language    TEXT DEFAULT 'fr',
  theme       TEXT DEFAULT 'light',
  radius      INT  DEFAULT 2000,              -- meters
  pmr         BOOL DEFAULT false,
  interests   TEXT[] DEFAULT '{}',
  age_group   TEXT DEFAULT 'adult',
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── Saved Places ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_places (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  osm_id      TEXT NOT NULL,                  -- OpenStreetMap node/way ID
  name        TEXT NOT NULL,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  category    TEXT,
  address     TEXT,
  saved_at    TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, osm_id)
);

-- ─── Search History ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS search_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lat         DOUBLE PRECISION NOT NULL,
  lng         DOUBLE PRECISION NOT NULL,
  city        TEXT,
  interests   TEXT[] DEFAULT '{}',
  result_count INT DEFAULT 0,
  searched_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Indexes ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_saved_places_user ON saved_places(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_search_history_time ON search_history(searched_at DESC);

-- ─── Auto-update timestamps ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_timestamp
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_prefs_timestamp
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Done
SELECT 'Good Maps database initialized.' AS status;
