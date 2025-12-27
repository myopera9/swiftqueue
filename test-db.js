const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing connection...');
        const users = await prisma.user.findMany();
        console.log('Users:', users);
        const tickets = await prisma.ticket.findMany();
        console.log('Tickets:', tickets);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
