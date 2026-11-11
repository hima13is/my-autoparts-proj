import type { Meta, StoryObj } from "@storybook/react-vite"
import { ArrowRight, Heart, ShoppingCart, X } from "lucide-react"
import { Button } from "./Button"
import { IconButton } from "./IconButton"

const meta = {
  title: "Components/Button",
  component: Button,
  tags: ["autodocs"],
  args: { children: "Add to cart", variant: "primary", size: "md" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["primary", "secondary", "outline", "ghost", "danger"],
    },
    size: { control: "inline-radio", options: ["md", "lg"] },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = { args: { leadingIcon: <ShoppingCart className="size-5" /> } }
export const Secondary: Story = { args: { variant: "secondary", children: "Check another car" } }
export const Outline: Story = { args: { variant: "outline", children: "Save for later" } }
export const Ghost: Story = { args: { variant: "ghost", children: "Skip" } }
export const Danger: Story = { args: { variant: "danger", children: "Remove item" } }
export const Large: Story = {
  args: {
    size: "lg",
    children: "Show accessories",
    trailingIcon: <ArrowRight className="size-5" />,
  },
}
export const Loading: Story = { args: { loading: true, children: "Adding…" } }
export const Disabled: Story = { args: { disabled: true } }
export const FullWidth: Story = {
  args: { fullWidth: true, size: "lg" },
  parameters: { layout: "padded" },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </div>
      <div className="flex flex-wrap gap-3">
        <Button disabled>Primary</Button>
        <Button variant="secondary" disabled>
          Secondary
        </Button>
        <Button variant="outline" disabled>
          Outline
        </Button>
        <Button loading>Loading</Button>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <IconButton label="Save to wishlist" icon={<Heart />} />
        <IconButton label="Save to wishlist" icon={<Heart />} variant="outline" />
        <IconButton label="Close" icon={<X />} variant="solid" />
        <IconButton label="Open cart" icon={<ShoppingCart />} variant="outline" count={2} />
        <div className="rounded-xl bg-ink p-1">
          <IconButton label="Open cart" icon={<ShoppingCart />} variant="on-dark" count={12} />
        </div>
      </div>
    </div>
  ),
}
