export const homeModels = [
  { slug: "sc-20x10s", name: "SC 20x10S", category: "Studio", size: "20 × 10 ft", summary: "A compact, single-space layout for guest stays, home offices and quiet getaways.", image: "/images/studio-v2.jpg", images: ["/images/studio-v2.jpg", "/images/cottage.jpg", "/images/home.jpg", "/images/office.jpg"] },
  { slug: "sc-20x10-one", name: "SC 20x10 One", category: "1 BHK", size: "20 × 10 ft", summary: "One bedroom with a living area, planned for comfortable everyday living.", image: "/images/cottage.jpg", images: ["/images/cottage.jpg", "/images/home.jpg", "/images/studio-v2.jpg", "/images/office.jpg"] },
  { slug: "sc-20x40-two", name: "SC 20x40 Two", category: "2 BHK", size: "20 × 40 ft", summary: "Two bedrooms with generous living space, ideal for families and longer stays.", image: "/images/home.jpg", images: ["/images/home.jpg", "/images/cottage.jpg", "/images/studio-v2.jpg", "/images/office.jpg"] },
] as const;

export const homeHighlights = [
  { icon: "ShieldCheck", title: "Steel modular construction", text: "Purpose-built steel structure" },
  { icon: "Factory", title: "Factory-controlled build", text: "Quality managed off-site" },
  { icon: "Truck", title: "Delivery & installation", text: "Taken care of by our team" },
] as const;

export const enquiryInterests = ["Prefab homes", "Office cabins", "Site offices & security cabins", ...homeModels.map(model => model.name), "Help me choose"];
