const request = require("supertest");
const app = require("../src/app");

const user = {
  username: "settingsuser",
  email: "settingsuser@example.com",
  password: "Password123!",
};

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const registerAndLogin = async () => {
  await request(app).post("/api/auth/register").send(user);
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password: user.password });
  return res.body.data.token;
};

describe("User settings endpoints", () => {
  let token;

  beforeEach(async () => {
    token = await registerAndLogin();
  });

  it("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/users/me/settings");
    expect(res.status).toBe(401);
  });

  it("auto-creates default settings on first GET", async () => {
    const res = await request(app)
      .get("/api/users/me/settings")
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.theme).toBe("SYSTEM");
    expect(res.body.data.preferredCurrency).toBe("PKR");
    expect(res.body.data.emailNotifications).toBe(false);
    expect(res.body.data.budgetAlerts).toBe(false);
  });

  it("updates settings", async () => {
    await request(app).get("/api/users/me/settings").set(authHeader(token));

    const res = await request(app)
      .patch("/api/users/me/settings")
      .set(authHeader(token))
      .send({ theme: "DARK" });

    expect(res.status).toBe(200);
    expect(res.body.data.theme).toBe("DARK");
  });

  it("rejects an invalid theme value", async () => {
    const res = await request(app)
      .patch("/api/users/me/settings")
      .set(authHeader(token))
      .send({ theme: "NEON" });

    expect(res.status).toBe(400);
  });

  it("persists notification preferences and rejects invalid boolean values", async () => {
    await request(app).get("/api/users/me/settings").set(authHeader(token));

    const update = await request(app)
      .patch("/api/users/me/settings")
      .set(authHeader(token))
      .send({ emailNotifications: true, budgetAlerts: true });

    const read = await request(app)
      .get("/api/users/me/settings")
      .set(authHeader(token));

    const invalid = await request(app)
      .patch("/api/users/me/settings")
      .set(authHeader(token))
      .send({ emailNotifications: "true" });

    expect(update.status).toBe(200);
    expect(read.body.data.emailNotifications).toBe(true);
    expect(read.body.data.budgetAlerts).toBe(true);
    expect(invalid.status).toBe(400);
  });

  it("rejects unsupported currency and language values", async () => {
    const currencyRes = await request(app)
      .patch("/api/users/me/settings")
      .set(authHeader(token))
      .send({ preferredCurrency: "ABC" });

    const languageRes = await request(app)
      .patch("/api/users/me/settings")
      .set(authHeader(token))
      .send({ language: "fr" });

    expect(currencyRes.status).toBe(400);
    expect(languageRes.status).toBe(400);
  });

  it("rejects creating settings that already exist", async () => {
    await request(app)
      .post("/api/users/me/settings")
      .set(authHeader(token))
      .send({ theme: "DARK" });

    const res = await request(app)
      .post("/api/users/me/settings")
      .set(authHeader(token))
      .send({ theme: "LIGHT" });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe("SETTINGS_ALREADY_EXIST");
  });

  it("returns 404 updating settings that don't exist yet", async () => {
    const res = await request(app)
      .patch("/api/users/me/settings")
      .set(authHeader(token))
      .send({ theme: "DARK" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("SETTINGS_NOT_FOUND");
  });
});
