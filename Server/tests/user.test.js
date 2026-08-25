const request = require("supertest");
const app = require("../src/app");

const user = {
  username: "profileuser",
  email: "profileuser@example.com",
  password: "Password123!",
};

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const registerAndLogin = async (overrides = {}) => {
  const payload = { ...user, ...overrides };
  await request(app).post("/api/auth/register").send(payload);
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: payload.email, password: payload.password });
  return res.body.data.token;
};

describe("User profile endpoints", () => {
  let token;

  beforeEach(async () => {
    token = await registerAndLogin();
  });

  it("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/users/me");
    expect(res.status).toBe(401);
  });

  it("returns the authenticated user's profile", async () => {
    const res = await request(app).get("/api/users/me").set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe(user.email);
    expect(res.body.data.passwordHash).toBeUndefined();
  });

  it("updates the profile picture", async () => {
    const res = await request(app)
      .patch("/api/users/me")
      .set(authHeader(token))
      .send({ profilePicture: "https://example.com/pic.png" });

    expect(res.status).toBe(200);
    expect(res.body.data.profilePicture).toBe("https://example.com/pic.png");
  });

  // KNOWN BUG (pre-existing, documented in REPORT.md, not fixed by this
  // refactor): userService.updateUserProfile never reads `data.username`,
  // so a username-only PATCH body updates nothing and falls through to an
  // "EMPTY_UPDATE" error.
  //
  // The status code below (400) reflects one deliberate fix made during
  // this refactor: EMPTY_UPDATE previously had no statusCode attached, so
  // it fell through every controller's error handling to a generic 500.
  // It now carries statusCode 400, since "you sent nothing to update" is a
  // client input error, not a server fault. See REPORT.md.
  it("silently ignores username updates (documented bug, not a spec)", async () => {
    const res = await request(app)
      .patch("/api/users/me")
      .set(authHeader(token))
      .send({ username: "somethingelse" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("EMPTY_UPDATE");
  });

  describe("PATCH /api/users/me/password", () => {
    it("changes the password with the correct current password", async () => {
      const res = await request(app)
        .patch("/api/users/me/password")
        .set(authHeader(token))
        .send({
          currentPassword: user.password,
          newPassword: "NewPassword456!",
        });

      expect(res.status).toBe(200);
    });

    it("rejects an incorrect current password", async () => {
      const res = await request(app)
        .patch("/api/users/me/password")
        .set(authHeader(token))
        .send({
          currentPassword: "WrongPassword123!",
          newPassword: "NewPassword456!",
        });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("INVALID_CURRENT_PASSWORD");
    });

    it("rejects reusing the same password", async () => {
      // Caught by validateChangePassword's strict-equality check before
      // the controller/service ever run, so no error.code is attached.
      const res = await request(app)
        .patch("/api/users/me/password")
        .set(authHeader(token))
        .send({
          currentPassword: user.password,
          newPassword: user.password,
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/different from current password/i);
    });
  });
});
