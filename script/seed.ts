import "dotenv/config";
import { storage } from "../server/storage";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString("hex")}.${salt}`;
}

async function main() {
    try {
        const adminUsername = "admin";
        const adminPassword = "admin123";

        const existingUser = await storage.getUser(adminUsername);
        if (existingUser) {
            console.log(`User '${adminUsername}' already exists.`);
            process.exit(0);
        }

        console.log(`Creating user '${adminUsername}'...`);
        const hashedPassword = await hashPassword(adminPassword);

        await storage.createUser({
            username: adminUsername,
            password: hashedPassword,
        });

        console.log(`User '${adminUsername}' created successfully.`);
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

main();
