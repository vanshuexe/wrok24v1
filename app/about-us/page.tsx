import type { Metadata } from "next";
import SitePage from "@/components/site-page";

export const metadata: Metadata = {
  "title": "About Us | Smart Cubes",
  "description": "Learn about Smart Cubes and our connected approach to designing, manufacturing, transporting, and installing steel modular spaces."
};

export default function Page() { return <SitePage section="about" />; }
