const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@radiostation.com' },
      update: {},
      create: {
        email: 'admin@radiostation.com',
        username: 'admin',
        password: adminPassword,
        displayName: 'Admin',
        role: 'ADMIN',
        isAdmin: true,
        profilePicture: 'admin-avatar.png',
        bio: 'Radio Station Administrator'
      },
    });

    console.log('Admin user created:', admin);

    // Create sample tracks
    const sampleTracks = [
      {
        title: 'Summer Vibes',
        artist: 'DJ Cool',
        url: '/tracks/summer-vibes.mp3',
        artwork: '/artwork/summer-vibes.jpg'
      },
      {
        title: 'Night Drive',
        artist: 'Midnight Cruisers',
        url: '/tracks/night-drive.mp3',
        artwork: '/artwork/night-drive.jpg'
      },
      {
        title: 'Morning Coffee',
        artist: 'Chill Beats',
        url: '/tracks/morning-coffee.mp3',
        artwork: '/artwork/morning-coffee.jpg'
      }
    ];

    // Create tracks one by one to handle potential duplicates
    for (const track of sampleTracks) {
      await prisma.track.upsert({
        where: {
          title_artist: {
            title: track.title,
            artist: track.artist
          }
        },
        update: {},
        create: track
      });
    }

    console.log('Sample tracks created successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 