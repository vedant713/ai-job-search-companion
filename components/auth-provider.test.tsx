import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, act, waitFor } from "@testing-library/react"
import React from "react"

vi.mock("@/hooks/use-toast", () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
    dismiss: vi.fn(),
    toasts: [],
  })),
}))

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  })),
}))

const mockFetch = vi.fn()
global.fetch = mockFetch

import { AuthProvider, useAuth } from "./auth-provider"

function TestComponent() {
  const auth = useAuth()
  return React.createElement(
    "div",
    null,
    React.createElement("span", { "data-testid": "loading" }, auth.loading.toString()),
    React.createElement("span", { "data-testid": "user" }, auth.user?.email || "null"),
    React.createElement("span", { "data-testid": "isLocalMode" }, auth.isLocalMode.toString()),
    React.createElement(
      "button",
      { onClick: () => auth.signIn("test@test.com", "password"), "data-testid": "signIn-btn" },
      "signIn"
    ),
    React.createElement(
      "button",
      { onClick: () => auth.signOut(), "data-testid": "signOut-btn" },
      "signOut"
    ),
    React.createElement(
      "button",
      { onClick: () => auth.signUp("new@test.com", "password"), "data-testid": "signUp-btn" },
      "signUp"
    )
  )
}

function OutsideAuthProviderTestComponent() {
  let errorMessage = ""
  try {
    const auth = useAuth()
    return React.createElement("div", { "data-testid": "inside-auth" }, auth.user?.email || "no-user")
  } catch (error: any) {
    errorMessage = error.message
    return React.createElement("div", { "data-testid": "error-message" }, errorMessage)
  }
}

describe("useAuth hook", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockReset()
  })

  describe("Context value shape", () => {
    it("provides user, loading, signUp, signIn, signOut, and isLocalMode", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userId: "test-user-id",
          profile: null,
        }),
      })

      let contextValue: any = null

      function CaptureContextComponent() {
        const auth = useAuth()
        contextValue = auth
        return React.createElement("div", null, "captured")
      }

      render(
        React.createElement(
          AuthProvider,
          null,
          React.createElement(CaptureContextComponent, null)
        )
      )

      await waitFor(() => {
        expect(contextValue).toBeDefined()
      })

      expect(contextValue).toHaveProperty("user")
      expect(contextValue).toHaveProperty("loading")
      expect(contextValue).toHaveProperty("signUp")
      expect(contextValue).toHaveProperty("signIn")
      expect(contextValue).toHaveProperty("signOut")
      expect(contextValue).toHaveProperty("isLocalMode")
    })

    it("user can be null when not authenticated", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: null,
        }),
      })

      render(
        React.createElement(
          AuthProvider,
          null,
          React.createElement(TestComponent, null)
        )
      )

      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("null")
      })
    })

    it("loading starts as true and becomes false after initialization", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userId: "test-user-id",
          profile: null,
        }),
      })

      render(
        React.createElement(
          AuthProvider,
          null,
          React.createElement(TestComponent, null)
        )
      )

      expect(screen.getByTestId("loading").textContent).toBe("true")

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false")
      })
    })

    it("isLocalMode is true when local db returns ok", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userId: "local-user-id",
          profile: null,
        }),
      })

      render(
        React.createElement(
          AuthProvider,
          null,
          React.createElement(TestComponent, null)
        )
      )

      await waitFor(() => {
        expect(screen.getByTestId("isLocalMode").textContent).toBe("true")
      })
    })
  })

  describe("useAuth error handling", () => {
    it("throws error when used outside AuthProvider", () => {
      render(React.createElement(OutsideAuthProviderTestComponent, null))

      expect(screen.getByTestId("error-message").textContent).toBe(
        "useAuth must be used within an AuthProvider"
      )
    })
  })

  describe("signIn", () => {
    it("updates user state when signIn is called", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userId: "initial-user-id",
          profile: null,
        }),
      })

      render(
        React.createElement(
          AuthProvider,
          null,
          React.createElement(TestComponent, null)
        )
      )

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false")
      })

      const signInProfile = {
        id: "signed-in-user-id",
        email: "signedin@test.com",
        full_name: "Signed In User",
        avatar_url: null,
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          profile: signInProfile,
        }),
      })

      await act(async () => {
        screen.getByTestId("signIn-btn").click()
      })

      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("signedin@test.com")
      })
    })
  })

  describe("signOut", () => {
    it("clears user state when signOut is called", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userId: "test-user-id",
          profile: null,
        }),
      })

      render(
        React.createElement(
          AuthProvider,
          null,
          React.createElement(TestComponent, null)
        )
      )

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false")
      })

      expect(screen.getByTestId("user").textContent).not.toBe("null")

      await act(async () => {
        screen.getByTestId("signOut-btn").click()
      })

      await waitFor(() => {
        expect(screen.getByTestId("user").textContent).toBe("null")
      })
    })
  })

  describe("signUp", () => {
    it("shows toast warning in local mode", async () => {
      const { useToast } = await import("@/hooks/use-toast")
      const mockToast = vi.fn()
      ;(useToast as ReturnType<typeof vi.fn>).mockReturnValue({
        toast: mockToast,
        dismiss: vi.fn(),
        toasts: [],
      })

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          userId: "test-user-id",
          profile: null,
        }),
      })

      render(
        React.createElement(
          AuthProvider,
          null,
          React.createElement(TestComponent, null)
        )
      )

      await waitFor(() => {
        expect(screen.getByTestId("loading").textContent).toBe("false")
      })

      await act(async () => {
        screen.getByTestId("signUp-btn").click()
      })

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "Local Mode",
          description: "Sign up is disabled in local mode. Using default local user.",
        })
      })
    })
  })
})
