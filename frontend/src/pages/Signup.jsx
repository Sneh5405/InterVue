import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'INTERVIEWEE'
    });
    const [otp, setOtp] = useState('');
    const [userId, setUserId] = useState(null);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await api.post('/signup', formData);
            setUserId(response.data.userId);
            setMessage(response.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const response = await api.post('/verify-otp', { userId, otp });
            setMessage(response.data.message);
            // Auto login after verification
            await login(formData.email, formData.password);
            const queryParams = new URLSearchParams(location.search);
            const returnUrl = queryParams.get('returnUrl') || '/';
            navigate(returnUrl);
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 bg-grid-pattern p-4 relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] -z-10 animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] -z-10 animate-pulse-slow"></div>

            <div className="w-full max-w-[420px] relative z-10 transition-all duration-300 my-8">
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-lg shadow-2xl relative overflow-hidden">
                    {/* Console Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2.5 bg-slate-950/60 select-none">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
                        </div>
                        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                            auth_register.sh
                        </span>
                    </div>

                    <div className="p-8 sm:p-10">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-slate-950 border border-slate-800 font-mono font-bold text-indigo-400 text-lg mb-4 shadow-inner">
                                &lt;/&gt;
                            </div>
                            <h2 className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
                                {step === 1 ? "create_account.sh" : "verify_email.sh"}
                            </h2>
                            <p className="text-slate-400 mt-2 font-mono text-xs">
                                {step === 1 ? "Initialize candidate database node" : `OTP sent to ${formData.email}`}
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
                            <form onSubmit={handleSignup} className="space-y-4">
                                <Input
                                    label="Full Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Email address"
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <Input
                                    label="Password"
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />

                                <div className="flex flex-col gap-1.5 pt-1">
                                    <label className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase ml-0.5">Role</label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        className="bg-slate-900 border border-slate-700/80 rounded px-4 py-2 text-sm text-slate-100 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat cursor-pointer shadow-inner"
                                    >
                                        <option value="INTERVIEWEE" className="bg-slate-900 text-slate-300">Interviewee</option>
                                        <option value="INTERVIEWER" className="bg-slate-900 text-slate-300">Interviewer</option>
                                        <option value="HR" className="bg-slate-900 text-slate-300">HR</option>
                                    </select>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full py-2.5 mt-4"
                                    disabled={loading}
                                >
                                    {loading ? 'creating_account...' : 'create_account()'}
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
                                    has_account?{' '}
                                    <Link to={`/login${location.search}`} className="text-blue-400 hover:text-blue-300 font-bold transition-colors">
                                        authenticate_node
                                    </Link>
                                </p>
                            </form>
                        )}

                        {step === 2 && (
                            <form onSubmit={handleVerify} className="space-y-6">
                                <Input
                                    label="One-Time Password"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    className="text-center tracking-[0.5em] text-xl font-mono py-2 bg-slate-950/40"
                                    maxLength={6}
                                    required
                                />
                                <Button
                                    type="submit"
                                    className="w-full py-2.5"
                                    disabled={loading}
                                >
                                    {loading ? 'verifying...' : 'verify_otp()'}
                                </Button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;


