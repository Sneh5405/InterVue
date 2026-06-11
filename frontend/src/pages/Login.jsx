import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, loginWithOAuth } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const oauthSuccess = queryParams.get('oauth_success');
        const userDataStr = queryParams.get('user');
        const oauthError = queryParams.get('error');

        if (oauthSuccess === 'true' && userDataStr) {
            try {
                const oauthUser = JSON.parse(decodeURIComponent(userDataStr));
                loginWithOAuth(oauthUser);
                const returnUrl = queryParams.get('returnUrl') || '/';
                navigate(returnUrl);
            } catch (err) {
                console.error("Failed to parse OAuth user data", err);
                setError("OAuth login failed during session mapping.");
            }
        } else if (oauthError) {
            if (oauthError === 'account_blocked') {
                setError("Account is blocked. Administrative suspension.");
            } else {
                setError(`OAuth authentication error: ${oauthError}`);
            }
        }
    }, [location.search, navigate, loginWithOAuth]);

    const handleGoogleLogin = () => {
        window.location.href = '/api/auth/google';
    };

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

                            <button
                                type="button"
                                onClick={handleGoogleLogin}
                                className="w-full py-2 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white rounded transition-all font-mono text-xs flex items-center justify-center gap-2 shadow-inner"
                            >
                                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                                </svg>
                                init_google_oauth()
                            </button>

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


