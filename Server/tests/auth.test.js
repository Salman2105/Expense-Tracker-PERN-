const request = require("supertest");
const app = require("../src/app");

const validUser = {
  username: "johndoe",
  email: "johndoe@example.com",
  password: "Password123!",
};

describe("Auth endpoints", () => {
  describe("POST /api/auth/register", () => {
    it("registers a new user and never returns the password hash", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe(validUser.username);
      expect(res.body.data.passwordHash).toBeUndefined();
    });

    it("rejects a duplicate email", async () => {
      await request(app).post("/api/auth/register").send(validUser);

      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, username: "someoneelse" });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it("rejects an invalid payload (missing fields)", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "a@b.com" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("rejects a short username", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, username: "ab" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/username/i);
    });

    it("rejects a weak/short password", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ ...validUser, password: "short" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/password/i);
    });
  });

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(validUser);
    });

    it("logs in with valid credentials and returns a token", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(typeof res.body.data.token).toBe("string");
      expect(res.body.data.user.email).toBe(validUser.email);
    });

    it("rejects an invalid password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: "WrongPassword123!" });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("rejects a non-existent email", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@example.com", password: validUser.password });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("Protected routes", () => {
    let token;

    beforeEach(async () => {
      await request(app).post("/api/auth/register").send(validUser);
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: validUser.email, password: validUser.password });
      token = loginRes.body.data.token;
    });

    it("rejects GET /api/auth/me without a token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
    });

    it("allows GET /api/auth/me with a valid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(validUser.email);
    });

    it("rejects a malformed Authorization header", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "NotBearer sometoken");

      expect(res.status).toBe(401);
    });

    it("rejects a tampered/invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid.token.value");

      expect(res.status).toBe(401);
    });
  });
});
