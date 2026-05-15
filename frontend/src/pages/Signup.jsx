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
        <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] p-4 relative overflow-hidden">
            {/* Ambient Background Efects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] -z-10 animate-blob"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[128px] -z-10 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_100%)] pointer-events-none -z-10"></div>

            <div className="w-full max-w-[420px] relative z-10 transition-all duration-300 hover:transform hover:-translate-y-1 my-8">
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-white/5 rounded-3xl p-8 sm:p-10 shadow-[0_0_40px_-15px_rgba(79,70,229,0.3)]">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-blue-500 mb-6 shadow-lg shadow-indigo-500/30 group">
                            <span className="text-2xl font-black tracking-tighter text-white group-hover:scale-110 transition-transform">IV</span>
                        </div>
                        <h2 className="text-3xl font-extrabold bg-gradient-to-br from-white to-slate-300 bg-clip-text text-transparent">
                            {step === 1 ? "Create Account" : "Verify Email"}
                        </h2>
                        <p className="text-slate-400 mt-2.5 font-medium text-sm">
                            {step === 1 ? "Join InterVue today" : `Enter the OTP sent to ${formData.email}`}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}
                    {message && (
                        <div className="mb-5 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            {message}
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
                                <label className="text-sm font-semibold text-slate-300 ml-1">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    className="bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all font-medium appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%2394a3b8%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:12px_12px] bg-[right_1rem_center] bg-no-repeat"
                                >
                                    <option value="INTERVIEWEE" className="bg-slate-800">Interviewee</option>
                                    <option value="INTERVIEWER" className="bg-slate-800">Interviewer</option>
                                    <option value="HR" className="bg-slate-800">HR</option>
                                </select>
                            </div>

                            <Button
                                type="submit"
                                className="w-full py-3.5 mt-4 text-sm font-bold bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-400 hover:to-blue-500 transition-all shadow-lg hover:shadow-indigo-500/25 border-none"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating account...
                                    </span>
                                ) : 'Sign Up'}
                            </Button>

                            <div className="relative mt-6 mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-700/50"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="px-2 bg-slate-900/60 text-slate-500 font-medium">Or continue with</span>
                                </div>
                            </div>

                            <p className="text-center text-slate-400 text-sm font-medium mt-6">
                                Already have an account?{' '}
                                <Link to={`/login${location.search}`} className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors">
                                    Log in
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
                                className="text-center tracking-[0.5em] text-xl font-mono py-4 bg-slate-900/80"
                                maxLength={6}
                                required
                            />
                            <Button
                                type="submit"
                                className="w-full py-3.5 text-sm font-bold bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg hover:shadow-green-500/25 border-none"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : 'Verify OTP'}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Signup;
