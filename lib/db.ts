import "server-only";
import dns from "node:dns";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalPrisma = globalThis as unknown as { futurvionPrisma?: PrismaClient };

function configureDatabaseDns() {
  const configuredServers = process.env.DATABASE_DNS_SERVERS?.split(",").map(server => server.trim()).filter(Boolean);
  const servers = configuredServers?.length ? configuredServers : ["1.1.1.1", "8.8.8.8"];
  try {
    dns.setServers(servers);
  } catch {
    console.error("Invalid DATABASE_DNS_SERVERS configuration; using the system DNS resolver.");
  }
}
configureDatabaseDns();

const systemLookup = dns.lookup.bind(dns);
const resolver = new dns.Resolver();
resolver.setServers(dns.getServers());
(dns as unknown as { lookup: typeof dns.lookup }).lookup = ((hostname: string, options: dns.LookupOptions | ((error: NodeJS.ErrnoException | null, address: string, family: number) => void), callback: (error: NodeJS.ErrnoException | null, address: string | dns.LookupAddress[], family?: number) => void) => {
  const lookupOptions = typeof options === "number" ? { family: options } : typeof options === "object" ? options : {};
  const lookupCallback = (typeof options === "function" ? options : callback) as (
    error: NodeJS.ErrnoException | null,
    address?: string | dns.LookupAddress[],
    family?: number,
  ) => void;
  systemLookup(hostname, lookupOptions, (systemError, address, family) => {
    if (!systemError && typeof address === "string") {
      lookupCallback(null, address, family);
      return;
    }
    resolver.resolve4(hostname, (resolverError, addresses) => {
      if (resolverError || !addresses.length) {
        lookupCallback(systemError);
        return;
      }
      if (typeof lookupOptions === "object" && lookupOptions.all) {
        lookupCallback(null, addresses.map(address => ({ address, family: 4 })), 4);
        return;
      }
      lookupCallback(null, addresses[0], 4);
    });
  });
}) as typeof dns.lookup;

export function getDb(): PrismaClient | null {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!globalPrisma.futurvionPrisma) {
    const pool = new Pool({ connectionString: url });
    globalPrisma.futurvionPrisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  }
  return globalPrisma.futurvionPrisma;
}
