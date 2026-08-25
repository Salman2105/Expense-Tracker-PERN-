const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../config/swagger");
const env = require("../config/env");
const helmet = require("helmet");
const cors = require("cors");
const hpp = require("hpp");
const requestLogger = require("./middleware/requestLogger.middleware");
const errorMiddleware = require("./middleware/error.middleware");

const healthRoutes = require("./routes/health.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const userSettingsRoutes = require("./routes/userSettings.routes");
const accountRoutes = require("./routes/account.routes");
const categoryRoutes = require("./routes/category.routes");
const transactionRoutes = require("./routes/transaction.routes");
const dashboardRoutes = require("./routes/dashboard.routes");


const {
  startAccountCleanupJob,
} = require("./jobs/accountCleanup.job");


const app = express();

// Secure HTTP response headers
app.use(helmet());

// Swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: env.clientUrl,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Limit JSON request body size
app.use(express.json({ limit: "10kb" }));

// Prevent HTTP parameter pollution (must run after body parsing so it can
// also de-duplicate array-polluted fields in the parsed body, not just the
// query string).
app.use(hpp());

// Request logging
app.use(requestLogger);

startAccountCleanupJob();

app.use("/", healthRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/users", userSettingsRoutes);

app.use("/api/account", accountRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/dashboard", dashboardRoutes);

// Must be registered last: catches errors from every route above,
// including malformed-JSON body-parser errors from express.json().
app.use(errorMiddleware);

module.exports = app;