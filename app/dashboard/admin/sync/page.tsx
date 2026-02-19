"use client";
import { Sidebar } from "@/app/components/Sidebar";
import { Header } from "@/app/components/Header";
import { useState } from "react";
import { syncUser, UserRole } from "@/lib/db";
import { Users, Save, CheckCircle, UserMinus, AlertTriangle, Loader2, KeyRound } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { signInWithEmailAndPassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";

export default function AdminUserManagementPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState<UserRole>("employee");
    const [department, setDepartment] = useState("Development");
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const handleOnboard = async (e: React.FormEvent) => {
        e.preventDefault();

        setStatus('loading');
        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/onboard-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email, password, name, role, department })
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.error || "Failed to onboard user");

            setStatus('success');
            setEmail("");
            setPassword("");
            setName("");
            setRole("employee");
            setDepartment("Development");

            setTimeout(() => setStatus('idle'), 3000);
        } catch (error: any) {
            console.error(error);
            alert(error.message);
            setStatus('idle');
        }
    };

    return (
        <>
            <Header title="User Management" />

            <main className="p-4 md:ml-64 md:p-8 space-y-8 pb-20">
                {/* Onboard Section */}
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
                        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Onboard Employee</h2>
                                <p className="text-sm text-gray-500">Create a new user account instantly. This creates both Login and Profile.</p>
                            </div>
                        </div>

                        <form onSubmit={handleOnboard} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary outline-none transition-all"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="john@example.com"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary outline-none transition-all"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Password</label>
                                        <input
                                            type="text"
                                            required
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="Secret123!"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary outline-none transition-all font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                                        <select
                                            value={role}
                                            onChange={(e) => setRole(e.target.value as UserRole)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary outline-none transition-all"
                                        >
                                            <option value="employee">Employee</option>
                                            <option value="lead">Lead</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                                        <select
                                            value={department}
                                            onChange={(e) => setDepartment(e.target.value)}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-iqm-primary/20 focus:border-iqm-primary outline-none transition-all"
                                        >
                                            <option value="Development">Development</option>
                                            <option value="UX">UX</option>
                                            <option value="Social Media">Social Media</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-95
                                        ${status === 'success'
                                            ? 'bg-green-500 text-white hover:bg-green-600'
                                            : 'bg-iqm-primary text-white hover:bg-iqm-sidebar'}`}
                                >
                                    {status === 'loading' ? (
                                        "Creating Account..."
                                    ) : status === 'success' ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Onboarded Successfully
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Create User
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Terminate Section */}
                <TerminateUserSection />

                {/* Change Password Section */}
                <ChangePasswordSection />

            </main>
        </>
    );
}

function TerminateUserSection() {
    const [searchTerm, setSearchTerm] = useState("");
    const [users, setUsers] = useState<any[]>([]);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [terminateStatus, setTerminateStatus] = useState<'idle' | 'terminating' | 'success' | 'error'>('idle');

    // Fetch users (Lead + Employee)
    const fetchUsers = async () => {
        setLoading(true);
        try {
            // Can't do Query 'in' with different collections, but here user store is one.
            // Simple approach: Get all users, filter client side if list is small, or simple query.
            const q = query(collection(db, "users"), where("role", "in", ["employee", "lead"]));
            const snap = await getDocs(q);
            setUsers(snap.docs.map(d => d.data()));
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    };

    // Auto search/filter
    // For now, let's just fetch all on mount or search
    const filteredUsers = users.filter(u =>
        (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleTerminate = async () => {
        if (!selectedUser) return;
        setTerminateStatus('terminating');

        // Optimistic Update: Immediately remove from UI list
        // We will keep 'selectedUser' for the modal success state, but remove from list.
        const previousUsers = [...users];
        setUsers(users.filter(u => u.uid !== selectedUser.uid));

        try {
            const token = await auth.currentUser?.getIdToken();
            const res = await fetch('/api/terminate-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetUid: selectedUser.uid })
            });

            const data = await res.json().catch(() => null);

            if (!res.ok) {
                // Revert optimistic update on failure
                setUsers(previousUsers);

                const errorMessage = data?.error || res.statusText || "Request failed";
                console.error("Termination API Error:", errorMessage);
                throw new Error(errorMessage);
            }

            setTerminateStatus('success');

            // Close modal after short delay
            setTimeout(() => {
                setIsModalOpen(false);
                setSelectedUser(null);
                setSearchTerm(""); // Clear search input
                setTerminateStatus('idle');
                // No need to fetchUsers() again if optimistic update succeeded
            }, 1500);

        } catch (error: any) {
            console.error(error);
            alert(error.message);
            setTerminateStatus('error');
            // Re-enable UI
            setTimeout(() => setTerminateStatus('idle'), 1000);
        }
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className={`bg-white rounded-2xl shadow-sm border border-red-100 p-8 transition-opacity ${isModalOpen ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-red-50">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Terminate Employee</h2>
                        <p className="text-sm text-gray-500">Permanently remove an Employee or Lead. Irreversible.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-2">
                        <input
                            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500/20 outline-none"
                            placeholder="Search user by name..."
                            value={searchTerm}
                            onClick={() => { if (users.length === 0) fetchUsers(); }}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                if (!e.target.value) setSelectedUser(null);
                            }}
                            disabled={loading}
                        />
                        <button
                            onClick={fetchUsers}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-100 rounded-xl font-semibold text-gray-600 disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Refresh"}
                        </button>
                    </div>

                    {users.length > 0 && searchTerm && (
                        <div className="max-h-48 overflow-y-auto border border-gray-100 rounded-xl divide-y">
                            {filteredUsers.map(user => (
                                <div
                                    key={user.uid}
                                    onClick={() => setSelectedUser(user)}
                                    className={`p-3 cursor-pointer hover:bg-gray-50 flex justify-between items-center transition-colors
                                        ${selectedUser?.uid === user.uid ? 'bg-red-50 border-l-4 border-red-500' : ''}`}
                                >
                                    <div>
                                        <p className="font-bold text-gray-800">{user.name}</p>
                                        <p className="text-xs text-gray-500">{user.email} • {user.role} • <span className="text-iqm-primary">{user.department || "N/A"}</span></p>
                                    </div>
                                    {selectedUser?.uid === user.uid && <UserMinus className="w-5 h-5 text-red-500" />}
                                </div>
                            ))}
                            {filteredUsers.length === 0 && <p className="p-4 text-center text-sm text-gray-400">No users found.</p>}
                        </div>
                    )}
                </div>

                {selectedUser && searchTerm && (
                    <div className="mt-8 p-6 bg-red-50 rounded-xl border border-red-100 animate-in fade-in slide-in-from-top-4 duration-300">
                        <h3 className="font-bold text-red-800 mb-2">Selected for Termination</h3>
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <p className="text-lg font-bold text-gray-900">{selectedUser.name}</p>
                                {/* REMOVED UID DISPLAY */}
                                <p className="text-sm text-gray-600">{selectedUser.role.toUpperCase()} • {selectedUser.department}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg shadow-red-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <AlertTriangle className="w-5 h-5" />
                            TERMINATE {selectedUser.name.toUpperCase()}
                        </button>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all duration-300">
                    <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                        {terminateStatus === 'success' ? (
                            <div className="text-center py-4">
                                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4 animate-in zoom-in duration-300">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Terminated</h3>
                                <p className="text-gray-500">User has been permanently removed.</p>
                            </div>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-red-600 mx-auto mb-4">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <h3 className="text-2xl font-bold text-center text-gray-900 mb-2">Are you absolutely sure?</h3>
                                <p className="text-center text-gray-500 mb-8">
                                    This action is <b>irreversible</b>. <br />
                                    <b>{selectedUser?.name}</b> will be permanently deleted.
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={handleTerminate}
                                        disabled={terminateStatus === 'terminating'}
                                        className="w-full py-3.5 rounded-xl bg-red-600 disabled:opacity-70 disabled:cursor-not-allowed hover:bg-red-700 text-white font-bold transition-all flex items-center justify-center gap-2"
                                    >
                                        {terminateStatus === 'terminating' ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                                        {terminateStatus === 'terminating' ? "Terminating..." : "Yes, Delete Everything"}
                                    </button>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        disabled={terminateStatus === 'terminating'}
                                        className="w-full py-3.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function ChangePasswordSection() {
    const [email, setEmail] = useState("");
    const [initialPassword, setInitialPassword] = useState(""); // Admin's "Initial" / Authorization Password
    const [newPassword, setNewPassword] = useState("");
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);

    // Initial check (Client Side) before opening modal
    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !initialPassword || !newPassword) {
            alert("All fields are required.");
            return;
        }
        if (newPassword.length < 6) {
            alert("New password must be at least 6 characters.");
            return;
        }

        // Open Confirmation Dialog
        setIsConfirmOpen(true);
    };

    const handleExecuteChange = async () => {
        setStatus('loading');
        try {
            // STEP 1: VALIDATE Admin Credentials
            // We use reauthenticateWithCredential to verify the current Admin knows their password
            // without expecting a full sign-in flow that might disrupt the session.
            const user = auth.currentUser;
            if (!user || !user.email) {
                throw new Error("Admin session invalid. Please refresh.");
            }

            try {
                const credential = EmailAuthProvider.credential(user.email, initialPassword);
                await reauthenticateWithCredential(user, credential);
            } catch (e: any) {
                console.error("Re-auth failed:", e);
                if (e.code === 'auth/wrong-password') {
                    throw new Error("The Admin Password you entered is incorrect. Please try again.");
                }
                throw new Error("Authorization failed: " + e.message);
            }

            // STEP 2: Call API to Update Target User Password
            const token = await user.getIdToken();
            const res = await fetch('/api/change-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ email, newPassword })
            });

            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.error || "Failed to update password");

            setStatus('success');
            setEmail("");
            setInitialPassword("");
            setNewPassword("");

            setTimeout(() => {
                setStatus('idle');
                setIsConfirmOpen(false);
            }, 2000);

        } catch (error: any) {
            console.error(error);
            alert(error.message);
            setStatus('idle');
            setIsConfirmOpen(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-orange-100 p-8">
                <div className="flex items-center gap-3 mb-6 pb-6 border-b border-orange-50">
                    <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-600">
                        <KeyRound className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
                        <p className="text-sm text-gray-500">Reset a user's password securely.</p>
                    </div>
                </div>

                <form onSubmit={handlePreSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Target user email..."
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Verify Admin Password</label>
                                <input
                                    type="password"
                                    required
                                    value={initialPassword}
                                    onChange={(e) => setInitialPassword(e.target.value)}
                                    placeholder="Verify Admin Password"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                                    title="Enter YOUR admin password to authorize this change"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">Authorize with YOUR password.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
                                <input
                                    type="text"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Set New Password"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all font-mono text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full py-4 rounded-xl bg-iqm-primary text-white font-bold hover:bg-iqm-sidebar transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                        >
                            <KeyRound className="w-5 h-5" />
                            Change Password
                        </button>
                    </div>
                </form>

                {/* Confirmation Modal */}
                {isConfirmOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-2xl max-w-sm w-full p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                            {status === 'success' ? (
                                <div className="text-center py-4">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4 animate-in zoom-in duration-300">
                                        <CheckCircle className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Success</h3>
                                    <p className="text-gray-500">Password has been updated.</p>
                                </div>
                            ) : (
                                <>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Password Change</h3>
                                    <p className="text-gray-500 mb-6 text-sm">
                                        Are you sure you want to change this user's password?
                                    </p>

                                    <div className="space-y-3">
                                        <button
                                            onClick={handleExecuteChange}
                                            disabled={status === 'loading'}
                                            className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all flex items-center justify-center gap-2"
                                        >
                                            {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                                            Yes, Change Password
                                        </button>
                                        <button
                                            onClick={() => setIsConfirmOpen(false)}
                                            disabled={status === 'loading'}
                                            className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
