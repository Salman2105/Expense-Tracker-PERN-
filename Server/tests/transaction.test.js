const request = require("supertest");
const app = require("../src/app");

const user = {
  username: "txuser",
  email: "txuser@example.com",
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

const createCategory = async (token, overrides = {}) => {
  const res = await request(app)
    .post("/api/categories")
    .set(authHeader(token))
    .send({ name: "Salary", icon: "money", type: "INCOME", ...overrides });
  return res.body.data;
};

describe("Transaction endpoints", () => {
  let token;
  let category;

  beforeEach(async () => {
    token = await registerAndLogin();
    category = await createCategory(token);
  });

  it("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/transactions");
    expect(res.status).toBe(401);
  });

  it("creates a transaction", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set(authHeader(token))
      .send({
        categoryId: category.categoryId,
        type: "INCOME",
        amount: 1500,
        title: "Paycheck",
      });

    expect(res.status).toBe(201);
    expect(res.body.data.title).toBe("Paycheck");
    expect(res.body.data.amount).toBe("1500");
  });

  it("rejects a transaction with a type mismatched to its category", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set(authHeader(token))
      .send({
        categoryId: category.categoryId,
        type: "EXPENSE",
        amount: 100,
        title: "Mismatch",
      });

    expect(res.status).toBe(400);
  });

  it("rejects a negative/zero amount", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set(authHeader(token))
      .send({
        categoryId: category.categoryId,
        type: "INCOME",
        amount: 0,
        title: "Bad",
      });

    expect(res.status).toBe(400);
  });

  it("rejects a missing title", async () => {
    const res = await request(app)
      .post("/api/transactions")
      .set(authHeader(token))
      .send({ categoryId: category.categoryId, type: "INCOME", amount: 10 });

    expect(res.status).toBe(400);
  });

  it("lists transactions with pagination", async () => {
    await request(app)
      .post("/api/transactions")
      .set(authHeader(token))
      .send({
        categoryId: category.categoryId,
        type: "INCOME",
        amount: 100,
        title: "One",
      });

    const res = await request(app)
      .get("/api/transactions?page=1&limit=10")
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.transactions).toHaveLength(1);
    expect(res.body.data.pagination.total).toBe(1);
  });

  it("gets a transaction by id", async () => {
    const create = await request(app)
      .post("/api/transactions")
      .set(authHeader(token))
      .send({
        categoryId: category.categoryId,
        type: "INCOME",
        amount: 100,
        title: "One",
      });

    const res = await request(app)
      .get(`/api/transactions/${create.body.data.transactionId}`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.transactionId).toBe(create.body.data.transactionId);
  });

  it("returns 404 for a nonexistent transaction id", async () => {
    const res = await request(app)
      .get("/api/transactions/11111111-1111-4111-8111-111111111111")
      .set(authHeader(token));

    expect(res.status).toBe(404);
  });

  it("returns 400 for a malformed transaction id", async () => {
    const res = await request(app)
      .get("/api/transactions/not-a-uuid")
      .set(authHeader(token));

    expect(res.status).toBe(400);
  });

  it("updates a transaction", async () => {
    const create = await request(app)
      .post("/api/transactions")
      .set(authHeader(token))
      .send({
        categoryId: category.categoryId,
        type: "INCOME",
        amount: 100,
        title: "One",
      });

    const res = await request(app)
      .patch(`/api/transactions/${create.body.data.transactionId}`)
      .set(authHeader(token))
      .send({ amount: 200 });

    expect(res.status).toBe(200);
    expect(res.body.data.amount).toBe("200");
  });

  it("deletes a transaction", async () => {
    const create = await request(app)
      .post("/api/transactions")
      .set(authHeader(token))
      .send({
        categoryId: category.categoryId,
        type: "INCOME",
        amount: 100,
        title: "One",
      });

    const res = await request(app)
      .delete(`/api/transactions/${create.body.data.transactionId}`)
      .set(authHeader(token));

    expect(res.status).toBe(200);
  });

  it("rejects creating a transaction against another user's custom category", async () => {
    await request(app).post("/api/auth/register").send({
      username: "categoryowner",
      email: "categoryowner@example.com",
      password: "Password123!",
    });
    const ownerLogin = await request(app).post("/api/auth/login").send({
      email: "categoryowner@example.com",
      password: "Password123!",
    });
    const ownerCategory = await createCategory(ownerLogin.body.data.token, {
      name: "Owner Only",
    });

    const res = await request(app)
      .post("/api/transactions")
      .set(authHeader(token))
      .send({
        categoryId: ownerCategory.categoryId,
        type: "INCOME",
        amount: 50,
        title: "Trying someone else's category",
      });

    expect(res.status).toBe(403);
  });

  it("rejects updating a transaction to use another user's custom category", async () => {
    const create = await request(app)
      .post("/api/transactions")
      .set(authHeader(token))
      .send({
        categoryId: category.categoryId,
        type: "INCOME",
        amount: 100,
        title: "One",
      });

    await request(app).post("/api/auth/register").send({
      username: "categoryowner2",
      email: "categoryowner2@example.com",
      password: "Password123!",
    });
    const ownerLogin = await request(app).post("/api/auth/login").send({
      email: "categoryowner2@example.com",
      password: "Password123!",
    });
    const ownerCategory = await createCategory(ownerLogin.body.data.token, {
      name: "Owner Only 2",
    });

    const res = await request(app)
      .patch(`/api/transactions/${create.body.data.transactionId}`)
      .set(authHeader(token))
      .send({ categoryId: ownerCategory.categoryId });

    expect(res.status).toBe(403);
  });

  it("does not allow a user to access another user's transaction", async () => {
    const create = await request(app)
      .post("/api/transactions")
      .set(authHeader(token))
      .send({
        categoryId: category.categoryId,
        type: "INCOME",
        amount: 100,
        title: "One",
      });

    const otherToken = await (async () => {
      await request(app).post("/api/auth/register").send({
        username: "otheruser",
        email: "otheruser@example.com",
        password: "Password123!",
      });
      const loginRes = await request(app).post("/api/auth/login").send({
        email: "otheruser@example.com",
        password: "Password123!",
      });
      return loginRes.body.data.token;
    })();

    const res = await request(app)
      .get(`/api/transactions/${create.body.data.transactionId}`)
      .set(authHeader(otherToken));

    expect(res.status).toBe(404);
  });
});
