import request from "supertest";
import { app } from "../server.js";

describe("Health & System Metadata Endpoints", () => {
  describe("GET /health", () => {
    it("should return 200 with service health status and timestamp", async () => {
      const res = await request(app).get("/health");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("status", "ok");
      expect(res.body).toHaveProperty("service", "SanchitX Backend");
      expect(res.body).toHaveProperty("timestamp");
    });
  });

  describe("GET /api/models", () => {
    it("should return 200 with available Groq AI models and default active model", async () => {
      const res = await request(app).get("/api/models");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("activeModel");
      expect(res.body).toHaveProperty("models");
      expect(Array.isArray(res.body.models)).toBe(true);
      expect(res.body.models.length).toBeGreaterThan(0);

      const firstModel = res.body.models[0];
      expect(firstModel).toHaveProperty("id");
      expect(firstModel).toHaveProperty("name");
      expect(firstModel).toHaveProperty("isDefault");
    });
  });
});
