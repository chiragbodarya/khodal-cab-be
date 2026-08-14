require('dotenv').config();
import app from './app';
import prisma from './config/prisma';

const PORT = process.env.PORT || 9000;

async function startServer() {
  try {
    // Verify database connection before starting the server
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error: any) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
