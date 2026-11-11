import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { expect, userEvent, within } from "storybook/test"
import { Accordion } from "./Accordion"
import { Button } from "./Button"
import { Sheet } from "./Sheet"
import { Tabs } from "./Tabs"
import { ToastProvider, useToast } from "./Toast"

const meta = {
  title: "Components/Sheet, tabs, accordion & toast",
  component: Sheet,
  tags: ["autodocs"],
  args: { open: false, onClose: () => {}, title: "Filters", children: null },
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

function SheetDemo({ startOpen = false }: { startOpen?: boolean }) {
  const [open, setOpen] = useState(startOpen)
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Open filters
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        title="Filters"
        description="2 selected"
        footer={
          <Button fullWidth onClick={() => setOpen(false)}>
            Show 24 results
          </Button>
        }
      >
        <p className="text-graphite">
          Bottom sheet on phones, centred dialog from 768px. Press Esc to close.
        </p>
        <ul className="mt-3 list-disc pl-5">
          <li>Price</li>
          <li>Brand</li>
          <li>Material</li>
        </ul>
      </Sheet>
    </>
  )
}

export const BottomSheet: Story = {
  render: () => <SheetDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const trigger = canvas.getByRole("button", { name: "Open filters" })
    await userEvent.click(trigger)
    const dialog = within(document.body).getByRole("dialog", { name: "Filters" })
    await expect(dialog).toBeVisible()
    await userEvent.keyboard("{Escape}")
    await expect(dialog).not.toBeVisible()
    await expect(trigger).toHaveFocus()
  },
}

export const ProductTabs: Story = {
  render: () => (
    <Tabs
      label="Product information"
      items={[
        { id: "highlights", label: "Highlights", content: <p>Custom cut for your exact model.</p> },
        { id: "specs", label: "Specifications", content: <p>Material: PU leatherette.</p> },
        {
          id: "box",
          label: "In the box",
          content: <p>2 front, 1 rear bench, 5 headrest covers.</p>,
        },
      ]}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const first = canvas.getByRole("tab", { name: "Highlights" })
    first.focus()
    await userEvent.keyboard("{ArrowRight}")
    await expect(canvas.getByRole("tab", { name: "Specifications" })).toHaveFocus()
    await expect(canvas.getByRole("tabpanel")).toHaveTextContent("PU leatherette")
  },
}

export const Faq: Story = {
  render: () => (
    <Accordion
      exclusive
      items={[
        {
          id: "fit",
          title: "Will this fit my car?",
          content: <p>Only items marked “Fits” are guaranteed for your car.</p>,
          defaultOpen: true,
        },
        {
          id: "cod",
          title: "Is cash on delivery available?",
          content: <p>Yes, on orders up to ₹5,000.</p>,
        },
        {
          id: "returns",
          title: "How do returns work?",
          content: <p>Request a return within 7 days; we pick it up.</p>,
        },
      ]}
    />
  ),
}

function ToastDemo() {
  const toast = useToast()
  return (
    <div className="flex gap-3">
      <Button onClick={() => toast.show("Added to cart")}>Add to cart</Button>
      <Button
        variant="outline"
        onClick={() => toast.show("Couldn't check that PIN code", { tone: "error" })}
      >
        Show error
      </Button>
    </div>
  )
}

export const Toasts: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Add to cart" }))
    await expect(within(document.body).getByRole("status")).toHaveTextContent("Added to cart")
  },
}
