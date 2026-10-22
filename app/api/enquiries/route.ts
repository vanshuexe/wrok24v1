import { enquiryInterests } from "@/data/home-models";
import { NextResponse } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    // Next.js may use its bind address in request.url; the Host header retains
    // the public address that the visitor actually opened.
    if (origin && new URL(origin).host !== request.headers.get("host")) return NextResponse.json({ error: "Please submit the form from this website." }, { status: 403 });
    if (Number(request.headers.get("content-length") || 0) > 16000) return NextResponse.json({ error: "Your message is too long." }, { status: 413 });
    const raw = await request.text();
    if (raw.length > 16000) return NextResponse.json({ error: "Your message is too long." }, { status: 413 });
    let input;
    try { input = JSON.parse(raw); } catch { return NextResponse.json({ error: "Please check the form and try again." }, { status: 400 }); }
    if (!input || typeof input !== "object" || Array.isArray(input)) return NextResponse.json({ error: "Invalid form submission." }, { status: 400 });
    if (input.website) return NextResponse.json({ ok: true });
    const clean = (key: string, limit: number) => typeof input[key] === "string" ? input[key].trim().slice(0, limit) : "";
    const enquiry = { id: randomUUID(), createdAt: new Date().toISOString(), name: clean("name", 100), phone: clean("phone", 20), email: clean("email", 254), interest: clean("interest", 100), location: clean("location", 150), message: clean("message", 3000) };
    const interests = enquiryInterests;
    if (enquiry.name.length < 2 || !/^[+0-9 ()-]{8,20}$/.test(enquiry.phone) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email) || !interests.includes(enquiry.interest) || enquiry.location.length < 2 || input.consent !== "on") {
      return NextResponse.json({ error: "Please complete all required fields with valid details and agree to be contacted." }, { status: 400 });
    }
    if (process.env.ENQUIRY_WEBHOOK_URL) {
      const result = await fetch(process.env.ENQUIRY_WEBHOOK_URL, { method: "POST", headers: { "Content-Type": "application/json", ...(process.env.ENQUIRY_WEBHOOK_TOKEN ? { Authorization: `Bearer ${process.env.ENQUIRY_WEBHOOK_TOKEN}` } : {}) }, body: JSON.stringify(enquiry), signal: AbortSignal.timeout(10000) });
      if (!result.ok) throw new Error("Enquiry delivery failed");
    } else {
      if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) return NextResponse.json({ error: "Enquiries are temporarily unavailable. Please try again later." }, { status: 503 });
      const directory = process.env.ENQUIRY_STORAGE_DIR || path.join(process.cwd(), "data");
      await mkdir(directory, { recursive: true });
      await appendFile(path.join(directory, "enquiries.jsonl"), JSON.stringify(enquiry) + "\n", { encoding: "utf8", mode: 0o600 });
    }
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "We couldn't save your enquiry. Please try again in a moment." }, { status: 500 });
  }
}
