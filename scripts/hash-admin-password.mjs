import { randomBytes, scryptSync } from "node:crypto";
const password = process.env.ADMIN_BOOTSTRAP_PASSWORD;
if (!password || password.length < 8) { console.error("Set ADMIN_BOOTSTRAP_PASSWORD to a password of at least 8 characters. Use a unique 12+ character password in production."); process.exit(1); }
const salt = randomBytes(16);
console.log(`scrypt$${salt.toString("hex")}$${scryptSync(password, salt, 64).toString("hex")}`);
