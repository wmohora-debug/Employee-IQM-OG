"use client";
import { useState } from "react";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle } from "lucide-react";
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

            // 2. Verify against Firestore
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

            // Success: AuthContext will handle redirection automatically

        } catch (err: any) {
            console.error("Login error:", err);

            // Handle Custom Errors
            if (err.message === "NOT_ONBOARDED") {
                setError("Account setup required. Please contact your administrator.");
            }
            // Handle Firebase Auth Errors
            else if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
                setError("Invalid credentials. Please try again.");
            }
            else if (err.code === 'auth/wrong-password') {
                setError("Incorrect password.");
            }
            else if (err.code === 'auth/too-many-requests') {
                setError("Too many attempts. Please wait a moment.");
            }
            else {
                setError("Authentication failed. Please contact support.");
            }

            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-[400px]">
            {/* Header Text */}
            <div className="mb-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-900 tracking-tight">Welcome back</h2>
                <p className="text-sm text-gray-500 mt-2">Enter your credentials to access the workspace</p>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04),0_12px_24px_rgba(0,0,0,0.04)] ring-1 ring-gray-100 p-6 md:p-8">
                {error && (
                    <div className="mb-6 p-3 bg-red-50/50 border border-red-100 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                        <p className="text-sm text-red-600 font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">Email Address</label>
                        <div className="relative group">
                            <input
                                type="email"
                                required
                                className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400
                                         focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 
                                         transition-all duration-200 ease-in-out hover:border-gray-300"
                                placeholder="name@company.com"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                <Mail className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-medium text-gray-700 uppercase tracking-wider">Password</label>
                        <div className="relative group">
                            <input
                                type="password"
                                required
                                className="block w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-900 text-sm placeholder-gray-400
                                         focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 
                                         transition-all duration-200 ease-in-out hover:border-gray-300"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-indigo-500 transition-colors">
                                <Lock className="h-4 w-4" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full relative flex items-center justify-center py-2.5 px-4 rounded-lg shadow-sm text-sm font-semibold text-white bg-[#1A1A1A] hover:bg-black 
                                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 overflow-hidden transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-4 h-4" />
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>Log in</span>
                                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                                </div>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
