import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@leadradius.io';
  const adminPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { password: adminPassword, role: 'admin' },
    create: {
      name: 'Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'admin',
    },
  });

  const teamEmail = 'team@jaiveeru.co.in';
  const teamPassword = await bcrypt.hash('team123', 10);

  const team = await prisma.user.upsert({
    where: { email: teamEmail },
    update: { password: teamPassword, role: 'user' },
    create: {
      name: 'JV Team',
      email: teamEmail,
      password: teamPassword,
      role: 'user',
    },
  });

  console.log('Admin account created: email:', admin.email, 'password: admin123');
  console.log('Team account created: email:', team.email, 'password: team123');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
