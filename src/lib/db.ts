import { copyFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

function ensureServerlessSqlite() {
  // On Vercel/serverless the filesystem is read-only except /tmp.
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
  if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) return;
  try {
    await client.$executeRawUnsafe("PRAGMA busy_timeout = 10000");
    await client.$executeRawUnsafe("PRAGMA journal_mode = WAL");
  } catch {
    // Ignore pragma errors on unsupported environments.
  }
}

ensureServerlessSqlite();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

void configureSqlite(prisma);

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
