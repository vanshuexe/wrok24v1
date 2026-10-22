import type { Metadata } from "next";
import SitePage from "@/components/site-page";

export const metadata: Metadata = {
  "title": "Explore our options | Smart Cubes",
  "description": "Explore prefab homes, office cabins, and site offices from Smart Cubes."
};

export default function Page() { return <SitePage section="designs" />; }
