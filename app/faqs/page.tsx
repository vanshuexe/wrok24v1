import type { Metadata } from "next";
import SitePage from "@/components/site-page";

export const metadata: Metadata = {
  "title": "Frequently Asked Questions | Smart Cubes",
  "description": "Answers to common questions about Smart Cubes prefab homes, layouts, timelines, installation, and quotations."
};

export default function Page() { return <SitePage section="faqs" />; }
