import type { Meta, StoryObj } from "@storybook/react-vite"
import { SearchX, ShoppingCart } from "lucide-react"
import { Breadcrumb } from "./Breadcrumb"
import { Button } from "./Button"
import { EmptyState } from "./EmptyState"
import { Pagination } from "./Pagination"

const meta = {
  title: "Components/Navigation & empty states",
  component: Breadcrumb,
  tags: ["autodocs"],
  args: {
    items: [
      { label: "Home", href: "#" },
      { label: "Interior", href: "#" },
      { label: "Seat covers" },
    ],
  },
} satisfies Meta<typeof Breadcrumb>

export default meta
type Story = StoryObj<typeof meta>

export const Breadcrumbs: Story = {}

export const PaginationStart: Story = {
  render: () => <Pagination current={1} total={12} href={(p) => `#page-${p}`} />,
}
export const PaginationMiddle: Story = {
  render: () => <Pagination current={6} total={12} href={(p) => `#page-${p}`} />,
}
export const PaginationEnd: Story = {
  render: () => <Pagination current={12} total={12} href={(p) => `#page-${p}`} />,
}

export const EmptyCart: Story = {
  render: () => (
    <EmptyState
      icon={<ShoppingCart />}
      title="Your cart is empty"
      action={<Button>Shop accessories for your car</Button>}
    >
      Pick your car and we&apos;ll show you accessories that fit it.
    </EmptyState>
  ),
}

export const NoResults: Story = {
  render: () => (
    <EmptyState icon={<SearchX />} title="No results for “seet cvr hydai”">
      Check the spelling, or try a shorter search like “seat cover”.
    </EmptyState>
  ),
}
