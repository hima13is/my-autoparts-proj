/**
 * Launch car list: popular Indian cars, with the generations accessories care about.
 *
 * Sources: manufacturer launch dates as publicly reported up to late 2026. `to: null` means
 * still on sale. A facelift only becomes its own generation when accessories stop fitting
 * across it (e.g. Nexon 2023). Variants are representative trims, not every price point.
 * The owner/suppliers should review this list before launch (PLAN §9 Q4).
 */

type Fuel = "petrol" | "diesel" | "cng" | "electric" | "hybrid"
type Gearbox = "manual" | "automatic"
type BodyType = "hatchback" | "sedan" | "suv" | "compact_suv" | "muv" | "pickup" | "coupe"

export type SeedVariant = { name: string; fuel: Fuel; transmission: Gearbox; seats?: number }
export type SeedGeneration = {
  name: string
  from: number
  to: number | null
  variants: SeedVariant[]
}
export type SeedModel = {
  name: string
  body: BodyType
  seats: number
  generations: SeedGeneration[]
}
export type SeedMake = { name: string; models: SeedModel[] }

const v = (name: string, fuel: Fuel, transmission: Gearbox, seats?: number): SeedVariant => ({
  name,
  fuel,
  transmission,
  ...(seats ? { seats } : {}),
})
const gen = (name: string, from: number, to: number | null, variants: SeedVariant[]) => ({
  name,
  from,
  to,
  variants,
})

export const VEHICLES: SeedMake[] = [
  {
    name: "Maruti Suzuki",
    models: [
      {
        name: "Swift",
        body: "hatchback",
        seats: 5,
        generations: [
          gen("2nd gen", 2011, 2017, [
            v("LXi", "petrol", "manual"),
            v("VDi", "diesel", "manual"),
            v("ZXi", "petrol", "manual"),
          ]),
          gen("3rd gen", 2018, 2024, [
            v("LXi", "petrol", "manual"),
            v("VXi AMT", "petrol", "automatic"),
            v("ZXi+", "petrol", "manual"),
            v("VXi CNG", "cng", "manual"),
          ]),
          gen("4th gen", 2024, null, [
            v("LXi", "petrol", "manual"),
            v("VXi AMT", "petrol", "automatic"),
            v("ZXi+", "petrol", "manual"),
            v("VXi CNG", "cng", "manual"),
          ]),
        ],
      },
      {
        name: "Baleno",
        body: "hatchback",
        seats: 5,
        generations: [
          gen("1st gen", 2015, 2022, [
            v("Sigma", "petrol", "manual"),
            v("Delta CVT", "petrol", "automatic"),
            v("Alpha", "petrol", "manual"),
          ]),
          gen("2nd gen", 2022, null, [
            v("Sigma", "petrol", "manual"),
            v("Delta CNG", "cng", "manual"),
            v("Zeta AMT", "petrol", "automatic"),
            v("Alpha", "petrol", "manual"),
          ]),
        ],
      },
      {
        name: "Dzire",
        body: "sedan",
        seats: 5,
        generations: [
          gen("2nd gen", 2017, 2024, [
            v("LXi", "petrol", "manual"),
            v("VXi CNG", "cng", "manual"),
            v("ZXi+ AMT", "petrol", "automatic"),
          ]),
          gen("3rd gen", 2024, null, [
            v("LXi", "petrol", "manual"),
            v("VXi CNG", "cng", "manual"),
            v("ZXi+ AMT", "petrol", "automatic"),
          ]),
        ],
      },
      {
        name: "Brezza",
        body: "compact_suv",
        seats: 5,
        generations: [
          gen("Vitara Brezza", 2016, 2022, [
            v("LDi", "diesel", "manual"),
            v("VXi", "petrol", "manual"),
            v("ZXi AT", "petrol", "automatic"),
          ]),
          gen("2nd gen", 2022, null, [
            v("LXi", "petrol", "manual"),
            v("VXi CNG", "cng", "manual"),
            v("ZXi+ AT", "petrol", "automatic"),
          ]),
        ],
      },
      {
        name: "Ertiga",
        body: "muv",
        seats: 7,
        generations: [
          gen("1st gen", 2012, 2018, [v("LXi", "petrol", "manual"), v("VDi", "diesel", "manual")]),
          gen("2nd gen", 2018, null, [
            v("LXi", "petrol", "manual"),
            v("VXi CNG", "cng", "manual"),
            v("ZXi+ AT", "petrol", "automatic"),
          ]),
        ],
      },
      {
        name: "Wagon R",
        body: "hatchback",
        seats: 5,
        generations: [
          gen("2nd gen", 2010, 2019, [
            v("LXi", "petrol", "manual"),
            v("VXi AMT", "petrol", "automatic"),
          ]),
          gen("3rd gen", 2019, null, [
            v("LXi", "petrol", "manual"),
            v("VXi CNG", "cng", "manual"),
            v("ZXi+ AMT", "petrol", "automatic"),
          ]),
        ],
      },
      {
        name: "Grand Vitara",
        body: "suv",
        seats: 5,
        generations: [
          gen("1st gen", 2022, null, [
            v("Sigma", "petrol", "manual"),
            v("Delta CNG", "cng", "manual"),
            v("Zeta+ Hybrid", "hybrid", "automatic"),
            v("Alpha+ Hybrid", "hybrid", "automatic"),
          ]),
        ],
      },
      {
        name: "Fronx",
        body: "compact_suv",
        seats: 5,
        generations: [
          gen("1st gen", 2023, null, [
            v("Sigma", "petrol", "manual"),
            v("Delta+ AMT", "petrol", "automatic"),
            v("Alpha Turbo", "petrol", "manual"),
          ]),
        ],
      },
    ],
  },
  {
    name: "Hyundai",
    models: [
      {
        name: "Creta",
        body: "suv",
        seats: 5,
        generations: [
          gen("1st gen", 2015, 2019, [
            v("E", "petrol", "manual"),
            v("SX", "diesel", "manual"),
            v("SX(O) AT", "diesel", "automatic"),
          ]),
          gen("2nd gen", 2020, null, [
            v("E", "petrol", "manual"),
            v("S", "diesel", "manual"),
            v("SX Tech", "petrol", "automatic"),
            v("SX(O) Turbo DCT", "petrol", "automatic"),
          ]),
        ],
      },
      {
        name: "Venue",
        body: "compact_suv",
        seats: 5,
        generations: [
          gen("1st gen", 2019, 2025, [
            v("E", "petrol", "manual"),
            v("S(O) Turbo", "petrol", "manual"),
            v("SX(O) DCT", "petrol", "automatic"),
            v("SX Diesel", "diesel", "manual"),
          ]),
          gen("2nd gen", 2025, null, [
            v("HX2", "petrol", "manual"),
            v("HX8 Turbo DCT", "petrol", "automatic"),
            v("HX8 Diesel", "diesel", "manual"),
          ]),
        ],
      },
      {
        name: "i20",
        body: "hatchback",
        seats: 5,
        generations: [
          gen("Elite i20", 2014, 2020, [
            v("Era", "petrol", "manual"),
            v("Sportz", "diesel", "manual"),
            v("Asta CVT", "petrol", "automatic"),
          ]),
          gen("3rd gen", 2020, null, [
            v("Magna", "petrol", "manual"),
            v("Sportz IVT", "petrol", "automatic"),
            v("Asta(O)", "petrol", "manual"),
          ]),
        ],
      },
      {
        name: "Grand i10 Nios",
        body: "hatchback",
        seats: 5,
        generations: [
          gen("1st gen", 2019, null, [
            v("Era", "petrol", "manual"),
            v("Magna CNG", "cng", "manual"),
            v("Asta AMT", "petrol", "automatic"),
          ]),
        ],
      },
      {
        name: "Verna",
        body: "sedan",
        seats: 5,
        generations: [
          gen("5th gen", 2017, 2023, [
            v("S", "petrol", "manual"),
            v("SX Diesel", "diesel", "manual"),
            v("SX(O) Turbo DCT", "petrol", "automatic"),
          ]),
          gen("6th gen", 2023, null, [
            v("EX", "petrol", "manual"),
            v("SX IVT", "petrol", "automatic"),
            v("SX(O) Turbo DCT", "petrol", "automatic"),
          ]),
        ],
      },
      {
        name: "Exter",
        body: "compact_suv",
        seats: 5,
        generations: [
          gen("1st gen", 2023, null, [
            v("EX", "petrol", "manual"),
            v("S CNG", "cng", "manual"),
            v("SX(O) Connect AMT", "petrol", "automatic"),
          ]),
        ],
      },
    ],
  },
  {
    name: "Tata",
    models: [
      {
        name: "Nexon",
        body: "compact_suv",
        seats: 5,
        generations: [
          gen("1st gen", 2017, 2023, [
            v("XE", "petrol", "manual"),
            v("XZ+ Diesel", "diesel", "manual"),
            v("XZA+ AMT", "petrol", "automatic"),
          ]),
          gen("2023 facelift", 2023, null, [
            v("Smart", "petrol", "manual"),
            v("Creative Diesel", "diesel", "manual"),
            v("Fearless+ DCA", "petrol", "automatic"),
            v("EV Empowered", "electric", "automatic"),
          ]),
        ],
      },
      {
        name: "Punch",
        body: "compact_suv",
        seats: 5,
        generations: [
          gen("1st gen", 2021, null, [
            v("Pure", "petrol", "manual"),
            v("Adventure CNG", "cng", "manual"),
            v("Creative AMT", "petrol", "automatic"),
            v("EV Empowered", "electric", "automatic"),
          ]),
        ],
      },
      {
        name: "Altroz",
        body: "hatchback",
        seats: 5,
        generations: [
          gen("1st gen", 2020, null, [
            v("XE", "petrol", "manual"),
            v("XZ Diesel", "diesel", "manual"),
            v("XZ+ DCA", "petrol", "automatic"),
            v("XM+ CNG", "cng", "manual"),
          ]),
        ],
      },
      {
        name: "Harrier",
        body: "suv",
        seats: 5,
        generations: [
          gen("1st gen", 2019, 2023, [
            v("XE", "diesel", "manual"),
            v("XZA+", "diesel", "automatic"),
          ]),
          gen("2023 facelift", 2023, null, [
            v("Smart", "diesel", "manual"),
            v("Fearless+ AT", "diesel", "automatic"),
            v("EV Empowered", "electric", "automatic"),
          ]),
        ],
      },
      {
        name: "Tiago",
        body: "hatchback",
        seats: 5,
        generations: [
          gen("1st gen", 2016, null, [
            v("XE", "petrol", "manual"),
            v("XZ+ AMT", "petrol", "automatic"),
            v("XT CNG", "cng", "manual"),
            v("EV XZ+", "electric", "automatic"),
          ]),
        ],
      },
    ],
  },
  {
    name: "Mahindra",
    models: [
      {
        name: "Thar",
        body: "suv",
        seats: 4,
        generations: [
          gen("1st gen", 2010, 2020, [v("CRDe", "diesel", "manual", 6)]),
          gen("2nd gen", 2020, null, [
            v("AX(O) Diesel", "diesel", "manual"),
            v("LX Petrol AT", "petrol", "automatic"),
            v("LX Diesel AT", "diesel", "automatic"),
          ]),
        ],
      },
      {
        name: "Thar Roxx",
        body: "suv",
        seats: 5,
        generations: [
          gen("1st gen", 2024, null, [
            v("MX1", "petrol", "manual"),
            v("MX5 Diesel", "diesel", "manual"),
            v("AX7L Diesel AT", "diesel", "automatic"),
          ]),
        ],
      },
      {
        name: "Scorpio-N",
        body: "suv",
        seats: 7,
        generations: [
          gen("1st gen", 2022, null, [
            v("Z2", "petrol", "manual"),
            v("Z4 Diesel", "diesel", "manual"),
            v("Z8L Diesel AT", "diesel", "automatic", 6),
          ]),
        ],
      },
      {
        name: "XUV700",
        body: "suv",
        seats: 7,
        generations: [
          gen("1st gen", 2021, null, [
            v("MX", "petrol", "manual", 5),
            v("AX5 Diesel", "diesel", "manual"),
            v("AX7L Diesel AT", "diesel", "automatic"),
          ]),
        ],
      },
      {
        name: "XUV 3XO",
        body: "compact_suv",
        seats: 5,
        generations: [
          gen("1st gen", 2024, null, [
            v("MX1", "petrol", "manual"),
            v("AX5 Diesel", "diesel", "manual"),
            v("AX7L Turbo AT", "petrol", "automatic"),
          ]),
        ],
      },
    ],
  },
  {
    name: "Kia",
    models: [
      {
        name: "Seltos",
        body: "suv",
        seats: 5,
        generations: [
          gen("1st gen", 2019, null, [
            v("HTE", "petrol", "manual"),
            v("HTK+ Diesel", "diesel", "manual"),
            v("GTX+ Turbo DCT", "petrol", "automatic"),
            v("X-Line Diesel AT", "diesel", "automatic"),
          ]),
        ],
      },
      {
        name: "Sonet",
        body: "compact_suv",
        seats: 5,
        generations: [
          gen("1st gen", 2020, null, [
            v("HTE", "petrol", "manual"),
            v("HTK+ Diesel", "diesel", "manual"),
            v("GTX+ Turbo DCT", "petrol", "automatic"),
          ]),
        ],
      },
      {
        name: "Carens",
        body: "muv",
        seats: 7,
        generations: [
          gen("1st gen", 2022, null, [
            v("Premium", "petrol", "manual"),
            v("Prestige Diesel", "diesel", "manual", 6),
            v("Luxury Plus Turbo DCT", "petrol", "automatic", 6),
          ]),
        ],
      },
    ],
  },
  {
    name: "Toyota",
    models: [
      {
        name: "Innova Crysta",
        body: "muv",
        seats: 7,
        generations: [
          gen("1st gen", 2016, null, [
            v("GX", "diesel", "manual", 8),
            v("VX", "diesel", "manual"),
            v("ZX", "diesel", "manual"),
          ]),
        ],
      },
      {
        name: "Innova Hycross",
        body: "muv",
        seats: 7,
        generations: [
          gen("1st gen", 2022, null, [
            v("GX", "petrol", "automatic", 8),
            v("VX Hybrid", "hybrid", "automatic"),
            v("ZX(O) Hybrid", "hybrid", "automatic"),
          ]),
        ],
      },
      {
        name: "Fortuner",
        body: "suv",
        seats: 7,
        generations: [
          gen("2nd gen", 2016, null, [
            v("4x2 Petrol AT", "petrol", "automatic"),
            v("4x2 Diesel MT", "diesel", "manual"),
            v("Legender 4x4 AT", "diesel", "automatic"),
          ]),
        ],
      },
      {
        name: "Urban Cruiser Hyryder",
        body: "suv",
        seats: 5,
        generations: [
          gen("1st gen", 2022, null, [
            v("E", "petrol", "manual"),
            v("S CNG", "cng", "manual"),
            v("V Hybrid", "hybrid", "automatic"),
          ]),
        ],
      },
    ],
  },
  {
    name: "Honda",
    models: [
      {
        name: "City",
        body: "sedan",
        seats: 5,
        generations: [
          gen("4th gen", 2014, 2020, [
            v("SV", "petrol", "manual"),
            v("V Diesel", "diesel", "manual"),
            v("ZX CVT", "petrol", "automatic"),
          ]),
          gen("5th gen", 2020, null, [
            v("SV", "petrol", "manual"),
            v("VX CVT", "petrol", "automatic"),
            v("ZX e:HEV", "hybrid", "automatic"),
          ]),
        ],
      },
      {
        name: "Amaze",
        body: "sedan",
        seats: 5,
        generations: [
          gen("2nd gen", 2018, 2024, [
            v("E", "petrol", "manual"),
            v("S Diesel", "diesel", "manual"),
            v("VX CVT", "petrol", "automatic"),
          ]),
          gen("3rd gen", 2024, null, [
            v("V", "petrol", "manual"),
            v("VX CVT", "petrol", "automatic"),
            v("ZX CVT", "petrol", "automatic"),
          ]),
        ],
      },
      {
        name: "Elevate",
        body: "suv",
        seats: 5,
        generations: [
          gen("1st gen", 2023, null, [
            v("SV", "petrol", "manual"),
            v("V CVT", "petrol", "automatic"),
            v("ZX CVT", "petrol", "automatic"),
          ]),
        ],
      },
    ],
  },
]
