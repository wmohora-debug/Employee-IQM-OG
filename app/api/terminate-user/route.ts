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

        // 1. Verify Caller is HR
        // We know HR UID is hardcoded or we can check the db
        if (callerUid !== "vBlvUiEDmqXbN0dUP7iHSW8ZH1O2") {
            // Double check via DB if needed, but for now strict checking
            return NextResponse.json({ error: "Forbidden: Only HR can terminate users" }, { status: 403 });
        }

        if (!targetUid) {
            return NextResponse.json({ error: "Target UID required" }, { status: 400 });
        }

        if (targetUid === callerUid) {
            return NextResponse.json({ error: "Cannot terminate yourself" }, { status: 400 });
        }

        // 2. Verify Target is NOT HR
        const targetDoc = await adminDb.collection("users").doc(targetUid).get();
        if (!targetDoc.exists) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }
        const targetData = targetDoc.data();
        if (targetData?.role === 'hr') {
            return NextResponse.json({ error: "Cannot terminate another HR" }, { status: 403 });
        }

        console.log(`Terminating user ${targetUid} by ${callerUid}`);

        // 3. Perform Deletion (Atomic-ish)

        // A. Delete from Auth
        await adminAuth.deleteUser(targetUid);

        // B. Delete from Firestore (Users collection)
        await adminDb.collection("users").doc(targetUid).delete();

        // C. Clean up related collections
        const batch = adminDb.batch();

        // Delete valid tasks assigned to user
        const tasksSnapshot = await adminDb.collection("tasks").where("assignedTo", "==", targetUid).get();
        tasksSnapshot.docs.forEach((doc: any) => {
            batch.delete(doc.ref);
        });

        // Delete SVM ratings
        const svmSnapshot = await adminDb.collection("svm_ratings").where("ratedUser", "==", targetUid).get();
        svmSnapshot.docs.forEach((doc: any) => {
            batch.delete(doc.ref);
        });

        // Delete Leaderboard stats (if separate docs exist, otherwise they are usually aggregations)
        // Assuming leaderboard is computed or stored in users. Since user is deleted, it's gone.
        // If there is an 'employee_stats' collection:
        const statsRef = adminDb.collection("employee_stats").doc(targetUid);
        batch.delete(statsRef);

        await batch.commit();

        return NextResponse.json({ success: true, message: "User terminated successfully" });

    } catch (error: any) {
        console.error("Termination error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
