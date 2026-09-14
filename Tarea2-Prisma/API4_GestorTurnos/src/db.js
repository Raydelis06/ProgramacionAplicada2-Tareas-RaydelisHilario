import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

// Inicialización del adaptador de base de datos PostgreSQL de Prisma 7
const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL
});

// Instancia única compartida de PrismaClient
export const prisma = new PrismaClient({
    adapter
});