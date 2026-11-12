import type { Meta, StoryObj } from "@storybook/react-vite"
import { demoProducts, productImage } from "../fixtures"
import { ProductCard } from "./ProductCard"
import { ProductCardSkeleton, Skeleton } from "./Skeleton"

const p = demoProducts[0]

const meta = {
  title: "Components/ProductCard",
  component: ProductCard,
  tags: ["autodocs"],
  args: {
    href: `#${p.slug}`,
    title: p.title,
    brand: p.brand,
    image: { src: productImage(p.kind), alt: p.alt },
    price: p.price,
    mrp: p.mrp,
    rating: p.rating,
    fit: { status: "fits", car: "Creta" },
    delivery: p.delivery,
  },
  decorators: [(Story) => <div className="w-56">{Story()}</div>],
} satisfies Meta<typeof ProductCard>

export default meta
type Story = StoryObj<typeof meta>

export const Fits: Story = {}
export const DoesNotFit: Story = { args: { fit: { status: "no-fit", car: "Creta" } } }
export const CheckFitment: Story = { args: { fit: { status: "unknown" } } }
export const FitsAllCars: Story = { args: { fit: { status: "universal" } } }
export const NoDiscount: Story = {
  args: { mrp: undefined, title: "3D Fabric Seat Covers with lumbar support" },
}

export const Grid: Story = {
  decorators: [(Story) => <div className="w-full max-w-5xl">{Story()}</div>],
  render: () => (
    <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {demoProducts.map((d) => (
        <li key={d.slug}>
          <ProductCard
            href={`#${d.slug}`}
            title={d.title}
            brand={d.brand}
            image={{ src: productImage(d.kind), alt: d.alt }}
            price={d.price}
            mrp={d.mrp}
            rating={d.rating}
            fit={{ status: d.fit, car: "Creta" }}
            delivery={d.delivery}
          />
        </li>
      ))}
    </ul>
  ),
}

export const Loading: Story = {
  decorators: [(Story) => <div className="w-full max-w-5xl">{Story()}</div>],
  render: () => (
    <section aria-busy="true" aria-label="Loading products" className="flex flex-col gap-4">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </section>
  ),
}
