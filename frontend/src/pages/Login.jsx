import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await login(formData.email, formData.password);
            const queryParams = new URLSearchParams(location.search);
            const returnUrl = queryParams.get('returnUrl') || '/';
            navigate(returnUrl); // Redirect to returnUrl or home
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-grid-pattern p-4 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] -z-10 animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] -z-10 animate-pulse-slow"></div>

            <div className="w-full max-w-[420px] relative z-10 transition-all duration-300">
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-lg shadow-2xl relative overflow-hidden">
                    {/* Console Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2.5 bg-slate-950/60 select-none">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
                        </div>
                        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                            auth_login.sh
                        </span>
                    </div>

                    <div className="p-8 sm:p-10">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-slate-950 border border-slate-800 font-mono font-bold text-blue-400 text-lg mb-4 shadow-inner">
                                &lt;/&gt;
                            </div>
                            <h2 className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
                                welcome_back.sh
                            </h2>
                            <p className="text-slate-400 mt-2 font-mono text-xs">
                                Enter parameters to mount credentials
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {error && (
                                <div className="p-3.5 rounded bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs font-mono flex items-center gap-2">
                                    <span>✖</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                <Input
                                    label="Email address"
                                    type="email"
                                    name="email"
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />

                                <div>
                                    <Input
                                        label="Password"
                                        type="password"
                                        name="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <div className="flex justify-end mt-2">
                                        <Link to="/forgot-password" className="text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors">
                                            forgot_password.js
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-2.5"
                                disabled={loading}
                            >
                                {loading ? 'authenticating...' : 'authenticate()'}
                            </Button>

                            <div className="relative mt-6 mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-800/80"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px]">
                                    <span className="px-2 bg-[#0d121e] text-slate-500 font-mono">OR_CONTINUE</span>
                                </div>
                            </div>

                            <p className="text-center text-slate-400 font-mono text-xs mt-6">
                                no_account?{' '}
                                <Link to={`/signup${location.search}`} className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                                    create_one_here
                                </Link>
                            </p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;


