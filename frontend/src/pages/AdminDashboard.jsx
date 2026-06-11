import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
    const { user, loading: authLoading } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.email === 'admin@gmail.com') {
            fetchUsers();
        }
    }, [user]);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        try {
            await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
            // Optimistic update
            setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Failed to update status");
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-slate-950 bg-grid-pattern pt-20 pb-12 flex items-center justify-center">
                <div className="text-center font-mono text-slate-400 animate-pulse">
                    &gt; authenticating_session...
                </div>
            </div>
        );
    }

    if (!user || user.email !== 'admin@gmail.com') {
        return <Navigate to="/" replace />;
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 bg-grid-pattern pt-20 pb-12 flex items-center justify-center">
                <div className="text-center font-mono text-slate-400 animate-pulse">
                    &gt; connection_established. polling_user_database...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 bg-grid-pattern pt-20 pb-12">
            <div className="container mx-auto p-4 md:p-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-mono font-bold text-slate-100 flex items-center gap-2">
                        <span className="text-blue-500">&gt;</span> system_diagnostics_admin.sh
                    </h1>
                    <p className="text-slate-500 text-xs font-mono mt-1">// Remote administrative user telemetry and security access panel</p>
                </div>

                {/* Telemetry Panels */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 font-mono text-xs">
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg p-4 relative overflow-hidden hover:border-slate-700 transition-all shadow-md">
                        <div className="text-slate-500">// system_load</div>
                        <div className="text-xl font-bold text-blue-500 mt-1">ONLINE / SECURE</div>
                        <div className="text-[10px] text-slate-400 mt-2">Active User Nodes: {users.length} connections</div>
                    </div>
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg p-4 relative overflow-hidden hover:border-slate-700 transition-all shadow-md">
                        <div className="text-slate-500">// system_privileges</div>
                        <div className="text-xl font-bold text-indigo-400 mt-1">
                            HR: {users.filter(u => u.role === 'HR').length} | IV: {users.filter(u => u.role === 'INTERVIEWER').length}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-2">
                            Candidates: {users.filter(u => u.role === 'CANDIDATE').length} nodes
                        </div>
                    </div>
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg p-4 relative overflow-hidden hover:border-slate-700 transition-all shadow-md">
                        <div className="text-slate-500">// access_security</div>
                        <div className="text-xl font-bold text-emerald-500 mt-1">
                            ACTIVE: {users.filter(u => u.status === 'ACTIVE').length}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-2">
                            Suspended Nodes: {users.filter(u => u.status === 'BLOCKED').length}
                        </div>
                    </div>
                </div>

                {/* User Table container */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg flex flex-col hover:border-slate-750 transition-all overflow-hidden shadow-lg">
                    {/* Top window decorations */}
                    <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2 bg-slate-950/60 select-none">
                        <div className="flex items-center gap-1.5">
                            <span className="console-dot-close"></span>
                            <span className="console-dot-minimize"></span>
                            <span className="console-dot-maximize"></span>
                        </div>
                        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                            user_directory_register.db
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-950/40 text-slate-400 font-mono text-xs border-b border-slate-800">
                                <tr>
                                    <th className="p-4 uppercase tracking-wider font-semibold">User Identity</th>
                                    <th className="p-4 uppercase tracking-wider font-semibold">Email Anchor</th>
                                    <th className="p-4 uppercase tracking-wider font-semibold">Role Class</th>
                                    <th className="p-4 uppercase tracking-wider font-semibold">Node Status</th>
                                    <th className="p-4 uppercase tracking-wider font-semibold">Privilege Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/50 font-mono text-xs">
                                {users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-800/20 transition-colors border-b border-slate-800/40">
                                        <td className="p-4 font-semibold text-slate-200">{u.name || 'N/A'}</td>
                                        <td className="p-4 text-slate-400">{u.email}</td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${
                                                u.role === 'HR' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                                u.role === 'INTERVIEWER' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            }`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${
                                                u.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                            }`}>
                                                {u.status}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            {u.id !== user.id && ( // Prevent blocking self
                                                <button
                                                    onClick={() => toggleStatus(u.id, u.status)}
                                                    className={`px-3 py-1 rounded text-xs font-mono font-semibold border transition-all ${
                                                        u.status === 'ACTIVE'
                                                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20'
                                                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                    }`}
                                                >
                                                    {u.status === 'ACTIVE' ? 'suspend_node()' : 'activate_node()'}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {users.length === 0 && (
                        <div className="p-8 text-center text-slate-500 font-mono text-xs">// No active user nodes registered.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
