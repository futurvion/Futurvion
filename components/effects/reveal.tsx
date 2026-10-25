"use client";

import { useEffect } from "react";

// Animate one content unit at a time, never both a panel and its children.
const blockSelector = [
  ".service-card", ".solution-tiles > a", ".process-step", ".work-preview-item",
  ".faq-list details", ".capability-card", ".sector-card", ".contact-form",
  ".work-card", ".studio-project", ".case-grid > div", ".footer-top > div",
  ".capability-index > a", ".studio-process-list > li", ".goal-result",
  ".job-card:not(.job-card-skeleton)",
].join(", ");
const textSelector = "main :is(h2, h3, p, .text-link, .button, .filter-row), .footer-bottom, .footer-wordmark";
const targetSelector = `${blockSelector}, ${textSelector}`;
const animatedElsewhere = ".hero, .inner-hero, .story, .jobs-hero, .admin-workspace, .admin-login-page";

function entranceFor(element: HTMLElement) {
  if (element.matches(".studio-project, .work-card")) return "artwork";
  if (element.matches(".capability-index > a, .studio-process-list > li")) return "row";
  if (element.matches(".faq-list details")) return "disclosure";
  if (element.matches(".goal-result, .contact-form")) return "panel";
  if (element.matches("h2, .footer-wordmark")) return "heading";
  if (element.matches(blockSelector)) return "card";
  return "copy";
}

/** One-time side entrances; static HTML and reduced-motion content remain visible. */
export function ScrollReveal() {
  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const main = document.getElementById("main-content");
    if (!main) return;

    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const element = entry.target as HTMLElement;
        element.classList.remove("scroll-reveal-pending");
        element.classList.add("scroll-reveal-visible");
        element.dataset.revealState = "shown";
        observer.unobserve(element);
      }
    }, { threshold: 0.08, rootMargin: "0px 0px -5% 0px" });

    function prepare(element: HTMLElement) {
      if (element.closest(animatedElsewhere)) return;
      if (!element.matches(blockSelector) && element.closest(blockSelector)) return;
      if (element.dataset.revealState === "shown" || motionPreference.matches) return;
      if (element.dataset.revealState !== "pending") {
        const bounds = element.getBoundingClientRect();
        if (bounds.bottom <= 0) { element.dataset.revealState = "shown"; return; }
        const fromRight = bounds.left + bounds.width / 2 > window.innerWidth / 2;
        const distance = fromRight ? window.innerWidth - bounds.left + 40 : -bounds.right - 40;
        element.style.setProperty("--reveal-x", `${distance}px`);
        element.dataset.revealSide = fromRight ? "right" : "left";
        element.dataset.revealState = "pending";
        element.dataset.reveal = entranceFor(element);
        element.classList.add("scroll-reveal-pending");
        const siblings = Array.from(element.parentElement?.children ?? []).filter(child => child.matches(targetSelector));
        const position = Math.max(0, siblings.indexOf(element));
        element.style.setProperty("--reveal-delay", `${Math.min(position, 4) * 70}ms`);
      }
      observer.observe(element);
    }

    function scan(root: ParentNode) {
      if (root instanceof HTMLElement && root.matches(targetSelector)) prepare(root);
      root.querySelectorAll<HTMLElement>(targetSelector).forEach(prepare);
    }
    scan(document);
    const changes = new MutationObserver(records => {
      for (const record of records) {
        for (const node of record.addedNodes) if (node instanceof HTMLElement) scan(node);
        for (const node of record.removedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          observer.unobserve(node);
          node.querySelectorAll<HTMLElement>(".scroll-reveal-pending").forEach(element => observer.unobserve(element));
        }
      }
    });
    changes.observe(main, { childList: true, subtree: true });

    const onMotionChange = () => {
      if (!motionPreference.matches) { scan(document); return; }
      document.querySelectorAll<HTMLElement>(".scroll-reveal-pending, .scroll-reveal-visible").forEach(element => {
        element.classList.remove("scroll-reveal-pending", "scroll-reveal-visible");
        element.dataset.revealState = "shown";
        observer.unobserve(element);
      });
    };
    // A keyboard user should never have to follow an arriving control.
    const onFocus = (event: FocusEvent) => {
      if (!(event.target instanceof Element)) return;
      const element = event.target.closest<HTMLElement>("[data-reveal-state]");
      if (!element) return;
      element.classList.remove("scroll-reveal-pending", "scroll-reveal-visible");
      element.dataset.revealState = "shown";
      observer.unobserve(element);
    };
    motionPreference.addEventListener("change", onMotionChange);
    document.addEventListener("focusin", onFocus);
    return () => {
      observer.disconnect();
      changes.disconnect();
      motionPreference.removeEventListener("change", onMotionChange);
      document.removeEventListener("focusin", onFocus);
    };
  }, []);
  return null;
}
