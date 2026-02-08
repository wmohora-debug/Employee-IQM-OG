"use client";
import { useAuth } from "@/app/context/AuthContext";

export function Header({ title }: { title: string, user?: any }) {
    const { user } = useAuth();

    // Handle loading or missing user
    const name = user?.name || "User";
    let roleLabel = "";
    if (user?.role === 'admin') roleLabel = "Admin";
    else if (user?.role === 'ceo') roleLabel = "CEO";
    else roleLabel = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : "";
    const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-8 md:ml-64 transition-all sticky top-0 z-20">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800">{title}</h2>
            </div>

            {/* User Profile - Static Display */}
            {user && (
                <div className="flex items-center gap-3 pl-4 border-l border-gray-100 py-1 pr-2">
                    <div className="w-10 h-10 bg-iqm-primary rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-white">
                        {initials}
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-bold text-gray-900 leading-tight">{name}</p>
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 mt-1 capitalize">
                            {roleLabel}
                            {user.department && user.role !== 'admin' && user.role !== 'ceo' ? ` - ${user.department}` : ''}
                        </span>
                    </div>
                </div>
            )}
        </header>
    );
}
