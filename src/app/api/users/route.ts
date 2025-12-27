
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { auth } from '@/auth';

export async function POST(request: Request) {
    const session = await auth();

    // Check if user is authenticated and is an ADMIN (optional but good practice, keeping it simple for now)
    // For now, let's just require authentication
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { username, password, name, email, role } = body;

        if (!username || !password) {
            return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
        }

        // Check if username already exists
        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return NextResponse.json({ error: 'Username already taken' }, { status: 400 });
        }

        // Check if email already exists (if provided)
        if (email) {
            const existingEmail = await prisma.user.findUnique({
                where: { email },
            });

            if (existingEmail) {
                return NextResponse.json({ error: 'Email already taken' }, { status: 400 });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                name,
                email,
                role: role || 'USER',
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;

    } catch (error) {
        console.error('Failed to create user:', error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                name: true,
                email: true,
            },
        });
        return NextResponse.json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
