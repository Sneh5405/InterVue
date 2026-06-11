import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({ email: '' });
    const [resetData, setResetData] = useState({ otp: '', newPassword: '' });
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleForgotSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await api.post('/forgot-password', formData);
            setUserId(response.data.userId);
            setMessage(response.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request password reset. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await api.post('/reset-password', {
                userId,
                otp: resetData.otp,
                newPassword: resetData.newPassword
            });
            setMessage(response.data.message);
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please check the OTP.');
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
                            auth_reset.sh
                        </span>
                    </div>

                    <div className="p-8 sm:p-10">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-slate-950 border border-slate-800 font-mono font-bold text-blue-400 text-lg mb-4 shadow-inner">
                                &lt;/&gt;
                            </div>
                            <h2 className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
                                {step === 1 ? "forgot_password.sh" : "reset_password.sh"}
                            </h2>
                            <p className="text-slate-400 mt-2 font-mono text-xs">
                                {step === 1 ? "Dispatch OTP validation token to email node" : "Set new credentials for user node"}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-5 p-3.5 rounded bg-rose-500/5 border border-rose-500/20 text-rose-400 text-xs font-mono">
                                ✖ {error}
                            </div>
                        )}
                        {message && (
                            <div className="mb-5 p-3.5 rounded bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                                ✓ {message}
                            </div>
                        )}

                        {step === 1 && (
                            <form onSubmit={handleForgotSubmit} className="space-y-4">
                                <Input
                                    label="Email address"
                                    type="email"
                                    name="email"
                                    placeholder="name@company.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />

                                <Button
                                    type="submit"
                                    className="w-full py-2.5 mt-4"
                                    disabled={loading}
                                >
                                    {loading ? 'sending_otp...' : 'send_otp()'}
                                </Button>

                                <div className="relative mt-6 mb-6">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-800/80"></div>
                                    </div>
                                    <div className="relative flex justify-center text-[10px]">
                                        <span className="px-2 bg-[#0d121e] text-slate-500 font-mono">OR</span>
                                    </div>
                                </div>

                                <p className="text-center text-slate-400 font-mono text-xs mt-6">
                                    know_password?{' '}
                                    <Link to="/login" className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                                        authenticate_node
                                    </Link>
                                </p>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleResetSubmit} className="space-y-6">
                                <Input
                                    label="One-Time Password"
                                    value={resetData.otp}
                                    onChange={(e) => setResetData({ ...resetData, otp: e.target.value })}
                                    placeholder="123456"
                                    className="tracking-[0.5em] text-xl font-mono py-2 bg-slate-950/40 text-center"
                                    maxLength={6}
                                    required
                                />
                                <Input
                                    label="New Password"
                                    type="password"
                                    name="newPassword"
                                    placeholder="••••••••"
                                    value={resetData.newPassword}
                                    onChange={(e) => setResetData({ ...resetData, newPassword: e.target.value })}
                                    required
                                />
                                <Button
                                    type="submit"
                                    className="w-full py-2.5"
                                    disabled={loading}
                                >
                                    {loading ? 'resetting_password...' : 'reset_password()'}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;


