"use client";
import { useEffect, useMemo } from "react";
import { useAuth } from "@/app/context/AuthContext";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { user, isLoggingOut } = useAuth();

    const theme = useMemo(() => {
        if (!user || isLoggingOut) return null;

        const d = Array.isArray(user.department) ? user.department[0] : user.department;
        const r = user.role;

        if (d === 'Development') return 'dev';
        if (d === 'UX') return 'ux';
        if (d === 'Social Media') return 'social';
        if (r === 'ceo') return 'ceo';
        if (r === 'coo') return 'coo';
        if (r === 'cco') return 'cco';
        if (r === 'admin') return 'admin';
        return 'default';
    }, [user?.role, user?.department, isLoggingOut, user?.uid]);

    useEffect(() => {
        const root = document.documentElement;
        if (!theme) {
            root.removeAttribute("data-theme");
        } else {
            root.setAttribute("data-theme", theme);
        }
    }, [theme]);

    return <>{children}</>;
}
