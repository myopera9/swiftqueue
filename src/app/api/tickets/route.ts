import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const tickets = await prisma.ticket.findMany({
            include: {
                createdBy: true,
                assignedTo: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return NextResponse.json(tickets);
    } catch (error) {
        console.error('Failed to fetch tickets:', error);
        return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
    }
}

import { auth } from '@/auth';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { title, description, priority } = body;
        const userId = session.user.id;

        const ticket = await prisma.ticket.create({
            data: {
                title,
                description,
                priority: priority || 'MEDIUM',
                createdById: userId,
                status: 'OPEN',
            },
        });

        return NextResponse.json(ticket);
    } catch (error) {
        console.error('Failed to create ticket:', error);
        return NextResponse.json({ error: 'Failed to create ticket' }, { status: 500 });
    }
}
