"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";

export default function SiteExperience() {
  const pathname = usePathname();
  const progress = useRef<HTMLDivElement>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const fraction = distance > 0 ? Math.min(1, Math.max(0, window.scrollY / distance)) : 0;
      if (progress.current) progress.current.style.transform = `scaleX(${fraction})`;
      document.documentElement.classList.toggle("site-has-scrolled", window.scrollY > 24);
      setShowTop(window.scrollY > 650);
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update(); window.addEventListener("scroll", scroll, { passive: true }); window.addEventListener("resize", scroll);
    const resize = new ResizeObserver(scroll); resize.observe(document.body);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", scroll); window.removeEventListener("resize", scroll); resize.disconnect(); };
  }, [pathname]);

  useEffect(() => {
    if (!window.IntersectionObserver) return;
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const seen = new WeakSet<Element>();
    let frame = 0;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("is-revealed"); observer.unobserve(entry.target); }
    }, { threshold: 0.07, rootMargin: "0px 0px -24px 0px" });
    const selector = ".source-design-gallery>a,.source-benefits-grid article,.source-about-copy>p,.source-contact-copy,.source-audience-grid>a,.source-value-strip>div,.process-steps>article,.specifications-grid>article,.checklist-grid>article,.audience-details-grid>article,.design-card,.benefit,.about-copy>p,.audience-card,.details-intro,.about-visual,.about-highlights li,.hero-highlights>div,.home-project-checklist>div,.home-model-card,.catalog-help,.more-home-card,.product-highlights li";
    const scan = () => {
      frame = 0;
      document.querySelectorAll(selector).forEach(element => {
        if (seen.has(element)) return;
        seen.add(element);
        const rect = element.getBoundingClientRect();
        if (preference.matches || rect.top < window.innerHeight - 24) return;
        element.classList.add("reveal-target");
        const index = Array.from(element.parentElement?.children || []).indexOf(element);
        (element as HTMLElement).style.setProperty("--reveal-delay", `${Math.min(index % 3, 2) * 55}ms`);
        observer.observe(element);
      });
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(scan); };
    const mutations = new MutationObserver(schedule); mutations.observe(document.body, { childList: true, subtree: true });
    const revealFocused = (event: FocusEvent) => (event.target as HTMLElement).closest(".reveal-target")?.classList.add("is-revealed");
    const reduce = () => { if (preference.matches) { document.querySelectorAll(".reveal-target").forEach(element => element.classList.add("is-revealed")); observer.disconnect(); } };
    schedule(); document.addEventListener("focusin", revealFocused); preference.addEventListener("change", reduce);
    return () => { cancelAnimationFrame(frame); observer.disconnect(); mutations.disconnect(); document.removeEventListener("focusin", revealFocused); preference.removeEventListener("change", reduce); document.querySelectorAll(".reveal-target:not(.is-revealed)").forEach(element => element.classList.add("is-revealed")); };
  }, [pathname]);

  return <><div ref={progress} className="reading-progress" aria-hidden="true" />{showTop && <button className="back-to-top" aria-label="Scroll to top" onClick={() => window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" })}><ArrowUp size={20} strokeWidth={1.7} aria-hidden="true" /></button>}</>;
}
