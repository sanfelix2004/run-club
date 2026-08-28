import { copyFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

function getTursoConfig() {
  const url =
    process.env.TURSO_DATABASE_URL ??
    (process.env.DATABASE_URL?.startsWith("libsql://") ? process.env.DATABASE_URL : null);
  const authToken = process.env.TURSO_AUTH_TOKEN ?? process.env.DATABASE_AUTH_TOKEN;

  if (!url || !authToken) return null;
  return { url, authToken };
}

function ensureServerlessSqlite() {
  if (getTursoConfig()) return;
  if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) return;

  const target = "/tmp/runclub.db";
  process.env.DATABASE_URL = `file:${target}`;

  if (existsSync(target)) return;

  const source = path.join(process.cwd(), "prisma", "seed.db");
  if (existsSync(source)) {
    mkdirSync("/tmp", { recursive: true });
    copyFileSync(source, target);
  }
}

async function configureSqlite(client: PrismaClient) {
  if (getTursoConfig()) return;
  if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) return;
  try {
    await client.$executeRawUnsafe("PRAGMA busy_timeout = 10000");
    await client.$executeRawUnsafe("PRAGMA journal_mode = WAL");
  } catch {
    // Ignore pragma errors on unsupported environments.
  }
}

function createPrismaClient() {
  const turso = getTursoConfig();
  if (turso) {
    const libsql = createClient({
      url: turso.url,
      authToken: turso.authToken,
    });
    return new PrismaClient({
      adapter: new PrismaLibSQL(libsql),
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

ensureServerlessSqlite();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

void configureSqlite(prisma);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
