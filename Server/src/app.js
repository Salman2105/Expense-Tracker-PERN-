const express = require("express");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("../config/swagger");
const env = require("../config/env");
const helmet = require("helmet");
const cors = require("cors");
const hpp = require("hpp");
const requestLogger = require("./middleware/requestLogger.middleware");
const logger = require("./middleware/logger");
const errorMiddleware = require("./middleware/error.middleware");

const authRoutes = require("./routes/auth.routes");
const prisma = require("../config/prisma");
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

// Swagger
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);



// Secure HTTP response headers
app.use(helmet());



// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: env.clientUrl,
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Prevent HTTP parameter pollution
app.use(hpp());


// Limit JSON request body size
app.use(express.json({ limit: "10kb" }));

// Request logging
app.use(requestLogger);


app.get("/db-check", async (req, res) => {
  try {
    const usersCount = await prisma.user.count();

    res.json({
      ok: true,
      usersCount,
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error.message,
    });
  }
});



startAccountCleanupJob();



app.get("/", (req, res) => {
  res.json({
    message: "Expense Tracker API is running",
  });
});



app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/users", userSettingsRoutes);

app.use("/api/account", accountRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/transactions", transactionRoutes);

app.use("/api/dashboard", dashboardRoutes);
app.use(errorMiddleware);



app.use((error, req, res, next) => {
  // Malformed JSON
  if (
    error instanceof SyntaxError &&
    error.status === 400 &&
    "body" in error
  ) {
    return res.status(400).json({
      success: false,
      message: "Request body contains invalid JSON",
    });
  }

  const statusCode = Number.isInteger(error.statusCode)
    ? error.statusCode
    : Number.isInteger(error.status) && error.status >= 400
      ? error.status
      : 500;

  if (statusCode >= 500) {
    logger.error("Unhandled application error", {
      message: error.message,
      stack: error.stack,
      method: req.method,
      url: req.originalUrl,
    });
  }

  return res.status(statusCode).json({
    success: false,
    message:
      statusCode >= 500
        ? "Internal server error"
        : error.message,
  });
});

module.exports = app;