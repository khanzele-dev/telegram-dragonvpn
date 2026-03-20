import "dotenv/config";
import { PrismaClient } from "../../generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({ adapter });

export async function initializeDatabase() {
  console.log("🔄 Connecting to database...");
  console.log("Connection string:", process.env.DATABASE_URL);
  try {
    await prisma.$connect();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    throw error;
  }
}

export async function closeDatabase() {
  await prisma.$disconnect();
}

export default prisma;