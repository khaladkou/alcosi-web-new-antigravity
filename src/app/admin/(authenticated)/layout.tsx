import { Sidebar } from "@/components/admin/Sidebar";

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-secondary/20 min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-64 p-8">
                {children}
            </main>
        </div>
    );
}
