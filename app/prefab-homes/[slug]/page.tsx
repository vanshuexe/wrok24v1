import type { Metadata } from "next";
import { notFound } from "next/navigation";
import SitePage from "@/components/site-page";
import { HomeProduct } from "@/components/home-catalog";
import { homeModels } from "@/data/home-models";

export const dynamicParams = false;
export function generateStaticParams() { return homeModels.map(model => ({ slug: model.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const model = homeModels.find(item => item.slug === slug);
  return { title: model ? `${model.name} | Smart Cubes` : "Home not found | Smart Cubes" };
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!homeModels.some(model => model.slug === slug)) notFound();
  return <SitePage section="prefab"><HomeProduct slug={slug} /></SitePage>;
}
