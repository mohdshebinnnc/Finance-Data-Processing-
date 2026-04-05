import { PrismaClient, Role, TransactionType, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const hashedPassword = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@finance.com' },
    update: {},
    create: {
      email: 'admin@finance.com',
      password: hashedPassword,
      name: 'Admin User',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
    },
  });

  const analyst = await prisma.user.upsert({
    where: { email: 'analyst@finance.com' },
    update: {},
    create: {
      email: 'analyst@finance.com',
      password: hashedPassword,
      name: 'Analyst User',
      role: Role.ANALYST,
      status: UserStatus.ACTIVE,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@finance.com' },
    update: {},
    create: {
      email: 'viewer@finance.com',
      password: hashedPassword,
      name: 'Viewer User',
      role: Role.VIEWER,
      status: UserStatus.ACTIVE,
    },
  });

  console.log('Created users:', { admin: admin.email, analyst: analyst.email, viewer: viewer.email });

  const categories = {
    income: ['Salary', 'Freelance', 'Investment', 'Business', 'Other Income'],
    expense: ['Food', 'Transportation', 'Housing', 'Utilities', 'Entertainment', 'Healthcare', 'Education', 'Shopping', 'Other Expense'],
  };

  const transactions = [];

  for (let i = 0; i < 50; i++) {
    const isIncome = Math.random() > 0.4;
    const type = isIncome ? TransactionType.INCOME : TransactionType.EXPENSE;
    const categoryList = isIncome ? categories.income : categories.expense;
    const category = categoryList[Math.floor(Math.random() * categoryList.length)];
    
    const daysAgo = Math.floor(Math.random() * 180);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const user = i % 3 === 0 ? admin : i % 3 === 1 ? analyst : viewer;

    transactions.push({
      amount: isIncome 
        ? Math.floor(Math.random() * 5000) + 1000 
        : Math.floor(Math.random() * 1000) + 50,
      type,
      category,
      date,
      description: `${category} transaction`,
      userId: user.id,
    });
  }

  for (const t of transactions) {
    await prisma.transaction.create({ data: t });
  }

  console.log(`Created ${transactions.length} transactions`);

  console.log('Seed completed successfully!');
  console.log('\nTest credentials:');
  console.log('  Admin: admin@finance.com / password123');
  console.log('  Analyst: analyst@finance.com / password123');
  console.log('  Viewer: viewer@finance.com / password123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
