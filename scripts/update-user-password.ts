
import { getAdmin } from '../lib/firebase-admin';

async function main() {
    try {
        const targetEmail = "uprety@iqmonline.in";
        const newPassword = "Beauty1ups@123";

        console.log(`Looking for user: ${targetEmail}`);
        const { adminAuth } = getAdmin();

        try {
            const user = await adminAuth.getUserByEmail(targetEmail);
            console.log(`Found user ${user.uid} (${user.email}). Updating password...`);

            await adminAuth.updateUser(user.uid, {
                password: newPassword
            });

            console.log("Password updated successfully.");
        } catch (e: any) {
            if (e.code === 'auth/user-not-found') {
                console.error(`User ${targetEmail} not found.`);
            } else {
                throw e;
            }
        }

    } catch (error) {
        console.error("Error updating password:", error);
    }
}

main();
