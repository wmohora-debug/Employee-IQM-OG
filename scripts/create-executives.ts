
import { getAdmin } from '../lib/firebase-admin';
import * as admin from 'firebase-admin';

async function main() {
    console.log("Creating/Updating Executive Users...");

    // Check if initialized
    try {
        const { adminAuth, adminDb } = getAdmin();
    } catch (e) {
        console.error("Firebase Admin SDK failed to initialize. Check service account key.");
        process.exit(1);
    }

    const { adminAuth, adminDb } = getAdmin();

    const executives = [
        {
            email: "prabhanu@iqmonline.in",
            password: "xukmox-3cihfa-xohsyA",
            name: "Prabhanu Kharel",
            role: "cco"
        },
        {
            email: "nikchaya@iqmonline.in",
            password: "Nikchaya@2026",
            name: "Nikchaya Lamsal",
            role: "coo"
        }
    ];

    for (const exec of executives) {
        let uid = "";
        try {
            console.log(`Checking user: ${exec.email}`);
            const userRecord = await adminAuth.getUserByEmail(exec.email);
            uid = userRecord.uid;
            console.log(`User exists (${uid}). updating password...`);
            await adminAuth.updateUser(uid, {
                password: exec.password,
                displayName: exec.name
            });
        } catch (error: any) {
            if (error.code === 'auth/user-not-found') {
                console.log(`User not found. Creating ${exec.email}...`);
                const userRecord = await adminAuth.createUser({
                    email: exec.email,
                    password: exec.password,
                    displayName: exec.name,
                });
                uid = userRecord.uid;
                console.log(`Created user: ${uid}`);
            } else {
                console.error(`Error with ${exec.email}:`, error);
                continue;
            }
        }

        // Update Firestore
        if (uid) {
            console.log(`Updating Firestore profile for ${uid}...`);
            await adminDb.collection('users').doc(uid).set({
                uid: uid,
                email: exec.email,
                name: exec.name,
                role: exec.role,
                points: 0,
                // No department for C-levels
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                lastSeen: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
        }
    }
    console.log("Done.");
}

main().catch(console.error);
