"use client";
import { useAuth } from "@/app/context/AuthContext";
import { useSound } from "@/app/context/SoundContext";
import { Volume2, VolumeX } from 'lucide-react';

export function Header({ title }: { title: string, user?: any }) {
    const { user } = useAuth();
    const { isMuted, toggleMute } = useSound();

    // Handle loading or missing user
    const name = user?.name || "User";
    let roleLabel = "";
    if (user?.role === 'admin') roleLabel = "Admin";
    else if (user?.role === 'ceo') roleLabel = "CEO";
    else if (user?.role === 'cco') roleLabel = "CCO";
    else if (user?.role === 'coo') roleLabel = "COO";
    else roleLabel = user?.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1)) : "";
    const initials = name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase();

    return (
        <header className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 pl-14 md:px-8 md:pl-8 md:ml-64 transition-all sticky top-0 z-20 bg-white/5 backdrop-blur border-white/10">
            <div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">{title}</h2>
            </div>

            <div className="flex items-center gap-4">
                {/* Sound Toggle */}
                <button
                    onClick={toggleMute}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
                >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>

                {/* User Profile - Static Display */}
                {user && (
                    <div className="flex items-center gap-3 pl-4 border-l border-gray-100 py-1 pr-2">
                        <div className="w-10 h-10 bg-iqm-primary rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-sm ring-2 ring-white border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            {initials}
                        </div>
                        <div className="hidden md:block text-left">
                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">{name}</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-50 text-indigo-700 mt-1 capitalize">
                                {roleLabel}
                                {user.department && !['admin', 'ceo', 'cco', 'coo'].includes(user.role) ? ` - ${user.department}` : ''}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
