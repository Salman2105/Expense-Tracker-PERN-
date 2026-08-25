const request = require("supertest");
const app = require("../src/app");

const user = {
  username: "categoryuser",
  email: "categoryuser@example.com",
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

describe("Category endpoints", () => {
  let token;

  beforeEach(async () => {
    token = await registerAndLogin();
  });

  it("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/categories");
    expect(res.status).toBe(401);
  });

  it("creates a category", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set(authHeader(token))
      .send({ name: "Groceries", icon: "cart", type: "EXPENSE" });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe("Groceries");
  });

  it("rejects an invalid category type", async () => {
    const res = await request(app)
      .post("/api/categories")
      .set(authHeader(token))
      .send({ name: "Groceries", icon: "cart", type: "BOGUS" });

    expect(res.status).toBe(400);
  });

  it("rejects a duplicate category name for the same user", async () => {
    await request(app)
      .post("/api/categories")
      .set(authHeader(token))
      .send({ name: "Groceries", icon: "cart", type: "EXPENSE" });

    const res = await request(app)
      .post("/api/categories")
      .set(authHeader(token))
      .send({ name: "groceries", icon: "cart2", type: "EXPENSE" });

    expect(res.status).toBe(409);
  });

  it("lists the user's categories", async () => {
    await request(app)
      .post("/api/categories")
      .set(authHeader(token))
      .send({ name: "Groceries", icon: "cart", type: "EXPENSE" });

    const res = await request(app)
      .get("/api/categories")
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it("updates a category it owns", async () => {
    const create = await request(app)
      .post("/api/categories")
      .set(authHeader(token))
      .send({ name: "Groceries", icon: "cart", type: "EXPENSE" });

    const res = await request(app)
      .patch(`/api/categories/${create.body.data.categoryId}`)
      .set(authHeader(token))
      .send({ name: "Food & Groceries" });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe("Food & Groceries");
  });

  it("returns 400 for an invalid categoryId format on update", async () => {
    const res = await request(app)
      .patch("/api/categories/not-a-uuid")
      .set(authHeader(token))
      .send({ name: "X" });

    expect(res.status).toBe(400);
  });

  it("returns 404 updating a category that does not belong to the user", async () => {
    const res = await request(app)
      .patch("/api/categories/11111111-1111-4111-8111-111111111111")
      .set(authHeader(token))
      .send({ name: "X" });

    expect(res.status).toBe(404);
  });

  it("deletes a category it owns", async () => {
    const create = await request(app)
      .post("/api/categories")
      .set(authHeader(token))
      .send({ name: "Groceries", icon: "cart", type: "EXPENSE" });

    const res = await request(app)
      .delete(`/api/categories/${create.body.data.categoryId}`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
  });
});
