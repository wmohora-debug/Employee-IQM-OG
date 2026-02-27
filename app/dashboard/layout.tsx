"use client";
import { RoleBackground } from "@/app/components/RoleBackground";
import { useAuth } from "@/app/context/AuthContext";

export default function DashboardGlobalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="relative min-h-screen">
            <RoleBackground />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
