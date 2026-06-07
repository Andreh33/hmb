import type { Category, MenuItem, SiteConfig } from "./types";

// Neutral demo data. NO invented reviews, awards, or figures (§0.7).
// Prices/names are generic placeholders, swapped per client via the CMS.

export const MOCK_CATEGORIES: Category[] = [
  { id: "c-signature", slug: "signature", name: { es: "De autor", en: "Signature" }, sort: 0 },
  { id: "c-classics", slug: "classics", name: { es: "Clásicas", en: "Classics" }, sort: 1 },
  { id: "c-sides", slug: "sides", name: { es: "Para picar", en: "Sides" }, sort: 2 },
  { id: "c-drinks", slug: "drinks", name: { es: "Bebidas", en: "Drinks" }, sort: 3 },
];

export const MOCK_MENU: MenuItem[] = [
  {
    id: "m-ember", categoryId: "c-signature",
    name: { es: "La Brasa", en: "The Ember" },
    desc: { es: "Carne madurada 45 días, cheddar curado, cebolla al carbón, brioche.", en: "45-day aged beef, aged cheddar, charred onion, brioche." },
    priceCents: 1450, allergens: ["gluten", "lacteos"], badges: ["nuevo"], isPublished: true, sort: 0,
  },
  {
    id: "m-smash", categoryId: "c-signature",
    name: { es: "Doble Smash", en: "Double Smash" },
    desc: { es: "Doble carne prensada, queso americano, pepinillo, salsa de la casa.", en: "Double smashed patty, American cheese, pickle, house sauce." },
    priceCents: 1290, allergens: ["gluten", "lacteos", "huevo"], badges: [], isPublished: true, sort: 1,
  },
  {
    id: "m-blue", categoryId: "c-signature",
    name: { es: "Azul & Miel", en: "Blue & Honey" },
    desc: { es: "Queso azul, miel picante, rúcula, cebolla caramelizada.", en: "Blue cheese, hot honey, rocket, caramelized onion." },
    priceCents: 1390, allergens: ["gluten", "lacteos"], badges: ["picante"], isPublished: true, sort: 2,
  },
  {
    id: "m-classic", categoryId: "c-classics",
    name: { es: "Clásica", en: "Classic" },
    desc: { es: "Carne, lechuga, tomate, cebolla, kétchup y mostaza.", en: "Beef, lettuce, tomato, onion, ketchup & mustard." },
    priceCents: 990, allergens: ["gluten"], badges: [], isPublished: true, sort: 0,
  },
  {
    id: "m-cheese", categoryId: "c-classics",
    name: { es: "Cheeseburger", en: "Cheeseburger" },
    desc: { es: "Carne, doble cheddar, pepinillo, salsa burger.", en: "Beef, double cheddar, pickle, burger sauce." },
    priceCents: 1090, allergens: ["gluten", "lacteos"], badges: [], isPublished: true, sort: 1,
  },
  {
    id: "m-veggie", categoryId: "c-classics",
    name: { es: "Veggie", en: "Veggie" },
    desc: { es: "Hamburguesa vegetal, aguacate, brotes, mayo vegana.", en: "Plant patty, avocado, sprouts, vegan mayo." },
    priceCents: 1190, allergens: ["gluten", "soja"], badges: ["veggie"], isPublished: true, sort: 2,
  },
  {
    id: "s-fries", categoryId: "c-sides",
    name: { es: "Patatas bravas", en: "Spicy fries" },
    desc: { es: "Patatas con alioli y salsa brava.", en: "Fries with aioli and brava sauce." },
    priceCents: 490, allergens: ["huevo"], badges: ["picante"], isPublished: true, sort: 0,
  },
  {
    id: "s-rings", categoryId: "c-sides",
    name: { es: "Aros de cebolla", en: "Onion rings" },
    desc: { es: "Aros crujientes con mayo de chipotle.", en: "Crispy rings with chipotle mayo." },
    priceCents: 520, allergens: ["gluten", "huevo"], badges: [], isPublished: true, sort: 1,
  },
  {
    id: "d-cola", categoryId: "c-drinks",
    name: { es: "Refresco", en: "Soft drink" },
    desc: { es: "Lata 33cl.", en: "33cl can." },
    priceCents: 250, allergens: [], badges: [], isPublished: true, sort: 0,
  },
  {
    id: "d-shake", categoryId: "c-drinks",
    name: { es: "Batido", en: "Milkshake" },
    desc: { es: "Vainilla, chocolate o fresa.", en: "Vanilla, chocolate or strawberry." },
    priceCents: 450, allergens: ["lacteos"], badges: [], isPublished: true, sort: 1,
  },
];

export const MOCK_SITE_CONFIG: SiteConfig = {
  experience: "ember",
  brand: "SEAR",
  whatsapp: "+34600000000",
  address: "Calle de la Brasa, 1, Madrid",
  lat: 40.4168,
  lng: -3.7038,
  hours: { "lun-jue": "13:00–23:30", "vie-sab": "13:00–01:00", dom: "13:00–23:00" },
  socials: { instagram: "#", tiktok: "#" },
};
