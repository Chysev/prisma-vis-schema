import { config } from "dotenv";
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

config();

const adapter = new PrismaMariaDb({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || "3306"),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    connectionLimit: 5
});

const prisma = new PrismaClient({ adapter });

const connectPrisma = async () => {
    try {
        await prisma.$connect();
        console.log("[db] ✅ Prisma connected to database");
    } catch (err) {
        console.error("[db] ❌ Prisma failed to connect:", err);
        process.exit(1);
    }
};
const disconnectPrisma = async () => {
    await prisma.$disconnect();
};

export { connectPrisma, disconnectPrisma };

export default prisma;
