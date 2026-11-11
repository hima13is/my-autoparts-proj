import type { Meta, StoryObj } from "@storybook/react-vite"
import { useState } from "react"
import { expect, userEvent, within } from "storybook/test"
import { Button } from "../components/Button"
import { demoCatalog } from "../fixtures"
import { vehicleLabel, type SelectedVehicle } from "./catalog"
import { CarChip } from "./CarChip"
import { VehicleSelectorForm } from "./VehicleSelectorForm"
import { VehicleSelectorSheet } from "./VehicleSelectorSheet"

const meta = {
  title: "Patterns/Vehicle selector",
  component: VehicleSelectorForm,
  tags: ["autodocs"],
  args: { catalog: demoCatalog, onSubmit: () => {} },
} satisfies Meta<typeof VehicleSelectorForm>

export default meta
type Story = StoryObj<typeof meta>

export const HeroForm: Story = {
  decorators: [
    (Story) => <div className="max-w-sm rounded-card bg-white p-5 shadow-card">{Story()}</div>,
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const submit = canvas.getByRole("button", { name: "Show accessories" })
    await expect(submit).toBeDisabled()
    await userEvent.selectOptions(canvas.getByLabelText("Make"), "hyundai")
    await userEvent.selectOptions(canvas.getByLabelText("Model"), "creta")
    await userEvent.selectOptions(canvas.getByLabelText("Year"), "2021")
    await expect(submit).toBeEnabled()
  },
}

function SheetDemo() {
  const [open, setOpen] = useState(false)
  const [car, setCar] = useState<SelectedVehicle>()
  return (
    <div className="flex max-w-md flex-col gap-3">
      <CarChip
        label={car ? vehicleLabel(demoCatalog, car) : undefined}
        onChange={() => setOpen(true)}
      />
      <Button onClick={() => setOpen(true)}>Select your car</Button>
      <VehicleSelectorSheet
        catalog={demoCatalog}
        open={open}
        onClose={() => setOpen(false)}
        onSelect={(v) => {
          setCar(v)
          setOpen(false)
        }}
        onSkip={() => setOpen(false)}
      />
    </div>
  )
}

export const StepByStepSheet: Story = {
  render: () => <SheetDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    await userEvent.click(canvas.getByRole("button", { name: "Select your car" }))
    const sheet = within(within(document.body).getByRole("dialog"))
    await userEvent.type(sheet.getByLabelText("Search makes"), "hyun")
    await userEvent.click(sheet.getByRole("button", { name: "Hyundai" }))
    await userEvent.click(sheet.getByRole("button", { name: "Creta" }))
    await userEvent.click(sheet.getByRole("button", { name: "2021" }))
    await userEvent.click(sheet.getByRole("button", { name: "SX Diesel" }))
    await expect(canvas.getByText("Hyundai Creta 2021 SX Diesel")).toBeVisible()
  },
}

export const CarChips: Story = {
  render: () => (
    <div className="flex max-w-md flex-col gap-2">
      <CarChip label="Hyundai Creta 2021 SX Diesel" onChange={() => {}} />
      <CarChip onChange={() => {}} />
    </div>
  ),
}
