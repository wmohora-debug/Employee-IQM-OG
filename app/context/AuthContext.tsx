"use client";
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
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
    isLoggingOut: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    login: async () => { },
    logout: () => { },
    isLoggingOut: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const frozenUserRef = useRef<User | null>(null);
    const router = useRouter();

    if (user && !isLoggingOut) {
        frozenUserRef.current = user;
    }

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
                        if (!userData.department && !['admin', 'ceo', 'cco', 'coo'].includes(userData.role)) {
                            console.warn("User missing department, backfilling default 'Development'");
                            const updatedUser = { ...userData, department: 'Development', uid: firebaseUser.uid };
                            await setDoc(userRef, { department: 'Development' }, { merge: true });
                            setUser(updatedUser as unknown as User);
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
                        if (email.includes("ceo")) role = "ceo";
                        if (email.includes("cco")) role = "cco";
                        if (email.includes("coo")) role = "coo";
                        // Auto-detect CEO for testing if needed, though usually manual.

                        const rawName = firebaseUser.displayName || email.split('@')[0];
                        const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

                        const newUser: User = {
                            uid: firebaseUser.uid,
                            email: email,
                            name: displayName,
                            role: role,
                            points: 0,
                        };

                        // Assign department only for non-executives
                        if (!(["admin", "ceo", "cco", "coo"] as UserRole[]).includes(role)) {
                            newUser.department = "Development";
                        }

                        // Sanitize undefined fields
                        const userForDb = Object.fromEntries(
                            Object.entries(newUser).filter(([_, v]) => v !== undefined)
                        );

                        await setDoc(userRef, {
                            ...userForDb,
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
            setIsLoggingOut(true);

            // Allow exit animations to play (250ms)
            await new Promise((resolve) => setTimeout(resolve, 250));

            await signOut(auth);
            setUser(null);

            // Use router.replace to avoid history flash and navigate cleanly
            router.replace("/");
        } catch (error) {
            console.error("Logout error", error);
            router.replace("/");
        } finally {
            // Wait slightly before setting false to let React unmount safely
            setTimeout(() => setIsLoggingOut(false), 100);
        }
    };

    const providedUser = isLoggingOut ? frozenUserRef.current : user;

    return (
        <AuthContext.Provider value={{ user: providedUser, loading, login, logout, isLoggingOut }}>
            {children}
        </AuthContext.Provider>
    );
};
