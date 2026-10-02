import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const brands = [
  ["Dell", "dell"],
  ["Lenovo", "lenovo"],
  ["Acer", "acer"],
  ["Asus", "asus"],
  ["Samsung", "samsung"],
  ["HP", "hp"],
  ["Avell", "avell"],
  ["Positivo", "positivo"],
] as const;

const categories = [
  ["compactos", "Notebooks compactos", "Leves para mochila, estudo e deslocamento.", 1],
  ["ate-14", 'Até 14"', "Telas menores, com boa portabilidade.", 2],
  ["tela-156", '15,6"', "Tela maior para trabalho e uso diário.", 3],
  ["gamer", "Gamer", "Placa de vídeo dedicada e tela com taxa alta.", 4],
  ["profissional", "Profissional", "Configuração estável para o dia de trabalho.", 5],
  ["estudo", "Estudo", "Modelos diretos para aula, pesquisa e tarefas.", 6],
  ["alto-desempenho", "Alto desempenho", "Processador e armazenamento para carga pesada.", 7],
] as const;

type SeedProduct = {
  name: string;
  slug: string;
  sku: string;
  ean: string;
  brand: string;
  category: string;
  summary: string;
  description: string;
  priceCents: number;
  promoPriceCents?: number;
  warrantyMonths: number;
  rating: number;
  reviewCount: number;
  featured?: boolean;
  isLaunch?: boolean;
  isDeal?: boolean;
  purpose: string;
  images: string[];
  physical: number;
  reserved?: number;
  spec: {
    screenInches: number;
    resolution: string;
    refreshRate: number;
    panel: string;
    processor: string;
    processorFamily: string;
    generation: string;
    cores: number;
    threads: number;
    ramGb: number;
    ramType: string;
    ramMaxGb: number;
    ssdGb: number;
    gpu: string;
    gpuType: "integrada" | "dedicada";
    os: string;
    wifi: string;
    bluetooth: string;
    hdmi: boolean;
    usb: string;
    usbC: string;
    ethernet: boolean;
    battery: string;
    charger: string;
    weightKg: number;
    widthMm: number;
    heightMm: number;
    depthMm: number;
    color: string;
  };
};

const products: SeedProduct[] = [
  {
    name: "IdeaPad Slim 3i",
    slug: "lenovo-ideapad-slim-3i",
    sku: "SV-LEN-SLIM3-14",
    ean: "7891001000014",
    brand: "lenovo",
    category: "estudo",
    summary: "Compacto e leve para estudar, trabalhar e transportar no dia a dia.",
    description:
      "Notebook de 14 polegadas com Core i5, 16 GB de memória e SSD de 512 GB. Indicado para aulas, documentos e navegação com boa autonomia.",
    priceCents: 349900,
    promoPriceCents: 319900,
    warrantyMonths: 12,
    rating: 4.7,
    reviewCount: 86,
    featured: true,
    isDeal: true,
    purpose: "estudo",
    images: ["/products/laptop-02.jpg", "/products/laptop-04.jpg"],
    physical: 8,
    spec: baseSpec({
      screenInches: 14,
      processor: "Intel Core i5-1335U",
      processorFamily: "Intel Core i5",
      generation: "13ª geração",
      cores: 10,
      threads: 12,
      weightKg: 1.37,
      color: "Cinza",
    }),
  },
  {
    name: "Aspire 5",
    slug: "acer-aspire-5",
    sku: "SV-ACR-A515",
    ean: "7891001000021",
    brand: "acer",
    category: "tela-156",
    summary: "Tela de 15,6 polegadas para aula e uso em casa.",
    description:
      "Configuração de entrada com Ryzen 5, 8 GB de RAM e SSD de 256 GB. Serve para estudo, streaming e pacote office.",
    priceCents: 329900,
    warrantyMonths: 12,
    rating: 4.5,
    reviewCount: 64,
    purpose: "estudo",
    images: ["/products/laptop-05.jpg", "/products/laptop-10.jpg"],
    physical: 6,
    spec: baseSpec({
      screenInches: 15.6,
      processor: "AMD Ryzen 5 7530U",
      processorFamily: "AMD Ryzen 5",
      generation: "Série 7000",
      cores: 6,
      threads: 12,
      ramGb: 8,
      ramType: "DDR4",
      ramMaxGb: 32,
      ssdGb: 256,
      gpu: "AMD Radeon Graphics",
      weightKg: 1.76,
      refreshRate: 60,
      color: "Prata",
    }),
  },
  {
    name: "Inspiron 15",
    slug: "dell-inspiron-15",
    sku: "SV-DEL-INS15",
    ean: "7891001000038",
    brand: "dell",
    category: "tela-156",
    summary: "15,6 polegadas para o expediente, com 16 GB e SSD de 512 GB.",
    description:
      "Modelo de trabalho com Core i5, memória folgada para várias abas e armazenamento para arquivos do dia a dia.",
    priceCents: 459900,
    promoPriceCents: 429900,
    warrantyMonths: 12,
    rating: 4.6,
    reviewCount: 41,
    featured: true,
    isDeal: true,
    purpose: "profissional",
    images: ["/products/laptop-03.jpg", "/products/laptop-06.jpg"],
    physical: 5,
    reserved: 1,
    spec: baseSpec({
      screenInches: 15.6,
      processor: "Intel Core i5-1334U",
      processorFamily: "Intel Core i5",
      generation: "13ª geração",
      cores: 10,
      threads: 12,
      weightKg: 1.65,
      color: "Preto",
    }),
  },
  {
    name: "Galaxy Book4",
    slug: "samsung-galaxy-book4",
    sku: "SV-SAM-BK4",
    ean: "7891001000045",
    brand: "samsung",
    category: "profissional",
    summary: "Tela grande e chassi fino para reuniões e documentos.",
    description:
      "Core i7, 16 GB de RAM e SSD de 512 GB. Pensado para quem passa o dia em planilhas, chamadas e navegador.",
    priceCents: 569900,
    warrantyMonths: 12,
    rating: 4.8,
    reviewCount: 29,
    isLaunch: true,
    featured: true,
    purpose: "profissional",
    images: ["/products/laptop-06.jpg", "/products/laptop-09.jpg"],
    physical: 4,
    spec: baseSpec({
      screenInches: 15.6,
      processor: "Intel Core i7-1355U",
      processorFamily: "Intel Core i7",
      generation: "13ª geração",
      cores: 10,
      threads: 12,
      weightKg: 1.55,
      color: "Grafite",
      panel: "IPS",
    }),
  },
  {
    name: "Vivobook 14",
    slug: "asus-vivobook-14",
    sku: "SV-ASU-VB14",
    ean: "7891001000052",
    brand: "asus",
    category: "compactos",
    summary: "14 polegadas e 1,4 kg para levar na mochila.",
    description:
      "Notebook fino com Core i5, 16 GB e SSD de 512 GB. A bateria cobre um turno de aula ou escritório.",
    priceCents: 399900,
    warrantyMonths: 12,
    rating: 4.6,
    reviewCount: 53,
    purpose: "portatil",
    images: ["/products/laptop-04.jpg", "/products/laptop-08.jpg"],
    physical: 7,
    spec: baseSpec({
      screenInches: 14,
      processor: "Intel Core i5-1235U",
      processorFamily: "Intel Core i5",
      generation: "12ª geração",
      cores: 10,
      threads: 12,
      weightKg: 1.4,
      color: "Prata",
    }),
  },
  {
    name: "HP 14",
    slug: "hp-14",
    sku: "SV-HP-14EP",
    ean: "7891001000069",
    brand: "hp",
    category: "ate-14",
    summary: "Até 14 polegadas, com memória e SSD para o trabalho leve.",
    description:
      "Core i5, 16 GB de RAM e SSD de 512 GB em um chassi de 14 polegadas. Bom equilíbrio entre tela e peso.",
    priceCents: 449900,
    warrantyMonths: 12,
    rating: 4.4,
    reviewCount: 22,
    purpose: "profissional",
    images: ["/products/laptop-09.jpg", "/products/laptop-02.jpg"],
    physical: 3,
    spec: baseSpec({
      screenInches: 14,
      processor: "Intel Core i5-1335U",
      processorFamily: "Intel Core i5",
      generation: "13ª geração",
      cores: 10,
      threads: 12,
      weightKg: 1.38,
      color: "Prata",
    }),
  },
  {
    name: "XPS 13",
    slug: "dell-xps-13",
    sku: "SV-DEL-XPS13",
    ean: "7891001000076",
    brand: "dell",
    category: "compactos",
    summary: "13,4 polegadas e 1,19 kg para quem viaja com o notebook.",
    description:
      "Linha compacta com Core Ultra, tela de alta resolução e SSD de 512 GB. Feito para levar todos os dias.",
    priceCents: 1099900,
    warrantyMonths: 12,
    rating: 4.9,
    reviewCount: 18,
    featured: true,
    isLaunch: true,
    purpose: "portatil",
    images: ["/products/laptop-08.jpg", "/products/laptop-09.jpg"],
    physical: 2,
    spec: baseSpec({
      screenInches: 13.4,
      resolution: "1920x1200",
      processor: "Intel Core Ultra 7 155H",
      processorFamily: "Intel Core Ultra",
      generation: "Series 1",
      cores: 16,
      threads: 22,
      weightKg: 1.19,
      heightMm: 15,
      color: "Platina",
      battery: "Até 12 horas",
      panel: "IPS",
    }),
  },
  {
    name: "Swift Go 14",
    slug: "acer-swift-go-14",
    sku: "SV-ACR-SW14",
    ean: "7891001000083",
    brand: "acer",
    category: "alto-desempenho",
    summary: "14 polegadas, painel OLED e Core Ultra para carga criativa.",
    description:
      "Tela OLED, 16 GB de RAM e SSD de 512 GB. Indicado para edição leve, estudo avançado e multitarefa.",
    priceCents: 629900,
    promoPriceCents: 589900,
    warrantyMonths: 12,
    rating: 4.7,
    reviewCount: 15,
    isLaunch: true,
    isDeal: true,
    purpose: "desempenho",
    images: ["/products/laptop-10.jpg", "/products/laptop-01.jpg"],
    physical: 4,
    spec: baseSpec({
      screenInches: 14,
      resolution: "2880x1800",
      panel: "OLED",
      processor: "Intel Core Ultra 5 125H",
      processorFamily: "Intel Core Ultra",
      generation: "Series 1",
      cores: 14,
      threads: 18,
      weightKg: 1.25,
      color: "Cinza",
      battery: "Até 10 horas",
    }),
  },
  {
    name: "LOQ 15",
    slug: "lenovo-loq-15",
    sku: "SV-LEN-LOQ15",
    ean: "7891001000090",
    brand: "lenovo",
    category: "gamer",
    summary: "15,6 polegadas, 144 Hz e placa de vídeo dedicada.",
    description:
      "Core i5 da série H, RTX 3050, 16 GB e SSD de 512 GB. Para jogos e também para quem precisa de GPU.",
    priceCents: 679900,
    promoPriceCents: 639900,
    warrantyMonths: 12,
    rating: 4.6,
    reviewCount: 37,
    isDeal: true,
    featured: true,
    purpose: "gamer",
    images: ["/products/laptop-07.jpg", "/products/laptop-12.jpg"],
    physical: 5,
    spec: baseSpec({
      screenInches: 15.6,
      refreshRate: 144,
      processor: "Intel Core i5-13420H",
      processorFamily: "Intel Core i5",
      generation: "13ª geração",
      cores: 8,
      threads: 12,
      gpu: "NVIDIA GeForce RTX 3050 6 GB",
      gpuType: "dedicada",
      weightKg: 2.4,
      battery: "Até 5 horas",
      ethernet: true,
      color: "Cinza",
      heightMm: 25,
    }),
  },
  {
    name: "TUF Gaming F15",
    slug: "asus-tuf-gaming-f15",
    sku: "SV-ASU-TUF15",
    ean: "7891001000106",
    brand: "asus",
    category: "gamer",
    summary: "Core i7, RTX 4050 e SSD de 1 TB.",
    description:
      "Notebook gamer com tela de 144 Hz, memória de 16 GB e armazenamento de 1 TB para jogos e arquivos grandes.",
    priceCents: 789900,
    warrantyMonths: 12,
    rating: 4.7,
    reviewCount: 26,
    purpose: "gamer",
    images: ["/products/laptop-12.jpg", "/products/laptop-01.jpg"],
    physical: 3,
    spec: baseSpec({
      screenInches: 15.6,
      refreshRate: 144,
      processor: "Intel Core i7-13620H",
      processorFamily: "Intel Core i7",
      generation: "13ª geração",
      cores: 10,
      threads: 16,
      ssdGb: 1024,
      gpu: "NVIDIA GeForce RTX 4050 6 GB",
      gpuType: "dedicada",
      weightKg: 2.2,
      battery: "Até 6 horas",
      ethernet: true,
      color: "Grafite",
      heightMm: 23,
    }),
  },
  {
    name: "A52",
    slug: "avell-a52",
    sku: "SV-AVL-A52",
    ean: "7891001000113",
    brand: "avell",
    category: "gamer",
    summary: "Alto desempenho com RTX 4050 para jogo e criação.",
    description:
      "Configuração gamer nacional com Core i7, 16 GB de RAM, SSD de 512 GB e tela de 144 Hz.",
    priceCents: 929900,
    warrantyMonths: 12,
    rating: 4.5,
    reviewCount: 11,
    featured: true,
    purpose: "gamer",
    images: ["/products/laptop-01.jpg", "/products/laptop-07.jpg"],
    physical: 2,
    spec: baseSpec({
      screenInches: 15.6,
      refreshRate: 144,
      processor: "Intel Core i7-13650HX",
      processorFamily: "Intel Core i7",
      generation: "13ª geração",
      cores: 14,
      threads: 20,
      gpu: "NVIDIA GeForce RTX 4050 6 GB",
      gpuType: "dedicada",
      weightKg: 2.3,
      battery: "Até 4 horas",
      ethernet: true,
      color: "Preto",
      heightMm: 26,
    }),
  },
  {
    name: "Motion C",
    slug: "positivo-motion-c",
    sku: "SV-POS-MOTC",
    ean: "7891001000120",
    brand: "positivo",
    category: "estudo",
    summary: "Opção de entrada para tarefas escolares e navegação.",
    description:
      "Notebook acessível com 8 GB de RAM e SSD de 256 GB. Indicado para texto, aula online e pesquisa.",
    priceCents: 259900,
    promoPriceCents: 239900,
    warrantyMonths: 12,
    rating: 4.2,
    reviewCount: 48,
    isDeal: true,
    purpose: "estudo",
    images: ["/products/laptop-11.jpg", "/products/laptop-05.jpg"],
    physical: 9,
    spec: baseSpec({
      screenInches: 14,
      processor: "Intel Celeron N4500",
      processorFamily: "Intel Celeron",
      generation: "Jasper Lake",
      cores: 2,
      threads: 2,
      ramGb: 8,
      ramMaxGb: 16,
      ssdGb: 256,
      gpu: "Intel UHD Graphics",
      weightKg: 1.46,
      battery: "Até 6 horas",
      color: "Cinza",
    }),
  },
];

function baseSpec(overrides: Partial<SeedProduct["spec"]>): SeedProduct["spec"] {
  return {
    screenInches: 14,
    resolution: "1920x1080",
    refreshRate: 60,
    panel: "IPS",
    processor: "Intel Core i5",
    processorFamily: "Intel Core i5",
    generation: "13ª geração",
    cores: 10,
    threads: 12,
    ramGb: 16,
    ramType: "DDR4",
    ramMaxGb: 32,
    ssdGb: 512,
    gpu: "Intel Iris Xe",
    gpuType: "integrada",
    os: "Windows 11",
    wifi: "Wi-Fi 6",
    bluetooth: "5.1",
    hdmi: true,
    usb: "2x USB-A",
    usbC: "1x USB-C",
    ethernet: false,
    battery: "Até 8 horas",
    charger: "65 W",
    weightKg: 1.5,
    widthMm: 322,
    heightMm: 18,
    depthMm: 215,
    color: "Cinza",
    ...overrides,
  };
}

async function main() {
  await prisma.productImage.deleteMany();
  await prisma.productSpecification.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  const brandRows = new Map<string, string>();
  for (const [name, slug] of brands) {
    const brand = await prisma.brand.create({
      data: { name, slug, logoUrl: `/brands/${slug}.${slug === "avell" ? "png" : "svg"}` },
    });
    brandRows.set(slug, brand.id);
  }

  const categoryRows = new Map<string, string>();
  for (const [slug, name, description, sortOrder] of categories) {
    const category = await prisma.category.create({
      data: { slug, name, description, sortOrder },
    });
    categoryRows.set(slug, category.id);
  }

  for (const product of products) {
    const brandId = brandRows.get(product.brand);
    const categoryId = categoryRows.get(product.category);
    if (!brandId || !categoryId) throw new Error(`Cadastro inválido: ${product.slug}`);

    await prisma.product.create({
      data: {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        ean: product.ean,
        brandId,
        categoryId,
        summary: product.summary,
        description: product.description,
        priceCents: product.priceCents,
        promoPriceCents: product.promoPriceCents,
        warrantyMonths: product.warrantyMonths,
        rating: product.rating,
        reviewCount: product.reviewCount,
        featured: product.featured ?? false,
        isLaunch: product.isLaunch ?? false,
        isDeal: product.isDeal ?? false,
        purpose: product.purpose,
        images: {
          create: product.images.map((url, sortOrder) => ({
            url,
            alt: product.name,
            sortOrder,
          })),
        },
        spec: { create: product.spec },
        inventory: {
          create: {
            physical: product.physical,
            reserved: product.reserved ?? 0,
            minimum: 2,
          },
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
