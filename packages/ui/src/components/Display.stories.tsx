import type { Meta, StoryObj } from "@storybook/react-vite"
import { Tag } from "lucide-react"
import { Badge, FitBadge } from "./Badge"
import { Card } from "./Card"
import { PriceBlock } from "./PriceBlock"
import { Rating } from "./Rating"

const meta = {
  title: "Components/Badge, price & rating",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Bestseller" },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Badges: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <FitBadge status="fits" car="Creta" />
      <FitBadge status="no-fit" car="Creta" />
      <FitBadge status="unknown" />
      <Badge tone="offer" icon={<Tag />}>
        42% off
      </Badge>
      <Badge tone="info">New</Badge>
      <Badge>Universal fit</Badge>
    </div>
  ),
}

export const Prices: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <PriceBlock price={3499} mrp={5999} />
      <PriceBlock price={1899} />
      <PriceBlock price={125000} mrp={149999} size="lg" showTaxNote />
    </div>
  ),
}

export const Ratings: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Rating value={4.4} count={210} />
      <Rating value={3.5} count={12} size="md" />
      <Rating value={5} count={1} />
      <Rating value={0} count={0} />
    </div>
  ),
}

export const Cards: Story = {
  render: () => (
    <div className="grid max-w-xl gap-4 sm:grid-cols-2">
      <Card>
        <h3 className="font-heading font-semibold text-ink">Card</h3>
        <p className="text-graphite">White surface, Sand border, on the cream page.</p>
      </Card>
      <Card padding="lg" as="section" aria-label="Large card">
        <h3 className="font-heading font-semibold text-ink">Large padding</h3>
        <p className="text-graphite">Used for checkout steps and the fitment panel.</p>
      </Card>
    </div>
  ),
}
