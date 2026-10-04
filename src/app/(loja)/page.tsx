import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, ChevronRight, CreditCard, QrCode, ShieldCheck, Store } from "lucide-react";
import { Carousel } from "@/components/carousel";
import { HeroVideos } from "@/components/hero-videos";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { listBrands, listProducts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

const benefits = [
  { icon: CreditCard, title: "Cartão de crédito", text: "Parcele em até 10x" },
  { icon: QrCode, title: "Pague com Pix", text: "E ganhe desconto à vista" },
  { icon: ShieldCheck, title: "Garantia", text: "Em todos os equipamentos" },
  { icon: Store, title: "Retirada na loja", text: "Compre online e retire" },
];

const infoCards = [
  { title: "Tudo sobre a Servo Informática", text: "Loja física e virtual com o mesmo estoque, preço e atendimento.", href: "/notebooks" },
  { title: "Compare antes de comprar", text: "Coloque até 3 notebooks lado a lado e veja tela, peso, memória e preço antes de decidir.", href: "/comparar" },
  { title: "Garantia e retirada", text: "Equipamentos com garantia e retirada na loja depois do pagamento confirmado.", href: "/ofertas" },
];

export default async function HomePage() {
  const [brands, deals, launches, featured, portable] = await Promise.all([
    listBrands(),
    listProducts({ oferta: true }),
    listProducts({ lancamento: true }),
    listProducts({ destaque: true }),
    listProducts({ peso: "leve" }),
  ]);
  const brandsWithProducts = brands.filter((brand) => brand._count.products > 0);

  return (
    <div>
      <section className="relative isolate overflow-hidden bg-black text-white">
        <HeroVideos />
        <div className="mx-auto flex min-h-[26rem] max-w-7xl flex-col justify-center px-4 py-14 sm:px-6 lg:min-h-[30rem]">
          <p className="inline-flex w-fit rounded-md border border-white/30 bg-black/40 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
            Informática com garantia
          </p>
          <h1 className="mt-5 max-w-2xl font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Tecnologia para o seu ritmo
          </h1>
          <p className="mt-5 max-w-lg text-lg leading-7 text-white/75">
            Notebooks, computadores, periféricos e acessórios. O mesmo estoque e preço da loja física.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="uppercase tracking-wider">
              <Link href="/notebooks">
                Compre agora <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/60 uppercase tracking-wider text-white hover:bg-white hover:text-black">
              <Link href="/ofertas">Ver ofertas</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-[#e9e9e9]">
        <ul className="mx-auto grid max-w-7xl grid-cols-2 gap-x-4 gap-y-6 px-4 py-8 sm:px-6 lg:grid-cols-4">
          {benefits.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-black/70 sm:size-14">
                <Icon className="size-6" aria-hidden />
              </span>
              <span>
                <span className="block text-sm font-bold">{title}</span>
                <span className="block text-xs text-neutral-600">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <ProductRail title="Ofertas da semana" href="/ofertas" products={deals} />
      <ProductRail title="Lançamentos" href="/lancamentos" products={launches} />

      {portable.length ? (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <SectionTitle title="Leves para levar a qualquer lugar" subtitle="Notebooks de até 1,4 kg para estudo, trabalho e deslocamento." />
          <div className="mt-10 grid items-center gap-8 lg:grid-cols-2">
            <Link
              href="/categoria/compactos"
              className="group relative flex min-h-60 flex-col justify-between overflow-hidden rounded-2xl bg-black p-8 text-white"
            >
              <span className="text-xs uppercase tracking-[0.2em] text-white/60">Notebooks compactos</span>
              <span className="font-display text-5xl font-bold uppercase leading-none sm:text-6xl">
                Até <span className="text-primary">1,4 kg</span>
              </span>
              <span className="inline-flex w-fit items-center gap-2 rounded-md border border-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition group-hover:bg-white group-hover:text-black">
                Compre agora <ChevronRight className="size-4" />
              </span>
            </Link>
            <div className="text-center lg:text-left">
              <h3 className="font-display text-2xl font-bold">A escolha certa para quem vive em movimento</h3>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-neutral-600 lg:mx-0">
                Tela, peso, processador e memória no mesmo card. Compare os modelos e retire na loja.
              </p>
              <Button asChild variant="dark" className="mt-6">
                <Link href="/categoria/compactos">Ver compactos</Link>
              </Button>
            </div>
          </div>
        </section>
      ) : null}

      {brandsWithProducts.length ? (
        <section className="bg-[#e9e9e9] py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-16">
            <Carousel label="Marcas" itemClassName="w-[42%] sm:w-[28%] lg:w-[calc(20%-16px)]">
              {brandsWithProducts.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/marca/${brand.slug}`}
                  className="grid h-20 place-items-center rounded-xl bg-white px-6 transition hover:shadow-md"
                  aria-label={brand.name}
                >
                  {brand.logoUrl ? (
                    <Image src={brand.logoUrl} alt={brand.name} width={120} height={40} unoptimized className="h-9 w-auto max-w-full object-contain" />
                  ) : (
                    <span className="font-display text-lg font-bold text-neutral-700">{brand.name}</span>
                  )}
                </Link>
              ))}
            </Carousel>
          </div>
        </section>
      ) : null}

      <ProductRail title="Dica da Servo" href="/notebooks" products={featured} />

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-12 sm:px-6 md:grid-cols-3">
        {infoCards.map((card) => (
          <Link key={card.title} href={card.href} className="flex min-h-56 flex-col rounded-2xl bg-gradient-to-br from-[#e4e4e4] to-[#cfcfcf] p-8 transition hover:-translate-y-0.5">
            <h3 className="max-w-[14rem] font-display text-lg font-bold uppercase leading-tight">{card.title}</h3>
            <p className="mt-4 max-w-[16rem] text-sm leading-6 text-neutral-700">{card.text}</p>
            <span className="mt-auto pt-6 text-sm font-bold underline underline-offset-4">Saiba mais</span>
          </Link>
        ))}
      </section>
    </div>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle?: ReactNode }) {
  return (
    <div className="text-center">
      <h2 className="font-display text-3xl font-bold sm:text-4xl">{title}</h2>
      {subtitle ? <p className="mt-2 text-sm text-neutral-600">{subtitle}</p> : null}
    </div>
  );
}

function ProductRail({
  title,
  href,
  products,
}: {
  title: string;
  href: string;
  products: Awaited<ReturnType<typeof listProducts>>;
}) {
  if (!products.length) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-16">
      <SectionTitle title={title} />
      <div className="mt-10">
        <Carousel label={title}>
          {products.slice(0, 12).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </Carousel>
      </div>
      <p className="mt-6 text-center">
        <Link href={href} className="text-sm font-semibold underline underline-offset-4 hover:text-primary">
          Ver todos
        </Link>
      </p>
    </section>
  );
}
