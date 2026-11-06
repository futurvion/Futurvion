"use client";

import Image from "next/image";
import Link from "next/link";
import { AlertCircle, Check, Copy, Download, QrCode, RefreshCcw, Sparkles } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useMemo, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics";
import {
  buildQrPayload,
  defaultQrCustomization,
  defaultQrFormValues,
  qrTypeOptions,
  type QRType,
  type QrCustomization,
  type QrFormValues,
} from "@/lib/tools/qr-generator";

const sectionLabels: Record<QRType, string> = {
  url: "Website URL",
  text: "Text content",
  email: "Email details",
  phone: "Phone number",
  sms: "SMS details",
  wifi: "Wi‑Fi details",
  vcard: "Contact details",
};

export function QRGenerator() {
  const [activeType, setActiveType] = useState<QRType>("url");
  const [values, setValues] = useState<QrFormValues>(defaultQrFormValues);
  const [customization, setCustomization] = useState<QrCustomization>(defaultQrCustomization);
  const [qrPreview, setQrPreview] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [downloadMessage, setDownloadMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [regenerateToken, setRegenerateToken] = useState(0);
  const lastTrackedPayload = useRef<string>("");

  const validation = useMemo(() => buildQrPayload(activeType, values), [activeType, values]);

  useEffect(() => {
    trackEvent("qr_generator_open", { tool_id: "qr-generator" });
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!validation.valid || !validation.payload) {
      lastTrackedPayload.current = "";
      return () => {
        cancelled = true;
      };
    }

    const generate = async () => {
      setIsGenerating(true);

      try {
        const imageDataUrl = await QRCode.toDataURL(validation.payload, {
          margin: customization.margin,
          width: customization.size,
          errorCorrectionLevel: customization.errorCorrection,
          color: {
            dark: customization.foreground,
            light: customization.background,
          },
        });

        if (!cancelled) {
          setQrPreview(imageDataUrl);
          setIsGenerating(false);
          if (lastTrackedPayload.current !== validation.payload) {
            trackEvent("qr_generated", { qr_type: activeType });
            lastTrackedPayload.current = validation.payload;
          }
        }
      } catch {
        if (!cancelled) {
          setQrPreview("");
          setIsGenerating(false);
        }
      }
    };

    void generate();

    return () => {
      cancelled = true;
    };
  }, [activeType, customization, regenerateToken, validation]);

  const updateValue = (field: keyof QrFormValues, value: string | boolean) => {
    setCopied(false);
    setDownloadMessage("");
    setValues((current) => {
      const nextValues = { ...current, [field]: value };
      if (!buildQrPayload(activeType, nextValues).valid) {
        setQrPreview("");
      }
      return nextValues;
    });
  };

  const generateDownload = async (format: "png" | "svg") => {
    if (!validation.valid || !validation.payload) {
      setDownloadMessage("Generate a valid QR code before downloading.");
      return;
    }

    if (format === "png") {
      const link = document.createElement("a");
      link.href = qrPreview || "";
      link.download = "futurvion-qr-code.png";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setDownloadMessage("PNG download started.");
      trackEvent("qr_downloaded", { download_format: "png", qr_type: activeType });
      return;
    }

    try {
      const svgMarkup = await QRCode.toString(validation.payload, {
        type: "svg",
        margin: customization.margin,
        width: customization.size,
        errorCorrectionLevel: customization.errorCorrection,
        color: {
          dark: customization.foreground,
          light: customization.background,
        },
      });
      const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const download = document.createElement("a");
      download.href = url;
      download.download = "futurvion-qr-code.svg";
      document.body.appendChild(download);
      download.click();
      download.remove();
      URL.revokeObjectURL(url);
      setDownloadMessage("SVG download started.");
      trackEvent("qr_downloaded", { download_format: "svg", qr_type: activeType });
    } catch {
      setDownloadMessage("Could not generate the SVG file. Please try again.");
    }
  };

  const handleCopyPayload = async () => {
    if (!validation.valid || !validation.payload) {
      setDownloadMessage("Generate a valid QR first.");
      return;
    }

    try {
      await navigator.clipboard.writeText(validation.payload);
      setCopied(true);
      trackEvent("qr_payload_copied", { qr_type: activeType });
    } catch {
      setDownloadMessage("Clipboard access was blocked. Copy the payload manually.");
    }
  };

  const resetAll = () => {
    setValues(defaultQrFormValues);
    setQrPreview("");
    setCustomization(defaultQrCustomization);
    setCopied(false);
    setDownloadMessage("");
    setRegenerateToken((current) => current + 1);
    lastTrackedPayload.current = "";
  };

  return (
    <div className="qr-generator-page">
      <div className="page-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/tools">Tools</Link>
        <span aria-hidden="true">/</span>
        <span>QR Code Generator</span>
      </div>

      <header className="qr-header">
        <span className="eyebrow">Free QR Code Generator</span>
        <h1>Free QR Code Generator</h1>
        <p>
          Create beautiful, customizable QR codes in seconds. Generate QR codes for
          websites, text, Wi‑Fi, contact information, and more.
        </p>
      </header>

      <div className="qr-generator-shell">
        <section className="qr-form-panel" aria-labelledby="qr-generator-form-title">
          <div className="qr-form-header">
            <h2 id="qr-generator-form-title">Generate a QR code</h2>
            <button type="button" className="inline-button" onClick={resetAll}>
              <RefreshCcw size={16} aria-hidden="true" /> Reset all
            </button>
          </div>

          <div className="segment-control" role="tablist" aria-label="QR type selector">
            {qrTypeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={activeType === option.value}
                className={activeType === option.value ? "segment active" : "segment"}
                onClick={() => {
                  setCopied(false);
                  setDownloadMessage("");
                  setActiveType(option.value);
                  trackEvent("qr_type_selected", { qr_type: option.value });
                }}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="qr-form-section">
            <h3>{sectionLabels[activeType]}</h3>

            {activeType === "url" && (
              <label className="field">
                <span>Website URL</span>
                <input
                  type="url"
                  value={values.url}
                  onChange={(event) => updateValue("url", event.target.value)}
                  placeholder="https://example.com"
                />
              </label>
            )}

            {activeType === "text" && (
              <label className="field">
                <span>Text content</span>
                <textarea
                  value={values.text}
                  onChange={(event) => updateValue("text", event.target.value)}
                  placeholder="Type your message here"
                  rows={5}
                />
              </label>
            )}

            {activeType === "email" && (
              <>
                <label className="field">
                  <span>Email address</span>
                  <input
                    type="email"
                    value={values.email}
                    onChange={(event) => updateValue("email", event.target.value)}
                    placeholder="hello@example.com"
                  />
                </label>
                <label className="field">
                  <span>Subject</span>
                  <input
                    type="text"
                    value={values.subject}
                    onChange={(event) => updateValue("subject", event.target.value)}
                    placeholder="Optional"
                  />
                </label>
                <label className="field">
                  <span>Message</span>
                  <textarea
                    value={values.message}
                    onChange={(event) => updateValue("message", event.target.value)}
                    placeholder="Optional"
                    rows={4}
                  />
                </label>
              </>
            )}

            {activeType === "phone" && (
              <label className="field">
                <span>Phone number</span>
                <input
                  type="tel"
                  value={values.phone}
                  onChange={(event) => updateValue("phone", event.target.value)}
                  placeholder="+1 415 555 0123"
                />
              </label>
            )}

            {activeType === "sms" && (
              <>
                <label className="field">
                  <span>Phone number</span>
                  <input
                    type="tel"
                    value={values.smsPhone}
                    onChange={(event) => updateValue("smsPhone", event.target.value)}
                    placeholder="+1 415 555 0123"
                  />
                </label>
                <label className="field">
                  <span>Message</span>
                  <textarea
                    value={values.smsMessage}
                    onChange={(event) => updateValue("smsMessage", event.target.value)}
                    placeholder="Optional"
                    rows={4}
                  />
                </label>
              </>
            )}

            {activeType === "wifi" && (
              <>
                <label className="field">
                  <span>Network name (SSID)</span>
                  <input
                    type="text"
                    value={values.wifiSsid}
                    onChange={(event) => updateValue("wifiSsid", event.target.value)}
                    placeholder="Home Wi‑Fi"
                  />
                </label>
                <label className="field">
                  <span>Password</span>
                  <input
                    type="text"
                    value={values.wifiPassword}
                    onChange={(event) => updateValue("wifiPassword", event.target.value)}
                    placeholder="Optional when network is open"
                  />
                </label>
                <div className="multi-field-row">
                  <label className="field">
                    <span>Security type</span>
                    <select
                      value={values.wifiSecurity}
                      onChange={(event) =>
                        updateValue("wifiSecurity", event.target.value as QrFormValues["wifiSecurity"])
                      }
                    >
                      <option value="WPA">WPA / WPA2</option>
                      <option value="WEP">WEP</option>
                      <option value="None">None</option>
                    </select>
                  </label>
                  <label className="checkbox-row">
                    <input
                      type="checkbox"
                      checked={values.wifiHidden}
                      onChange={(event) => updateValue("wifiHidden", event.target.checked)}
                    />
                    <span>Hidden network</span>
                  </label>
                </div>
              </>
            )}

            {activeType === "vcard" && (
              <>
                <label className="field">
                  <span>Full name</span>
                  <input
                    type="text"
                    value={values.fullName}
                    onChange={(event) => updateValue("fullName", event.target.value)}
                    placeholder="Jane Smith"
                  />
                </label>
                <label className="field">
                  <span>Phone number</span>
                  <input
                    type="tel"
                    value={values.contactPhone}
                    onChange={(event) => updateValue("contactPhone", event.target.value)}
                    placeholder="+1 415 555 0123"
                  />
                </label>
                <label className="field">
                  <span>Email address</span>
                  <input
                    type="email"
                    value={values.contactEmail}
                    onChange={(event) => updateValue("contactEmail", event.target.value)}
                    placeholder="jane@example.com"
                  />
                </label>
                <div className="multi-field-row">
                  <label className="field">
                    <span>Organization</span>
                    <input
                      type="text"
                      value={values.organization}
                      onChange={(event) => updateValue("organization", event.target.value)}
                      placeholder="Optional"
                    />
                  </label>
                  <label className="field">
                    <span>Website</span>
                    <input
                      type="url"
                      value={values.website}
                      onChange={(event) => updateValue("website", event.target.value)}
                      placeholder="https://example.com"
                    />
                  </label>
                </div>
              </>
            )}

            {validation.error && (
              <p className="field-error" aria-live="polite">
                <AlertCircle size={16} aria-hidden="true" /> {validation.error}
              </p>
            )}
          </div>
        </section>

        <aside className="qr-preview-panel" aria-label="QR code preview and actions">
          <div className="qr-preview-box">
            {isGenerating ? (
              <div className="qr-placeholder generating">
                <Sparkles size={20} aria-hidden="true" />
                <span>Generating preview…</span>
              </div>
            ) : qrPreview ? (
              <Image
                src={qrPreview}
                alt="Generated QR code preview"
                className="qr-image"
                width={640}
                height={640}
                unoptimized
              />
            ) : (
              <div className="qr-placeholder">
                <QrCode size={34} aria-hidden="true" />
                <span>Enter valid details to preview your QR code.</span>
              </div>
            )}
          </div>

          <div className="qr-action-row">
            <button type="button" className="primary-button" onClick={() => generateDownload("png")}>
              <Download size={16} aria-hidden="true" /> PNG
            </button>
            <button type="button" className="secondary-button" onClick={() => generateDownload("svg")}>
              <Download size={16} aria-hidden="true" /> SVG
            </button>
          </div>

          <div className="qr-action-row compact">
            <button type="button" className="secondary-button" onClick={handleCopyPayload}>
              {copied ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
              {copied ? "Copied" : "Copy payload"}
            </button>
            <button type="button" className="secondary-button" onClick={() => setRegenerateToken((current) => current + 1)}>
              <RefreshCcw size={16} aria-hidden="true" /> Regenerate
            </button>
          </div>

          <div className="customization-panel">
            <div className="customization-heading">
              <h3>Customization</h3>
              <button
                type="button"
                className="inline-button"
                onClick={() => setCustomization(defaultQrCustomization)}
              >
                Reset
              </button>
            </div>

            <div className="color-row">
              <label className="color-control">
                <span>Foreground</span>
                <input
                  type="color"
                  value={customization.foreground}
                  onChange={(event) =>
                    setCustomization((current) => ({ ...current, foreground: event.target.value }))
                  }
                />
              </label>
              <label className="color-control">
                <span>Background</span>
                <input
                  type="color"
                  value={customization.background}
                  onChange={(event) =>
                    setCustomization((current) => ({ ...current, background: event.target.value }))
                  }
                />
              </label>
            </div>

            <div className="customization-grid">
              <label className="field small-field">
                <span>Size</span>
                <select
                  value={customization.size}
                  onChange={(event) =>
                    setCustomization((current) => ({
                      ...current,
                      size: Number(event.target.value) as QrCustomization["size"],
                    }))
                  }
                >
                  <option value={256}>256px</option>
                  <option value={512}>512px</option>
                  <option value={1024}>1024px</option>
                </select>
              </label>

              <label className="field small-field">
                <span>Error correction</span>
                <select
                  value={customization.errorCorrection}
                  onChange={(event) =>
                    setCustomization((current) => ({
                      ...current,
                      errorCorrection: event.target.value as QrCustomization["errorCorrection"],
                    }))
                  }
                >
                  <option value="L">Low (L)</option>
                  <option value="M">Medium (M)</option>
                  <option value="Q">Quartile (Q)</option>
                  <option value="H">High (H)</option>
                </select>
              </label>
            </div>

            <label className="field small-field">
              <span>Margin</span>
              <input
                type="range"
                min={0}
                max={10}
                value={customization.margin}
                onChange={(event) =>
                  setCustomization((current) => ({ ...current, margin: Number(event.target.value) }))
                }
              />
            </label>

            <p className="customization-note">
              Higher error correction improves recovery from damage but can make the QR code more complex.
            </p>
          </div>

          {downloadMessage && <p className="download-status">{downloadMessage}</p>}
        </aside>
      </div>
    </div>
  );
}
