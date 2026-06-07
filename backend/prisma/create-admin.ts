import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@resumepilot.ai';
  const password = 'Admin@ResumePilot2025';
  const name = 'Admin';

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, role: 'admin', name },
    create: { email, password: hashed, name, role: 'admin' },
  });

  console.log(`Admin created: ${user.email} (id: ${user.id})`);
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
