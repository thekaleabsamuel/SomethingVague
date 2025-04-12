const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
  try {
    const admin = await prisma.user.findFirst({
      where: {
        email: 'admin@radiostation.com'
      }
    });

    console.log('Admin user:', admin);
  } catch (error) {
    console.error('Error checking admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAdmin(); 