import { unlink } from "node:fs/promises";
import { prisma } from "../src/lib/prisma";
import { deleteBrand, saveBrand } from "../src/lib/admin";

const slug = "marca-logo-teste";

function pngFile(name: string) {
  const bytes = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
    "base64",
  );
  return new File([bytes], name, { type: "image/png" });
}

async function main() {
  const create = new FormData();
  create.set("name", "Marca Logo Teste");
  create.set("slug", slug);
  create.set("logo", pngFile("logo.png"));
  await saveBrand(create);

  const created = await prisma.brand.findUnique({ where: { slug } });
  if (created?.logoUrl !== `/brands/${slug}.png`) {
    throw new Error(`logo ausente: ${created?.logoUrl}`);
  }

  const keep = new FormData();
  keep.set("id", created.id);
  keep.set("name", "Marca Logo Teste");
  keep.set("slug", slug);
  await saveBrand(keep);
  const kept = await prisma.brand.findUnique({ where: { slug } });
  if (kept?.logoUrl !== `/brands/${slug}.png`) throw new Error("logo sumiu no update");

  const bad = new FormData();
  bad.set("id", created.id);
  bad.set("name", "Marca Logo Teste");
  bad.set("slug", slug);
  bad.set("logo", new File(["nope"], "logo.txt", { type: "text/plain" }));
  let rejected = false;
  try {
    await saveBrand(bad);
  } catch (error) {
    rejected = error instanceof Error && error.message.includes("PNG");
  }
  if (!rejected) throw new Error("arquivo inválido foi aceito");

  await deleteBrand(created.id);
  await unlink(`public/brands/${slug}.png`);
  console.log("ok");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
