-- ============================================================================
-- MANUAL MIGRATION FOR PRODUCTION DATABASE
-- ============================================================================
-- Execute this SQL in your PostgreSQL database in Render
--
-- HOW TO RUN:
-- 1. Go to Render Dashboard → Your PostgreSQL Database
-- 2. Click "Connect" → "External Connection"
-- 3. Copy the PSQL Command and run in terminal, OR
-- 4. Use any PostgreSQL client (DBeaver, pgAdmin, etc.) and paste this SQL
--
-- IMPORTANT: This will migrate your portfolio_snapshots table
-- Backup recommended before running!
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: ADD NEW COLUMNS (nullable temporarily)
-- ============================================================================
ALTER TABLE portfolio_snapshots
ADD COLUMN IF NOT EXISTS entry_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS value DECIMAL(19,2);

-- ============================================================================
-- STEP 2: MIGRATE EXISTING DATA - Create TOTAL_INVESTED entries
-- ============================================================================
INSERT INTO portfolio_snapshots (
    user_id,
    date,
    entry_type,
    value,
    monthly_contribution,
    fixed_income_percentage
)
SELECT
    user_id,
    date,
    'TOTAL_INVESTED',
    total_invested,
    monthly_contribution,
    fixed_income_percentage
FROM portfolio_snapshots
WHERE entry_type IS NULL
  AND total_invested IS NOT NULL;

-- ============================================================================
-- STEP 3: MIGRATE EXISTING DATA - Create PORTFOLIO_VALUE entries
-- ============================================================================
INSERT INTO portfolio_snapshots (
    user_id,
    date,
    entry_type,
    value,
    monthly_contribution,
    fixed_income_percentage
)
SELECT
    user_id,
    date,
    'PORTFOLIO_VALUE',
    portfolio_value,
    monthly_contribution,
    fixed_income_percentage
FROM portfolio_snapshots
WHERE entry_type IS NULL
  AND portfolio_value IS NOT NULL;

-- ============================================================================
-- STEP 4: DELETE OLD RECORDS (without entry_type)
-- ============================================================================
DELETE FROM portfolio_snapshots
WHERE entry_type IS NULL;

-- ============================================================================
-- STEP 5: MAKE NEW COLUMNS NOT NULL
-- ============================================================================
ALTER TABLE portfolio_snapshots
ALTER COLUMN entry_type SET NOT NULL,
ALTER COLUMN value SET NOT NULL;

-- ============================================================================
-- STEP 6: DROP OLD UNIQUE CONSTRAINT
-- ============================================================================
ALTER TABLE portfolio_snapshots
DROP CONSTRAINT IF EXISTS uk4550fx40rlpjb6vcg7srwjjvi;

-- ============================================================================
-- STEP 7: ADD NEW UNIQUE CONSTRAINT (date + user_id + entry_type)
-- ============================================================================
ALTER TABLE portfolio_snapshots
ADD CONSTRAINT uk_snapshot_date_user_type
UNIQUE (date, user_id, entry_type);

-- ============================================================================
-- STEP 8: UPDATE FLYWAY SCHEMA HISTORY
-- ============================================================================
CREATE TABLE IF NOT EXISTS flyway_schema_history (
    installed_rank INT NOT NULL PRIMARY KEY,
    version VARCHAR(50),
    description VARCHAR(200),
    type VARCHAR(20),
    script VARCHAR(1000),
    checksum INT,
    installed_by VARCHAR(100),
    installed_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    execution_time INT,
    success BOOLEAN
);

-- Mark V1 as executed in Flyway history
INSERT INTO flyway_schema_history (
    installed_rank,
    version,
    description,
    type,
    script,
    checksum,
    installed_by,
    execution_time,
    success
)
VALUES (
    1,
    '1',
    'migrate portfolio snapshots',
    'SQL',
    'V1__migrate_portfolio_snapshots.sql',
    NULL,
    'manual-migration',
    0,
    true
)
ON CONFLICT (installed_rank) DO NOTHING;

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the migration was successful:

-- Check that columns exist
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'portfolio_snapshots'
ORDER BY column_name;

-- Check data distribution by entry type
SELECT entry_type, COUNT(*) as count
FROM portfolio_snapshots
GROUP BY entry_type;

-- Check Flyway history
SELECT * FROM flyway_schema_history ORDER BY installed_rank;

-- ============================================================================
-- EXPECTED RESULTS:
-- ============================================================================
-- You should see:
-- 1. Columns: entry_type (varchar, NOT NULL), value (decimal, NOT NULL)
-- 2. Two groups: TOTAL_INVESTED and PORTFOLIO_VALUE with equal counts
-- 3. Flyway history with version 1 marked as success=true
-- ============================================================================
