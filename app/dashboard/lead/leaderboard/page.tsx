import { Sidebar } from "@/app/components/Sidebar";
import { Header } from "@/app/components/Header";
import { Leaderboard } from "@/app/components/Leaderboard";

export default function LeadLeaderboardPage() {
    return (
        <>
            <Header title="Team Leaderboard" user="Lead Manager" />
            <main className="p-4 md:ml-64 md:p-8 space-y-8">
                <Leaderboard />
            </main>
        </>
    );
}
