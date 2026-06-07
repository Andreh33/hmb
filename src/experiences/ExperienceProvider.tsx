"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_EXPERIENCE,
  EXPERIENCES,
  type ExperienceId,
  type ExperienceMeta,
} from "./registry";

interface ExperienceContextValue {
  id: ExperienceId;
  meta: ExperienceMeta;
  setId: (next: ExperienceId) => void;
  /** True briefly while the cinematic transition between experiences plays. */
  transitioning: boolean;
}

const ExperienceContext = createContext<ExperienceContextValue | null>(null);

/** Writes every experience color token as a CSS variable on :root. */
export function applyExperienceVars(meta: ExperienceMeta): void {
  const root = document.documentElement;
  const c = meta.colors;
  root.style.setProperty("--bg", c.bg);
  root.style.setProperty("--surface", c.surface);
  root.style.setProperty("--text", c.text);
  root.style.setProperty("--muted", c.muted);
  root.style.setProperty("--accent", c.accent);
  root.style.setProperty("--accent2", c.accent2);
  root.style.setProperty("--glaze", c.glaze);
  root.style.setProperty("--display", meta.fonts.display);
  root.style.setProperty("--body", meta.fonts.body);
  root.style.setProperty("--radius", meta.radius);
  root.style.setProperty("--glow", String(meta.glow));
  root.dataset.exp = meta.id;
  root.dataset.mode = meta.mode;
  root.style.colorScheme = meta.mode;
}

export function ExperienceProvider({
  initial,
  children,
}: {
  initial: ExperienceId;
  children: React.ReactNode;
}) {
  const [id, setRawId] = useState<ExperienceId>(initial ?? DEFAULT_EXPERIENCE);
  const [transitioning, setTransitioning] = useState(false);

  // Apply vars on mount and whenever id changes.
  useEffect(() => {
    applyExperienceVars(EXPERIENCES[id]);
  }, [id]);

  const setId = useCallback(
    (next: ExperienceId) => {
      if (next === id) return;
      document.cookie = `sear_exp=${next};path=/;max-age=31536000;samesite=lax`;
      setTransitioning(true);
      // Let the transition overlay cover the swap, then commit.
      window.setTimeout(() => {
        setRawId(next);
        window.setTimeout(() => setTransitioning(false), 480);
      }, 220);
    },
    [id],
  );

  const value = useMemo<ExperienceContextValue>(
    () => ({ id, meta: EXPERIENCES[id], setId, transitioning }),
    [id, setId, transitioning],
  );

  return (
    <ExperienceContext.Provider value={value}>
      {children}
    </ExperienceContext.Provider>
  );
}

export function useExperience(): ExperienceContextValue {
  const ctx = useContext(ExperienceContext);
  if (!ctx) {
    throw new Error("useExperience must be used within ExperienceProvider");
  }
  return ctx;
}
