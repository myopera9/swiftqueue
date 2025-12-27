import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id: ticketId } = await params;

    try {
        const body = await request.json();
        const { content } = body;

        if (!content || !content.trim()) {
            return NextResponse.json({ error: 'Content is required' }, { status: 400 });
        }

        const comment = await prisma.comment.create({
            data: {
                content,
                ticketId,
                authorId: userId,
            },
            include: {
                author: {
                    select: { name: true, image: true, email: true }
                }
            }
        });

        return NextResponse.json(comment);
    } catch (error) {
        console.error('Failed to create comment:', error);
        return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 });
    }
}
