import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';

const AssessmentInvite = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [inviteDetails, setInviteDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeToStart, setTimeToStart] = useState(0);

    useEffect(() => {
        if (!inviteDetails || !inviteDetails.startTime) return;

        const calcTimeLeft = () => {
            const diff = new Date(inviteDetails.startTime) - new Date();
            return diff > 0 ? Math.floor(diff / 1000) : 0;
        };

        setTimeToStart(calcTimeLeft());

        const interval = setInterval(() => {
            const left = calcTimeLeft();
            setTimeToStart(left);
            if (left <= 0) {
                clearInterval(interval);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [inviteDetails]);

    const formatTime = (seconds) => {
        if (seconds <= 0) return '';
        const d = Math.floor(seconds / (3600 * 24));
        const h = Math.floor((seconds % (3600 * 24)) / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;

        let parts = [];
        if (d > 0) parts.push(`${d}d`);
        if (h > 0 || d > 0) parts.push(`${h}h`);
        parts.push(`${m}m`);
        parts.push(`${s}s`);

        return parts.join(' ');
    };

    useEffect(() => {
        const fetchInvite = async () => {
            try {
                const response = await api.get(`/assessments/invite/${token}`);
                setInviteDetails(response.data);
            } catch (err) {
                setError(err.response?.data?.error || "Invalid or expired invite link.");
            } finally {
                setLoading(false);
            }
        };
        fetchInvite();
    }, [token]);

    const handleAccept = async () => {
        if (!user) {
            navigate(`/signup?returnUrl=${encodeURIComponent(location.pathname)}`);
            return;
        }

        try {
            const res = await api.post(`/assessments/invite/${token}/accept`);
            navigate(`/oa/exam/${res.data.assessmentId}`);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to accept invite.");
        }
    };

    useEffect(() => {
        if (!loading && user && inviteDetails) {
            if (inviteDetails.status === 'INVITED') {
                handleAccept();
            } else if (inviteDetails.status !== 'COMPLETED' && inviteDetails.status !== 'CHEATED') {
                navigate(`/oa/exam/${inviteDetails.assessmentId}`);
            }
        }
    }, [loading, user, inviteDetails]);

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-slate-950 bg-grid-pattern flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md relative z-10">
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-rose-500/30 rounded-lg shadow-2xl relative overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2 bg-slate-950/60 select-none">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-rose-500/70"></span>
                            <span className="w-2 h-2 rounded-full bg-amber-500/70"></span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500/70"></span>
                        </div>
                        <span className="text-[10px] font-mono tracking-widest text-rose-400 uppercase">
                            error_output.log
                        </span>
                    </div>
                    <div className="p-8 text-center">
                        <div className="text-4xl mb-4">🚫</div>
                        <h1 className="text-xl font-mono font-bold text-rose-400 mb-3">invite_unavailable</h1>
                        <p className="text-slate-450 font-mono text-xs leading-relaxed">{error}</p>
                        <Button onClick={() => navigate('/')} variant="outline" className="mt-6">
                            ~/return_home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 bg-grid-pattern relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] -z-10 animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] -z-10 animate-pulse-slow"></div>

            <div className="w-full max-w-lg relative z-10">
                <div className="bg-slate-900/60 backdrop-blur-2xl border border-slate-800/80 rounded-lg shadow-2xl relative overflow-hidden flex flex-col">
                    {/* Console Header */}
                    <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2.5 bg-slate-950/60 select-none">
                        <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
                        </div>
                        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                            candidate_lobby.sh
                        </span>
                    </div>

                    <div className="p-8">
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-12 h-12 rounded bg-slate-950 border border-slate-800 font-mono font-bold text-blue-400 text-lg mb-4 shadow-inner">
                                &lt;/&gt;
                            </div>
                            <h2 className="text-2xl font-bold text-slate-100 font-mono tracking-tight">
                                system_invite_received()
                            </h2>
                            <p className="text-slate-500 mt-2 font-mono text-xs">
                                Join the assessment to evaluate your technical skills.
                            </p>
                        </div>

                        <div className="bg-slate-950/80 border border-slate-800/80 rounded p-6 mb-6 font-mono text-xs text-slate-350 space-y-4">
                            <div><span className="text-slate-650">// Assessment details</span></div>
                            <div>
                                <span className="text-slate-500">const</span> assessmentName = <span className="text-blue-400">"{inviteDetails.assessmentTitle}"</span>;
                            </div>
                            <div>
                                <span className="text-slate-500">const</span> allocatedDuration = <span className="text-indigo-400">{inviteDetails.duration}</span>; <span className="text-slate-650">// minutes</span>
                            </div>

                            {inviteDetails.startTime && (
                                <div className="border-t border-slate-850 pt-3 text-slate-400">
                                    <span className="text-slate-500">const</span> scheduleTime = <span className="text-amber-400">"{new Date(inviteDetails.startTime).toLocaleString()}"</span>;
                                </div>
                            )}

                            {timeToStart > 0 && (
                                <div className="border-t border-slate-850 pt-4 flex flex-col items-center">
                                    <span className="text-[10px] text-amber-500 uppercase font-bold tracking-wider mb-2">time_until_start</span>
                                    <span className="bg-amber-500/10 text-amber-400 font-mono font-bold text-sm px-4 py-1.5 rounded border border-amber-500/25 animate-pulse">
                                        ⏳ {formatTime(timeToStart)}
                                    </span>
                                </div>
                            )}
                        </div>

                        <div className="text-xs font-mono text-slate-400 mb-8 p-5 bg-amber-500/5 border border-amber-500/15 rounded">
                            <p className="font-bold text-amber-500/90 mb-3 flex items-center gap-1.5">
                                <span>⚠️</span> [system_warning]: Before you begin
                            </p>
                            <ul className="space-y-2 text-slate-400">
                                <li>• Ensure a secure, stable compiler network link.</li>
                                <li>• Do not reload page once environment is spawned.</li>
                                <li>• Assessment timer operates strictly client-independent.</li>
                                <li>• Assure final solution execution before timeout.</li>
                            </ul>
                        </div>

                        {inviteDetails.status === 'INVITED' ? (
                            user ? (
                                <Button 
                                    onClick={handleAccept}
                                    className="w-full py-3 text-base font-bold"
                                >
                                    accept_invite()
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Button 
                                        onClick={() => navigate(`/signup?returnUrl=${encodeURIComponent(location.pathname)}`)}
                                        className="w-full py-3"
                                    >
                                        register_and_accept()
                                    </Button>
                                    <Button 
                                        onClick={() => navigate(`/login?returnUrl=${encodeURIComponent(location.pathname)}`)}
                                        variant="secondary"
                                        className="w-full py-3"
                                    >
                                        sign_in_and_accept()
                                    </Button>
                                </div>
                            )
                        ) : inviteDetails.status === 'COMPLETED' ? (
                            <div className="text-center font-mono text-emerald-400 font-bold p-3 bg-emerald-500/10 rounded border border-emerald-500/20 text-xs">
                                status: COMPLETED_SUCCESSFULLY
                            </div>
                        ) : inviteDetails.status === 'CHEATED' ? (
                            <div className="text-center font-mono text-rose-400 font-bold p-3 bg-rose-500/10 rounded border border-rose-500/20 text-xs">
                                status: EXAM_DISQUALIFIED_SECURITY_EXCEPTION
                            </div>
                        ) : (
                            <Button 
                                onClick={() => navigate(`/oa/exam/${inviteDetails.assessmentId}`)} 
                                className="w-full py-3"
                            >
                                resume_assessment()
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentInvite;
