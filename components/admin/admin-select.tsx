"use client";

import { useEffect, useId, useRef, useState } from "react";

export type AdminSelectOption = { value: string; label: string };

type AdminSelectProps = {
  name: string;
  label?: string;
  options: AdminSelectOption[];
  defaultValue?: string;
  placeholder?: string;
};

export function AdminSelect({ name, label, options, defaultValue, placeholder }: AdminSelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue ?? options[0]?.value ?? "");
  const selected = options.find(option => option.value === value);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function selectOption(nextValue: string) {
    setValue(nextValue);
    setOpen(false);
    triggerRef.current?.focus();
  }

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const currentIndex = Math.max(0, options.findIndex(option => option.value === value));
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const offset = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex = (currentIndex + offset + options.length) % options.length;
      if (!open) setOpen(true);
      selectOption(options[nextIndex]?.value ?? value);
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setOpen(current => !current);
    }
  }

  return <div className="admin-field admin-select-field" ref={rootRef}>
    {label && <label className="admin-field-label" htmlFor={id}>{label}</label>}
    <input type="hidden" name={name} value={value}/>
    <div className="admin-select" data-open={open || undefined}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="admin-select-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${id}-options`}
        onClick={() => setOpen(current => !current)}
        onKeyDown={handleTriggerKeyDown}
      >
        <span>{selected?.label ?? placeholder ?? "Choose an option"}</span>
        <span className="admin-select-chevron" aria-hidden="true">⌄</span>
      </button>
      {open && <div className="admin-select-menu" id={`${id}-options`} role="listbox" aria-labelledby={id}>
        {options.map(option => <button
          key={option.value}
          type="button"
          role="option"
          aria-selected={option.value === value}
          className="admin-select-option"
          onClick={() => selectOption(option.value)}
        >
          <span>{option.label}</span>
          {option.value === value && <span className="admin-select-check" aria-hidden="true">✓</span>}
        </button>)}
      </div>}
    </div>
  </div>;
}
