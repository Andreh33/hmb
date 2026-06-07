"use client";

import { useEffect } from "react";

/**
 * Tiny event bus that coordinates the "fly to cart" animation between the menu
 * cards (emitters) and the OrderBar (which owns the flight layer + cart anchor).
 * SSR-safe: only touches `window` inside browser-only handlers.
 */

export interface FlyPayload {
  /** Bounding rect of the source element (e.g. the card image). */
  from: DOMRect;
  /** Optional image URL to render as the flying ghost; falls back to a dot. */
  image?: string;
  /** Accent color for the ghost trail. */
  color?: string;
}

const FLY_EVENT = "sear:fly-to-cart";
const CONFETTI_EVENT = "sear:confetti";

export function emitFlyToCart(payload: FlyPayload): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<FlyPayload>(FLY_EVENT, { detail: payload }));
}

export function emitConfetti(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONFETTI_EVENT));
}

export function useFlyToCart(handler: (payload: FlyPayload) => void): void {
  useEffect(() => {
    const fn = (e: Event) => {
      const ce = e as CustomEvent<FlyPayload>;
      if (ce.detail) handler(ce.detail);
    };
    window.addEventListener(FLY_EVENT, fn);
    return () => window.removeEventListener(FLY_EVENT, fn);
  }, [handler]);
}

export function useConfetti(handler: () => void): void {
  useEffect(() => {
    const fn = () => handler();
    window.addEventListener(CONFETTI_EVENT, fn);
    return () => window.removeEventListener(CONFETTI_EVENT, fn);
  }, [handler]);
}
