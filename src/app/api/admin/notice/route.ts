
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { en, ja } = await request.json();

        if (!en || !ja) {
            return NextResponse.json({ error: 'Missing content' }, { status: 400 });
        }

        const messagesDir = path.join(process.cwd(), 'messages');
        const enPath = path.join(messagesDir, 'en.json');
        const jaPath = path.join(messagesDir, 'ja.json');

        // Helper to update json file
        const updateFile = async (filePath: string, noticeText: string) => {
            const content = await fs.readFile(filePath, 'utf-8');
            const data = JSON.parse(content);

            // Ensure structure exists
            if (!data.Dashboard) data.Dashboard = {};

            data.Dashboard.noticeDescription = noticeText;

            await fs.writeFile(filePath, JSON.stringify(data, null, 4), 'utf-8');
        };

        await Promise.all([
            updateFile(enPath, en),
            updateFile(jaPath, ja)
        ]);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Failed to update notice:', error);
        return NextResponse.json({ error: 'Failed to update notice' }, { status: 500 });
    }
}
