import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";

const port = Number(process.env.PG_PORT ?? 5433);
const user = process.env.PG_USER ?? "servo";
const password = process.env.PG_PASSWORD ?? "servo";
const database = process.env.PG_DATABASE ?? "servo";
const databaseDir = path.join(process.cwd(), ".data", "pg");

const postgres = new EmbeddedPostgres({
  databaseDir,
  user,
  password,
  port,
  persistent: true,
});

async function main() {
  try {
    await postgres.initialise();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/already|exist/i.test(message)) throw error;
  }

  await postgres.start();

  try {
    await postgres.createDatabase(database);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (!/already exists/i.test(message)) throw error;
  }

  console.log(`PostgreSQL local em postgresql://${user}:${password}@127.0.0.1:${port}/${database}`);

  const shutdown = async () => {
    await postgres.stop();
    process.exit(0);
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  await new Promise(() => {});
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
