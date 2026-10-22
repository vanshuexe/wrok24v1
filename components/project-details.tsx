import { Ruler, Factory, Truck, House, Clock3, ShieldCheck, Sun, Wallet, Shapes, MapPin, ClipboardList, Trees, Building2, Layers3, BriefcaseBusiness } from "lucide-react";
import details from "@/data/site-details.json";

const icons = { Ruler, Factory, Truck, House, Clock3, ShieldCheck, Sun, Wallet, Shapes, MapPin, ClipboardList, Trees, Building2, Layers3, BriefcaseBusiness };
export function DetailIcon({ name, size = 26 }: { name: string; size?: number }) {
  const Icon = icons[name as keyof typeof icons] || Ruler;
  return <Icon size={size} strokeWidth={1.5} aria-hidden="true" focusable="false" />;
}

export function ProcessDetails() {
  return <div className="project-details process-details content-width"><div className="details-intro"><span className="detail-kicker">HOW IT COMES TOGETHER</span><h2>From your idea to your site.</h2><p>One connected process, with the scope and site requirements confirmed along the way.</p></div><div className="process-steps">{details.process.map(step => <article key={step.number}><div className="process-step-top"><DetailIcon name={step.icon} /><span>{step.number}</span></div><h3>{step.title}</h3><p>{step.text}</p></article>)}</div></div>;
}
export function SpaceSpecifications() {
  return <div className="project-details specifications-details content-width"><div className="details-intro"><span className="detail-kicker">PLAN YOUR SPACE</span><h2>A useful place to start.</h2><p>Available configurations and final specifications are confirmed with our team.</p></div><div className="specifications-grid">{details.specifications.map(item => <article className="specification-card" key={item.title}><div className="specification-icon"><DetailIcon name={item.icon} /></div><h3>{item.title}</h3><strong>{item.value}</strong><p>{item.text}</p></article>)}</div><p className="specification-footnote">Available layouts, features, inclusions, transportation, and installation requirements are confirmed in your quotation.</p></div>;
}
export function ProjectChecklist() {
  return <div className="project-details checklist-details content-width"><div className="details-intro"><span className="detail-kicker">BEFORE WE TALK</span><h2>A few details help us guide you.</h2></div><div className="checklist-grid">{details.checklist.map(item => <article key={item.title}><DetailIcon name={item.icon} /><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></div>;
}
export function AudienceDetails() {
  return <div className="project-details audience-details content-width"><div className="details-intro"><span className="detail-kicker">YOUR PROJECT, YOUR PURPOSE</span><h2>Tell us how you’ll use the space.</h2><p>Different projects have different requirements. We’ll help you explore suitable configurations.</p></div><div className="audience-details-grid">{details.audienceDetails.map(item => <article key={item.title}><DetailIcon name={item.icon} /><div><h3>{item.title}</h3><p>{item.text}</p></div></article>)}</div></div>;
}
