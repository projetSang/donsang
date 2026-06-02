import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiUrl, apiFetch } from "./api";

describe("api helper", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("apiUrl", () => {
    it("should format endpoint correctly", () => {
      expect(apiUrl("/test")).toBe("/api/test");
      expect(apiUrl("test")).toBe("/api/test");
    });
  });

  describe("apiFetch", () => {
    it("should fetch successfully", async () => {
      const mockResponse = { data: "success" };
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      vi.stubGlobal("fetch", fetchSpy);

      const result = await apiFetch("/users");
      expect(result).toEqual(mockResponse);
      expect(fetchSpy).toHaveBeenCalledWith("/api/users", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
    });

    it("should handle FormData correctly without setting Content-Type", async () => {
      const mockResponse = { data: "uploaded" };
      const formData = new FormData();
      formData.append("file", "test");

      const fetchSpy = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });
      vi.stubGlobal("fetch", fetchSpy);

      const result = await apiFetch("/upload", {
        method: "POST",
        body: formData,
      });

      expect(result).toEqual(mockResponse);
      expect(fetchSpy).toHaveBeenCalledWith("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });
    });

    it("should handle general API error with JSON message", async () => {
      const errorJson = { message: "Something went wrong" };
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => errorJson,
      });
      vi.stubGlobal("fetch", fetchSpy);

      await expect(apiFetch("/error")).rejects.toThrow("Something went wrong");
    });

    it("should handle API error when JSON parsing fails", async () => {
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error("Invalid JSON");
        },
        text: async () => "Internal Server Error",
      });
      vi.stubGlobal("fetch", fetchSpy);

      await expect(apiFetch("/fatal")).rejects.toThrow("API Error: 500 - Internal Server Error");
    });

    it("should handle 422 validation errors", async () => {
      const validationError = {
        message: "Validation failed",
        errors: {
          email: ["Email already exists"],
          password: ["Password too short"],
        },
      };
      const fetchSpy = vi.fn().mockResolvedValue({
        ok: false,
        status: 422,
        json: async () => validationError,
      });
      vi.stubGlobal("fetch", fetchSpy);

      try {
        await apiFetch("/register");
        // Should not reach here
        expect(true).toBe(false);
      } catch (err: any) {
        expect(err.message).toBe("Validation failed");
        expect(err.errors).toEqual(validationError.errors);
      }
    });
  });
});
