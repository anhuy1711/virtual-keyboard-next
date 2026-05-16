import AdminSidebar from '@/app/components/admin/AdminSidebar';
import AdminTopbar from '@/app/components/admin/AdminTopbar';

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-surface text-on-surface flex min-h-screen">
            <AdminSidebar />

            <main className="flex-grow flex flex-col min-w-0">

                <div className="ml-72 mt-16 p-12 px-24">
                    {children}
                </div>
            </main>
        </div>
    );
}