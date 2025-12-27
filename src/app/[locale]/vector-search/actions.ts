"use server";

import { prisma } from "@/lib/prisma";
import { HuggingFaceTransformersEmbeddings } from "@langchain/community/embeddings/huggingface_transformers";
import { Document } from "@langchain/core/documents";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { Embeddings } from "@langchain/core/embeddings";
import { pipeline, env } from "@huggingface/transformers";

// Skip local caching check to avoid "string too long" errors in Node.js env
env.useBrowserCache = false;

// Simple in-memory vector store implementation to avoid dependency issues
class SimpleMemoryVectorStore {
    documents: Document[] = [];
    embeddings: number[][] = [];
    embedder: Embeddings;

    constructor(embedder: Embeddings) {
        this.embedder = embedder;
    }

    async addDocuments(docs: Document[]) {
        this.documents.push(...docs);
        const texts = docs.map(d => d.pageContent);
        const newEmbeddings = await this.embedder.embedDocuments(texts);
        this.embeddings.push(...newEmbeddings);
    }

    static async fromDocuments(docs: Document[], embedder: Embeddings) {
        const store = new SimpleMemoryVectorStore(embedder);
        await store.addDocuments(docs);
        return store;
    }

    async similaritySearch(query: string, k: number = 1) {
        const queryEmbedding = await this.embedder.embedQuery(query);
        const scores = this.embeddings.map((emb, i) => ({
            score: this.cosineSimilarity(queryEmbedding, emb),
            doc: this.documents[i]
        }));

        scores.sort((a, b) => b.score - a.score);
        return scores.slice(0, k).map(s => s.doc);
    }

    private cosineSimilarity(a: number[], b: number[]) {
        let dot = 0;
        let magA = 0;
        let magB = 0;
        for (let i = 0; i < a.length; i++) {
            dot += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }
        if (magA === 0 || magB === 0) return 0;
        return dot / (Math.sqrt(magA) * Math.sqrt(magB));
    }
}

export async function processVectorSearch(message: string, locale: string) {
    try {
        console.log("Vector Search called with:", message, locale);

        // 1. Fetch data from Prisma
        // Fetching more details to provide better context
        const tickets = await prisma.ticket.findMany({
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        if (tickets.length === 0) {
            return locale === 'ja'
                ? "データベースにチケットが見つかりませんでした。"
                : "No tickets found in the database.";
        }

        const docs = tickets.map(ticket => new Document({
            pageContent: `Title: ${ticket.title}\nDescription: ${ticket.description}\nStatus: ${ticket.status}\nPriority: ${ticket.priority}`,
            metadata: { id: ticket.id, type: "ticket", title: ticket.title, description: ticket.description, status: ticket.status, priority: ticket.priority }
        }));

        console.log(`Created ${docs.length} documents for vector store.${docs}`);

        // 2. Initialize Embeddings
        const embeddings = new HuggingFaceTransformersEmbeddings({
            model: "Xenova/all-MiniLM-L6-v2",
        });

        /*const embeddings = new GoogleGenerativeAIEmbeddings({
            modelName: "embedding-001",
            apiKey: process.env.GEMINI_API_KEY
        });*/

        // 3. Create Vector Store
        // For production, you should use a persistent vector store (Supabase pgvector, Pinecone, etc.)
        // Building this in-memory every time is expensive and slow for large datasets.
        const vectorStore = await SimpleMemoryVectorStore.fromDocuments(docs, embeddings);

        // 4. Search
        const results = await vectorStore.similaritySearch(message, 1);
        console.log('result:', results)
        //const results = await vectorStore.similaritySearch(message, 1);
        const context = results.map((doc: Document) => doc.pageContent).join("\n\n");

        console.log("Vector search results found.", context);

        // 5. Generate Answer
        // 5. Generate Answer
        //const generator = await pipeline('text2text-generation', 'bigscience/mt0-base', { dtype: 'fp32' });


        const template = locale === 'ja'
            ? `あなたはチケットシステムのAIアシスタントです。以下のコンテキストを使用して、ユーザーの質問に答えてください。もし答えがわからない場合は、正直に「提供された情報からは答えられません」と答えてください。\n\nコンテキスト:\n{context}\n\n質問: {question}`
            : `You are an AI assistant for a ticket system. Use the following context to answer the user's question. If you don't know the answer based on the context, honestly state that you cannot answer from the provided information.\n\nContext:\n{context}\n\nQuestion: {question}`;

        const formattedPrompt = template
            .replace("{context}", context)
            .replace("{question}", message);

        const inputPrompt = {
            prompt: formattedPrompt,
        };

        function buildQueryParams(inputPrompt: any) {
            const params = new URLSearchParams();
            for (const key in inputPrompt) {
                // オブジェクトのプロパティをループ処理
                // 値を文字列に変換してから追加するのが安全
                params.append(key, String(inputPrompt[key]));
            }
            // 例: "review=Excellent+work+this+quarter.&scores=95&userid=user123"
            return params.toString();
        }

        const queryParams = buildQueryParams(inputPrompt);
        console.log("Query params:", queryParams);

        const response = await fetch(`http://localhost:6470/ticket-ragvector?${queryParams}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain'
            },
        });

        if (!response.ok) {
            throw new Error(`RAG vector service responded with status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Raw RAG Vector service response:", data);
        const finalResponse = data;

        console.log("RAG Vector service response:", finalResponse);

        return finalResponse || "No response generated.";

    } catch (error: any) {
        console.error("Vector search error details:", error);
        if (error.status === 429 || error.message?.includes('429')) {
            return "申し訳ありませんが、AIサービスの利用制限（クォータ）に達しました。しばらく待ってから再度お試しください。";
        }
        return "システムエラーが発生しました。しばらく待ってから再度お試しください。";
    }
}
