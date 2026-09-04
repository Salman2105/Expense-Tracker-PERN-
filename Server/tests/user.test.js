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

  it("rejects direct non-Cloudinary profile picture URLs", async () => {
    const res = await request(app)
      .patch("/api/users/me")
      .set(authHeader(token))
      .send({ profilePicture: "https://example.com/pic.png" });

    expect(res.status).toBe(400);
  });

  it("updates the username", async () => {
    const res = await request(app)
      .patch("/api/users/me")
      .set(authHeader(token))
      .send({ username: "somethingelse" });

    expect(res.status).toBe(200);
    expect(res.body.data.username).toBe("somethingelse");
  });

  describe("POST /api/users/me/profile-picture", () => {
    it("rejects unauthenticated uploads", async () => {
      const res = await request(app)
        .post("/api/users/me/profile-picture")
        .attach("image", Buffer.from("not-an-image"), "avatar.png");

      expect(res.status).toBe(401);
    });

    it("rejects uploads without an image", async () => {
      const res = await request(app)
        .post("/api/users/me/profile-picture")
        .set(authHeader(token));

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("IMAGE_REQUIRED");
    });

    it("rejects unsupported image MIME types", async () => {
      const res = await request(app)
        .post("/api/users/me/profile-picture")
        .set(authHeader(token))
        .attach("image", Buffer.from("plain text"), "avatar.txt");

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("INVALID_IMAGE_TYPE");
    });
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
