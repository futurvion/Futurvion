"use client";

import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
import { services } from "@/data/services";
import { site } from "@/config/site";
import { siteStyles } from "@/config/styles";

export function ContactForm({ initialService = "" }: { initialService?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error" | "unavailable">("idle");
  const [message, setMessage] = useState("");
  const [selectedService, setSelectedService] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    setState("sending");
    setMessage("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (response.ok) {
        setState("success");
        form.reset();
        setSelectedService("");
        window.dispatchEvent(new Event("futurvion:conversion"));
        return;
      }
      setState(response.status === 503 ? "unavailable" : "error");
      setMessage(result.message || "Please review your details and try again.");
    } catch {
      setState("unavailable");
      setMessage("The form is unavailable right now. Please contact us by email.");
    }
  }

  return <form className="contact-form" onSubmit={submit}>
    <div className="form-row"><label>Full name <span>*</span><input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Your name" /></label><label>Work email <span>*</span><input name="email" type="email" spellCheck={false} autoComplete="email" required placeholder="you@company.com" /></label></div>
    <div className="form-row"><label>Company <small>Optional</small><input name="company" autoComplete="organization" maxLength={120} placeholder="Company name" /></label><label>Phone <small>Optional</small><input name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="Phone number" /></label></div>
    <div className="form-row"><label>I&apos;m interested in <span>*</span><select name="service" required value={selectedService ?? initialService} onChange={event => setSelectedService(event.target.value)}><option value="" disabled>Select a service</option>{services.map(service => <option key={service.slug} value={service.slug}>{service.title}</option>)}<option value="not-sure">Not sure yet</option></select></label><label>Estimated budget <small>Optional</small><select name="budget" defaultValue=""><option value="">Prefer to discuss</option><option value="under-5k">Under $5,000</option><option value="5k-15k">$5,000–$15,000</option><option value="15k-50k">$15,000–$50,000</option><option value="50k-plus">$50,000+</option></select></label></div>
    <label>Tell us about your project <span>*</span><textarea name="description" required minLength={20} maxLength={5000} rows={5} placeholder="What are you building or trying to improve?" /></label>
    <label className="consent-line"><input name="consent" type="checkbox" value="yes" required /><span>I agree to be contacted about my enquiry and have read the <a href="/privacy-policy">privacy policy</a>.</span></label>
    <div className="honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="form-bottom"><button className={`${siteStyles.button} button button-primary ${siteStyles.buttonPrimary}`} type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send your enquiry"}<ArrowUpRight size={18}/></button><span>We&apos;ll use your details only to respond to this enquiry.</span></div>
    {state === "success" && <p role="status" className="form-status success">Your enquiry was received. Thank you for reaching out.</p>}
    {(state === "error" || state === "unavailable") && <p role="alert" className="form-status error">{message} {state === "unavailable" && <>You can <a href={`mailto:${site.email}`}>open your email app</a> instead.</>}</p>}
  </form>;
}
