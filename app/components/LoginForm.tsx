"use client";
import { useState } from "react";
import { Terminal, Shield, ArrowRight, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export function LoginForm() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
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
                <h2 className="text-2xl font-semibold text-white tracking-tight drop-shadow-md">Command Center Login</h2>
                <p className="text-sm text-gray-400 mt-2">Initialize secure connection to workspace</p>
            </div>

            {/* Main Card (Extreme Glassmorphism) */}
            <div className="relative rounded-2xl p-6 md:p-8 overflow-hidden group border border-white/20 shadow-[0_0_40px_rgba(139,92,246,0.2)]">
                {/* 1. Underlying Extreme Glass Layer */}
                <div className="absolute inset-0 bg-[#0a0a0a]/60 backdrop-blur-md rounded-2xl z-0" />

                {/* 2. Synced Department Pulse Border Glow */}
                <div className="absolute inset-0 rounded-2xl pointer-events-none shadow-[inset_0_0_20px_rgba(139,92,246,0.3)] z-0" />

                {/* 3. Shimmer Sweep Layer */}
                <div className="absolute inset-0 pointer-events-none z-0 opacity-10 bg-gradient-to-r from-transparent via-purple-400 to-transparent -translate-x-full animate-shimmer-sweep" />

                <div className="relative z-10 w-full">
                    {error && (
                        <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 backdrop-blur-md">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-400 font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest pl-1">Identifier</label>
                            <div className="relative group/input">
                                {/* Focus animation wrapper (synced) */}
                                <div className="absolute -inset-[1px] rounded-xl animate-sync-border-colors opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
                                <input
                                    type="email"
                                    required
                                    className="relative block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500
                                             focus:outline-none transition-all duration-300 ease-in-out hover:border-white/20 hover:bg-white/10 z-20"
                                    placeholder="admin_node"
                                    value={formData.username}
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-gray-300 uppercase tracking-widest pl-1">Passcode</label>
                            <div className="relative group/input">
                                {/* Focus animation wrapper (synced) */}
                                <div className="absolute -inset-[1px] rounded-xl animate-sync-border-colors opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    className="relative block w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-500
                                             focus:outline-none transition-all duration-300 ease-in-out hover:border-white/20 hover:bg-white/10 z-20 pr-10"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute z-30 inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-white focus:outline-none transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full relative flex items-center justify-center py-3 px-4 rounded-xl shadow-lg text-sm font-bold text-white bg-white/10 hover:bg-white/20 
                                         border border-white/10 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group/btn backdrop-blur-md"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin w-4 h-4" />
                                ) : (
                                    <div className="flex items-center gap-2 tracking-wide uppercase">
                                        <span>Initialize Connection</span>
                                        <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                                    </div>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
