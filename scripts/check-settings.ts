import "dotenv/config";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import { asaasWebhookToken, hashPassword, sessionSecret, verifyPassword } from "../src/lib/settings";
import { createSessionToken, readSession } from "../src/lib/session";

async function main() {
  const hash = await hashPassword("senha-forte");
  assert.equal(await verifyPassword("senha-forte", hash), true);
  assert.equal(await verifyPassword("errada", hash), false);

  const secret = await sessionSecret();
  assert.equal(secret.length, 64);
  assert.equal(await sessionSecret(), secret);
  assert.equal((await asaasWebhookToken()).length, 64);

  const token = await createSessionToken("admin@loja.com");
  assert.equal((await readSession(token))?.email, "admin@loja.com");
  assert.equal(await readSession(token.slice(0, -1) + "0"), null);
  console.log("ok");
}

main().finally(() => prisma.$disconnect());
