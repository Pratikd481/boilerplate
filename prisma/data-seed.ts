import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
    await prisma.user.create({
        data: {
            email: 'admin@example.com',
            name: 'Admin',
            passwordHash: 'securepassword'
        }
    });
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
