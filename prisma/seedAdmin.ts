import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";
import { hashPassword } from "../src/lib/memberAuth";

// Cria (ou atualiza a senha de) o usuário que acessa o painel /admin. Rodar com:
//   ADMIN_SEED_NAME="Seu Nome" ADMIN_SEED_EMAIL="voce@exemplo.com" ADMIN_SEED_PASSWORD="senha-forte" npx tsx prisma/seedAdmin.ts
// Pode ser rodado de novo a qualquer momento (com uma senha nova) para trocar a senha do admin.

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const name = process.env.ADMIN_SEED_NAME;
  const email = process.env.ADMIN_SEED_EMAIL;
  const password = process.env.ADMIN_SEED_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "Defina ADMIN_SEED_NAME, ADMIN_SEED_EMAIL e ADMIN_SEED_PASSWORD antes de rodar este script.",
    );
  }
  if (password.length < 8) {
    throw new Error("ADMIN_SEED_PASSWORD precisa ter pelo menos 8 caracteres.");
  }

  const passwordHash = hashPassword(password);
  const admin = await prisma.admin.upsert({
    where: { email },
    update: { name, passwordHash },
    create: { name, email, passwordHash },
  });

  console.log(`Admin "${admin.name}" (${admin.email}) pronto para logar em /admin.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
