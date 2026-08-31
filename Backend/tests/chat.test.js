import request from "supertest";
import { app } from "../server.js";

describe("Chat & Conversation Management Endpoints (/api)", () => {
  let userAToken = "";
  let userBToken = "";
  const threadIdUserA = `thread_test_${Date.now()}_a`;

  beforeAll(async () => {
    // Register User A
    const userARes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "User Alice",
        email: `alice_${Date.now()}@sanchitx.ai`,
        password: "AlicePassword123!"
      });
    userAToken = userARes.body.token;

    // Register User B
    const userBRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "User Bob",
        email: `bob_${Date.now()}@sanchitx.ai`,
        password: "BobPassword123!"
      });
    userBToken = userBRes.body.token;
  });

  describe("Protected Endpoint Authorization Checks", () => {
    it("should reject GET /api/thread without authentication", async () => {
      const res = await request(app).get("/api/thread");
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Unauthorized access. Token required.");
    });

    it("should reject GET /api/thread/:threadId without authentication", async () => {
      const res = await request(app).get(`/api/thread/${threadIdUserA}`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Unauthorized access. Token required.");
    });

    it("should reject POST /api/chat without authentication", async () => {
      const res = await request(app)
        .post("/api/chat")
        .send({ threadId: threadIdUserA, message: "Hello AI" });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Unauthorized access. Token required.");
    });

    it("should reject PATCH /api/thread/:threadId/rename without authentication", async () => {
      const res = await request(app)
        .patch(`/api/thread/${threadIdUserA}/rename`)
        .send({ title: "New Title" });
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Unauthorized access. Token required.");
    });

    it("should reject DELETE /api/thread/:threadId without authentication", async () => {
      const res = await request(app).delete(`/api/thread/${threadIdUserA}`);
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error", "Unauthorized access. Token required.");
    });
  });

  describe("Input Validation", () => {
    it("should reject POST /api/chat when threadId is missing", async () => {
      const res = await request(app)
        .post("/api/chat")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ message: "Hello AI without threadId" });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Missing required fields");
    });

    it("should reject POST /api/chat when message is empty or whitespace", async () => {
      const res = await request(app)
        .post("/api/chat")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ threadId: threadIdUserA, message: "   " });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Missing required fields");
    });

    it("should reject PATCH /api/thread/:threadId/rename when title is empty", async () => {
      const res = await request(app)
        .patch(`/api/thread/${threadIdUserA}/rename`)
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ title: "   " });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error", "Title is required.");
    });
  });

  describe("Conversation Lifecycle & Data Isolation", () => {
    it("should allow User A to send a chat message and receive an AI response", async () => {
      const res = await request(app)
        .post("/api/chat")
        .set("Authorization", `Bearer ${userAToken}`)
        .send({
          threadId: threadIdUserA,
          message: "What is machine learning in one sentence?"
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("reply");
      expect(typeof res.body.reply).toBe("string");
    });

    it("should allow User A to retrieve messages for their thread", async () => {
      const res = await request(app)
        .get(`/api/thread/${threadIdUserA}`)
        .set("Authorization", `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2); // user message + assistant reply
      expect(res.body[0]).toHaveProperty("role", "user");
      expect(res.body[1]).toHaveProperty("role", "assistant");
    });

    it("should allow User A to list all of their conversation threads", async () => {
      const res = await request(app)
        .get("/api/thread")
        .set("Authorization", `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const found = res.body.find(t => t.threadId === threadIdUserA);
      expect(found).toBeDefined();
    });

    it("should allow User A to rename their conversation thread", async () => {
      const updatedTitle = "ML Discussion";
      const res = await request(app)
        .patch(`/api/thread/${threadIdUserA}/rename`)
        .set("Authorization", `Bearer ${userAToken}`)
        .send({ title: updatedTitle });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", true);
      expect(res.body.thread).toHaveProperty("title", updatedTitle);
    });

    it("should PREVENT User B from accessing User A's conversation thread (Data Isolation)", async () => {
      const res = await request(app)
        .get(`/api/thread/${threadIdUserA}`)
        .set("Authorization", `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Thread not found or access denied.");
    });

    it("should PREVENT User B from renaming User A's conversation thread", async () => {
      const res = await request(app)
        .patch(`/api/thread/${threadIdUserA}/rename`)
        .set("Authorization", `Bearer ${userBToken}`)
        .send({ title: "Hacked by User B" });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Thread not found or access denied.");
    });

    it("should NOT include User A's thread in User B's thread list", async () => {
      const res = await request(app)
        .get("/api/thread")
        .set("Authorization", `Bearer ${userBToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      const hasUserAThread = res.body.some(t => t.threadId === threadIdUserA);
      expect(hasUserAThread).toBe(false);
    });

    it("should allow User A to delete their own conversation thread", async () => {
      const res = await request(app)
        .delete(`/api/thread/${threadIdUserA}`)
        .set("Authorization", `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("success", "Thread deleted successfully");

      // Verify deletion
      const checkRes = await request(app)
        .get(`/api/thread/${threadIdUserA}`)
        .set("Authorization", `Bearer ${userAToken}`);
      expect(checkRes.status).toBe(404);
    });

    it("should return 404 when querying a non-existent thread ID", async () => {
      const res = await request(app)
        .get("/api/thread/non_existent_thread_12345")
        .set("Authorization", `Bearer ${userAToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "Thread not found or access denied.");
    });
  });
});
