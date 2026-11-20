import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, Role, PlanType } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log(`Starting database seeding...`);

  //create default admin user
  const adminEmail = "admin@gmail.com";
  const adminPassword = "udemy12345";

  // check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log(`Admin user already exists`);
  } else {
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    //create admin user
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: "Admin User",
        role: Role.ADMIN,
        subscription: {
          create: {
            planType: PlanType.PRO,
            isActive: true,
          },
        },
        usage: {
          create: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            validationCount: 0,
          },
        },
      },
    });

    console.log(`Admin user created successfully`);
  }

  //create default admin user
  const userEmail = "user@gmail.com";
  const userPassword = "user12345";

  // check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (existingUser) {
    console.log(`Admin user already exists`);
  } else {
    const hashedPassword = await bcrypt.hash(userPassword, 12);

    //create admin user
    await prisma.user.create({
      data: {
        email: userEmail,
        password: hashedPassword,
        name: "User",
        role: Role.USER,
        subscription: {
          create: {
            planType: PlanType.FREE,
            isActive: true,
          },
        },
        usage: {
          create: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            validationCount: 0,
          },
        },
      },
    });
    console.log(`Test user created successfully`);
  }
  console.log(`\n Database seeding completed`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.log(`Error seedig database`, e);
    await prisma.$disconnect();
    process.exit(1);
  });
