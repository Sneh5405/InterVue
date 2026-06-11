import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { interviewService } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const CreateInterview = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        startTime: '',
        duration: 60, // minutes
        interviewerEmail: '',
        candidateEmail: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const start = new Date(formData.startTime);
            const end = new Date(start.getTime() + formData.duration * 60000);

            await interviewService.create({
                startTime: start.toISOString(),
                endTime: end.toISOString(),
                hrId: JSON.parse(localStorage.getItem('user')).id, // Current HR
                interviewerEmail: formData.interviewerEmail,
                candidateEmail: formData.candidateEmail,
                type: 'TECHNICAL'
            });

            navigate('/interviews');
        } catch (error) {
            console.error("Create failed", error);
            alert(error.response?.data?.error || "Failed to create interview. Check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 bg-grid-pattern pt-20 pb-12">
            <div className="container mx-auto p-4 md:p-8 max-w-2xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-mono font-bold text-slate-100 flex items-center gap-2">
                        <span className="text-blue-500">&gt;</span> initialize_session_worker()
                    </h1>
                    <p className="text-slate-500 text-xs font-mono mt-1">// Provision resources for new technical assessment session</p>
                </div>

                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg flex flex-col hover:border-slate-750 transition-all overflow-hidden shadow-lg">
                    {/* Top window decorations */}
                    <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2 bg-slate-950/60 select-none">
                        <div className="flex items-center gap-1.5">
                            <span className="console-dot-close"></span>
                            <span className="console-dot-minimize"></span>
                            <span className="console-dot-maximize"></span>
                        </div>
                        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                            schedule_worker.config
                        </span>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div className="space-y-1">
                            <label className="block text-[11px] font-mono font-bold text-slate-400">
                                <span className="text-blue-500">// @param:</span> start_time
                            </label>
                            <Input
                                type="datetime-local"
                                value={formData.startTime}
                                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                required
                                className="w-full bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200 focus:border-blue-500/50 font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[11px] font-mono font-bold text-slate-400">
                                <span className="text-blue-500">// @param:</span> duration_minutes
                            </label>
                            <Input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                min="15"
                                step="15"
                                required
                                className="w-full bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200 focus:border-blue-500/50 font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[11px] font-mono font-bold text-slate-400">
                                <span className="text-blue-500">// @param:</span> interviewer_email
                            </label>
                            <Input
                                type="email"
                                placeholder="interviewer@intervue.io"
                                value={formData.interviewerEmail}
                                onChange={(e) => setFormData({ ...formData, interviewerEmail: e.target.value })}
                                required
                                className="w-full bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200 focus:border-blue-500/50 font-mono text-sm"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[11px] font-mono font-bold text-slate-400">
                                <span className="text-blue-500">// @param:</span> candidate_email
                            </label>
                            <Input
                                type="email"
                                placeholder="candidate@sandbox.dev"
                                value={formData.candidateEmail}
                                onChange={(e) => setFormData({ ...formData, candidateEmail: e.target.value })}
                                required
                                className="w-full bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200 focus:border-blue-500/50 font-mono text-sm"
                            />
                        </div>

                        <div className="flex gap-4 pt-4">
                            <Button type="button" variant="ghost" onClick={() => navigate('/interviews')} className="w-full font-mono text-xs py-2 border border-transparent hover:border-slate-800">
                                cancel_worker()
                            </Button>
                            <Button type="submit" variant="primary" loading={loading} className="w-full font-mono text-xs py-2">
                                execute_schedule()
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateInterview;
