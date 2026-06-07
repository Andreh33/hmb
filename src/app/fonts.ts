import {
  Fraunces,
  Geist,
  Alfa_Slab_One,
  DM_Sans,
  Cormorant_Garamond,
  Hanken_Grotesk,
  Bricolage_Grotesque,
} from "next/font/google";

export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});
export const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});
export const alfa = Alfa_Slab_One({
  variable: "--font-alfa",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});
export const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
  display: "swap",
});
export const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});
export const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});
export const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  display: "swap",
});

// Clash Display + Satoshi are Fontshare fonts to be self-hosted by A-SMASH.
// Until the .woff2 files land, alias them to loaded Google variables so SMASH
// still renders with character (no system fonts). See docs/DECISIONS.md.
export const FONT_VARIABLES = [
  fraunces.variable,
  geist.variable,
  alfa.variable,
  dmSans.variable,
  cormorant.variable,
  hanken.variable,
  bricolage.variable,
].join(" ");
