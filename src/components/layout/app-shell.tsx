import { Sidebar } from "./sidebar";
import { auth } from "@/auth";

export async function AppShell({ children }: { children: React.ReactNode }) {
    const session = await auth();
    return (
        <div className="flex min-h-screen w-full">
            {session?.user && <Sidebar session={session} />}
            <main className="flex w-full flex-1 flex-col overflow-hidden">
                {children}
            </main>
        </div>
    );
}
