const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
      where: {
        email: 'admin@radiostation.com'
      }
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Create admin user
    const admin = await prisma.user.create({
      data: {
        email: 'admin@radiostation.com',
        username: 'admin',
        password: hashedPassword,
        displayName: 'Admin',
        role: 'ADMIN',
        isAdmin: true
      }
    });

    console.log('Admin user created successfully:', admin);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 