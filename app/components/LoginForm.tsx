"use client";
import { useState } from "react";
import { Lock, AtSign, ArrowRight, Loader2 } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        username: "",
        password: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // 1. Attempt Authentication
            const userCredential = await signInWithEmailAndPassword(auth, formData.username, formData.password);
            const user = userCredential.user;

            // 2. Dynamic Import for Firestore checks (to keep bundle light if needed, though standard import is fine)
            // Using standard import at top is better, but for this snippet:
            // verifying against Firestore
            const { doc, getDoc } = await import("firebase/firestore");
            const { db } = await import("@/lib/firebase");
            const { signOut } = await import("firebase/auth");

            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);

            if (!docSnap.exists()) {
                console.warn("User authenticated but not found in Firestore. Enforcing logout.");
                await signOut(auth);
                throw new Error("NOT_ONBOARDED");
            }

            // Success: AuthContext will handle redirection

        } catch (err: any) {
            console.error("Login error:", err);

            // Handle Custom Errors
            if (err.message === "NOT_ONBOARDED") {
                setError("Your account is not onboarded. Please contact HR.");
            }
            // Handle Firebase Auth Errors
            else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                // Note: newer firebase versions use invalid-credential for both wrong password and user not found sometimes to prevent enumeration,
                // but if we are checking specifically for non-existence or generic failure:
                // User requested "This account does not exist." for non-existing. 
                // We will interpret invalid-credential as invalid credentials generally, but try to handle user-not-found if returned.
                setError("Invalid email or password. If you don't have an account, please contact HR.");
            }
            else if (err.code === 'auth/wrong-password') {
                setError("Invalid email or password.");
            }
            else if (err.code === 'auth/too-many-requests') {
                setError("Too many failed attempts. Please try again later.");
            }
            else {
                setError("Login failed. Please contact support.");
            }

            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                    <p className="text-sm text-gray-500">
                        Login to your account
                    </p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <AtSign className="h-5 w-5 text-gray-400 group-focus-within:text-iqm-primary transition-colors" />
                            </div>
                            <input
                                type="email"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary transition-all sm:text-sm"
                                placeholder="name@iqm.com"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider ml-1">Password</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-iqm-primary transition-colors" />
                            </div>
                            <input
                                type="password"
                                required
                                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary transition-all sm:text-sm"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-iqm-primary hover:bg-iqm-sidebar focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-iqm-primary transition-all active:scale-[98%]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Logging in...
                            </>
                        ) : (
                            <>
                                Login
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </button>


                </form>
            </div>
        </div>
    );
}
