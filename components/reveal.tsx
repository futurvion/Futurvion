"use client";

import { useEffect } from "react";

const cardSelector = [
  ".service-card",
  ".solution-tiles > a",
  ".process-step",
  ".work-preview-item",
  ".faq-list details",
  ".capability-card",
  ".sector-card",
  ".contact-form",
  ".work-card",
  ".case-grid > div",
  ".footer-top > div",
].join(", ");

const textSelector = "main :is(.eyebrow, h2, h3, p, .text-link, .button, .filter-row), .footer-bottom";
const targetSelector = `${cardSelector}, ${textSelector}`;
const animatedElsewhere = ".hero, .inner-hero, .story";

/** Reveals page content as it enters view, without hiding it before JavaScript runs. */
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
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });

    function prepare(element: HTMLElement) {
      if (element.closest(animatedElsewhere)) return;
      const card = element.matches(cardSelector);
      if (!card && element.closest(cardSelector)) return;
      if (element.dataset.revealState === "shown" || motionPreference.matches) return;

      const bounds = element.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < window.innerHeight * 0.94) {
        element.classList.remove("scroll-reveal-pending");
        element.dataset.revealState = "shown";
        observer.unobserve(element);
        return;
      }

      if (element.dataset.revealState !== "pending") {
        element.dataset.revealState = "pending";
        element.classList.add("scroll-reveal-pending");
        if (card) {
          element.classList.add("scroll-reveal-card");
          const siblings = Array.from(element.parentElement?.children ?? []).filter(child => child.matches(cardSelector));
          element.style.setProperty("--reveal-delay", `${(siblings.indexOf(element) % 3) * 75}ms`);
        }
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
        for (const node of record.addedNodes) {
          if (node instanceof HTMLElement) scan(node);
        }
        for (const node of record.removedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          observer.unobserve(node);
          node.querySelectorAll<HTMLElement>(".scroll-reveal-pending").forEach(element => observer.unobserve(element));
        }
      }
    });
    changes.observe(main, { childList: true, subtree: true });

    const onMotionChange = () => {
      if (!motionPreference.matches) {
        scan(document);
        return;
      }
      document.querySelectorAll<HTMLElement>(".scroll-reveal-pending").forEach(element => {
        element.classList.remove("scroll-reveal-pending");
        element.dataset.revealState = "shown";
        observer.unobserve(element);
      });
    };
    motionPreference.addEventListener("change", onMotionChange);

    return () => {
      observer.disconnect();
      changes.disconnect();
      motionPreference.removeEventListener("change", onMotionChange);
    };
  }, []);

  return null;
}
