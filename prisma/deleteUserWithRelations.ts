import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function deleteUserByEmail(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('User not found');
    return;
  }
  const userId = user.id;

  // Delete related records
  await prisma.account.deleteMany({ where: { userId } });
  await prisma.session.deleteMany({ where: { userId } });
  await prisma.usageLog.deleteMany({ where: { userId } });
  await prisma.project.deleteMany({ where: { userId } });

  // Delete the user
  await prisma.user.delete({ where: { id: userId } });
  console.log('User and related records deleted');
}

// Change the email below to the user you want to delete
const emailToDelete = 'abhinayy060@gmail.com';

deleteUserByEmail(emailToDelete)
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 