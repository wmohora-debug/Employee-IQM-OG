import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        // Initialize Admin
        let adminAuth, adminDb;
        try {
            const admin = getAdmin();
            adminAuth = admin.adminAuth;
            adminDb = admin.adminDb;
        } catch (e: any) {
            return NextResponse.json({ error: e.message }, { status: 500 });
        }

        const authHeader = req.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const callerUid = decodedToken.uid;

        // 1. Verify Caller is Admin
        if (callerUid !== "vBlvUiEDmqXbN0dUP7iHSW8ZH1O2") {
            return NextResponse.json({ error: "Forbidden: Only Admin can onboard users" }, { status: 403 });
        }

        const { email, password, name, role, department } = await req.json();

        if (!email || !password || !name || !role || !department) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 2. Validate Role
        if (!['employee', 'lead'].includes(role)) {
            return NextResponse.json({ error: "Invalid role. Only 'employee' or 'lead' allowed." }, { status: 400 });
        }

        // 3. Create User in Auth
        let newUserRecord;
        try {
            newUserRecord = await adminAuth.createUser({
                email,
                password,
                displayName: name,
            });
        } catch (error: any) {
            if (error.code === 'auth/email-already-exists') {
                return NextResponse.json({ error: "Email already in use." }, { status: 400 });
            }
            throw error;
        }

        // 4. Create User Profile in Firestore
        try {
            await adminDb.collection("users").doc(newUserRecord.uid).set({
                uid: newUserRecord.uid,
                name,
                email,
                role,
                department, // Save Department
                status: 'active',
                createdAt: new Date(),
                onboardedBy: callerUid
            });
        } catch (error: any) {
            // Rollback Auth creation if Firestore fails
            await adminAuth.deleteUser(newUserRecord.uid);
            throw new Error("Failed to create user profile. Rolled back.");
        }

        return NextResponse.json({ success: true, uid: newUserRecord.uid });

    } catch (error: any) {
        console.error("Onboarding Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
