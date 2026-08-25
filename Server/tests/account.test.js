const request = require("supertest");
const app = require("../src/app");

const user = {
  username: "acctuser",
  email: "acctuser@example.com",
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

describe("Account endpoints", () => {
  let token;

  beforeEach(async () => {
    token = await registerAndLogin();
  });

  it("rejects unauthenticated access to account status", async () => {
    const res = await request(app).get("/api/account/status");
    expect(res.status).toBe(401);
  });

  it("returns the account status for the authenticated user", async () => {
    const res = await request(app)
      .get("/api/account/status")
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("ACTIVE");
    expect(res.body.data.deletedAt).toBeNull();
  });

  it("soft-deletes the authenticated user's account", async () => {
    const res = await request(app)
      .delete("/api/account/delete")
      .set(authHeader(token));

    expect(res.status).toBe(200);
  });

  it("rejects deleting an already-deleted account", async () => {
    await request(app).delete("/api/account/delete").set(authHeader(token));

    const res = await request(app)
      .delete("/api/account/delete")
      .set(authHeader(token));

    // Middleware rejects the token because the account is now deleted.
    expect([400, 401, 403]).toContain(res.status);
  });
});
