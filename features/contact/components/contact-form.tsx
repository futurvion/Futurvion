"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { ArrowUpRight, Check, ChevronDown } from "lucide-react";
import { services } from "@/data/services";
import { site } from "@/config/site";
import { siteStyles } from "@/config/styles";

type SelectOption = {
  label: string;
  value: string;
};

function CustomSelect({
  id,
  labelId,
  name,
  value,
  options,
  placeholder,
  required = false,
  invalid = false,
  errorId,
  buttonRef,
  onChange,
}: {
  id: string;
  labelId: string;
  name: string;
  value: string;
  options: SelectOption[];
  placeholder: string;
  required?: boolean;
  invalid?: boolean;
  errorId?: string;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
  onChange: (value: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex(option => option.value === value)),
  );
  const selected = options.find(option => option.value === value);
  const activeOption = options[activeIndex];

  useEffect(() => {
    const closeOnOutsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  useEffect(() => {
    if (open) {
      rootRef.current
        ?.querySelector<HTMLElement>(`#${id}-option-${activeIndex}`)
        ?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex, id, open]);

  function openAt(index: number) {
    setActiveIndex(Math.max(0, Math.min(index, options.length - 1)));
    setOpen(true);
  }

  function choose(option: SelectOption) {
    onChange(option.value);
    setActiveIndex(options.indexOf(option));
    setOpen(false);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      const selectedIndex = options.findIndex(option => option.value === value);
      openAt(open ? activeIndex + 1 : Math.max(0, selectedIndex + 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      const selectedIndex = options.findIndex(option => option.value === value);
      openAt(open ? activeIndex - 1 : Math.max(0, selectedIndex - 1));
    } else if (event.key === "Home" && open) {
      event.preventDefault();
      setActiveIndex(0);
    } else if (event.key === "End" && open) {
      event.preventDefault();
      setActiveIndex(options.length - 1);
    } else if ((event.key === "Enter" || event.key === " ") && open) {
      event.preventDefault();
      if (activeOption) choose(activeOption);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  }

  return (
    <div className={`custom-select${open ? " is-open" : ""}`} ref={rootRef}>
      <input type="hidden" name={name} value={value} />
      <button
        ref={buttonRef}
        id={id}
        className="custom-select-trigger"
        type="button"
        role="combobox"
        aria-labelledby={labelId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-listbox`}
        aria-activedescendant={open && activeOption ? `${id}-option-${activeIndex}` : undefined}
        aria-required={required || undefined}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? errorId : undefined}
        onClick={() => open ? setOpen(false) : openAt(Math.max(0, options.findIndex(option => option.value === value)))}
        onKeyDown={handleKeyDown}
      >
        <span className={selected ? "" : "custom-select-placeholder"}>{selected?.label ?? placeholder}</span>
        <ChevronDown size={17} aria-hidden="true" />
      </button>
      <ul
        id={`${id}-listbox`}
        className="custom-select-listbox"
        role="listbox"
        aria-labelledby={labelId}
        hidden={!open}
      >
        {options.map((option, index) => (
          <li
            id={`${id}-option-${index}`}
            className={`custom-select-option${activeIndex === index ? " is-active" : ""}`}
            key={option.value}
            role="option"
            aria-selected={value === option.value}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseDown={event => event.preventDefault()}
            onClick={() => choose(option)}
          >
            <span>{option.label}</span>
            {value === option.value && <Check size={16} aria-hidden="true" />}
          </li>
        ))}
      </ul>
    </div>
  );
}

const serviceOptions = [
  ...services.map(service => ({ value: service.slug, label: service.title })),
  { value: "not-sure", label: "Not sure yet" },
];

const budgetOptions = [
  { value: "", label: "Prefer to discuss" },
  { value: "under-10k", label: "Under ₹10,000" },
  { value: "10k-25k", label: "₹10,000–₹25,000" },
  { value: "25k-50k", label: "₹25,000–₹50,000" },
  { value: "50k-plus", label: "₹50,000+" },
];

export function ContactForm({ initialService = "" }: { initialService?: string }) {
  const [state, setState] = useState<"idle" | "sending" | "success" | "error" | "unavailable">("idle");
  const [message, setMessage] = useState("");
  const [service, setService] = useState(initialService);
  const [budget, setBudget] = useState("");
  const [serviceError, setServiceError] = useState(false);
  const serviceButtonRef = useRef<HTMLButtonElement>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!service) {
      setServiceError(true);
      serviceButtonRef.current?.focus();
      return;
    }

    const data = Object.fromEntries(new FormData(form).entries());
    setState("sending");
    setMessage("");
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const result = await response.json();
      if (response.ok) {
        setState("success");
        form.reset();
        setService("");
        setBudget("");
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

  return <form className="contact-form" data-clarity-mask="True" onSubmit={submit}>
    <div className="form-row"><label>Full name <span>*</span><input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Your name" /></label><label>Work email <span>*</span><input name="email" type="email" spellCheck={false} autoComplete="email" required placeholder="you@company.com" /></label></div>
    <div className="form-row"><label>Company <small>Optional</small><input name="company" autoComplete="organization" maxLength={120} placeholder="Company name" /></label><label>Phone <small>Optional</small><input name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="Phone number" /></label></div>
    <div className="form-row">
      <div className="custom-select-field">
        <span className="custom-select-label" id="contact-service-label">I&apos;m interested in <span>*</span></span>
        <CustomSelect
          buttonRef={serviceButtonRef}
          errorId="contact-service-error"
          id="contact-service"
          invalid={serviceError}
          labelId="contact-service-label"
          name="service"
          onChange={value => { setService(value); setServiceError(false); }}
          options={serviceOptions}
          placeholder="Select a service"
          required
          value={service}
        />
        {serviceError && <span className="custom-select-error" id="contact-service-error" role="alert">Choose a service to continue.</span>}
      </div>
      <div className="custom-select-field">
        <span className="custom-select-label" id="contact-budget-label">Estimated budget <small>Optional</small></span>
        <CustomSelect
          id="contact-budget"
          labelId="contact-budget-label"
          name="budget"
          onChange={setBudget}
          options={budgetOptions}
          placeholder="Prefer to discuss"
          value={budget}
        />
      </div>
    </div>
    <label>Tell us about your project <span>*</span><textarea name="description" required minLength={20} maxLength={5000} rows={5} placeholder="What are you building or trying to improve?" /></label>
    <label className="consent-line"><input name="consent" type="checkbox" value="yes" required /><span>I agree to be contacted about my enquiry and have read the <a href="/privacy-policy">privacy policy</a>.</span></label>
    <div className="honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="form-bottom"><button className={`${siteStyles.button} button button-primary ${siteStyles.buttonPrimary}`} type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send your enquiry"}<ArrowUpRight size={18}/></button><span>We&apos;ll use your details only to respond to this enquiry.</span></div>
    {state === "success" && <p role="status" className="form-status success">Your enquiry was received. Thank you for reaching out.</p>}
    {(state === "error" || state === "unavailable") && <p role="alert" className="form-status error">{message} {state === "unavailable" && <>You can <a href={`mailto:${site.email}`}>open your email app</a> instead.</>}</p>}
  </form>;
}
