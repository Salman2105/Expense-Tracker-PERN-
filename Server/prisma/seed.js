require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const globalCategories = [
  { name: "Food", icon: "food", type: "EXPENSE" },
  { name: "Transport", icon: "transport", type: "EXPENSE" },
  { name: "Shopping", icon: "shopping", type: "EXPENSE" },
  { name: "Bills", icon: "bills", type: "EXPENSE" },
  { name: "Entertainment", icon: "entertainment", type: "EXPENSE" },
  { name: "Salary", icon: "salary", type: "INCOME" },
  { name: "Uncategorized", icon: "Uncategorized", type: "EXPENSE" },
];

async function main() {
  for (const category of globalCategories) {
    const existing = await prisma.category.findFirst({
      where: {
        name: category.name,
        type: category.type,
        userId: null,
        isDefault: true,
      },
    });

    if (existing) {
      await prisma.category.update({
        where: { categoryId: existing.categoryId },
        data: {
          icon: category.icon,
          type: category.type,
          isDefault: true,
          userId: null,
        },
      });

      console.log(`Ensured global category: ${category.name}`);
      continue;
    }

    await prisma.category.create({
      data: {
        name: category.name,
        icon: category.icon,
        type: category.type,
        userId: null,
        isDefault: true,
      },
    });

    console.log(`Created global category: ${category.name}`);
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
