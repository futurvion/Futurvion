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

type ContactField = "name" | "email" | "service" | "description" | "consent";
type ContactErrors = Partial<Record<ContactField, string>>;
type ContactTouched = Partial<Record<ContactField, boolean>>;

const contactFields: ContactField[] = ["name", "email", "service", "description", "consent"];

function getFieldError(field: ContactField, form: HTMLFormElement): string | undefined {
  if (field === "name") {
    const name = form.elements.namedItem("name");
    if (!(name instanceof HTMLInputElement) || !name.value.trim()) return "Enter your full name.";
    if (name.value.trim().length < 2) return "Please enter at least 2 characters.";
  }

  if (field === "email") {
    const email = form.elements.namedItem("email");
    if (!(email instanceof HTMLInputElement) || !email.value.trim()) return "Enter your work email.";
    if (email.validity.typeMismatch) return "Enter a valid email address.";
  }

  if (field === "service") {
    const service = form.elements.namedItem("service");
    if (!(service instanceof HTMLInputElement) || !service.value) return "Choose a service to continue.";
  }

  if (field === "description") {
    const description = form.elements.namedItem("description");
    if (!(description instanceof HTMLTextAreaElement) || !description.value.trim()) {
      return "Tell us about your project.";
    }
    if (description.value.trim().length < 20) return "Please add at least 20 characters.";
  }

  if (field === "consent") {
    const consent = form.elements.namedItem("consent");
    if (!(consent instanceof HTMLInputElement) || !consent.checked) {
      return "Please agree before sending your enquiry.";
    }
  }
}

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
  onBlur,
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
  onBlur?: (form: HTMLFormElement) => void;
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
        onBlur={event => {
          const form = event.currentTarget.closest("form");
          if (form) onBlur?.(form);
        }}
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
  const [errors, setErrors] = useState<ContactErrors>({});
  const [touched, setTouched] = useState<ContactTouched>({});
  const serviceButtonRef = useRef<HTMLButtonElement>(null);

  function validateField(field: ContactField, form: HTMLFormElement | null) {
    if (!form) return;
    setErrors(current => ({ ...current, [field]: getFieldError(field, form) }));
  }

  function handleFieldBlur(field: ContactField, form: HTMLFormElement | null) {
    if (!form) return;
    setTouched(current => ({ ...current, [field]: true }));
    validateField(field, form);
  }

  function handleFieldChange(field: ContactField, form: HTMLFormElement | null) {
    if (touched[field]) validateField(field, form);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors: ContactErrors = {};
    for (const field of contactFields) {
      const error = getFieldError(field, form);
      if (error) nextErrors[field] = error;
    }
    if (Object.keys(nextErrors).length > 0) {
      const firstInvalidField = contactFields.find(field => nextErrors[field]);
      if (firstInvalidField) {
        setTouched(current => ({ ...current, [firstInvalidField]: true }));
        setErrors(current => ({ ...current, [firstInvalidField]: nextErrors[firstInvalidField] }));
      }
      if (firstInvalidField === "service") serviceButtonRef.current?.focus();
      else if (firstInvalidField) {
        form.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`)?.focus();
      }
      return;
    }
    setErrors({});

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
        setErrors({});
        setTouched({});
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

  return <form className="contact-form" data-clarity-mask="True" noValidate onSubmit={submit}>
    <div className="form-row">
      <div className="contact-field">
        <label htmlFor="contact-name">Full name <span>*</span></label>
        <input id="contact-name" name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="Your name" aria-invalid={Boolean(errors.name) || undefined} aria-describedby={errors.name ? "contact-name-error" : undefined} onBlur={event => handleFieldBlur("name", event.currentTarget.form)} onChange={event => handleFieldChange("name", event.currentTarget.form)} />
        {errors.name && <span className="field-error" id="contact-name-error" role="alert">{errors.name}</span>}
      </div>
      <div className="contact-field">
        <label htmlFor="contact-email">Work email <span>*</span></label>
        <input id="contact-email" name="email" type="email" spellCheck={false} autoComplete="email" required maxLength={254} placeholder="you@company.com" aria-invalid={Boolean(errors.email) || undefined} aria-describedby={errors.email ? "contact-email-error" : undefined} onBlur={event => handleFieldBlur("email", event.currentTarget.form)} onChange={event => handleFieldChange("email", event.currentTarget.form)} />
        {errors.email && <span className="field-error" id="contact-email-error" role="alert">{errors.email}</span>}
      </div>
    </div>
    <div className="form-row"><label>Company <small>Optional</small><input name="company" autoComplete="organization" maxLength={120} placeholder="Company name" /></label><label>Phone <small>Optional</small><input name="phone" type="tel" autoComplete="tel" maxLength={30} placeholder="Phone number" /></label></div>
    <div className="form-row">
      <div className="custom-select-field">
        <span className="custom-select-label" id="contact-service-label">I&apos;m interested in <span>*</span></span>
        <CustomSelect
          buttonRef={serviceButtonRef}
          errorId="contact-service-error"
          id="contact-service"
          invalid={Boolean(errors.service)}
          labelId="contact-service-label"
          name="service"
          onBlur={form => handleFieldBlur("service", form)}
          onChange={value => {
            setService(value);
            setErrors(current => ({ ...current, service: undefined }));
          }}
          options={serviceOptions}
          placeholder="Select a service"
          required
          value={service}
        />
        {errors.service && <span className="field-error" id="contact-service-error" role="alert">{errors.service}</span>}
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
    <div className="contact-field">
      <label htmlFor="contact-description">Tell us about your project <span>*</span></label>
      <textarea id="contact-description" name="description" required minLength={20} maxLength={5000} rows={5} placeholder="What are you building or trying to improve?" aria-invalid={Boolean(errors.description) || undefined} aria-describedby={errors.description ? "contact-description-error" : undefined} onBlur={event => handleFieldBlur("description", event.currentTarget.form)} onChange={event => handleFieldChange("description", event.currentTarget.form)} />
      {errors.description && <span className="field-error" id="contact-description-error" role="alert">{errors.description}</span>}
    </div>
    <div className="contact-field">
      <label className="consent-line" htmlFor="contact-consent"><input id="contact-consent" name="consent" type="checkbox" value="yes" required aria-invalid={Boolean(errors.consent) || undefined} aria-describedby={errors.consent ? "contact-consent-error" : undefined} onBlur={event => handleFieldBlur("consent", event.currentTarget.form)} onChange={event => handleFieldChange("consent", event.currentTarget.form)} /><span>I agree to be contacted about my enquiry and have read the <a href="/privacy-policy">privacy policy</a>.</span></label>
      {errors.consent && <span className="field-error" id="contact-consent-error" role="alert">{errors.consent}</span>}
    </div>
    <div className="honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <div className="form-bottom"><button className={`${siteStyles.button} button button-primary ${siteStyles.buttonPrimary}`} type="submit" disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send your enquiry"}<ArrowUpRight size={18}/></button><span>We&apos;ll use your details only to respond to this enquiry.</span></div>
    {state === "success" && <p role="status" className="form-status success">Your enquiry was received. Thank you for reaching out.</p>}
    {(state === "error" || state === "unavailable") && <p role="alert" className="form-status error">{message} {state === "unavailable" && <>You can <a href={`mailto:${site.email}`}>open your email app</a> instead.</>}</p>}
  </form>;
}
