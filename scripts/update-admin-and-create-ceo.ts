import { getAdmin } from '../lib/firebase-admin';

async function migrate() {
    try {
        console.log("Starting Migration: Admin Rename & CEO Creation...");
        const { adminDb, adminAuth } = getAdmin();
        const usersRef = adminDb.collection('users');

        // 1. Find Existing Admin (by fixed UID or email)
        const oldEmail = "dinesh@iqmonline.in";
        const adminUid = "vBlvUiEDmqXbN0dUP7iHSW8ZH1O2"; // Hardcoded UID from rules

        // Update Auth for Admin
        try {
            await adminAuth.updateUser(adminUid, {
                email: "admin@iqmonline.com",
                displayName: "Admin"
            });
            console.log("Admin Auth updated to admin@iqmonline.com");
        } catch (e: any) {
            console.error("Admin Auth Update Failed (Might already exist):", e.message);
        }

        // Update Firestore for Admin
        const adminDocRef = usersRef.doc(adminUid);
        await adminDocRef.update({
            name: "Admin",
            email: "admin@iqmonline.com",
            role: "admin",
            department: null // Ensure no department
        });
        console.log("Admin Firestore updated.");


        // 2. Create CEO User
        const ceoEmail = "dinesh@iqmonline.in";
        const ceoPassword = "password123!"; // Placeholder, user said "123456" but auth requires strong pass usually? No, firebase allows 6 chars.

        // Check if CEO exists in Auth
        let ceoUid;
        try {
            const existingCeo = await adminAuth.getUserByEmail(ceoEmail);
            ceoUid = existingCeo.uid;
            console.log("CEO Auth user already exists.");
        } catch (e) {
            console.log("Creating CEO Auth user...");
            const newCeo = await adminAuth.createUser({
                email: ceoEmail,
                password: "123456", // As requested
                displayName: "Dinesh Sharma"
            });
            ceoUid = newCeo.uid;
        }

        // Set CEO in Firestore
        await usersRef.doc(ceoUid).set({
            uid: ceoUid,
            name: "Dinesh Sharma",
            email: ceoEmail,
            role: "ceo",
            department: null, // Global
            createdAt: new Date(),
            points: 0
        }, { merge: true });

        console.log("CEO Firestore updated/created.");
        console.log("Migration Complete.");

    } catch (error: any) {
        console.error("Migration Error:", error);
    }
}

migrate();
