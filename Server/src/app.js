const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const prisma = require('../config/prisma');
const userRoutes = require("./routes/user.routes");
const userSettingsRoutes = require("./routes/userSettings.routes");
const accountRoutes = require("./routes/account.routes");
const categoryRoutes = require("./routes/category.routes");
const {
  startAccountCleanupJob,
} = require("./jobs/accountCleanup.job");

dotenv.config();

const app = express();


app.use(express.json());
app.get('/db-check', async (req, res) => {
  try {
    const usersCount = await prisma.user.count();
    res.json({ ok: true, usersCount });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

startAccountCleanupJob();
// Health / root route
app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API is running' });
});

// Simple DB check

// API routes
app.use('/api/auth', authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/users", userSettingsRoutes);
app.use("/api/account", accountRoutes);
app.use("/api/categories", categoryRoutes);


module.exports = app;

