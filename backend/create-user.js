const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function createUser() {
  const prisma = new PrismaClient();
  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    // Create the user
    const user = await prisma.user.create({
      data: {
        email: 'admin@example.com',
        username: 'admin',
        passwordHash,
      },
    });
    
    console.log('User created successfully:', {
      id: user.id,
      username: user.username,
      email: user.email
    });
  } catch (error) {
    console.error('Error creating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createUser();
