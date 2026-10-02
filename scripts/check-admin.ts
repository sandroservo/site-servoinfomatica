import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { duplicateProduct, saveProduct, setProductActive } from "../src/lib/admin";

async function main() {
  const brand = await prisma.brand.findFirstOrThrow();
  const category = await prisma.category.findFirstOrThrow();
  const form = new FormData();
  form.set("name", "Notebook Teste Admin");
  form.set("sku", "SV-TEST-ADMIN");
  form.set("brandId", brand.id);
  form.set("categoryId", category.id);
  form.set("price", "1999,90");
  form.set("summary", "Criado pelo admin");
  form.set("active", "on");
  form.set("screenInches", "14");
  form.set("processor", "Intel Core i5-1335U");
  form.set("processorFamily", "Intel Core i5");
  form.set("ramGb", "16");
  form.set("ssdGb", "512");
  form.set("weightKg", "1,35");
  form.set("physical", "4");
  form.set("reserved", "1");
  form.set("images", "/products/laptop-02.jpg");

  const id = await saveProduct(form);
  const copyId = await duplicateProduct(id);
  await setProductActive(id, false);
  const active = await prisma.product.findUnique({
    where: { id },
    include: { inventory: true, spec: true },
  });
  const copy = await prisma.product.findUnique({ where: { id: copyId } });
  console.log(
    JSON.stringify({
      price: active?.priceCents,
      weight: active?.spec?.weightKg,
      available: (active?.inventory?.physical ?? 0) - (active?.inventory?.reserved ?? 0),
      active: active?.active,
      copy: copy?.slug,
      copyActive: copy?.active,
    }),
  );
  await prisma.product.deleteMany({ where: { id: { in: [id, copyId] } } });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
