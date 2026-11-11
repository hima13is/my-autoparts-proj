/**
 * DEMO catalogue for local and staging only. It is never loaded in production.
 *
 * Built from the real car list so every fitment points at a real generation or variant.
 * Brand names are invented placeholders, and prices are realistic Indian street prices
 * in rupees. Real supplier data replaces all of this later (PLAN §9 Q4).
 */
import { slugify } from "../lib/fitment"
import type { SeedGeneration, SeedMake, SeedModel } from "./vehicles"

export type DemoCategory = { handle: string; name: string; description: string; parent?: string }

/** Top-level groups for the menu. Each demo category sits under one of them. */
export const DEMO_CATEGORY_GROUPS: DemoCategory[] = [
  { handle: "interior", name: "Interior", description: "Seat covers, mats, sunshades and more." },
  { handle: "exterior", name: "Exterior & Care", description: "Covers and cleaning." },
  { handle: "electronics", name: "Electronics", description: "Dashcams, lights and chargers." },
]

const GROUP_OF: Record<string, string> = {
  "seat-covers": "interior",
  "floor-mats": "interior",
  sunshades: "interior",
  "car-perfumes": "interior",
  "steering-covers": "interior",
  "car-covers": "exterior",
  "car-care": "exterior",
  lighting: "electronics",
  dashcams: "electronics",
  "phone-holders-chargers": "electronics",
}

export const DEMO_CATEGORIES: DemoCategory[] = [
  {
    handle: "seat-covers",
    name: "Seat Covers",
    description: "Custom-fit seat covers made for your car.",
  },
  {
    handle: "floor-mats",
    name: "Floor Mats",
    description: "7D and rubber mats cut to your car's floor.",
  },
  {
    handle: "car-covers",
    name: "Car Covers",
    description: "Dust, sun and rain protection, sized by body type.",
  },
  { handle: "sunshades", name: "Sunshades", description: "Window sunshades shaped for your car." },
  { handle: "lighting", name: "Lighting", description: "LED headlight and interior bulbs." },
  { handle: "dashcams", name: "Dashcams", description: "Front and dual-channel dash cameras." },
  {
    handle: "car-perfumes",
    name: "Car Perfumes",
    description: "Dashboard, vent and spray fresheners.",
  },
  {
    handle: "car-care",
    name: "Car Care",
    description: "Shampoo, polish, microfibre and cleaning kits.",
  },
  {
    handle: "phone-holders-chargers",
    name: "Phone Holders & Chargers",
    description: "Mounts, wireless and fast chargers.",
  },
  {
    handle: "steering-covers",
    name: "Steering Covers",
    description: "Grippy covers sized by steering diameter.",
  },
]
for (const c of DEMO_CATEGORIES) c.parent = GROUP_OF[c.handle]

/** A car reference by name, resolved to IDs when the catalogue is loaded. */
export type CarRef = { make: string; model: string; generation: string; variants?: string[] }

export type DemoVariant = { title: string; sku: string; colour: string; price: number; mrp: number }

export type DemoProduct = {
  handle: string
  title: string
  description: string
  category: string
  brand: string
  variants: DemoVariant[]
  /** "universal" fits every car; otherwise the listed generations (optionally narrowed to variants). */
  fitment: "universal" | CarRef[]
}

type Car = { make: SeedMake; model: SeedModel; generation: SeedGeneration }

const carName = (c: Car) => `${c.model.name} ${c.generation.from}–${c.generation.to ?? "present"}`
const ref = (c: Car, variants?: string[]): CarRef => ({
  make: c.make.name,
  model: c.model.name,
  generation: c.generation.name,
  ...(variants ? { variants } : {}),
})

function product(
  title: string,
  category: string,
  brand: string,
  description: string,
  colours: [string, number, number][],
  fitment: DemoProduct["fitment"]
): DemoProduct {
  const handle = slugify(`${brand} ${title}`)
  return {
    handle,
    title,
    description,
    category,
    brand,
    fitment,
    variants: colours.map(([colour, price, mrp]) => ({
      title: colour,
      colour,
      price,
      mrp,
      sku: "", // assigned at the end of buildDemoCatalogue
    })),
  }
}

export const DEMO_BRANDS = [
  "Gaadi Pro",
  "Kavach",
  "LumaDrive",
  "Nirmal Care",
  "RoadSaathi",
  "Safar",
  "ShineMax",
  "UrbanTrim",
]

export function buildDemoCatalogue(vehicles: SeedMake[]): DemoProduct[] {
  const cars: Car[] = vehicles.flatMap((make) =>
    make.models.flatMap((model) =>
      model.generations.map((generation) => ({ make, model, generation }))
    )
  )
  const newest = vehicles.flatMap((make) =>
    make.models.map((model) => ({ make, model, generation: model.generations.at(-1)! }))
  )
  const products: DemoProduct[] = []

  // Seat covers: one per current car. When trims have different seat counts (6- vs 7-seater),
  // each layout gets its own product, mapped to those variants only.
  newest.forEach((car, i) => {
    const brand = i % 2 ? "UrbanTrim" : "Kavach"
    const bySeats = new Map<number, string[]>()
    for (const v of car.generation.variants) {
      const seats = v.seats ?? car.model.seats
      bySeats.set(seats, [...(bySeats.get(seats) ?? []), v.name])
    }
    for (const [seats, variantNames] of bySeats) {
      const split = bySeats.size > 1
      products.push(
        product(
          `${carName(car)} leatherette seat covers${split ? ` (${seats}-seater)` : ""}`,
          "seat-covers",
          brand,
          `Custom-fit ${seats}-seat leatherette covers with airbag-safe side stitching.`,
          [
            ["Black", 5499 + seats * 300, 7999 + seats * 300],
            ["Black & Beige", 5799 + seats * 300, 8499 + seats * 300],
          ],
          [ref(car, split ? variantNames : undefined)]
        )
      )
    }
  })

  // 7D floor mats: one per current car.
  newest.forEach((car, i) => {
    products.push(
      product(
        `${carName(car)} 7D floor mats`,
        "floor-mats",
        i % 2 ? "RoadSaathi" : "Gaadi Pro",
        "Laser-measured, raised-edge mats that hold spills. Driver mat has heel pad.",
        [
          ["Black", 3299, 4999],
          ["Tan", 3499, 5299],
        ],
        [ref(car)]
      )
    )
  })

  // Car covers: sized by body type, so one cover fits every generation of that size.
  const coverSizes: { label: string; bodies: string[]; rupees: number }[] = [
    { label: "Hatchback", bodies: ["hatchback"], rupees: 1399 },
    { label: "Sedan", bodies: ["sedan"], rupees: 1599 },
    { label: "Compact SUV", bodies: ["compact_suv"], rupees: 1799 },
    { label: "SUV & MUV", bodies: ["suv", "muv"], rupees: 2199 },
  ]
  for (const size of coverSizes) {
    const fits = cars.filter((c) => size.bodies.includes(c.model.body)).map((c) => ref(c))
    for (const [brand, extra] of [
      ["Kavach", 0],
      ["Safar", 400],
    ] as const) {
      products.push(
        product(
          `${size.label} car cover, ${extra ? "triple-layer waterproof" : "dustproof"}`,
          "car-covers",
          brand,
          `Elastic-hem cover with mirror pockets, sized for ${size.label.toLowerCase()} cars.`,
          [["Silver", size.rupees + extra, size.rupees + extra + 1000]],
          fits
        )
      )
    }
  }

  // Sunshades: the first 12 current cars.
  newest.slice(0, 12).forEach((car) => {
    products.push(
      product(
        `${carName(car)} magnetic sunshades (set of 4)`,
        "sunshades",
        "Safar",
        "Magnetic frames that snap to the door frame. Windows still roll down.",
        [["Black", 999, 1599]],
        [ref(car)]
      )
    )
  })

  // LED headlight kit for older halogen cars (generations that are no longer on sale).
  const older = cars.filter((c) => c.generation.to !== null).map((c) => ref(c))
  for (const [brand, price] of [
    ["LumaDrive", 1799],
    ["Gaadi Pro", 2499],
    ["UrbanTrim", 3499],
  ] as const) {
    products.push(
      product(
        `LED headlight bulb kit ${price > 3000 ? "90W" : price > 2000 ? "70W" : "50W"}`,
        "lighting",
        brand,
        "Plug-and-play LED upgrade for halogen headlights. 6000K white.",
        [["6000K White", price, Math.round(price * 1.6)]],
        older
      )
    )
  }

  // Universal products.
  const universal: [string, string, string, string, [string, number, number][]][] = [
    [
      "Dashcam 1080p with Wi-Fi",
      "dashcams",
      "LumaDrive",
      "Full-HD front camera, app download, loop recording.",
      [["Black", 2999, 4999]],
    ],
    [
      "Dashcam 2K front + rear",
      "dashcams",
      "LumaDrive",
      "Dual-channel 2K + 1080p with parking mode.",
      [["Black", 6499, 9999]],
    ],
    [
      "Dashcam 4K with GPS",
      "dashcams",
      "Gaadi Pro",
      "4K front camera, GPS speed overlay, supercapacitor.",
      [["Black", 8999, 13999]],
    ],
    [
      "Compact dashcam 1080p",
      "dashcams",
      "RoadSaathi",
      "Hides behind the mirror. Voice control.",
      [["Black", 3499, 5499]],
    ],
    [
      "Night-vision dashcam 1440p",
      "dashcams",
      "Safar",
      "Starvis sensor for clear night footage.",
      [["Black", 4999, 7499]],
    ],
    [
      "Hardwire kit for dashcams",
      "dashcams",
      "LumaDrive",
      "Fuse-box kit for 24-hour parking mode.",
      [["Black", 799, 1299]],
    ],
    [
      "Gel dashboard perfume, Ocean",
      "car-perfumes",
      "Nirmal Care",
      "Lasts up to 60 days.",
      [["Ocean", 349, 499]],
    ],
    [
      "Gel dashboard perfume, Lavender",
      "car-perfumes",
      "Nirmal Care",
      "Lasts up to 60 days.",
      [["Lavender", 349, 499]],
    ],
    [
      "AC vent clip perfume (pack of 3)",
      "car-perfumes",
      "Nirmal Care",
      "Three scents, adjustable strength.",
      [["Mixed", 449, 699]],
    ],
    [
      "Hanging wood diffuser, Sandalwood",
      "car-perfumes",
      "Safar",
      "Refillable wooden diffuser.",
      [["Sandalwood", 599, 899]],
    ],
    [
      "Car air purifier perfume spray",
      "car-perfumes",
      "Nirmal Care",
      "Removes odour, 250 ml.",
      [["Citrus", 299, 449]],
    ],
    [
      "Microfibre cloth (pack of 4)",
      "car-care",
      "ShineMax",
      "350 GSM, scratch-free.",
      [["Grey", 349, 599]],
    ],
    [
      "pH-neutral car shampoo 1 L",
      "car-care",
      "ShineMax",
      "Safe on wax and ceramic coats.",
      [["1 L", 449, 699]],
    ],
    [
      "Ceramic spray coat 500 ml",
      "car-care",
      "ShineMax",
      "Hydrophobic shine for up to 3 months.",
      [["500 ml", 1199, 1799]],
    ],
    [
      "Dashboard polish 250 ml",
      "car-care",
      "Nirmal Care",
      "Matte finish, UV protection.",
      [["250 ml", 299, 449]],
    ],
    [
      "Complete car wash kit",
      "car-care",
      "ShineMax",
      "Shampoo, mitt, cloths, tyre shine.",
      [["Kit", 1499, 2299]],
    ],
    [
      "Tyre inflator, digital",
      "car-care",
      "Gaadi Pro",
      "12V, auto cut-off at set pressure.",
      [["Black", 2299, 3499]],
    ],
    [
      "Magnetic phone mount, dashboard",
      "phone-holders-chargers",
      "RoadSaathi",
      "One-hand mounting, 360° turn.",
      [["Black", 499, 899]],
    ],
    [
      "Wireless charging phone holder 15W",
      "phone-holders-chargers",
      "LumaDrive",
      "Auto-clamp, vent or dashboard mount.",
      [["Black", 1799, 2999]],
    ],
    [
      "Dual USB-C fast car charger 45W",
      "phone-holders-chargers",
      "LumaDrive",
      "PD + QC 3.0, metal body.",
      [["Silver", 899, 1499]],
    ],
    [
      "Phone holder, AC vent",
      "phone-holders-chargers",
      "RoadSaathi",
      "Gravity grip, fits 4.7–6.9 inch phones.",
      [["Black", 399, 699]],
    ],
    [
      "Bluetooth FM transmitter + charger",
      "phone-holders-chargers",
      "Gaadi Pro",
      "Music and calls on older stereos.",
      [["Black", 1099, 1799]],
    ],
    [
      "Steering cover, perforated leather (38 cm)",
      "steering-covers",
      "Kavach",
      "Fits 37–39 cm wheels.",
      [
        ["Black", 599, 999],
        ["Black & Red", 649, 1049],
      ],
    ],
    [
      "Steering cover, suede grip (38 cm)",
      "steering-covers",
      "UrbanTrim",
      "Anti-slip suede.",
      [["Grey", 799, 1299]],
    ],
    [
      "Steering cover, wooden finish (38 cm)",
      "steering-covers",
      "Kavach",
      "Classic wood look, cool to touch.",
      [["Brown", 699, 1199]],
    ],
  ]
  for (const [title, category, brand, description, colours] of universal) {
    products.push(product(title, category, brand, description, colours, "universal"))
  }

  // Short, stable SKUs: FG-DEMO-<product no.>-<variant no.>.
  products.forEach((p, i) =>
    p.variants.forEach((v, j) => {
      v.sku = `FG-DEMO-${String(i + 1).padStart(3, "0")}-${j + 1}`
    })
  )
  return products
}
