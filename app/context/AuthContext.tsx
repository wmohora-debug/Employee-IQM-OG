"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { User, UserRole } from "@/lib/db";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string) => Promise<void>; // Kept for interface compat, but unused
    logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { },
    logout: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in, fetch Firestore profile
                try {
                    const userRef = doc(db, "users", firebaseUser.uid);
                    const snap = await getDoc(userRef);

                    if (snap.exists()) {
                        const userData = snap.data() as User;

                        // MIGRATION / BACKFILL for Department
                        if (!userData.department && !['admin', 'ceo'].includes(userData.role)) {
                            console.warn("User missing department, backfilling default 'Development'");
                            const updatedUser = { ...userData, department: 'Development', uid: firebaseUser.uid };
                            await setDoc(userRef, { department: 'Development' }, { merge: true });
                            setUser(updatedUser);
                        } else {
                            setUser({ ...userData, uid: firebaseUser.uid });
                        }

                        // Handle redirection if on login page
                        const path = window.location.pathname;
                        if (path === '/') {
                            if (userData.role === 'lead') router.push('/dashboard/lead');
                            else if (userData.role === 'admin') router.push('/dashboard/admin/employees');
                            else if (userData.role === 'ceo') router.push('/dashboard/ceo/employees');
                            else if (userData.role === 'cco') router.push('/dashboard/cco/employees');
                            else if (userData.role === 'coo') router.push('/dashboard/coo/employees');
                            else router.push('/dashboard/employee');
                        }
                    } else {
                        // NEW USER HANDLING
                        console.log("Creating new user profile for", firebaseUser.email);
                        const email = firebaseUser.email?.toLowerCase() || "";
                        let role: UserRole = "employee";
                        if (email.includes("suraj")) role = "lead";
                        if (email.includes("admin") || email.includes("hr")) role = "admin";
                        // Auto-detect CEO for testing if needed, though usually manual.
                        // For safety, let's not auto-assign CEO unless specific email.
                        // Admin script creates CEO, so this block might not even run for him if created first.

                        const rawName = firebaseUser.displayName || email.split('@')[0];
                        const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

                        const newUser: User = {
                            uid: firebaseUser.uid,
                            email: email,
                            name: displayName,
                            role: role,
                            points: 0,
                            // Admin/CEO has no department
                            department: ['admin', 'ceo'].includes(role) ? undefined : 'Development'
                        };

                        await setDoc(userRef, {
                            ...newUser,
                            createdAt: serverTimestamp(),
                            lastSeen: serverTimestamp()
                        });

                        setUser(newUser);
                        if (role === 'lead') router.push('/dashboard/lead');
                        else if (role === 'admin') router.push('/dashboard/admin/employees');
                        else if (role === 'ceo') router.push('/dashboard/ceo/employees');
                        else if (role === 'cco') router.push('/dashboard/cco/employees');
                        else if (role === 'coo') router.push('/dashboard/coo/employees');
                        else router.push('/dashboard/employee');
                    }
                } catch (error) {
                    console.error("Error fetching user profile", error);
                }
            } else {
                // User is signed out
                setUser(null);
                const path = window.location.pathname;
                // If on a protected route and signed out -> redirect to login
                if (path.startsWith('/dashboard')) {
                    router.push('/');
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    // Legacy login compat (unused in real auth)
    const login = async (email: string) => { };

    const logout = async () => {
        try {
            setLoading(true);
            await signOut(auth);
            setUser(null);
            // Force hard redirect to clear any in-memory state/caches
            window.location.href = "/";
        } catch (error) {
            console.error("Logout error", error);
            // Fallback redirect even on error
            window.location.href = "/";
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
