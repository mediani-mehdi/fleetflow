
import { db } from "../server/db";
import { sql } from "drizzle-orm";

async function clean() {
    console.log("Cleaning database...");
    try {
        // Disable triggers if necessary, or just cascade
        await db.execute(sql`TRUNCATE TABLE assignments CASCADE`);
        await db.execute(sql`TRUNCATE TABLE vehicles CASCADE`);
        await db.execute(sql`TRUNCATE TABLE clients CASCADE`);
        console.log("Database cleaned successfully!");
    } catch (error) {
        console.error("Error cleaning database:", error);
    }
    process.exit(0);
}

clean().catch(console.error);
