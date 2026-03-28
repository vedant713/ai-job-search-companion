import { describe, it, expect, vi, beforeEach } from "vitest"
import {
  generateToken,
  verifyToken,
  getUserIdFromToken,
  hashPassword,
  comparePassword,
  JWTPayload,
} from "./auth"

vi.mock("jsonwebtoken", () => {
  const jwt = vi.fn()
  return {
    default: {
      sign: vi.fn(),
      verify: vi.fn(),
    },
    __esModule: true,
  }
})

vi.mock("bcryptjs", () => {
  return {
    default: {
      hash: vi.fn(),
      compare: vi.fn(),
    },
    __esModule: true,
  }
})

import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

const mockJwt = jwt as unknown as {
  sign: ReturnType<typeof vi.fn>
  verify: ReturnType<typeof vi.fn>
}
const mockBcrypt = bcrypt as unknown as {
  hash: ReturnType<typeof vi.fn>
  compare: ReturnType<typeof vi.fn>
}

describe("auth utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("generateToken", () => {
    it("creates a valid JWT token with correct payload", () => {
      const userId = 123
      const email = "test@example.com"
      const mockToken = "mock.jwt.token"

      mockJwt.sign.mockReturnValue(mockToken)

      const result = generateToken(userId, email)

      expect(mockJwt.sign).toHaveBeenCalledWith(
        { userId, email },
        expect.any(String),
        { expiresIn: "7d" }
      )
      expect(result).toBe(mockToken)
    })
  })

  describe("verifyToken", () => {
    it("verifies a valid token and returns payload", () => {
      const mockToken = "valid.jwt.token"
      const mockPayload: JWTPayload = {
        userId: 123,
        email: "test@example.com",
        iat: 1234567890,
        exp: 1234567890 + 7 * 24 * 60 * 60,
      }

      mockJwt.verify.mockReturnValue(mockPayload)

      const result = verifyToken(mockToken)

      expect(mockJwt.verify).toHaveBeenCalledWith(mockToken, expect.any(String))
      expect(result).toEqual(mockPayload)
    })

    it("returns null for invalid token", () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error("invalid signature")
      })

      const result = verifyToken("invalid.token")

      expect(result).toBeNull()
    })

    it("returns null for expired token", () => {
      mockJwt.verify.mockImplementation(() => {
        throw new Error("jwt expired")
      })

      const result = verifyToken("expired.token")

      expect(result).toBeNull()
    })
  })

  describe("getUserIdFromToken", () => {
    it("extracts userId from valid Bearer token", async () => {
      const { NextRequest } = await import("next/server")
      const mockPayload: JWTPayload = {
        userId: 42,
        email: "user@test.com",
        iat: 1234567890,
        exp: 1234567890 + 7 * 24 * 60 * 60,
      }

      mockJwt.verify.mockReturnValue(mockPayload)

      const request = new NextRequest("http://localhost", {
        headers: {
          authorization: "Bearer valid.token.here",
        },
      })

      const result = getUserIdFromToken(request)

      expect(mockJwt.verify).toHaveBeenCalledWith("valid.token.here", expect.any(String))
      expect(result).toBe(42)
    })

    it("returns null for missing authorization header", async () => {
      const { NextRequest } = await import("next/server")

      const request = new NextRequest("http://localhost", {
        headers: {},
      })

      const result = getUserIdFromToken(request)

      expect(mockJwt.verify).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it("returns null for non-Bearer authorization header", async () => {
      const { NextRequest } = await import("next/server")

      const request = new NextRequest("http://localhost", {
        headers: {
          authorization: "Basic somecredentials",
        },
      })

      const result = getUserIdFromToken(request)

      expect(mockJwt.verify).not.toHaveBeenCalled()
      expect(result).toBeNull()
    })

    it("returns null for empty Bearer token", async () => {
      const { NextRequest } = await import("next/server")

      const request = new NextRequest("http://localhost", {
        headers: {
          authorization: "Bearer ",
        },
      })

      const result = getUserIdFromToken(request)

      expect(result).toBeNull()
    })
  })

  describe("hashPassword", () => {
    it("creates a hash from password", async () => {
      const password = "securePassword123"
      const mockHash = "$2a$10$hashedpassword"

      mockBcrypt.hash.mockResolvedValue(mockHash)

      const result = await hashPassword(password)

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 10)
      expect(result).toBe(mockHash)
    })
  })

  describe("comparePassword", () => {
    it("returns true for matching password", async () => {
      const password = "correctPassword"
      const hash = "$2a$10$hashedpassword"

      mockBcrypt.compare.mockResolvedValue(true)

      const result = await comparePassword(password, hash)

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hash)
      expect(result).toBe(true)
    })

    it("returns false for non-matching password", async () => {
      const password = "wrongPassword"
      const hash = "$2a$10$hashedpassword"

      mockBcrypt.compare.mockResolvedValue(false)

      const result = await comparePassword(password, hash)

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hash)
      expect(result).toBe(false)
    })
  })

  describe("token expiration handling", () => {
    it("generates token with 7d expiration", () => {
      const userId = 1
      const email = "test@test.com"

      mockJwt.sign.mockReturnValue("token")

      generateToken(userId, email)

      expect(mockJwt.sign).toHaveBeenCalledWith(
        { userId, email },
        expect.any(String),
        { expiresIn: "7d" }
      )
    })

    it("verifies that expired tokens return null via verifyToken", () => {
      mockJwt.verify.mockImplementation(() => {
        const error = new Error("jwt expired")
        error.name = "TokenExpiredError"
        throw error
      })

      const result = verifyToken("expired.token")

      expect(result).toBeNull()
    })
  })
})
