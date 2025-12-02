import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log("Starting migration: Rename drivers to clients...");

        await client.query("BEGIN");

        // Step 1: Rename the drivers table to clients
        console.log("1. Renaming drivers table to clients...");
        await client.query("ALTER TABLE drivers RENAME TO clients");

        // Step 2: Add new columns
        console.log("2. Adding new columns...");
        await client.query("ALTER TABLE clients ADD COLUMN first_name TEXT");
        await client.query("ALTER TABLE clients ADD COLUMN last_name TEXT");
        await client.query("ALTER TABLE clients ADD COLUMN cin TEXT");
        await client.query("ALTER TABLE clients ADD COLUMN cin_image TEXT");
        await client.query("ALTER TABLE clients ADD COLUMN type TEXT DEFAULT 'existing'");

        // Step 3: Migrate existing data
        console.log("3. Migrating existing data...");
        await client.query(`
      UPDATE clients 
      SET 
        first_name = SPLIT_PART(name, ' ', 1),
        last_name = COALESCE(NULLIF(SPLIT_PART(name, ' ', 2), ''), SPLIT_PART(name, ' ', 1)),
        cin = 'TEMP-' || id,
        type = 'existing'
    `);

        // Step 4: Make new columns NOT NULL
        console.log("4. Setting NOT NULL constraints...");
        await client.query("ALTER TABLE clients ALTER COLUMN first_name SET NOT NULL");
        await client.query("ALTER TABLE clients ALTER COLUMN last_name SET NOT NULL");
        await client.query("ALTER TABLE clients ALTER COLUMN cin SET NOT NULL");
        await client.query("ALTER TABLE clients ALTER COLUMN type SET NOT NULL");

        // Step 5: Add unique constraint on CIN
        console.log("5. Adding unique constraint on CIN...");
        await client.query("ALTER TABLE clients ADD CONSTRAINT clients_cin_unique UNIQUE (cin)");

        // Step 6: Drop old columns
        console.log("6. Dropping old columns...");
        await client.query("ALTER TABLE clients DROP COLUMN name");
        await client.query("ALTER TABLE clients DROP COLUMN role");

        // Step 7: Rename driver_id to client_id in assignments
        console.log("7. Renaming driver_id to client_id in assignments...");
        await client.query("ALTER TABLE assignments RENAME COLUMN driver_id TO client_id");

        await client.query("COMMIT");
        console.log("✓ Migration completed successfully!");

    } catch (error) {
        await client.query("ROLLBACK");
        console.error("✗ Migration failed:", error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigration().catch(console.error);
