import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { demoCatalog } from "../fixtures"
import { Header } from "../patterns/Header"
import { VehicleSelectorForm } from "../vehicle/VehicleSelectorForm"
import { FitBadge } from "./Badge"
import { Button } from "./Button"
import { Input } from "./Field"
import { IconButton } from "./IconButton"
import { pageRange, Pagination } from "./Pagination"
import { PriceBlock } from "./PriceBlock"
import { ratingLabel } from "./Rating"
import { Sheet } from "./Sheet"
import { Tabs } from "./Tabs"
import { ToastProvider, useToast } from "./Toast"

describe("Button", () => {
  it("is a real button that doesn't submit forms by default", () => {
    render(<Button>Add to cart</Button>)
    expect(screen.getByRole("button", { name: "Add to cart" })).toHaveAttribute("type", "button")
  })

  it("blocks clicks and announces busy while loading", async () => {
    const onClick = vi.fn()
    render(
      <Button loading onClick={onClick}>
        Adding
      </Button>
    )
    const btn = screen.getByRole("button", { name: "Adding" })
    expect(btn).toBeDisabled()
    expect(btn).toHaveAttribute("aria-busy", "true")
    await userEvent.click(btn)
    expect(onClick).not.toHaveBeenCalled()
  })
})

describe("IconButton", () => {
  it("includes the count in its accessible name", () => {
    render(<IconButton label="Open cart" icon={<span />} count={2} />)
    expect(screen.getByRole("button", { name: "Open cart (2 items)" })).toBeInTheDocument()
  })
})

describe("Input", () => {
  it("links the label, hint and error to the field", () => {
    render(<Input label="PIN code" hint="6 digits" error="Enter a 6-digit PIN code." />)
    const field = screen.getByLabelText("PIN code")
    expect(field).toHaveAttribute("aria-invalid", "true")
    expect(field).toHaveAccessibleDescription("6 digits Enter a 6-digit PIN code.")
  })
})

describe("FitBadge", () => {
  it.each([
    ["fits", "Fits Creta"],
    ["no-fit", "Doesn't fit Creta"],
    ["unknown", "Check fitment"],
  ] as const)("%s → %s", (status, text) => {
    render(<FitBadge status={status} car="Creta" />)
    expect(screen.getByText(text)).toBeInTheDocument()
  })
})

describe("PriceBlock", () => {
  it("shows price, struck MRP and a rounded-down discount", () => {
    render(<PriceBlock price={3499} mrp={5999} />)
    expect(screen.getByText("₹3,499")).toBeInTheDocument()
    expect(screen.getByText("₹5,999").closest("s")).not.toBeNull()
    expect(screen.getByText("41% off")).toBeInTheDocument() // 41.67% → 41, never overstated
  })

  it("hides MRP when there is no discount", () => {
    render(<PriceBlock price={1899} mrp={1899} />)
    expect(screen.queryByText(/off/)).toBeNull()
  })
})

describe("ratingLabel", () => {
  it("reads as one sentence with Indian number grouping", () => {
    expect(ratingLabel(4.4, 1204)).toBe("Rated 4.4 out of 5, 1,204 reviews")
    expect(ratingLabel(5, 1)).toBe("Rated 5.0 out of 5, 1 review")
  })
})

describe("Pagination", () => {
  it.each([
    [1, 5, [1, 2, 3, 4, 5]],
    [1, 12, [1, 2, 3, 4, "…", 12]],
    [6, 12, [1, "…", 5, 6, 7, "…", 12]],
    [12, 12, [1, "…", 9, 10, 11, 12]],
  ])("pageRange(%i, %i)", (current, total, expected) => {
    expect(pageRange(current, total)).toEqual(expected)
  })

  it("marks the current page and hides Previous on page 1", () => {
    render(<Pagination current={1} total={3} href={(p) => `?page=${p}`} />)
    const nav = screen.getByRole("navigation", { name: "Pagination" })
    expect(within(nav).getByText("1").closest("[aria-current=page]")).not.toBeNull()
    expect(within(nav).queryByText("Previous")).toBeNull()
    expect(within(nav).getByRole("link", { name: "Next" })).toHaveAttribute("href", "?page=2")
  })
})

describe("Tabs", () => {
  const items = [
    { id: "a", label: "Highlights", content: "A" },
    { id: "b", label: "Specs", content: "B" },
    { id: "c", label: "In the box", content: "C" },
  ]

  it("moves with arrow keys (wrapping) and Home/End; only the active tab is tabbable", async () => {
    render(<Tabs label="Product information" items={items} />)
    const [a, b, c] = screen.getAllByRole("tab")
    expect(a).toHaveAttribute("tabindex", "0")
    expect(b).toHaveAttribute("tabindex", "-1")
    a.focus()
    await userEvent.keyboard("{ArrowRight}")
    expect(b).toHaveFocus()
    expect(screen.getByRole("tabpanel")).toHaveTextContent("B")
    await userEvent.keyboard("{End}")
    expect(c).toHaveFocus()
    await userEvent.keyboard("{ArrowRight}")
    expect(a).toHaveFocus()
    await userEvent.keyboard("{ArrowLeft}")
    expect(c).toHaveFocus()
  })
})

describe("Sheet", () => {
  function Demo() {
    const [open, setOpen] = useState(false)
    return (
      <>
        <button onClick={() => setOpen(true)}>Open filters</button>
        <Sheet open={open} onClose={() => setOpen(false)} title="Filters">
          <p>content</p>
        </Sheet>
      </>
    )
  }

  it("opens as a labelled dialog and returns focus to the trigger on close", async () => {
    render(<Demo />)
    const trigger = screen.getByRole("button", { name: "Open filters" })
    trigger.focus()
    await userEvent.click(trigger)
    const dialog = screen.getByRole("dialog", { name: "Filters" })
    expect(dialog).toHaveAttribute("open")
    await userEvent.click(within(dialog).getByRole("button", { name: "Close" }))
    await vi.waitFor(() => expect(dialog).not.toHaveAttribute("open"))
    await vi.waitFor(() => expect(trigger).toHaveFocus())
  })

  it("closes on Esc (the dialog's cancel event)", async () => {
    render(<Demo />)
    await userEvent.click(screen.getByRole("button", { name: "Open filters" }))
    const dialog = screen.getByRole("dialog", { name: "Filters" })
    dialog.dispatchEvent(new Event("cancel", { cancelable: true }))
    await vi.waitFor(() => expect(dialog).not.toHaveAttribute("open"))
  })
})

describe("Toast", () => {
  function Demo() {
    const toast = useToast()
    return <button onClick={() => toast.show("Added to cart")}>Add</button>
  }

  it("announces messages in a polite live region", async () => {
    render(
      <ToastProvider>
        <Demo />
      </ToastProvider>
    )
    const region = screen.getByRole("status")
    expect(region).toHaveAttribute("aria-live", "polite")
    await userEvent.click(screen.getByRole("button", { name: "Add" }))
    expect(region).toHaveTextContent("Added to cart")
  })
})

describe("VehicleSelectorForm", () => {
  it("cascades make → model → year and resets later choices", async () => {
    const onSubmit = vi.fn()
    render(<VehicleSelectorForm catalog={demoCatalog} onSubmit={onSubmit} />)
    const submit = screen.getByRole("button", { name: "Show accessories" })
    expect(screen.getByLabelText("Model")).toBeDisabled()
    expect(submit).toBeDisabled()

    await userEvent.selectOptions(screen.getByLabelText("Make"), "hyundai")
    await userEvent.selectOptions(screen.getByLabelText("Model"), "creta")
    await userEvent.selectOptions(screen.getByLabelText("Year"), "2021")
    await userEvent.selectOptions(screen.getByLabelText("Variant"), "sx-diesel")
    await userEvent.click(submit)
    expect(onSubmit).toHaveBeenCalledWith({
      makeId: "hyundai",
      modelId: "creta",
      year: 2021,
      variantId: "sx-diesel",
    })

    await userEvent.selectOptions(screen.getByLabelText("Make"), "tata")
    expect(screen.getByLabelText("Model")).toHaveValue("")
    expect(screen.getByLabelText("Year")).toBeDisabled()
    expect(submit).toBeDisabled()
  })
})

describe("Header", () => {
  it("has one search box and a cart link that says how many items", () => {
    render(<Header cartCount={2} />)
    expect(screen.getAllByRole("searchbox")).toHaveLength(1)
    expect(screen.getByRole("link", { name: "Cart, 2 items" })).toHaveAttribute("href", "/cart")
    expect(screen.getByRole("link", { name: "fitgaadi home" })).toBeInTheDocument()
  })
})
