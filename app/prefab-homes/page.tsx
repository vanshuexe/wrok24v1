import type { Metadata } from "next";
import SitePage from "@/components/site-page";
import { HomeCollection } from "@/components/home-catalog";

export const metadata: Metadata = { title: "Prefab Homes — Studio, 1 BHK & 2 BHK | Smart Cubes", description: "Explore the SC 20x10S, SC 20x10 One, and SC 20x40 Two prefab homes. Enquire for model pricing." };

export default function Page() { return <SitePage section="prefab"><HomeCollection /></SitePage>; }
