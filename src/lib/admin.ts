import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { readSession, sessionCookieName } from "@/lib/session";

export async function requireAdmin() {
  const jar = await cookies();
  const session = await readSession(jar.get(sessionCookieName())?.value);
  if (!session) redirect("/admin/login");
  return session;
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function reaisToCents(raw: string) {
  const value = raw.trim();
  if (!value) return null;
  const normalized = value.includes(",") ? value.replace(/\./g, "").replace(",", ".") : value;
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0) return Number.NaN;
  return Math.round(amount * 100);
}

export async function adminStats() {
  const products = await prisma.product.findMany({
    include: { brand: true, inventory: true },
    orderBy: { name: "asc" },
  });
  const [brands, categories] = await Promise.all([prisma.brand.count(), prisma.category.count()]);
  const available = (item: (typeof products)[number]) =>
    Math.max(0, (item.inventory?.physical ?? 0) - (item.inventory?.reserved ?? 0));

  return {
    products: products.length,
    active: products.filter((item) => item.active).length,
    brands,
    categories,
    deals: products.filter((item) => item.isDeal && item.active).length,
    launches: products.filter((item) => item.isLaunch && item.active).length,
    lowStock: products.filter(
      (item) => item.inventory && available(item) <= item.inventory.minimum,
    ),
  };
}

export function listAdminProducts(q?: string) {
  const where: Prisma.ProductWhereInput | undefined = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { sku: { contains: q, mode: "insensitive" } },
          { brand: { name: { contains: q, mode: "insensitive" } } },
        ],
      }
    : undefined;

  return prisma.product.findMany({
    where,
    include: { brand: true, category: true, inventory: true, images: { orderBy: { sortOrder: "asc" }, take: 1 } },
    orderBy: { updatedAt: "desc" },
  });
}

export function getAdminProduct(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: {
      brand: true,
      category: true,
      inventory: true,
      spec: true,
      images: { orderBy: { sortOrder: "asc" } },
    },
  });
}

function text(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function numberValue(formData: FormData, key: string, fallback: number) {
  const value = text(formData, key);
  if (!value) return fallback;
  const parsed = Number(value.replace(",", "."));
  if (!Number.isFinite(parsed)) throw new Error(`Valor inválido em ${key}.`);
  return parsed;
}

function checked(formData: FormData, key: string) {
  return formData.get(key) === "on" || formData.get(key) === "1";
}

export async function saveProduct(formData: FormData) {
  const id = text(formData, "id");
  const name = text(formData, "name");
  const sku = text(formData, "sku");
  const brandId = text(formData, "brandId");
  const categoryId = text(formData, "categoryId");
  const priceCents = reaisToCents(text(formData, "price"));
  const promoRaw = text(formData, "promoPrice");
  const promoPriceCents = promoRaw ? reaisToCents(promoRaw) : null;

  if (!name || !sku || !brandId || !categoryId) {
    throw new Error("Preencha nome, SKU, marca e categoria.");
  }
  if (priceCents == null || Number.isNaN(priceCents)) throw new Error("Informe um preço válido.");
  if (promoPriceCents != null && Number.isNaN(promoPriceCents)) {
    throw new Error("Informe um preço promocional válido.");
  }

  const slug = slugify(text(formData, "slug") || name);
  if (!slug) throw new Error("O slug do produto ficou vazio.");

  const imageUrls = text(formData, "images")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const spec = {
    screenInches: numberValue(formData, "screenInches", 14),
    resolution: text(formData, "resolution") || "1920x1080",
    refreshRate: numberValue(formData, "refreshRate", 60),
    panel: text(formData, "panel") || "IPS",
    processor: text(formData, "processor") || text(formData, "processorFamily") || "Intel Core i5",
    processorFamily: text(formData, "processorFamily") || "Intel Core i5",
    generation: text(formData, "generation") || "—",
    cores: numberValue(formData, "cores", 4),
    threads: numberValue(formData, "threads", 8),
    ramGb: numberValue(formData, "ramGb", 16),
    ramType: text(formData, "ramType") || "DDR4",
    ramMaxGb: numberValue(formData, "ramMaxGb", 32),
    ssdGb: numberValue(formData, "ssdGb", 512),
    gpu: text(formData, "gpu") || "Intel Iris Xe",
    gpuType: text(formData, "gpuType") || "integrada",
    os: text(formData, "os") || "Windows 11",
    wifi: text(formData, "wifi") || "Wi-Fi 6",
    bluetooth: text(formData, "bluetooth") || "5.1",
    hdmi: checked(formData, "hdmi"),
    usb: text(formData, "usb") || "2x USB-A",
    usbC: text(formData, "usbC") || "1x USB-C",
    ethernet: checked(formData, "ethernet"),
    battery: text(formData, "battery") || "Até 8 horas",
    charger: text(formData, "charger") || "65 W",
    weightKg: numberValue(formData, "weightKg", 1.5),
    widthMm: numberValue(formData, "widthMm", 322),
    heightMm: numberValue(formData, "heightMm", 18),
    depthMm: numberValue(formData, "depthMm", 215),
    color: text(formData, "color") || "Cinza",
  };

  const hasSpec = checked(formData, "hasSpec");

  const data = {
    name,
    slug,
    sku,
    ean: text(formData, "ean") || null,
    brandId,
    categoryId,
    summary: text(formData, "summary") || name,
    description: text(formData, "description") || text(formData, "summary") || name,
    priceCents,
    promoPriceCents,
    pixDiscountPercent: numberValue(formData, "pixDiscountPercent", 5),
    warrantyMonths: numberValue(formData, "warrantyMonths", 12),
    rating: numberValue(formData, "rating", 0),
    reviewCount: numberValue(formData, "reviewCount", 0),
    featured: checked(formData, "featured"),
    isLaunch: checked(formData, "isLaunch"),
    isDeal: checked(formData, "isDeal") || promoPriceCents != null,
    active: checked(formData, "active"),
    purpose: text(formData, "purpose") || "profissional",
  };

  const inventory = {
    physical: numberValue(formData, "physical", 0),
    reserved: numberValue(formData, "reserved", 0),
    minimum: numberValue(formData, "minimum", 2),
  };

  try {
    if (id) {
      if (!hasSpec) await prisma.productSpecification.deleteMany({ where: { productId: id } });
      await prisma.product.update({
        where: { id },
        data: {
          ...data,
          images: {
            deleteMany: {},
            create: imageUrls.map((url, sortOrder) => ({ url, alt: name, sortOrder })),
          },
          ...(hasSpec ? { spec: { upsert: { create: spec, update: spec } } } : {}),
          inventory: { upsert: { create: inventory, update: inventory } },
        },
      });
      return id;
    }

    const created = await prisma.product.create({
      data: {
        ...data,
        images: { create: imageUrls.map((url, sortOrder) => ({ url, alt: name, sortOrder })) },
        ...(hasSpec ? { spec: { create: spec } } : {}),
        inventory: { create: inventory },
      },
    });
    return created.id;
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      throw new Error("Já existe um produto com este slug ou SKU.");
    }
    throw error;
  }
}

export async function duplicateProduct(id: string) {
  const product = await getAdminProduct(id);
  if (!product?.inventory) throw new Error("Produto incompleto para duplicar.");

  const baseSlug = `${product.slug}-copia`;
  let slug = baseSlug;
  let sku = `${product.sku}-C`;
  let index = 2;
  while (await prisma.product.findFirst({ where: { OR: [{ slug }, { sku }] } })) {
    slug = `${baseSlug}-${index}`;
    sku = `${product.sku}-C${index}`;
    index += 1;
  }

  const spec = product.spec ? (({ id: _specId, productId: _specProduct, ...rest }) => rest)(product.spec) : null;
  const copy = await prisma.product.create({
    data: {
      name: `${product.name} (cópia)`,
      slug,
      sku,
      ean: null,
      brandId: product.brandId,
      categoryId: product.categoryId,
      summary: product.summary,
      description: product.description,
      priceCents: product.priceCents,
      promoPriceCents: product.promoPriceCents,
      pixDiscountPercent: product.pixDiscountPercent,
      warrantyMonths: product.warrantyMonths,
      rating: product.rating,
      reviewCount: 0,
      featured: false,
      isLaunch: false,
      isDeal: product.isDeal,
      active: false,
      purpose: product.purpose,
      images: {
        create: product.images.map((image) => ({
          url: image.url,
          alt: `${product.name} (cópia)`,
          sortOrder: image.sortOrder,
        })),
      },
      ...(spec ? { spec: { create: spec } } : {}),
      inventory: {
        create: { physical: 0, reserved: 0, minimum: product.inventory.minimum },
      },
    },
  });
  return copy.id;
}

export async function setProductActive(id: string, active: boolean) {
  await prisma.product.update({ where: { id }, data: { active } });
}

export async function deleteProduct(id: string) {
  if (!id) throw new Error("Produto não informado.");
  await prisma.product.delete({ where: { id } });
}

const logoTypes: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/svg+xml": ".svg",
};

async function storeBrandLogo(slug: string, entry: FormDataEntryValue | null) {
  if (!(entry instanceof File) || entry.size === 0) return null;
  const extension = logoTypes[entry.type];
  if (!extension) throw new Error("Envie uma imagem PNG, JPG, WEBP ou SVG.");
  if (entry.size > 1024 * 1024) throw new Error("A imagem deve ter no máximo 1 MB.");
  const directory = path.join(process.cwd(), "public", "brands");
  await mkdir(directory, { recursive: true });
  const filename = `${slug}${extension}`;
  await writeFile(path.join(directory, filename), Buffer.from(await entry.arrayBuffer()));
  return `/brands/${filename}`;
}

export async function saveBrand(formData: FormData) {
  const id = text(formData, "id");
  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  if (!name || !slug) throw new Error("Informe o nome da marca.");
  const uploadedLogo = await storeBrandLogo(slug, formData.get("logo"));
  try {
    if (id) {
      const current = await prisma.brand.findUnique({ where: { id } });
      await prisma.brand.update({
        where: { id },
        data: { name, slug, logoUrl: uploadedLogo ?? current?.logoUrl },
      });
      return;
    }
    await prisma.brand.create({ data: { name, slug, logoUrl: uploadedLogo } });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      throw new Error("Já existe uma marca com este nome ou slug.");
    }
    throw error;
  }
}

export async function deleteBrand(id: string) {
  if (!id) throw new Error("Marca não informada.");
  const products = await prisma.product.count({ where: { brandId: id } });
  if (products > 0) {
    throw new Error("Esta marca tem produtos. Mova ou exclua esses produtos antes.");
  }
  await prisma.brand.delete({ where: { id } });
}

export async function deleteCategory(id: string) {
  if (!id) throw new Error("Categoria não informada.");
  const products = await prisma.product.count({ where: { categoryId: id } });
  if (products > 0) {
    throw new Error("Esta categoria tem produtos. Mova ou exclua esses produtos antes.");
  }
  await prisma.category.delete({ where: { id } });
}

export async function saveCategory(formData: FormData) {
  const id = text(formData, "id");
  const name = text(formData, "name");
  const slug = slugify(text(formData, "slug") || name);
  const description = text(formData, "description");
  const sortOrder = numberValue(formData, "sortOrder", 0);
  if (!name || !slug) throw new Error("Informe o nome da categoria.");
  try {
    if (id) {
      await prisma.category.update({ where: { id }, data: { name, slug, description, sortOrder } });
      return;
    }
    await prisma.category.create({ data: { name, slug, description, sortOrder } });
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "P2002") {
      throw new Error("Já existe uma categoria com este slug.");
    }
    throw error;
  }
}

export async function saveStock(formData: FormData) {
  const productId = text(formData, "productId");
  if (!productId) throw new Error("Produto não informado.");
  const inventory = {
    physical: numberValue(formData, "physical", 0),
    reserved: numberValue(formData, "reserved", 0),
    minimum: numberValue(formData, "minimum", 2),
  };
  if (inventory.reserved > inventory.physical) {
    throw new Error("O reservado não pode ser maior que o estoque físico.");
  }
  await prisma.inventory.upsert({
    where: { productId },
    create: { productId, ...inventory },
    update: inventory,
  });
}
