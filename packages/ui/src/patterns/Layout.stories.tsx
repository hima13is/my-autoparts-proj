import type { Meta, StoryObj } from "@storybook/react-vite"
import { CarChip } from "../vehicle/CarChip"
import { Footer } from "./Footer"
import { Header } from "./Header"
import { TrustStrip } from "./TrustStrip"

const meta = {
  title: "Patterns/Header & footer",
  component: Header,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: {
    cartCount: 2,
    onMenu: () => {},
    homeHref: "#",
    cartHref: "#",
    accountHref: "#",
    wishlistHref: "#",
  },
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof meta>

export const SiteHeader: Story = {}
export const WithCarChip: Story = {
  args: { children: <CarChip label="Hyundai Creta 2021 SX Diesel" onChange={() => {}} /> },
}
export const EmptyCart: Story = { args: { cartCount: 0 } }
export const MobileHeader: Story = {
  args: { children: <CarChip label="Hyundai Creta 2021 SX Diesel" onChange={() => {}} /> },
  globals: { viewport: { value: "mobile360" } },
}

export const SiteFooter: Story = { render: () => <Footer /> }
export const Trust: Story = {
  parameters: { layout: "padded" },
  render: () => <TrustStrip />,
}
