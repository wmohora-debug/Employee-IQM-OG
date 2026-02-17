import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/firebase-admin";

export async function POST(req: NextRequest) {
    try {
        // Initialize Admin SDK
        let adminAuth;
        try {
            const admin = getAdmin();
            adminAuth = admin.adminAuth;
        } catch (e: any) {
            console.error("Firebase Admin Init Error:", e.message);
            return NextResponse.json({ error: e.message }, { status: 500 });
        }

        const { email, newPassword } = await req.json();
        const authHeader = req.headers.get("Authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Verify Admin
        const idToken = authHeader.split("Bearer ")[1];
        const decodedToken = await adminAuth.verifyIdToken(idToken);
        const callerUid = decodedToken.uid;

        // Hardcoded Check (Matching existing logic in terminate-user)
        // Alternatively, check DB role
        if (callerUid !== "vBlvUiEDmqXbN0dUP7iHSW8ZH1O2") {
            // We can also double check via custom claims or DB if needed
            // But following existing pattern:
            return NextResponse.json({ error: "Forbidden: Only Admin can change passwords" }, { status: 403 });
        }

        if (!email || !newPassword) {
            return NextResponse.json({ error: "Email and New Password are required" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        // Find Use by Email
        let userRecord;
        try {
            userRecord = await adminAuth.getUserByEmail(email);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                return NextResponse.json({ error: "User not found with this email" }, { status: 404 });
            }
            throw error;
        }

        // Update Password
        await adminAuth.updateUser(userRecord.uid, {
            password: newPassword
        });

        console.log(`Password updated for user ${email} by admin ${callerUid}`);

        return NextResponse.json({ success: true, message: "Password updated successfully" });

    } catch (error: any) {
        console.error("Change Password Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
