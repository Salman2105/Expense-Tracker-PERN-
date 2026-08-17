const prisma = require('./prisma');

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log('Postgres (Prisma) connected');
  } catch (error) {
    console.warn('Prisma connection failed:', error.message);
    console.warn('Continuing without database for now.');
  }
};

module.exports = connectDB;
