import type { Metadata } from "next";
import "./globals.css";
import SiteExperience from "@/components/site-experience";

export const metadata: Metadata = {
  title: "Smart Cubes | Thoughtful spaces. Smarter living.",
  description: "Discover purpose-built steel prefab homes, office cabins and site offices from Smart Cubes. Explore designs and start planning your space.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><link rel="stylesheet" href="/audience-illustrations.css" /><link rel="stylesheet" href="/ui-polish.css" /><link rel="stylesheet" href="/site-details.css" /><link rel="stylesheet" href="/home-catalog.css" /><link rel="stylesheet" href="/enhance.css" /></head><body>{children}<SiteExperience /></body></html>;
}
