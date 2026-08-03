import "dotenv/config";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL ?? "file:./dev.db",
  authToken: process.env.TURSO_AUTH_TOKEN,
});
const prisma = new PrismaClient({ adapter });

// Regras informadas pela AMMA (Associação Médica do Médio Araguaia) em 2026-07-23.
const FULL_SHIFT_SALAO_AREA = JSON.stringify([
  { label: "13h às 21h", startHour: 13, durationHours: 8 },
  { label: "20h às 04h", startHour: 20, durationHours: 8 },
]);

const SHIFT_COZINHA = JSON.stringify([
  { label: "13h às 20h", startHour: 13, durationHours: 7 },
  { label: "20h às 03h", startHour: 20, durationHours: 7 },
]);

// Mesmo calendário único usado na aba Agenda (ver src/lib/calendar.ts) — todos os espaços
// publicam suas reservas confirmadas nele.
const GOOGLE_CALENDAR_ID =
  process.env.GOOGLE_CALENDAR_EMBED_ID ?? "associacaomedicadomedioaraguai@gmail.com";

const spaces = [
  {
    slug: "salao-de-festa",
    name: "Salão de Festa",
    description:
      "Climatizado, com estrutura de cozinha industrial, banheiros climatizados (feminino, masculino e PCD), berçário e fraldário. Até 200 convidados.",
    photos: JSON.stringify(["/spaces/placeholder-salao.jpg"]),
    capacity: 200,
    minAdvanceDays: 15,
    paymentType: "SPLIT",
    finalDueDays: 5,
    monthlyLimitPerMember: 1,
    yearlyLimitPerMember: 4,
    pricingUnit: "FLAT",
    priceCents: 200000,
    maxHoursPerBooking: 8,
    overtimeHourlyCents: null,
    shiftOptions: FULL_SHIFT_SALAO_AREA,
    exclusiveVenue: true,
    googleCalendarId: GOOGLE_CALENDAR_ID,
  },
  {
    slug: "area-externa",
    name: "Área Externa",
    description:
      "Piscina, redário, churrasqueira, quadra de areia, cozinha industrial, forno de pizza industrial, banheiros climatizados (feminino, masculino e PCD), berçário e fraldário. Até 100 convidados.",
    photos: JSON.stringify(["/spaces/placeholder-area-externa.jpg"]),
    capacity: 100,
    minAdvanceDays: 15,
    paymentType: "SPLIT",
    finalDueDays: 5,
    monthlyLimitPerMember: 1,
    yearlyLimitPerMember: 4,
    pricingUnit: "FLAT",
    priceCents: 130000,
    maxHoursPerBooking: 8,
    overtimeHourlyCents: null,
    shiftOptions: FULL_SHIFT_SALAO_AREA,
    exclusiveVenue: true,
    googleCalendarId: GOOGLE_CALENDAR_ID,
  },
  {
    slug: "cozinha-gourmet",
    name: "Cozinha Gourmet",
    description: "Inclui acesso aos banheiros externos. Até 30 convidados.",
    photos: JSON.stringify(["/spaces/placeholder-cozinha.jpg"]),
    capacity: 30,
    minAdvanceDays: 7,
    paymentType: "SPLIT",
    finalDueDays: 5,
    monthlyLimitPerMember: 1,
    yearlyLimitPerMember: 4,
    pricingUnit: "FLAT",
    priceCents: 50000,
    maxHoursPerBooking: 7,
    overtimeHourlyCents: null,
    shiftOptions: SHIFT_COZINHA,
    exclusiveVenue: true,
    googleCalendarId: GOOGLE_CALENDAR_ID,
  },
  {
    slug: "quadra-de-areia",
    name: "Quadra de Areia",
    description:
      "Para Beach Tênis, Vôlei ou Futevôlei. Uso de até 2 horas por associado, das 8h às 22h.",
    photos: JSON.stringify(["/spaces/placeholder-quadra.jpg"]),
    capacity: null,
    minAdvanceDays: 5,
    paymentType: "FULL",
    finalDueDays: 3,
    monthlyLimitPerMember: null,
    yearlyLimitPerMember: null,
    pricingUnit: "HOURLY",
    priceCents: 2500,
    maxHoursPerBooking: 2,
    overtimeHourlyCents: null,
    shiftOptions: null,
    operatingStartHour: 8,
    operatingEndHour: 22,
    exclusiveVenue: false,
    googleCalendarId: GOOGLE_CALENDAR_ID,
  },
] as const;

async function main() {
  for (const space of spaces) {
    await prisma.space.upsert({
      where: { slug: space.slug },
      update: space,
      create: space,
    });
  }
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
