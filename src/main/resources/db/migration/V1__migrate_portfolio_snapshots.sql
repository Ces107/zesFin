-- Migration V1: Add entry_type and value columns to portfolio_snapshots
-- This migration follows the expand-and-contract pattern for zero-downtime migration

-- Step 1: EXPAND - Add new columns (nullable for now)
ALTER TABLE portfolio_snapshots
ADD COLUMN IF NOT EXISTS entry_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS value DECIMAL(19,2);

-- Step 2: MIGRATE - Copy data from old schema to new schema
-- Create TOTAL_INVESTED entries from existing records
INSERT INTO portfolio_snapshots (user_id, date, entry_type, value, monthly_contribution, fixed_income_percentage)
SELECT
    user_id,
    date,
    'TOTAL_INVESTED',
    total_invested,
    monthly_contribution,
    fixed_income_percentage
FROM portfolio_snapshots
WHERE entry_type IS NULL AND total_invested IS NOT NULL;

-- Create PORTFOLIO_VALUE entries from existing records
INSERT INTO portfolio_snapshots (user_id, date, entry_type, value, monthly_contribution, fixed_income_percentage)
SELECT
    user_id,
    date,
    'PORTFOLIO_VALUE',
    portfolio_value,
    monthly_contribution,
    fixed_income_percentage
FROM portfolio_snapshots
WHERE entry_type IS NULL AND portfolio_value IS NOT NULL;

-- Step 3: Delete old records (those without entry_type)
DELETE FROM portfolio_snapshots WHERE entry_type IS NULL;

-- Step 4: Make new columns NOT NULL
ALTER TABLE portfolio_snapshots
ALTER COLUMN entry_type SET NOT NULL,
ALTER COLUMN value SET NOT NULL;

-- Step 5: Update constraints
-- Drop old unique constraint if it exists
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uk4550fx40rlpjb6vcg7srwjjvi') THEN
        ALTER TABLE portfolio_snapshots DROP CONSTRAINT uk4550fx40rlpjb6vcg7srwjjvi;
    END IF;
END $$;

-- Create new unique constraint including entry_type
ALTER TABLE portfolio_snapshots
ADD CONSTRAINT uk_snapshot_date_user_type UNIQUE (date, user_id, entry_type);

-- Step 6: CONTRACT - Drop old columns (commented out for safety - can be done in V2 after verification)
-- ALTER TABLE portfolio_snapshots
-- DROP COLUMN IF EXISTS total_invested,
-- DROP COLUMN IF EXISTS portfolio_value,
-- DROP COLUMN IF EXISTS yield;

-- Note: Old columns are intentionally kept for rollback capability
-- They will be removed in a future migration after production verification
