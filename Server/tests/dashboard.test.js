const request = require("supertest");
const app = require("../src/app");

const user = {
  username: "dashuser",
  email: "dashuser@example.com",
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

describe("Dashboard endpoint", () => {
  let token;

  beforeEach(async () => {
    token = await registerAndLogin();
  });

  it("rejects unauthenticated access", async () => {
    const res = await request(app).get("/api/dashboard");
    expect(res.status).toBe(401);
  });

  it("returns an empty dashboard summary for a new user", async () => {
    const res = await request(app)
      .get("/api/dashboard")
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(res.body.data.totalIncome).toBe(0);
    expect(res.body.data.totalExpenses).toBe(0);
  });

  it("reflects created transactions in the dashboard totals", async () => {
    const category = (
      await request(app)
        .post("/api/categories")
        .set(authHeader(token))
        .send({ name: "Salary", icon: "money", type: "INCOME" })
    ).body.data;

    await request(app)
      .post("/api/transactions")
      .set(authHeader(token))
      .send({
        categoryId: category.categoryId,
        type: "INCOME",
        amount: 500,
        title: "Paycheck",
      });

    const res = await request(app)
      .get("/api/dashboard")
      .set(authHeader(token));

    expect(res.status).toBe(200);
    expect(Number(res.body.data.totalIncome)).toBe(500);
  });
});
