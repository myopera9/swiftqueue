import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id },
            include: {
                createdBy: true,
                assignedTo: true,
                comments: {
                    include: {
                        author: {
                            select: { name: true, image: true, email: true }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json(ticket);
    } catch (error) {
        console.error('Failed to fetch ticket:', error);
        return NextResponse.json({ error: 'Failed to fetch ticket' }, { status: 500 });
    }
}

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const body = await request.json();
        // Extract fields that can be updated
        // Note: createdById should typically not be changed.
        const { title, description, status, priority, assignedToId } = body;

        const ticket = await prisma.ticket.update({
            where: { id },
            data: {
                title,
                description,
                status,
                priority,
                // Only update assignedToId if it is explicitly provided (can be null to unassign)
                ...(assignedToId !== undefined && { assignedToId }),
            },
        });

        return NextResponse.json(ticket);
    } catch (error) {
        console.error('Failed to update ticket:', error);
        return NextResponse.json({ error: 'Failed to update ticket' }, { status: 500 });
    }
}
