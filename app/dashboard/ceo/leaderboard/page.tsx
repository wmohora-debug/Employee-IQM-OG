"use client";
import { Header } from "@/app/components/Header";
import { Leaderboard } from "@/app/components/Leaderboard";
import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CEOLeaderboardPage() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && user?.role !== 'ceo') {
            router.push('/');
        }
    }, [user, loading, router]);

    if (loading || user?.role !== 'ceo') return null;

    return (
        <>
            <Header title="Company Leaderboard" />
            <main className="p-4 md:ml-64 md:p-8 space-y-8 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Leaderboard department="Development" />
                    <Leaderboard department="UX" />
                    <Leaderboard department="Social Media" />
                </div>
            </main>
        </>
    );
}
