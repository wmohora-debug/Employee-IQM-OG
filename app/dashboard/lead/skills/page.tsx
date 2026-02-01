import { Sidebar } from "@/app/components/Sidebar";
import { Header } from "@/app/components/Header";
import { SkillMatrix } from "@/app/components/SkillMatrix";

export default function LeadSkillsPage() {
    return (
        <>
            <Header title="Skill Matrix (SVM)" user="Lead Manager" />
            <main className="p-4 md:ml-64 md:p-8 space-y-8">
                <SkillMatrix isEditable={true} />
            </main>
        </>
    );
}
