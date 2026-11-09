import type { Meta, StoryObj } from "@storybook/react-vite"
import { MapPin } from "lucide-react"
import { Checkbox, Input, RadioGroup, Select } from "./Field"

const meta = {
  title: "Components/Form fields",
  component: Input,
  tags: ["autodocs"],
  args: { label: "PIN code" },
  decorators: [(Story) => <div className="max-w-sm">{Story()}</div>],
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const TextInput: Story = {
  args: {
    label: "PIN code",
    inputMode: "numeric",
    placeholder: "e.g. 560034",
    leading: <MapPin className="size-5" />,
  },
}
export const WithHint: Story = {
  args: {
    label: "Mobile number",
    leading: "+91",
    inputMode: "tel",
    hint: "We'll send a 6-digit OTP.",
  },
}
export const WithError: Story = {
  args: { label: "PIN code", defaultValue: "5600", error: "Enter a 6-digit PIN code." },
}
export const DisabledInput: Story = {
  args: { label: "City", defaultValue: "Bengaluru", disabled: true },
}

export const NativeSelect: Story = {
  render: () => (
    <Select
      label="Make"
      placeholder="Select make"
      options={[
        { value: "hyundai", label: "Hyundai" },
        { value: "maruti", label: "Maruti Suzuki" },
        { value: "tata", label: "Tata" },
      ]}
    />
  ),
}

export const SelectWithError: Story = {
  render: () => (
    <Select
      label="State"
      placeholder="Select state"
      error="Select your state."
      options={[{ value: "ka", label: "Karnataka" }]}
    />
  ),
}

export const Checkboxes: Story = {
  render: () => (
    <div className="flex flex-col">
      <Checkbox label="Fits my car only" defaultChecked />
      <Checkbox label="Cash on delivery available" />
      <Checkbox label="I need a GST invoice" hint="Add your GSTIN at checkout." />
      <Checkbox label="Out of stock items" disabled />
    </div>
  ),
}

export const Radios: Story = {
  render: () => (
    <RadioGroup
      legend="Payment method"
      name="payment"
      defaultValue="upi"
      options={[
        { value: "upi", label: "UPI", hint: "GPay, PhonePe, Paytm" },
        { value: "card", label: "Credit or debit card" },
        { value: "cod", label: "Cash on delivery", hint: "+₹49 fee" },
      ]}
    />
  ),
}
