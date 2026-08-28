import { copyFileSync, existsSync, mkdirSync } from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

function ensureServerlessSqlite() {
  // On Vercel/serverless the filesystem is read-only except /tmp.
  if (!process.env.VERCEL && !process.env.AWS_LAMBDA_FUNCTION_NAME) return;

  const target = "/tmp/runclub.db";
  process.env.DATABASE_URL = `file:${target}`;

  if (existsSync(target)) return;

  const candidates = [
    path.join(process.cwd(), "prisma", "dev.db"),
    path.join(process.cwd(), "prisma", "seed.db"),
  ];
  const source = candidates.find((p) => existsSync(p));
  if (source) {
    mkdirSync("/tmp", { recursive: true });
    copyFileSync(source, target);
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

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
