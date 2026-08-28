import { createClient } from "@libsql/client";
import { execSync } from "child_process";

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN");
    process.exit(1);
  }

  const sql = execSync(
    "npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script",
    { encoding: "utf8" },
  );

  const client = createClient({ url, authToken });

  const statements = sql
    .split(/;\s*\n/)
    .map((statement) => statement.replace(/^--.*\n?/gm, "").trim())
    .filter(Boolean);

  for (const statement of statements) {
    try {
      await client.execute(statement);
      console.log("OK", statement.slice(0, 60));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("already exists")) {
        console.log("SKIP", statement.slice(0, 40));
        continue;
      }
      throw error;
    }
  }

  console.log("Turso schema applied.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
