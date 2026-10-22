import type { Metadata } from "next";
import { readFileSync } from "node:fs";
import path from "node:path";
import ReferenceHome from "@/components/reference-home";

export const metadata: Metadata = {
  "title": "Prefab Homes & Modular Spaces | Smart Cubes",
  "description": "Discover Smart Cubes prefab homes, office cabins, and site offices."
};

export default function Page() {
  const markup = readFileSync(path.join(process.cwd(), "data/reference-home.html"), "utf8");
  return <ReferenceHome markup={markup} />;
}
