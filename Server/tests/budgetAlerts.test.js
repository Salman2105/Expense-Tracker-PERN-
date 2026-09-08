jest.mock("../src/services/email.service", () => ({
  sendBudgetAlert: jest.fn().mockResolvedValue(undefined),
}));

const request = require("supertest");
const app = require("../src/app");
const emailService = require("../src/services/email.service");

const user = {
  username: "budgetuser",
  email: "budgetuser@example.com",
  password: "Password123!",
};

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const registerAndLogin = async () => {
  await request(app).post("/api/auth/register").send(user);
  const response = await request(app)
    .post("/api/auth/login")
    .send({ email: user.email, password: user.password });
  return response.body.data.token;
};

const createExpenseCategory = (token) =>
  request(app)
    .post("/api/categories")
    .set(authHeader(token))
    .send({ name: "Groceries", icon: "cart", type: "EXPENSE" });

const createExpense = (token, categoryId, amount) =>
  request(app)
    .post("/api/transactions")
    .set(authHeader(token))
    .send({ categoryId, type: "EXPENSE", amount, title: "Groceries" });

const waitForEmailCalls = async (expectedCount) => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    if (emailService.sendBudgetAlert.mock.calls.length >= expectedCount) return;
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
};

describe("Budget alerts", () => {
  let token;
  let categoryId;

  beforeEach(async () => {
    emailService.sendBudgetAlert.mockClear();
    token = await registerAndLogin();
    categoryId = (await createExpenseCategory(token)).body.data.categoryId;
    await request(app).get("/api/users/me/settings").set(authHeader(token));
    await request(app)
      .patch("/api/users/me/settings")
      .set(authHeader(token))
      .send({ emailNotifications: true, budgetAlerts: true });
    await request(app)
      .post("/api/budgets")
      .set(authHeader(token))
      .send({ categoryId, amount: 1000 });
  });

  it("sends one 80% alert and suppresses duplicate alerts", async () => {
    expect((await createExpense(token, categoryId, 800)).status).toBe(201);
    await waitForEmailCalls(1);
    expect(emailService.sendBudgetAlert).toHaveBeenCalledTimes(1);

    expect((await createExpense(token, categoryId, 50)).status).toBe(201);
    await waitForEmailCalls(1);
    expect(emailService.sendBudgetAlert).toHaveBeenCalledTimes(1);
  });

  it("does not send when budget alerts are disabled", async () => {
    await request(app)
      .patch("/api/users/me/settings")
      .set(authHeader(token))
      .send({ budgetAlerts: false });

    expect((await createExpense(token, categoryId, 900)).status).toBe(201);
    await waitForEmailCalls(1);
    expect(emailService.sendBudgetAlert).not.toHaveBeenCalled();
  });

  it("sends the 100% alert once after the 80% alert", async () => {
    expect((await createExpense(token, categoryId, 800)).status).toBe(201);
    await waitForEmailCalls(1);

    expect((await createExpense(token, categoryId, 200)).status).toBe(201);
    await waitForEmailCalls(2);

    expect(emailService.sendBudgetAlert).toHaveBeenCalledTimes(2);
    expect(emailService.sendBudgetAlert.mock.calls[1][0].threshold).toBe(100);
  });

  it("still sends budget alerts when general email notifications are disabled", async () => {
    await request(app)
      .patch("/api/users/me/settings")
      .set(authHeader(token))
      .send({ emailNotifications: false });

    expect((await createExpense(token, categoryId, 900)).status).toBe(201);
    await waitForEmailCalls(1);
    expect(emailService.sendBudgetAlert).toHaveBeenCalledTimes(1);
  });
});
