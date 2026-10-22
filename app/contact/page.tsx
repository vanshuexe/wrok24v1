import type { Metadata } from "next";
import SitePage from "@/components/site-page";

export const metadata: Metadata = {
  "title": "Contact Us & Request a Quotation | Smart Cubes",
  "description": "Share your project location and requirements with Smart Cubes using our enquiry form."
};

export default function Page() { return <SitePage section="contact" />; }
