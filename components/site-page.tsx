"use client";

import { useEffect, useRef, useState, type ReactNode, type FormEvent } from "react";
import { ArrowRight, ChevronRight, Check, Menu, X, Plus, Minus, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { enquiryInterests } from "@/data/home-models";
import { ProcessDetails, ProjectChecklist } from "@/components/project-details";
import faqs from "@/data/faqs.json";
import { designs } from "@/data/designs";

export type PageSection = "home" | "about" | "designs" | "prefab" | "contact" | "faqs";
const paths: Record<PageSection, string> = { home: "/", about: "/about-us", designs: "/designs", prefab: "/prefab-homes", contact: "/contact", faqs: "/faqs" };
const links = [["Home", "/"], ["About Us", "/about-us"], ["Designs", "/designs"], ["Contact Us", "/contact"], ["FAQs", "/faqs"]];
const categories = ["All spaces", "Homes", "Workspaces"];

function Logo({ white = false }: { white?: boolean }) {
  return <Link className={`logo ${white ? "logo-white" : ""}`} href="/" aria-label="Smart Cubes home"><img src="/images/smart-cubes-logo.png" alt="Smart Cubes" width="1034" height="579" /></Link>;
}
function SectionHeading({ children, id }: { children: React.ReactNode; id?: string }) { return <div className="section-heading"><h1 id={id}>{children}</h1></div>; }

export default function SitePage({ section, children }: { section: PageSection; children?: ReactNode }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [category, setCategory] = useState("All spaces");
  const [selected, setSelected] = useState<(typeof designs)[number] | null>(null);
  const [interest, setInterest] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [allFaqs, setAllFaqs] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); document.querySelector<HTMLButtonElement>(".menu-toggle")?.focus(); } };
    const outside = (event: PointerEvent) => { if (!(event.target as HTMLElement).closest(".header")) setMenuOpen(false); };
    const resize = () => { if (window.innerWidth > 760) setMenuOpen(false); };
    document.addEventListener("keydown", close); document.addEventListener("pointerdown", outside); window.addEventListener("resize", resize);
    return () => { document.removeEventListener("keydown", close); document.removeEventListener("pointerdown", outside); window.removeEventListener("resize", resize); };
  }, [menuOpen]);

  useEffect(() => {
    if (selected) { previousFocus.current = document.activeElement as HTMLElement; dialog.current?.showModal(); document.body.style.overflow = "hidden"; }
    else { dialog.current?.close(); document.body.style.overflow = ""; previousFocus.current?.focus(); }
    return () => { document.body.style.overflow = ""; };
  }, [selected]);

  function enquire(value: string) { setSelected(null); setMenuOpen(false); router.push("/contact?interest=" + encodeURIComponent(value)); }
  useEffect(() => {
    if (section !== "contact") return;
    const value = new URLSearchParams(window.location.search).get("interest");
    if (value && enquiryInterests.includes(value)) setInterest(value);
  }, [section]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget;
    setStatus("sending"); setError("");
    try {
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Please try again.");
      setStatus("success"); form.reset(); setInterest("");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Please try again."); setStatus("error"); }
  }

  return <>
    <Link href="#main" className="skip-link">Skip to content</Link>
    <header className="header"><div className="brand-row"><Logo white /><button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation">{menuOpen ? <X /> : <Menu />}<span className="mobile-menu-label">Menu</span></button></div><nav className="desktop-nav" aria-label="Main navigation">{links.map(([name, target]) => <Link href={target} aria-current={target === paths[section] ? "page" : undefined} key={target}>{name}</Link>)}</nav>{menuOpen && <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">{links.map(([name, target]) => <Link href={target} aria-current={target === paths[section] ? "page" : undefined} key={target} onClick={() => setMenuOpen(false)}>{name}<ChevronRight size={16} /></Link>)}</nav>}</header>

    <main id="main" className={section === "home" ? "home-page" : "inner-page"}>
      {section !== "home" && <div className="breadcrumb content-width"><Link href="/">Home</Link><ChevronRight size={13} /><span>{links.find(([, target]) => target === paths[section])?.[0] || "Prefab Homes"}</span></div>}
      {section === "home" && (<section className="hero" id="home"><img className="hero-image" src="/images/reference-hero.jpg" alt="Illustrative modern prefab home surrounded by nature" fetchPriority="high" width="1536" height="1024" /><div className="hero-overlay" /><div className="torn-edge torn-top" aria-hidden="true" /><div className="hero-content"><h1>Prefab Homes Built Around Your Life.</h1><p>Thoughtful spaces for living and working.</p><Link className="explore-button" href="/designs">Explore Designs <ChevronRight size={36} strokeWidth={4} /></Link></div><div className="torn-edge torn-bottom" aria-hidden="true" /></section>)}

      {section === "contact" && (<section className="quotation-section" id="contact" aria-labelledby="quotation-heading"><div className="content-width"><h1 id="quotation-heading">Request a Quotation for Your Project</h1><p className="quotation-intro">Tell us where you plan to build and the type of home or cottage you need. Our team will help you compare suitable designs and discuss specifications, site requirements, and your quotation.</p><div className="form-panel">{status === "success" ? <div className="form-success" role="status"><span className="success-icon"><Check size={28} /></span><h3>Your idea is in good hands.</h3><p>Your enquiry has been saved. Thank you for sharing your plans with Smart Cubes.</p><button className="black-button" onClick={() => setStatus("idle")}>Send another enquiry <ArrowRight size={17} /></button></div> : <form onSubmit={submit} aria-busy={status === "sending"}><div className="form-row"><label>Name <span>*</span><input name="name" autoComplete="name" placeholder="Enter your full name" minLength={2} maxLength={100} required /></label><label>Email <span>*</span><input name="email" type="email" autoComplete="email" placeholder="Enter your email" maxLength={254} required /></label></div><div className="form-row"><label>Phone <span>*</span><input name="phone" type="tel" autoComplete="tel" placeholder="Enter your phone number" pattern="[+0-9 ()-]{8,20}" maxLength={20} required /></label><label>Interested in <span>*</span><select name="interest" value={interest} onChange={e => setInterest(e.target.value)} required><option value="" disabled>Choose one</option>{enquiryInterests.map(value => <option key={value}>{value}</option>)}</select></label></div><label>Project City and State <span>*</span><input name="location" autoComplete="address-level2" placeholder="Include where your project is located" minLength={2} maxLength={150} required /></label><label>Project Details<textarea name="message" rows={3} maxLength={3000} placeholder="Tell us about your plans, preferred size, and approximate budget" /></label><div className="honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div><label className="consent"><input type="checkbox" name="consent" required /><span>I agree to be contacted by Smart Cubes about my enquiry.</span></label>{status === "error" && <p className="form-error" role="alert">{error}</p>}<button className="black-button form-submit" type="submit" disabled={status === "sending"}>{status === "sending" ? <>Sending your enquiry <LoaderCircle size={17} className="spinner" /></> : <>Request My Quotation <ArrowRight size={17} /></>}</button></form>}</div><div className="company-intro"><h3>Purpose-built steel modular homes & cottages</h3><p className="intro-points">Thoughtfully Planned | Factory-Built Construction | Transportation & Installation</p><p>Smart Cubes brings manufacturing, transportation, and installation into one connected process. Explore practical modular spaces for modern living, leisure, and work, with available configurations selected around your requirements.</p></div></div></section>)}

      {section === "designs" && (<section id="designs" aria-labelledby="designs-heading"><SectionHeading id="designs-heading">Explore our options</SectionHeading><div className="content-width section-content"><p className="section-intro">A design for every purpose. From peaceful weekend retreats to practical workspaces, find a ready-made configuration that works for you.</p><div className="tabs" role="tablist" aria-label="Filter spaces">{categories.map(tab => <button key={tab} role="tab" id={`tab-${tab.replaceAll(" ", "-")}`} aria-selected={category === tab} aria-controls="design-grid" tabIndex={category === tab ? 0 : -1} className={category === tab ? "active" : ""} onClick={() => setCategory(tab)} onKeyDown={event => { const index = categories.indexOf(tab); let next = index; if (event.key === "ArrowRight") next = (index + 1) % categories.length; else if (event.key === "ArrowLeft") next = (index + categories.length - 1) % categories.length; else if (event.key === "Home") next = 0; else if (event.key === "End") next = categories.length - 1; else return; event.preventDefault(); setCategory(categories[next]); document.getElementById(`tab-${categories[next].replaceAll(" ", "-")}`)?.focus(); }}>{tab}</button>)}</div><div className="design-grid" id="design-grid" role="tabpanel" aria-labelledby={`tab-${category.replaceAll(" ", "-")}`}>{designs.filter(d => category === "All spaces" || d.category === category).map(design => <button key={design.id} className="design-card" onClick={() => design.id === "prefab-home" ? router.push("/prefab-homes") : setSelected(design)}><div className="design-photo"><img src={design.image} alt={`Concept design for ${design.type.toLowerCase()}`} loading="lazy" width="960" height="640" /></div><h3>{design.type}</h3><p>{design.description}</p><span>Explore Designs <ChevronRight size={17} /></span></button>)}</div><p className="image-disclaimer">Architectural concept imagery is illustrative. Final designs, finishes, and inclusions are confirmed with your quotation.</p></div></section>)}



      {section === "about" && (<section id="about" aria-labelledby="about-heading"><div className="about-gallery" aria-label="Illustrative modular architecture"><img src="/images/home.jpg" alt="Prefab home concept" loading="lazy" width="960" height="640" /><img src="/images/cottage.jpg" alt="Holiday cottage concept" loading="lazy" width="1000" height="667" /><img src="/images/office.jpg" alt="Modular office concept" loading="lazy" width="960" height="640" /><img src="/images/studio-v2.jpg" alt="Compact studio concept" loading="lazy" width="960" height="640" /></div><SectionHeading id="about-heading">About Us</SectionHeading><div className="content-width about-copy section-content"><h3>About Smart Cubes — Rethinking the Way Spaces Are Built</h3><p>At Smart Cubes, we believe creating a comfortable, functional space should be a simpler and smarter experience.</p><p>We specialise in purpose-built steel modular structures designed for modern living, leisure, and work. From compact studio spaces and 1 BHK or 2 BHK prefab homes to holiday cottages, farm cottages, office cabins, and site offices, our solutions are designed around practical needs and everyday usability.</p><p>Our approach brings manufacturing, transportation, and installation together in one streamlined process. With factory-controlled manufacturing, thoughtfully planned layouts, and modern interior options, we aim to make prefab construction a practical alternative for customers looking for a well-designed space without the complexity of a conventional build.</p><p>Whether you’re planning a weekend retreat, adding accommodation to a resort, or creating a functional workspace, Smart Cubes helps you take the next step with clarity and confidence.</p><p className="about-tagline">Smart Cubes — Designed for living. Built for possibilities.</p></div></section>)}

      {section === "faqs" && (<section id="faqs" aria-labelledby="faqs-heading"><SectionHeading id="faqs-heading">Frequently asked questions</SectionHeading><div className="content-width faq-content"><div className="faq-list">{faqs.slice(0, allFaqs ? faqs.length : 6).map((faq, index) => <div className={`faq-item ${openFaq === index ? "is-open" : ""}`} key={faq.question}><h3><button id={`faq-question-${index}`} aria-expanded={openFaq === index} aria-controls={`faq-answer-${index}`} onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{faq.question}</span>{openFaq === index ? <Minus size={18} /> : <Plus size={18} />}</button></h3><div id={`faq-answer-${index}`} role="region" aria-labelledby={`faq-question-${index}`} hidden={openFaq !== index}><p>{faq.answer}</p></div></div>)}</div><button className="faq-more" onClick={() => { setAllFaqs(!allFaqs); if (allFaqs && openFaq !== null && openFaq > 5) setOpenFaq(null); }}>{allFaqs ? "Show fewer questions" : `View all ${faqs.length} questions`}{allFaqs ? <Minus size={16} /> : <Plus size={16} />}</button></div></section>)}

      {section === "home" && <div className="home-overview content-width"><h2>Designed for living. Built for possibilities.</h2><p>Purpose-built steel modular spaces for modern living, leisure, and work. Discover Smart Cubes and find the right starting point for your project.</p><div className="page-link-grid">{[
        { title: "About Smart Cubes", text: "Our approach to simpler, smarter spaces.", href: "/about-us", image: "/images/home.jpg" },
        { title: "Explore Our Designs", text: "Prefab homes, cottages, studios, and workspaces.", href: "/designs", image: "/images/cottage.jpg" },
        { title: "Contact Us", text: "Share your requirements and request a quotation.", href: "/contact", image: "/images/site-office-v2.jpg" },
        { title: "Frequently Asked Questions", text: "Straight answers to your prefab questions.", href: "/faqs", image: "/images/home.jpg" },
      ].map(page => <Link className="page-link-card" href={page.href} key={page.href}><img src={page.image} alt="" loading="lazy" width="960" height="640" /><div><h3>{page.title}</h3><p>{page.text}</p><span>Learn more <ChevronRight size={17} /></span></div></Link>)}</div></div>}
      {section === "about" && <ProcessDetails />}
      {section === "contact" && <ProjectChecklist />}
      {children}
    </main>

    <footer><div className="footer-inner"><Logo white /><p>Designed for living. Built for possibilities.</p><nav aria-label="Footer navigation">{links.slice(1).map(([name, target]) => <Link key={target} href={target} aria-current={target === paths[section] ? "page" : undefined}>{name}</Link>)}</nav><div className="footer-bottom"><span>© {new Date().getFullYear()} Smart Cubes. All rights reserved.</span><Link href={paths[section] + "#main"}>Back to top ↑</Link></div></div></footer>

    <dialog ref={dialog} className="design-dialog" aria-labelledby="dialog-title" onCancel={() => setSelected(null)} onClick={event => { if (event.target === event.currentTarget) setSelected(null); }}>{selected && <><button className="dialog-close" onClick={() => setSelected(null)} aria-label="Close design details"><X size={22} /></button><img className="dialog-image" src={selected.image} alt={`Concept for ${selected.type}`} /><div className="dialog-copy"><span className="dialog-category">{selected.type}</span><h2 id="dialog-title">{selected.name}</h2><p>{selected.description}</p><ul>{selected.features.map(feature => <li key={feature}><Check size={16} />{feature}</li>)}</ul><p className="dialog-note">Imagery is illustrative. Available configurations, finishes, pricing, and inclusions are confirmed during consultation.</p><button className="black-button" onClick={() => enquire(selected.type)}>Enquire about this space <ArrowRight size={17} /></button></div></>}</dialog>
  </>;
}
