import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/firebase-admin";


export async function POST(req: NextRequest) {
    try {
        // Initialize Admin SDK Lazily
        let adminAuth, adminDb;
        try {
            const admin = getAdmin();
            adminAuth = admin.adminAuth;
            adminDb = admin.adminDb;
        } catch (e: any) {
            console.error("Firebase Admin Init Error:", e.message);
            return NextResponse.json({ error: e.message }, { status: 500 });
        }

        const { targetUid } = await req.json();
        const authHeader = req.headers.get("Authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const callerUid = decodedToken.uid;

        // 1. Verify Caller is Admin
        // We know Admin UID is hardcoded or we can check the db
        if (callerUid !== "vBlvUiEDmqXbN0dUP7iHSW8ZH1O2") {
            // Double check via DB if needed, but for now strict checking
            return NextResponse.json({ error: "Forbidden: Only Admin can terminate users" }, { status: 403 });
        }

        if (!targetUid) {
            return NextResponse.json({ error: "Target UID required" }, { status: 400 });
        }

        if (targetUid === callerUid) {
            return NextResponse.json({ error: "Cannot terminate yourself" }, { status: 400 });
        }

        // 2. Verify Target is NOT Admin
        const targetDoc = await adminDb.collection("users").doc(targetUid).get();
        if (!targetDoc.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const targetData = targetDoc.data();
        if (targetData?.role === 'admin') {
            return NextResponse.json({ error: "Cannot terminate another Admin" }, { status: 403 });
        }

        console.log(`Terminating user ${targetUid} by ${callerUid}`);

        // 3. Perform Deletion (Cascade)

        // START BATCH
        const batch = adminDb.batch();

        // A. Delete from Auth
        try {
            await adminAuth.deleteUser(targetUid);
        } catch (err: any) {
            console.warn("Auth user might already be deleted:", err.message);
        }

        // B. Delete from Firestore (Users collection)
        const userRef = adminDb.collection("users").doc(targetUid);
        batch.delete(userRef);

        // C. Clean up Tasks
        // 1. Assigned TO the user
        const tasksAssignedTo = await adminDb.collection("tasks").where("assignedTo", "==", targetUid).get();
        tasksAssignedTo.docs.forEach((doc: any) => batch.delete(doc.ref));

        // 2. Assigned BY the user (Lead)
        const tasksAssignedBy = await adminDb.collection("tasks").where("assignedBy", "==", targetUid).get();
        tasksAssignedBy.docs.forEach((doc: any) => batch.delete(doc.ref));

        // 3. Verified BY the user (Lead)
        const tasksVerifiedBy = await adminDb.collection("tasks").where("verifiedBy", "==", targetUid).get();
        tasksVerifiedBy.docs.forEach((doc: any) => batch.delete(doc.ref));

        // 4. AssigneeIds Array Contains (Employee)
        const tasksAssignee = await adminDb.collection("tasks").where("assigneeIds", "array-contains", targetUid).get();
        tasksAssignee.docs.forEach((doc: any) => batch.delete(doc.ref));


        // D. Clean up SVM Ratings & Recalculate Logic
        const employeesToRecalculate = new Set<string>();

        // 1. Ratings RECEIVED by the user (Delete them)
        const svmReceived = await adminDb.collection("svm_ratings").where("employeeId", "==", targetUid).get();
        svmReceived.docs.forEach((doc: any) => batch.delete(doc.ref));

        // 2. Ratings GIVEN by the user (Delete them AND trigger recalc for affected employees)
        const svmGiven = await adminDb.collection("svm_ratings").where("leadId", "==", targetUid).get();
        svmGiven.docs.forEach((doc: any) => {
            const data = doc.data();
            if (data.employeeId) {
                employeesToRecalculate.add(data.employeeId);
            }
            batch.delete(doc.ref);
        });

        // E. Clean up User Skills
        // 1. Owned by user
        const skillsOwned = await adminDb.collection("user_skills").where("userId", "==", targetUid).get();
        skillsOwned.docs.forEach((doc: any) => batch.delete(doc.ref));

        // 2. Validated by user (Lead)
        const skillsValidated = await adminDb.collection("user_skills").where("validatedBy", "==", targetUid).get();
        skillsValidated.docs.forEach((doc: any) => batch.delete(doc.ref));

        // F. Clean up Leaderboard/Stats if existing
        // (Assuming standard users doc handles this, but if there are side-documents)
        // await adminDb.collection("employee_stats").doc(targetUid).delete(); // If exists


        // COMMIT DELETE BATCH
        await batch.commit();

        console.log("Cascade deletion complete. Starting recalculation...");

        // 4. Post-Deletion Recalculation
        // For each employee who lost a rating, we must recalculate their average
        for (const empId of Array.from(employeesToRecalculate)) {
            // Check if user still exists (might have been the one deleted, though unlikely given logic)
            if (empId === targetUid) continue;

            const ratingsSnap = await adminDb.collection("svm_ratings").where("employeeId", "==", empId).get();
            const ratings = ratingsSnap.docs.map((d: any) => d.data().average);

            let newSvmScore = 0;
            if (ratings.length > 0) {
                const sum = ratings.reduce((a: number, b: number) => a + b, 0);
                newSvmScore = parseFloat((sum / ratings.length).toFixed(2));
            }

            await adminDb.collection("users").doc(empId).update({
                svmScore: newSvmScore,
                ratingCount: ratings.length
            });
            console.log(`Recalculated SVM for ${empId}: ${newSvmScore}`);
        }

        return NextResponse.json({ success: true, message: "User and all related data terminated successfully." });

    } catch (error: any) {
        console.error("Termination error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
