import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// SQLite local em dev (libsql, binários pré-compilados, sem depender de toolchain C++ na
// máquina); em produção, DATABASE_URL/TURSO_AUTH_TOKEN apontam para um banco Turso remoto —
// mesmo client, só muda a URL e entra o token de autenticação.
const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
