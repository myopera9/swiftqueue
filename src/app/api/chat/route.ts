
import { NextResponse } from "next/server";
import { genAI } from "@/lib/gemini";
import { SchemaType } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

// Define the tools
async function listTickets(args: { status?: string; priority?: string; search?: string }) {
    console.log("TOOL CALL: listTickets", args);
    const where: any = {};

    if (args.status) {
        where.status = args.status;
    }
    if (args.priority) {
        where.priority = args.priority;
    }
    if (args.search) {
        where.OR = [
            { title: { contains: args.search } }, // SQLite contains is case-sensitive by default usually, but Prisma mimics ILIKE if mapped? Let's assume standard behavior.
            { description: { contains: args.search } },
        ];
    }

    try {
        const tickets = await prisma.ticket.findMany({
            where,
            select: {
                id: true,
                title: true,
                status: true,
                priority: true,
                description: true,
                createdAt: true,
            },
            take: 5,
            //take: 10,
        });
        console.log("Tickets:", tickets);
        return { tickets };
    } catch (error) {
        console.error("Error listing tickets:", error);
        return { error: "Failed to list tickets" };
    }
}

async function getTicketDetails(args: { ticketId: string }) {
    console.log("TOOL CALL: getTicketDetails", args);
    try {
        const ticket = await prisma.ticket.findUnique({
            where: { id: args.ticketId },
            include: {
                createdBy: { select: { name: true, email: true } },
                assignedTo: { select: { name: true, email: true } },
            },
        });
        if (!ticket) return { error: "Ticket not found" };
        return { ticket };
    } catch (error) {
        console.error("Error getting ticket details:", error);
        return { error: "Failed to get ticket details" };
    }
}

async function getTicketComments(args: { ticketId: string }) {
    console.log("TOOL CALL: getTicketComments", args);
    try {
        const comments = await prisma.comment.findMany({
            where: { ticketId: args.ticketId },
            include: {
                author: { select: { name: true } },
            },
            orderBy: { createdAt: 'asc' },
        });
        return { comments };
    } catch (error) {
        console.error("Error getting ticket comments:", error);
        return { error: "Failed to get ticket comments" };
    }
}

// Tool definitions for Gemini
const tools: any[] = [
    {
        functionDeclarations: [
            {
                name: "listTickets",
                description: "List tickets with optional filtering by status, priority, or search text.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        status: { type: SchemaType.STRING, description: "Filter by status (OPEN, IN_PROGRESS, CLOSED)" },
                        priority: { type: SchemaType.STRING, description: "Filter by priority (LOW, MEDIUM, HIGH, URGENT)" },
                        search: { type: SchemaType.STRING, description: "Search text in title or description" },
                    },
                },
            },
            {
                name: "getTicketDetails",
                description: "Get detailed information about a specific ticket by ID.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        ticketId: { type: SchemaType.STRING, description: "The ID of the ticket" },
                    },
                    required: ["ticketId"],
                },
            },
            {
                name: "getTicketComments",
                description: "Get comments for a specific ticket.",
                parameters: {
                    type: SchemaType.OBJECT,
                    properties: {
                        ticketId: { type: SchemaType.STRING, description: "The ID of the ticket" },
                    },
                    required: ["ticketId"],
                },
            },
        ],
    },
];

export async function POST(req: Request) {
    try {
        const { messages, locale } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
        }

        const systemInstruction = `You are a helpful assistant for a ticket system. 
The user's current locale is '${locale}'.
You MUST answer all questions in ${locale === 'ja' ? 'Japanese' : 'English'}.

IMPORTANT: The ticket database may contain content in English or Japanese. 
When using tools like 'listTickets' or 'search', if the user asks in Japanese, you should TRY to search using English keywords if the Japanese keywords might not match the database content, and vice versa. 
Your goal is to find the relevant information regardless of the language mismatch between the query and the data, run always just once.
`;

        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
            tools: tools,
            systemInstruction: systemInstruction,
        });

        const rawHistory = messages.slice(0, -1).map((msg: any) => ({
            role: msg.role === "assistant" ? "model" : "user",
            parts: [{ text: msg.content }],
        }));

        const history: any[] = [];
        let expectedRole = "user";

        for (const msg of rawHistory) {
            if (!msg.parts[0].text) continue;
            if (msg.role === expectedRole) {
                history.push(msg);
                expectedRole = expectedRole === "user" ? "model" : "user";
            }
        }

        // Ensure history logic for startChat is valid (must not end with user if we are sending user)
        if (history.length > 0 && history[history.length - 1].role === "user") {
            history.pop();
        }

        const lastMessage = messages[messages.length - 1];
        const lastMessageContent = lastMessage.content;

        if (!lastMessageContent) {
            return NextResponse.json({ error: "Last message content is missing" }, { status: 400 });
        }

        const chat = model.startChat({
            history: history,
        });

        let result = await chat.sendMessage(String(lastMessageContent));
        let response = await result.response;

        const MAX_TURNS = 1;
        let turn = 0;

        while (turn < MAX_TURNS) {
            const functionCalls = response.functionCalls();

            if (functionCalls && functionCalls.length > 0) {
                const functionResponses = [];

                for (const call of functionCalls) {
                    const name = call.name;
                    const args = call.args;
                    let apiResponse;

                    if (name === "listTickets") {
                        apiResponse = await listTickets(args as any);
                    } else if (name === "getTicketDetails") {
                        apiResponse = await getTicketDetails(args as any);
                    } else if (name === "getTicketComments") {
                        apiResponse = await getTicketComments(args as any);
                    } else {
                        apiResponse = { error: "Unknown function" };
                    }

                    functionResponses.push({
                        functionResponse: {
                            name: name,
                            response: apiResponse,
                        }
                    });
                }

                // Send function response back to model
                result = await chat.sendMessage(functionResponses);
                response = await result.response;
                turn++;
            } else {
                // No function calls, just text response
                break;
            }
        }

        const text = response.text();
        return NextResponse.json({ content: text });

    } catch (error) {
        console.error("Error in chat API:", error);
        return NextResponse.json({
            error: "Failed to process chat request",
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
