import getGroqResponse from "../utils/groq.js";

describe("Groq AI Utility & Error Handling (getGroqResponse)", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("should return a helpful configuration notice when GROQ_API_KEY is missing", async () => {
    delete process.env.GROQ_API_KEY;

    const response = await getGroqResponse("Hello AI");
    expect(typeof response).toBe("string");
    expect(response).toContain("GROQ_API_KEY is not configured");
  });

  it("should return a configuration notice when GROQ_API_KEY is the default placeholder", async () => {
    process.env.GROQ_API_KEY = "your_groq_api_key_here";

    const response = await getGroqResponse("Hello AI");
    expect(typeof response).toBe("string");
    expect(response).toContain("GROQ_API_KEY is not configured");
  });

  it("should handle invalid API key errors gracefully without crashing the server", async () => {
    process.env.GROQ_API_KEY = "gsk_invalid_test_mock_key";

    const response = await getGroqResponse("Hello AI");
    expect(typeof response).toBe("string");
    // Should return either Invalid API key notice or Groq API Error message, not throw an unhandled promise rejection
    expect(response.startsWith("⚠️")).toBe(true);
  });
});
