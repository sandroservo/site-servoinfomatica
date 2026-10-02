import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import { deleteProduct, saveProduct } from "../src/lib/admin";

async function main() {
  const brand = await prisma.brand.findFirstOrThrow();
  const category = await prisma.category.findFirstOrThrow();
  const form = new FormData();
  form.set("name", "Produto Temporario");
  form.set("sku", "SV-TEMP-DEL");
  form.set("brandId", brand.id);
  form.set("categoryId", category.id);
  form.set("price", "1000");
  form.set("active", "on");
  const id = await saveProduct(form);
  await deleteProduct(id);
  const gone = await prisma.product.findUnique({ where: { id } });
  const spec = await prisma.productSpecification.count({ where: { productId: id } });
  console.log(JSON.stringify({ deleted: gone === null, spec }));
}

main().finally(async () => {
  await prisma.$disconnect();
});
