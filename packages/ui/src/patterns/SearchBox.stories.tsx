import type { Meta, StoryObj } from "@storybook/react-vite"
import { expect, fn, userEvent, within } from "storybook/test"
import { Header } from "./Header"
import { SearchBox, type SearchSuggestion } from "./SearchBox"

const suggestions: SearchSuggestion[] = [
  { id: "1", label: "Creta 2020–present leatherette seat covers", href: "#1", hint: "Fits Creta" },
  {
    id: "2",
    label: "Steering cover, perforated leather (38 cm)",
    href: "#2",
    hint: "Fits all cars",
  },
  { id: "3", label: "Creta 2020–present 7D floor mats", href: "#3", hint: "Fits Creta" },
]

const meta = {
  title: "Patterns/Search box",
  component: SearchBox,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      // Dark band like the header, with room for the open list.
      <div className="min-h-80 bg-ink p-4">
        <div className="mx-auto max-w-xl">
          <Story />
        </div>
      </div>
    ),
  ],
  args: { suggestions, onNavigate: fn(), onQueryChange: fn() },
} satisfies Meta<typeof SearchBox>

export default meta
type Story = StoryObj<typeof meta>

export const Empty: Story = { args: { suggestions: [] } }

/** What a shopper sees after typing, with fit hints. */
export const WithSuggestions: Story = {
  args: { defaultValue: "seat cover", defaultOpen: true },
}

/** No matches: only the "see all results" row. */
export const NoSuggestions: Story = {
  args: { defaultValue: "zzqxv", defaultOpen: true, suggestions: [] },
}

/** Keyboard: ↓ moves through options, Enter opens one, Esc closes the list. */
export const KeyboardNavigation: Story = {
  args: { suggestions },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement)
    const box = canvas.getByRole("combobox", { name: "Search accessories" })
    await userEvent.type(box, "seat")
    await expect(box).toHaveAttribute("aria-expanded", "true")
    await expect(canvas.getAllByRole("option")).toHaveLength(suggestions.length + 1)

    await userEvent.keyboard("{ArrowDown}{ArrowDown}")
    const second = canvas.getAllByRole("option")[1]
    await expect(second).toHaveAttribute("aria-selected", "true")
    await expect(box).toHaveAttribute("aria-activedescendant", second.id)

    await userEvent.keyboard("{Enter}")
    await expect(args.onNavigate).toHaveBeenCalledWith("#2")

    await userEvent.type(box, "s")
    await userEvent.keyboard("{Escape}")
    await expect(box).toHaveAttribute("aria-expanded", "false")
  },
}

/** In the site header (the slot replaces the plain search form). */
export const InHeader: Story = {
  render: (args) => <Header cartCount={1} onMenu={() => {}} search={<SearchBox {...args} />} />,
}
