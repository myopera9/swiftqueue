const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
    const hashedPassword = await bcrypt.hash('password', 10)

    const user = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: hashedPassword
        },
        create: {
            username: 'admin',
            email: 'admin@example.com',
            name: 'Admin User',
            password: hashedPassword,
            role: 'ADMIN',
        },
    })

    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
