"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ReferenceHome({ markup }: { markup: string }) {
  const root = useRef<HTMLDivElement>(null);
  const router = useRouter();
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const closeMenu = (restoreFocus = false) => {
      element.classList.remove("source-menu-open");
      const button = element.querySelector<HTMLButtonElement>(".source-menu-button");
      button?.setAttribute("aria-expanded", "false");
      button?.setAttribute("aria-label", "Open navigation");
      if (restoreFocus) button?.focus();
    };
    const keydown = (event: KeyboardEvent) => { if (event.key === "Escape" && element.classList.contains("source-menu-open")) closeMenu(true); };
    const outside = (event: PointerEvent) => { if (!(event.target as HTMLElement).closest("#SITE_HEADER")) closeMenu(); };
    const resize = () => { if (window.innerWidth > 760) closeMenu(); };
    const click = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const menu = target.closest<HTMLButtonElement>(".source-menu-button");
      if (menu) { const open = menu.getAttribute("aria-expanded") !== "true"; menu.setAttribute("aria-expanded", String(open)); menu.setAttribute("aria-label", open ? "Close navigation" : "Open navigation"); element.classList.toggle("source-menu-open", open); return; }
      const link = target.closest<HTMLAnchorElement>("a[href]");
      if (link?.getAttribute("href")?.startsWith("/") && !event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) { event.preventDefault(); closeMenu(); router.push(link.getAttribute("href")!); }
    };
    const submit = async (event: Event) => {
      const form = event.target as HTMLFormElement;
      if (!form.matches("[data-source-enquiry]")) return;
      event.preventDefault();
      if (!form.reportValidity()) return;
      const button = form.querySelector<HTMLButtonElement>("[type=submit]")!;
      const status = form.querySelector<HTMLElement>(".source-form-status")!;
      button.disabled = true; form.setAttribute("aria-busy", "true"); status.setAttribute("role", "status"); status.dataset.error = "false"; status.textContent = "Sending your enquiry…";
      try {
        const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
        const result = await response.json(); if (!response.ok) throw new Error(result.error || "Please try again.");
        status.textContent = "Your enquiry has been saved. Thank you for sharing your plans with Smart Cubes."; form.reset();
      } catch (error) { status.setAttribute("role", "alert"); status.dataset.error = "true"; status.textContent = error instanceof Error ? error.message : "Please try again."; }
      finally { button.disabled = false; form.setAttribute("aria-busy", "false"); }
    };
    element.addEventListener("click", click); element.addEventListener("submit", submit);
    document.addEventListener("keydown", keydown); document.addEventListener("pointerdown", outside); window.addEventListener("resize", resize);
    return () => { element.removeEventListener("click", click); element.removeEventListener("submit", submit); document.removeEventListener("keydown", keydown); document.removeEventListener("pointerdown", outside); window.removeEventListener("resize", resize); };
  }, [router]);
  return <><link rel="stylesheet" href="/reference-home.css" /><link rel="stylesheet" href="/reference-adapter.css" /><link rel="stylesheet" href="/reference-layout.css" /><link rel="stylesheet" href="/ui-polish.css" /><link rel="stylesheet" href="/enhance.css" /><div ref={root} className="reference-home" dangerouslySetInnerHTML={{ __html: markup }} /></>;
}
