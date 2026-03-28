import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ThemeToggle } from "./theme-toggle"

const mockSetTheme = vi.fn()

vi.mock("next-themes", () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
  }),
}))

describe("ThemeToggle", () => {
  beforeEach(() => {
    mockSetTheme.mockClear()
  })

  it("renders the theme toggle button", () => {
    render(<ThemeToggle />)
    expect(screen.getByRole("button")).toBeInTheDocument()
  })

  it("button has correct aria-label for accessibility", () => {
    render(<ThemeToggle />)
    expect(screen.getByRole("button", { name: /toggle theme/i })).toBeInTheDocument()
  })

  it("clicking the button opens the dropdown menu", async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole("button"))

    expect(screen.getByText("Light")).toBeInTheDocument()
    expect(screen.getByText("Dark")).toBeInTheDocument()
    expect(screen.getByText("System")).toBeInTheDocument()
  })

  it("shows Light, Dark, and System options in dropdown", async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole("button"))

    expect(screen.getByText("Light")).toBeVisible()
    expect(screen.getByText("Dark")).toBeVisible()
    expect(screen.getByText("System")).toBeVisible()
  })

  it("clicking Light option calls setTheme with 'light'", async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole("button"))
    await user.click(screen.getByText("Light"))

    expect(mockSetTheme).toHaveBeenCalledWith("light")
  })

  it("clicking Dark option calls setTheme with 'dark'", async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole("button"))
    await user.click(screen.getByText("Dark"))

    expect(mockSetTheme).toHaveBeenCalledWith("dark")
  })

  it("clicking System option calls setTheme with 'system'", async () => {
    const user = userEvent.setup()
    render(<ThemeToggle />)

    await user.click(screen.getByRole("button"))
    await user.click(screen.getByText("System"))

    expect(mockSetTheme).toHaveBeenCalledWith("system")
  })
})
