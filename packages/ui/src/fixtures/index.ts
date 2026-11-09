// Demo data for Storybook and the /prototype pages (Build Phase 1).
// Brands, products, prices and ratings are all made up.
import type { FitStatus } from "../components/Badge"
import type { VehicleCatalog } from "../vehicle/catalog"

const years = (from: number, to: number, variants: string[]) =>
  Array.from({ length: to - from + 1 }, (_, i) => ({
    year: to - i,
    variants: variants.map((v) => ({ id: v.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name: v })),
  }))

export const demoCatalog: VehicleCatalog = {
  makes: [
    {
      id: "hyundai",
      name: "Hyundai",
      models: [
        {
          id: "creta",
          name: "Creta",
          years: years(2020, 2024, ["E Petrol", "S Petrol", "SX Diesel", "SX(O) Turbo"]),
        },
        { id: "venue", name: "Venue", years: years(2019, 2024, ["E", "S", "SX", "SX(O) Turbo"]) },
        { id: "i20", name: "i20", years: years(2020, 2024, ["Magna", "Sportz", "Asta"]) },
      ],
    },
    {
      id: "maruti-suzuki",
      name: "Maruti Suzuki",
      models: [
        { id: "swift", name: "Swift", years: years(2018, 2024, ["LXi", "VXi", "ZXi", "ZXi+"]) },
        { id: "brezza", name: "Brezza", years: years(2022, 2024, ["LXi", "VXi", "ZXi", "ZXi+"]) },
        {
          id: "baleno",
          name: "Baleno",
          years: years(2019, 2024, ["Sigma", "Delta", "Zeta", "Alpha"]),
        },
      ],
    },
    {
      id: "tata",
      name: "Tata",
      models: [
        {
          id: "nexon",
          name: "Nexon",
          years: years(2020, 2024, ["Smart", "Pure", "Creative", "Fearless"]),
        },
        {
          id: "punch",
          name: "Punch",
          years: years(2021, 2024, ["Pure", "Adventure", "Accomplished"]),
        },
      ],
    },
    {
      id: "mahindra",
      name: "Mahindra",
      models: [
        { id: "xuv700", name: "XUV700", years: years(2021, 2024, ["MX", "AX3", "AX5", "AX7"]) },
        { id: "thar", name: "Thar", years: years(2020, 2024, ["AX Opt", "LX"]) },
      ],
    },
    {
      id: "kia",
      name: "Kia",
      models: [
        { id: "seltos", name: "Seltos", years: years(2019, 2024, ["HTE", "HTK", "HTX", "GTX+"]) },
      ],
    },
    {
      id: "toyota",
      name: "Toyota",
      models: [
        {
          id: "innova-crysta",
          name: "Innova Crysta",
          years: years(2016, 2024, ["GX", "VX", "ZX"]),
        },
      ],
    },
    {
      id: "honda",
      name: "Honda",
      models: [{ id: "city", name: "City", years: years(2020, 2024, ["V", "VX", "ZX"]) }],
    },
  ],
}

export type ProductKind =
  "seat-cover" | "floor-mat" | "dashcam" | "perfume" | "phone-holder" | "led" | "inflator" | "cloth"

const art: Record<ProductKind, { bg: string; fg: string; shape: string }> = {
  "seat-cover": {
    bg: "#E9E2D6",
    fg: "#2B2B2B",
    shape:
      '<path d="M120 60h80q20 0 22 22l8 118q2 22-20 22H110q-22 0-20-22l8-118q2-22 22-22z"/><path d="M95 230h130q18 0 18 18v22q0 14-14 14H91q-14 0-14-14v-22q0-18 18-18z"/><path d="M140 90h40M138 130h44M136 170h48" stroke="#E9E2D6" stroke-width="8" stroke-linecap="round"/>',
  },
  "floor-mat": {
    bg: "#DCE6E3",
    fg: "#0E3B43",
    shape:
      '<path d="M90 70h140q14 0 14 14v150q0 30-30 30H106q-30 0-30-30V84q0-14 14-14z"/><path d="M100 100h120M100 130h120M100 160h120M100 190h120M100 220h120" stroke="#DCE6E3" stroke-width="6"/>',
  },
  dashcam: {
    bg: "#E3E1EC",
    fg: "#1A1A1A",
    shape:
      '<rect x="70" y="110" width="180" height="110" rx="22"/><circle cx="160" cy="165" r="38" fill="#3A3A4A"/><circle cx="160" cy="165" r="18" fill="#1D6672"/><rect x="140" y="80" width="40" height="34" rx="8"/>',
  },
  perfume: {
    bg: "#F3E3C8",
    fg: "#8A5A00",
    shape:
      '<rect x="125" y="60" width="70" height="40" rx="10"/><path d="M105 110h110q20 0 20 20v110q0 24-24 24H109q-24 0-24-24V130q0-20 20-20z"/>',
  },
  "phone-holder": {
    bg: "#E2E6EA",
    fg: "#1A1A1A",
    shape:
      '<rect x="115" y="60" width="90" height="160" rx="16"/><rect x="125" y="74" width="70" height="128" rx="6" fill="#1D6672"/><path d="M160 220v40M120 270h80" stroke="#1A1A1A" stroke-width="14" stroke-linecap="round"/>',
  },
  led: {
    bg: "#F6EED3",
    fg: "#E0922A",
    shape:
      '<circle cx="160" cy="130" r="62"/><rect x="132" y="190" width="56" height="60" rx="8" fill="#5C5C5C"/><path d="M160 30v20M90 60l14 14M230 60l-14 14" stroke="#E0922A" stroke-width="10" stroke-linecap="round"/>',
  },
  inflator: {
    bg: "#E6E1DA",
    fg: "#B42318",
    shape:
      '<rect x="85" y="100" width="150" height="130" rx="24"/><rect x="110" y="125" width="70" height="40" rx="6" fill="#1A1A1A"/><path d="M235 140q50 0 40 60" fill="none" stroke="#1A1A1A" stroke-width="10"/>',
  },
  cloth: {
    bg: "#DDE8F0",
    fg: "#1D6672",
    shape:
      '<path d="M80 110l80-30 80 30v120l-80 30-80-30z"/><path d="M80 110l80 30 80-30M160 140v120" stroke="#DDE8F0" stroke-width="6" fill="none"/>',
  },
}

/** A simple illustrated product image (data: URI), deterministic for screenshot tests. */
export function productImage(kind: ProductKind): string {
  const a = art[kind]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 320"><rect width="320" height="320" fill="${a.bg}"/><g fill="${a.fg}">${a.shape}</g></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

export interface DemoProduct {
  slug: string
  title: string
  brand: string
  kind: ProductKind
  category: string
  alt: string
  price: number
  mrp?: number
  rating: { value: number; count: number }
  fit: FitStatus
  delivery: string
  highlights: string[]
  fitNote?: string
  colours?: string[]
}

export const demoProducts: DemoProduct[] = [
  {
    slug: "leatherette-seat-cover-black",
    title: "Leatherette Seat Covers, full set (Black)",
    brand: "SeatCraft",
    kind: "seat-cover",
    category: "seat-covers",
    alt: "Black leatherette car seat cover",
    price: 3499,
    mrp: 5999,
    rating: { value: 4.4, count: 210 },
    fit: "fits",
    delivery: "Get it Thu, 12 Nov",
    highlights: [
      "Custom cut for your exact model",
      "Airbag-safe side stitching",
      "Water resistant, wipe clean",
    ],
    fitNote: "Not for the 7-seater variant.",
    colours: ["Black", "Beige", "Tan"],
  },
  {
    slug: "fabric-3d-seat-cover",
    title: "3D Fabric Seat Covers with lumbar support",
    brand: "ComfortWeave",
    kind: "seat-cover",
    category: "seat-covers",
    alt: "Grey fabric car seat cover",
    price: 1899,
    rating: { value: 4.1, count: 88 },
    fit: "fits",
    delivery: "Get it Fri, 13 Nov",
    highlights: ["Breathable mesh fabric", "Universal elastic fit for 5-seaters"],
  },
  {
    slug: "7d-floor-mats",
    title: "7D Luxury Floor Mats, custom fit",
    brand: "MatPro",
    kind: "floor-mat",
    category: "floor-mats",
    alt: "Black textured car floor mat set",
    price: 2799,
    mrp: 3999,
    rating: { value: 4.6, count: 342 },
    fit: "fits",
    delivery: "Get it Thu, 12 Nov",
    highlights: ["Raised edges hold water and mud", "Anti-skid backing"],
  },
  {
    slug: "dashcam-2k-wifi",
    title: "2K Dashcam with Wi-Fi and night vision",
    brand: "RoadEye",
    kind: "dashcam",
    category: "dashcams",
    alt: "Compact black dashcam with lens",
    price: 4990,
    mrp: 6990,
    rating: { value: 4.3, count: 1204 },
    fit: "unknown",
    delivery: "Get it Wed, 11 Nov",
    highlights: ["Fits every car with a 12V socket", "Loop recording, 128 GB card support"],
  },
  {
    slug: "car-perfume-gel",
    title: "Car Perfume Gel, Ocean Breeze (60 g)",
    brand: "Aroma Drive",
    kind: "perfume",
    category: "car-care",
    alt: "Amber car perfume gel container",
    price: 299,
    mrp: 349,
    rating: { value: 4.0, count: 2310 },
    fit: "fits",
    delivery: "Get it Wed, 11 Nov",
    highlights: ["Lasts up to 60 days"],
  },
  {
    slug: "magnetic-phone-holder",
    title: "Magnetic Dashboard Phone Holder",
    brand: "GripMount",
    kind: "phone-holder",
    category: "accessories",
    alt: "Black phone holder mounted on a stand",
    price: 549,
    mrp: 999,
    rating: { value: 4.2, count: 760 },
    fit: "fits",
    delivery: "Get it Thu, 12 Nov",
    highlights: ["360° rotation", "Strong N52 magnets"],
  },
  {
    slug: "led-headlight-h4",
    title: "LED Headlight Bulbs H4, 6000K (pair)",
    brand: "BrightBeam",
    kind: "led",
    category: "lighting",
    alt: "LED headlight bulb",
    price: 2299,
    mrp: 2999,
    rating: { value: 4.5, count: 455 },
    fit: "no-fit",
    delivery: "Get it Fri, 13 Nov",
    highlights: ["Plug-and-play", "2-year warranty"],
  },
  {
    slug: "digital-tyre-inflator",
    title: "Digital Tyre Inflator with auto cut-off",
    brand: "AirPump",
    kind: "inflator",
    category: "car-care",
    alt: "Red portable tyre inflator",
    price: 2199,
    mrp: 3499,
    rating: { value: 4.4, count: 980 },
    fit: "fits",
    delivery: "Get it Thu, 12 Nov",
    highlights: ["Set pressure, it stops by itself", "Runs off the 12V socket"],
  },
]

export const demoCategories = [
  { slug: "seat-covers", name: "Seat covers", kind: "seat-cover" as ProductKind },
  { slug: "floor-mats", name: "Floor mats", kind: "floor-mat" as ProductKind },
  { slug: "dashcams", name: "Dashcams", kind: "dashcam" as ProductKind },
  { slug: "car-care", name: "Car care", kind: "cloth" as ProductKind },
  { slug: "lighting", name: "Lighting", kind: "led" as ProductKind },
  { slug: "accessories", name: "Phone holders", kind: "phone-holder" as ProductKind },
]
