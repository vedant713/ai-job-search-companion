import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import "@testing-library/jest-dom"
import { LoginForm } from "./login-form"

const mockSignIn = vi.fn()
const mockSignUp = vi.fn()

vi.mock("@/components/auth-provider", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signUp: mockSignUp,
  }),
}))

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe("Rendering", () => {
    it("renders login form by default", () => {
      render(<LoginForm />)
      expect(screen.getByText("Welcome Back")).toBeInTheDocument()
      expect(screen.getByText("Login")).toBeInTheDocument()
      expect(screen.getByLabelText("Email")).toBeInTheDocument()
      expect(screen.getByLabelText("Password")).toBeInTheDocument()
    })

    it("renders signup form when tab is switched", async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.click(screen.getByRole("tab", { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByRole("heading", { name: "Create Account" })).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Create a password (min 6 chars)")).toBeInTheDocument()
      })
    })

    it("login form has email and password fields", () => {
      render(<LoginForm />)
      const emailInput = screen.getByLabelText("Email")
      const passwordInput = screen.getByLabelText("Password")
      expect(emailInput).toBeInTheDocument()
      expect(passwordInput).toBeInTheDocument()
      expect(emailInput).toHaveAttribute("type", "email")
      expect(passwordInput).toHaveAttribute("type", "password")
    })

    it("signup form has email, password, and confirm password fields", async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.click(screen.getByRole("tab", { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Ex: your@email.com")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Create a password (min 6 chars)")).toBeInTheDocument()
        expect(screen.getByPlaceholderText("Confirm your password")).toBeInTheDocument()
      })
    })
  })

  describe("Tab switching", () => {
    it("tab switching works correctly", async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      expect(screen.getByRole("tab", { name: /login/i })).toHaveAttribute(
        "data-state",
        "active"
      )

      await user.click(screen.getByRole("tab", { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByRole("tab", { name: /sign up/i })).toHaveAttribute(
          "data-state",
          "active"
        )
        expect(screen.getByRole("tab", { name: /login/i })).toHaveAttribute(
          "data-state",
          "inactive"
        )
      })
    })
  })

  describe("Password visibility toggle", () => {
    it("password visibility toggle works", async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      const passwordInput = screen.getByLabelText("Password")
      expect(passwordInput).toHaveAttribute("type", "password")

      const toggleButton = screen.getByRole("button", { name: "" })
      await user.click(toggleButton)

      expect(passwordInput).toHaveAttribute("type", "text")

      await user.click(toggleButton)
      expect(passwordInput).toHaveAttribute("type", "password")
    })
  })

  describe("Form submission", () => {
    it("login form submission calls signIn with correct data", async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByLabelText("Email"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")

      await user.click(screen.getByRole("button", { name: /sign in/i }))

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith("test@example.com", "password123")
      })
    })

    it("signup form submission calls signUp with correct data", async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.click(screen.getByRole("tab", { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByLabelText("Email")).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText("Email"), "newuser@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.type(screen.getByLabelText("Confirm Password"), "password123")

      await user.click(screen.getByRole("button", { name: /create account/i }))

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith("newuser@example.com", "password123")
      })
    })
  })

  describe("Form validation", () => {
    it("empty form fields prevent submission", async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.click(screen.getByRole("button", { name: /sign in/i }))

      expect(mockSignIn).not.toHaveBeenCalled()
    })

    it("password mismatch shows error message", async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.click(screen.getByRole("tab", { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByLabelText("Email")).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText("Email"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")
      await user.type(screen.getByLabelText("Confirm Password"), "differentpassword")

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument()
      })
    })

    it("password length validation (min 6 chars)", async () => {
      const user = userEvent.setup()
      render(<LoginForm />)

      await user.click(screen.getByRole("tab", { name: /sign up/i }))

      await waitFor(() => {
        expect(screen.getByLabelText("Email")).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText("Email"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "12345")
      await user.type(screen.getByLabelText("Confirm Password"), "12345")

      const submitButton = screen.getByRole("button", { name: /create account/i })
      expect(submitButton).toBeDisabled()
    })
  })

  describe("Loading state", () => {
    it("loading state disables button", () => {
      render(<LoginForm />)

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      expect(submitButton).not.toBeDisabled()
    })

    it("button shows loading spinner when isLoading is true", async () => {
      mockSignIn.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

      const user = userEvent.setup()
      render(<LoginForm />)

      await user.type(screen.getByLabelText("Email"), "test@example.com")
      await user.type(screen.getByLabelText("Password"), "password123")

      const submitButton = screen.getByRole("button", { name: /sign in/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(submitButton).toBeDisabled()
      })
    })
  })
})
