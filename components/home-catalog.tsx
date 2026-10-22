"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BedDouble, ChevronLeft, ChevronRight, Factory, Ruler, ShieldCheck, Truck } from "lucide-react";
import { homeHighlights, homeModels } from "@/data/home-models";

const highlightIcons = { ShieldCheck, Factory, Truck };
const enquiryHref = (name: string) => `/contact?interest=${encodeURIComponent(name)}`;

export function HomeCollection() {
  return <>
    <section className="catalog-hero" aria-labelledby="catalog-heading">
      <img src="/images/home.jpg" alt="" width="1536" height="1024" fetchPriority="high" />
      <div className="catalog-hero-copy content-width">
        <span className="catalog-kicker">PREFAB HOMES</span>
        <h1 id="catalog-heading">A space for every way of living.</h1>
        <p>Explore our Studio, 1 BHK, and 2 BHK models.</p>
        <nav className="catalog-categories" aria-label="Home configurations">{homeModels.map(model => <a key={model.slug} href={`#${model.slug}`}><BedDouble size={16} aria-hidden="true" />{model.category}</a>)}</nav>
      </div>
    </section>
    <div className="home-catalog content-width">
      {homeModels.map((model, index) => <section className="catalog-section" id={model.slug} key={model.slug} aria-labelledby={`${model.slug}-heading`}>
        <div className="catalog-section-head"><span className="catalog-index" aria-hidden="true">0{index + 1}</span><h2 id={`${model.slug}-heading`}>{model.category}</h2><span className="catalog-rule" aria-hidden="true" /></div>
        <article className={`home-model-card${index % 2 ? " is-reversed" : ""}`}>
          <Link className="model-image" href={`/prefab-homes/${model.slug}`} aria-label={`View ${model.name}`}>
            <img src={model.image} alt={`Illustrative ${model.category} prefab home for ${model.name}`} width="1200" height="800" loading="lazy" />
            <span className="model-image-tag"><Ruler size={14} aria-hidden="true" />{model.size}</span>
          </Link>
          <div className="model-card-copy">
            <span className="detail-kicker">{model.category}</span>
            <h3><Link href={`/prefab-homes/${model.slug}`}>{model.name}</Link></h3>
            <p className="model-summary">{model.summary}</p>
            <ul className="model-chips">{homeHighlights.map(item => <li key={item.title}>{item.title}</li>)}</ul>
            <div className="model-actions">
              <Link className="model-enquiry" href={enquiryHref(model.name)}>Enquire prices <ArrowRight size={18} /></Link>
              <Link className="model-details-link" href={`/prefab-homes/${model.slug}`}>Explore this home <ArrowRight size={16} /></Link>
            </div>
          </div>
        </article>
      </section>)}
      <aside className="catalog-help"><div><h2>Not sure which layout fits?</h2><p>Tell us how you plan to use the space and our team will help you choose.</p></div><Link className="model-enquiry" href={enquiryHref("Help me choose")}>Help me choose <ArrowRight size={18} /></Link></aside>
      <p className="model-image-note">Images are placeholders for illustration. Final model images will be added.</p>
    </div>
  </>;
}

export function HomeProduct({ slug }: { slug: string }) {
  const model = homeModels.find(item => item.slug === slug)!;
  const [active, setActive] = useState(0);
  const others = homeModels.filter(item => item.slug !== slug);
  const step = (direction: number) => setActive((active + direction + model.images.length) % model.images.length);
  return <div className="home-product content-width">
    <Link className="collection-back" href="/prefab-homes"><ChevronLeft size={16} /> All prefab homes</Link>
    <div className="product-layout">
      <div className="product-gallery"><div className="product-main-image"><img key={model.images[active]} src={model.images[active]} alt={`${model.name} — illustrative view ${active + 1}`} width="1200" height="800" /><span className="model-image-tag"><Ruler size={14} aria-hidden="true" />{model.size}</span><div className="product-gallery-controls"><button type="button" aria-label="Previous image" onClick={() => step(-1)}><ChevronLeft size={20} /></button><span aria-live="polite">{active + 1} / {model.images.length}</span><button type="button" aria-label="Next image" onClick={() => step(1)}><ChevronRight size={20} /></button></div></div>
        <div className="product-thumbnails" aria-label="Product image gallery">{model.images.map((image, index) => <button type="button" key={image} onClick={() => setActive(index)} aria-label={`Show image ${index + 1}`} aria-pressed={active === index}><img src={image} alt="" width="240" height="160" /></button>)}</div>
        <p className="model-image-note">Placeholder images. Final model images will be added.</p>
      </div>
      <div className="product-copy"><span className="detail-kicker">{model.category}</span><h1>{model.name}</h1><Link className="model-enquiry" href={enquiryHref(model.name)}>Enquire now <ArrowRight size={18} /></Link>
        <ul className="product-highlights">{homeHighlights.map(item => { const Icon = highlightIcons[item.icon]; return <li key={item.title}><Icon size={22} strokeWidth={1.5} aria-hidden="true" /><div><strong>{item.title}</strong><span>{item.text}</span></div></li>; })}</ul>
      </div>
    </div>
    <section className="more-homes" aria-labelledby="more-homes-heading"><h2 id="more-homes-heading">Explore other homes</h2><div className="more-homes-grid">{others.map(item => <Link key={item.slug} href={`/prefab-homes/${item.slug}`} className="more-home-card"><img src={item.image} alt="" width="600" height="400" loading="lazy" /><div><span className="detail-kicker">{item.category}</span><h3>{item.name}</h3><span className="more-home-link">View home <ArrowRight size={15} /></span></div></Link>)}</div></section>
  </div>;
}
