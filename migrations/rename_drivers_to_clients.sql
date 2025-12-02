-- Migration: Rename drivers to clients and update schema
-- This migration renames the drivers table to clients and adds new fields

-- Step 1: Rename the drivers table to clients
ALTER TABLE drivers RENAME TO clients;

-- Step 2: Rename the 'name' column and split into firstName and lastName
-- First, add new columns
ALTER TABLE clients ADD COLUMN first_name TEXT;
ALTER TABLE clients ADD COLUMN last_name TEXT;
ALTER TABLE clients ADD COLUMN cin TEXT;
ALTER TABLE clients ADD COLUMN cin_image TEXT;
ALTER TABLE clients ADD COLUMN type TEXT DEFAULT 'existing';

-- Step 3: Migrate existing data (split name into firstName and lastName)
-- This assumes names are in "FirstName LastName" format
UPDATE clients 
SET 
  first_name = SPLIT_PART(name, ' ', 1),
  last_name = COALESCE(NULLIF(SPLIT_PART(name, ' ', 2), ''), SPLIT_PART(name, ' ', 1)),
  cin = 'TEMP-' || id,  -- Temporary CIN value
  type = 'existing';

-- Step 4: Make new columns NOT NULL after data migration
ALTER TABLE clients ALTER COLUMN first_name SET NOT NULL;
ALTER TABLE clients ALTER COLUMN last_name SET NOT NULL;
ALTER TABLE clients ALTER COLUMN cin SET NOT NULL;
ALTER TABLE clients ALTER COLUMN type SET NOT NULL;

-- Step 5: Add unique constraint on CIN
ALTER TABLE clients ADD CONSTRAINT clients_cin_unique UNIQUE (cin);

-- Step 6: Drop the old 'name' and 'role' columns
ALTER TABLE clients DROP COLUMN name;
ALTER TABLE clients DROP COLUMN role;

-- Step 7: Rename driver_id to client_id in assignments table
ALTER TABLE assignments RENAME COLUMN driver_id TO client_id;

-- Step 8: Update foreign key constraint name (optional, for consistency)
-- Note: This may vary depending on your PostgreSQL version
-- ALTER TABLE assignments DROP CONSTRAINT assignments_driver_id_drivers_id_fk;
-- ALTER TABLE assignments ADD CONSTRAINT assignments_client_id_clients_id_fk 
--   FOREIGN KEY (client_id) REFERENCES clients(id);
