import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { deleteBrand, saveBrand } from "../src/lib/admin";

async function main() {
  const form = new FormData();
  form.set("name", "Marca Temporaria");
  await saveBrand(form);
  const created = await prisma.brand.findUniqueOrThrow({ where: { slug: "marca-temporaria" } });
  await deleteBrand(created.id);
  const gone = await prisma.brand.findUnique({ where: { id: created.id } });
  const dell = await prisma.brand.findFirstOrThrow({ where: { slug: "dell" } });
  let blocked = "";
  try {
    await deleteBrand(dell.id);
  } catch (error) {
    blocked = error instanceof Error ? error.message : "erro";
  }
  console.log(JSON.stringify({ deleted: gone === null, blocked }));
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });
