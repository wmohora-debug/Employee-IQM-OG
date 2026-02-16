
import { getAdmin } from '../lib/firebase-admin';

async function main() {
    try {
        console.log("Looking for user: dinesh@iqmonline.in");
        const { adminAuth } = getAdmin();
        
        try {
            const user = await adminAuth.getUserByEmail('dinesh@iqmonline.in');
            console.log(`Found user ${user.uid}. Updating password...`);
            
            await adminAuth.updateUser(user.uid, {
                password: 'dinesharma@2026'
            });
            
            console.log("Password updated successfully.");
        } catch (e: any) {
            if (e.code === 'auth/user-not-found') {
                console.error("User dinesh@iqmonline.in not found.");
            } else {
                throw e;
            }
        }
        
    } catch (error) {
        console.error("Error updating password:", error);
    }
}

main();
