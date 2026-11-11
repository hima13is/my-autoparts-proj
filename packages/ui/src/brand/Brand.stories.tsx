import type { Meta, StoryObj } from "@storybook/react-vite"
import { Logo, LogoMark } from "../logo/Logo"
import { BrandSheet } from "./BrandSheet"

const meta = {
  title: "Brand/Brand sheet",
  component: BrandSheet,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BrandSheet>

export default meta
type Story = StoryObj<typeof meta>

export const Sheet: Story = {}

export const Wordmark: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-col gap-6">
      <Logo className="h-16" />
      <div className="w-fit rounded-card bg-ink p-6">
        <Logo tone="dark" className="h-16" />
      </div>
      <LogoMark className="size-24" title="FitGaadi app icon" />
    </div>
  ),
}
