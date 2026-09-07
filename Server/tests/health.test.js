const request = require("supertest");
const app = require("../src/app");

describe("Health endpoints", () => {
  it("GET / returns a running message", async () => {
    const res = await request(app).get("/");

    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/running/i);
  });

  it("GET /health returns a lightweight health response", async () => {
    const res = await request(app).get("/health");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      message: "API is healthy",
    });
  });

  it("GET /db-check reports database connectivity", async () => {
    const res = await request(app).get("/db-check");

    expect(res.status).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(typeof res.body.usersCount).toBe("number");
  });

  it("returns a clean 400 for malformed JSON bodies without leaking parser internals", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Content-Type", "application/json")
      .send("{bad json");

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).not.toMatch(/position|token|JSON at/i);
  });
});
