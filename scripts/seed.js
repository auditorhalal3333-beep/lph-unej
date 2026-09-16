const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@example.com';
  const password = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      password,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('Seeded super admin');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
