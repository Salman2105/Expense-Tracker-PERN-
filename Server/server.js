const dotenv = require("dotenv");

dotenv.config();

const app = require("./src/app");
const connectDB = require("./config/db");
const prisma = require("./config/prisma");

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

  const shutdown = async () => {
    console.log('Shutting down...');
    server.close(async () => {
      try {
        await prisma.$disconnect();
        console.log('Prisma disconnected');
      } catch (e) {
        console.error('Error disconnecting Prisma:', e.message);
      }
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
};

start();