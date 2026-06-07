// Easing vocabulary shared by GSAP, Motion and CSS. "Lento = caro."

export const EASE = {
  lux: "cubic-bezier(0.16,1,0.3,1)",
  snap: "cubic-bezier(0.85,0,0.15,1)",
  soft: "cubic-bezier(0.33,1,0.68,1)",
  back: "cubic-bezier(0.34,1.56,0.64,1)",
} as const;

export type EaseName = keyof typeof EASE;

// Motion (framer-motion) bezier arrays.
export const EASE_ARR: Record<EaseName, [number, number, number, number]> = {
  lux: [0.16, 1, 0.3, 1],
  snap: [0.85, 0, 0.15, 1],
  soft: [0.33, 1, 0.68, 1],
  back: [0.34, 1.56, 0.64, 1],
};
