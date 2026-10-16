import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalPrisma = globalThis as unknown as { futurvionPrisma?: PrismaClient };
export function getDb(): PrismaClient | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!globalPrisma.futurvionPrisma) globalPrisma.futurvionPrisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });
  return globalPrisma.futurvionPrisma;
}
