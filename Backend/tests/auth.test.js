import request from "supertest";
import { app } from "../server.js";

describe("Authentication & Session Endpoints (/api/auth)", () => {
  const testUser = {
    name: "Test Engineer",
    email: `test_${Date.now()}@sanchitx.ai`,
    password: "Password123!"
  };

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully with 201 status and JWT token", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("token");
      expect(typeof res.body.token).toBe("string");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", testUser.email);
      expect(res.body.user).toHaveProperty("name", testUser.name);
      expect(res.body.user).toHaveProperty("id");
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should reject registration when required fields are missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "incomplete@sanchitx.ai" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Please fill in all required fields.");
    });

    it("should reject registration when email already exists", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(testUser);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "An account with this email already exists.");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should log in an existing registered user with valid credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", testUser.email);
      expect(res.body.user).not.toHaveProperty("password");
    });

    it("should log in demo user account with seeded demo credentials", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "sanchit@sanchitx.ai",
          password: "demo1234"
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body.user).toHaveProperty("email", "sanchit@sanchitx.ai");
    });

    it("should reject login with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "WrongPassword999!"
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid email or password.");
    });

    it("should reject login with non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({
          email: "nonexistent_user_999@sanchitx.ai",
          password: "Password123!"
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Invalid email or password.");
    });

    it("should reject login when fields are missing", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Email and password are required.");
    });
  });

  describe("GET /api/auth/me (Session Verification)", () => {
    it("should return user profile for authenticated request with valid Bearer token", async () => {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password
        });

      const token = loginRes.body.token;

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("user");
      expect(res.body.user).toHaveProperty("email", testUser.email);
      expect(res.body.user).toHaveProperty("name", testUser.name);
    });

    it("should reject session verification when Authorization header is missing", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Unauthorized access. Token required.");
    });

    it("should reject session verification when token is invalid or corrupted", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid.token.payload");

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Invalid or expired token.");
    });
  });
});
