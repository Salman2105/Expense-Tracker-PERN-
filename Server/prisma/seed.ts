import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

const globalCategories = [
  {
    name: "Food",
    icon: "food",
    type: "EXPENSE" as const,
  },
  {
    name: "Transport",
    icon: "transport",
    type: "EXPENSE" as const,
  },
  {
    name: "Shopping",
    icon: "shopping",
    type: "EXPENSE" as const,
  },
  {
    name: "Bills",
    icon: "bills",
    type: "EXPENSE" as const,
  },
  {
    name: "Entertainment",
    icon: "entertainment",
    type: "EXPENSE" as const,
  },
  {
    name: "Salary",
    icon: "salary",
    type: "INCOME" as const,
  },
  {
    name: "Uncategorized",
    icon: "Uncategorized",
    type: "EXPENSE" as const,
  },
];

async function main() {
  for (const category of globalCategories) {
    await prisma.category.upsert({
      where: {
        userId_name_type: {
          userId: null,
          name: category.name,
          type: category.type,
        },
      },
      update: {
        icon: category.icon,
        isDefault: true,
        userId: null,
      },
      create: {
        name: category.name,
        icon: category.icon,
        type: category.type,
        userId: null,
        isDefault: true,
      },
    });

    console.log(`Ensured global category: ${category.name}`);
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