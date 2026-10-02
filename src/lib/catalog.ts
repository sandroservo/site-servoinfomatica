import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { effectivePriceCents, pixPriceCents } from "@/lib/money";

export const productInclude = {
  brand: true,
  category: true,
  images: { orderBy: { sortOrder: "asc" } },
  spec: true,
  inventory: true,
} satisfies Prisma.ProductInclude;

export type CatalogProduct = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export type CatalogFilters = {
  q?: string;
  marca?: string;
  categoria?: string;
  tela?: string;
  peso?: string;
  processador?: string;
  ram?: number;
  ssd?: number;
  gpu?: string;
  sistema?: string;
  finalidade?: string;
  estoque?: string;
  destaque?: boolean;
  oferta?: boolean;
  lancamento?: boolean;
  ordem?: string;
  min?: number;
  max?: number;
  slugs?: string[];
};

const processorOptions = [
  "Intel Core i5",
  "Intel Core i7",
  "Intel Core Ultra",
  "AMD Ryzen 5",
  "AMD Ryzen 7",
  "Intel Celeron",
] as const;

export const filterOptions = {
  telas: [
    { value: "ate-14", label: 'Até 14"' },
    { value: "15", label: '15,6"' },
  ],
  pesos: [
    { value: "leve", label: "Até 1,4 kg" },
    { value: "medio", label: "Até 1,8 kg" },
    { value: "pesado", label: "Acima de 1,8 kg" },
  ],
  processadores: processorOptions.map((value) => ({ value, label: value })),
  rams: [8, 16, 32],
  ssds: [256, 512, 1024],
  gpus: [
    { value: "integrada", label: "Integrada" },
    { value: "dedicada", label: "Dedicada" },
  ],
  sistemas: ["Windows 11"],
  finalidades: [
    { value: "estudo", label: "Estudo" },
    { value: "profissional", label: "Profissional" },
    { value: "gamer", label: "Gamer" },
    { value: "portatil", label: "Portátil" },
    { value: "desempenho", label: "Alto desempenho" },
  ],
  ordens: [
    { value: "", label: "Destaques" },
    { value: "preco-asc", label: "Menor preço" },
    { value: "preco-desc", label: "Maior preço" },
    { value: "avaliacao", label: "Melhor avaliação" },
    { value: "novos", label: "Mais recentes" },
  ],
};

export function parseFilters(input: Record<string, string | string[] | undefined>): CatalogFilters {
  const one = (key: string) => {
    const value = input[key];
    return Array.isArray(value) ? value[0] : value;
  };
  const num = (key: string) => {
    const value = one(key);
    if (!value) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  };
  const slugs = one("slugs");

  return {
    q: one("q")?.trim() || undefined,
    marca: one("marca") || undefined,
    categoria: one("categoria") || undefined,
    tela: one("tela") || undefined,
    peso: one("peso") || undefined,
    processador: one("processador") || undefined,
    ram: num("ram"),
    ssd: num("ssd"),
    gpu: one("gpu") || undefined,
    sistema: one("sistema") || undefined,
    finalidade: one("finalidade") || undefined,
    estoque: one("estoque") || undefined,
    destaque: one("destaque") === "1",
    oferta: one("oferta") === "1",
    lancamento: one("lancamento") === "1",
    ordem: one("ordem") || undefined,
    min: num("min"),
    max: num("max"),
    slugs: slugs ? slugs.split(",").filter(Boolean) : undefined,
  };
}

function specWhere(filters: CatalogFilters): Prisma.ProductSpecificationWhereInput | undefined {
  const spec: Prisma.ProductSpecificationWhereInput = {};

  if (filters.tela === "ate-14") spec.screenInches = { lte: 14 };
  if (filters.tela === "15") spec.screenInches = { gte: 15 };
  if (filters.peso === "leve") spec.weightKg = { lte: 1.4 };
  if (filters.peso === "medio") spec.weightKg = { lte: 1.8 };
  if (filters.peso === "pesado") spec.weightKg = { gt: 1.8 };
  if (filters.processador) spec.processorFamily = filters.processador;
  if (filters.ram) spec.ramGb = filters.ram;
  if (filters.ssd) spec.ssdGb = filters.ssd;
  if (filters.gpu) spec.gpuType = filters.gpu;
  if (filters.sistema) spec.os = filters.sistema;

  return Object.keys(spec).length ? spec : undefined;
}

function orderBy(ordem?: string): Prisma.ProductOrderByWithRelationInput[] {
  if (ordem === "preco-asc") return [{ promoPriceCents: "asc" }, { priceCents: "asc" }];
  if (ordem === "preco-desc") return [{ priceCents: "desc" }];
  if (ordem === "avaliacao") return [{ rating: "desc" }];
  if (ordem === "novos") return [{ createdAt: "desc" }];
  return [{ featured: "desc" }, { rating: "desc" }];
}

export async function listProducts(filters: CatalogFilters = {}) {
  const where: Prisma.ProductWhereInput = { active: true };

  if (filters.slugs?.length) where.slug = { in: filters.slugs };
  if (filters.marca) where.brand = { slug: filters.marca };
  if (filters.categoria) where.category = { slug: filters.categoria };
  if (filters.finalidade) where.purpose = filters.finalidade;
  if (filters.destaque) where.featured = true;
  if (filters.oferta) where.isDeal = true;
  if (filters.lancamento) where.isLaunch = true;

  const spec = specWhere(filters);
  if (spec) where.spec = spec;

  if (filters.min || filters.max) {
    where.AND = [
      {
        OR: [
          {
            promoPriceCents: {
              gte: filters.min ? filters.min * 100 : undefined,
              lte: filters.max ? filters.max * 100 : undefined,
            },
          },
          {
            promoPriceCents: null,
            priceCents: {
              gte: filters.min ? filters.min * 100 : undefined,
              lte: filters.max ? filters.max * 100 : undefined,
            },
          },
        ],
      },
    ];
  }

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q, mode: "insensitive" } },
      { sku: { contains: filters.q, mode: "insensitive" } },
      { summary: { contains: filters.q, mode: "insensitive" } },
      { brand: { name: { contains: filters.q, mode: "insensitive" } } },
      { spec: { processor: { contains: filters.q, mode: "insensitive" } } },
    ];
  }

  const products = await prisma.product.findMany({
    where,
    include: productInclude,
    orderBy: orderBy(filters.ordem),
  });

  const withStock = products.filter((product) => {
    if (filters.estoque !== "1") return true;
    return availableUnits(product) > 0;
  });

  if (filters.ordem === "preco-asc" || filters.ordem === "preco-desc") {
    withStock.sort((a, b) => {
      const left = effectivePriceCents(a.priceCents, a.promoPriceCents);
      const right = effectivePriceCents(b.priceCents, b.promoPriceCents);
      return filters.ordem === "preco-asc" ? left - right : right - left;
    });
  }

  return withStock;
}

export async function getProductBySlug(slug: string) {
  return prisma.product.findFirst({
    where: { slug, active: true },
    include: productInclude,
  });
}

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { products: { where: { active: true } } } } },
  });
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

export async function listBrands() {
  return prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: { where: { active: true } } } } },
  });
}

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({ where: { slug } });
}

export function availableUnits(product: { inventory: { physical: number; reserved: number } | null }) {
  if (!product.inventory) return 0;
  return Math.max(0, product.inventory.physical - product.inventory.reserved);
}

export function stockLabel(units: number) {
  if (units <= 0) return "Indisponível";
  if (units <= 3) return "Últimas unidades";
  return "Em estoque";
}

export function specLine(product: CatalogProduct) {
  if (!product.spec) return "";
  const screen = Number.isInteger(product.spec.screenInches)
    ? String(product.spec.screenInches)
    : product.spec.screenInches.toLocaleString("pt-BR");
  return `${screen}" · ${product.spec.weightKg.toLocaleString("pt-BR")} kg · ${product.spec.processorFamily} · ${product.spec.ramGb} GB RAM · SSD ${product.spec.ssdGb} GB`;
}

export function toProductJson(product: CatalogProduct) {
  const price = effectivePriceCents(product.priceCents, product.promoPriceCents);
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    ean: product.ean,
    brand: product.brand,
    category: product.category,
    summary: product.summary,
    description: product.description,
    priceCents: product.priceCents,
    promoPriceCents: product.promoPriceCents,
    priceCentsEffective: price,
    pixCents: pixPriceCents(price, product.pixDiscountPercent),
    pixDiscountPercent: product.pixDiscountPercent,
    warrantyMonths: product.warrantyMonths,
    rating: product.rating,
    reviewCount: product.reviewCount,
    featured: product.featured,
    isLaunch: product.isLaunch,
    isDeal: product.isDeal,
    purpose: product.purpose,
    images: product.images,
    spec: product.spec,
    inventory: product.inventory,
    available: availableUnits(product),
    specLine: specLine(product),
  };
}
