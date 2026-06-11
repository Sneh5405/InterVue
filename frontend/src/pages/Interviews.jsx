import React, { useEffect, useState } from 'react';
import { interviewService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';

const Interviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Upcoming');
    const { user } = useAuth();

    const getFilteredInterviews = () => {
        const now = new Date();
        switch (filter) {
            case 'Upcoming':
                return interviews.filter(i =>
                    ['SCHEDULED', 'PENDING'].includes(i.status) &&
                    new Date(i.startTime) > now
                );
            case 'Ongoing':
                return interviews.filter(i => 
                    ['SCHEDULED'].includes(i.status) && 
                    new Date(i.startTime) <= now && 
                    new Date(i.endTime) >= now
                );
            case 'Past History':
                return interviews.filter(i =>
                    ['COMPLETED', 'CANCELLED', 'MOVED_TO_NEXT_ROUND'].includes(i.status) ||
                    (['SCHEDULED', 'PENDING'].includes(i.status) && new Date(i.endTime) < now)
                );
            default:
                return interviews;
        }
    };

    useEffect(() => {
        fetchInterviews();
    }, []);

    const fetchInterviews = async () => {
        try {
            const response = await interviewService.getAll();
            setInterviews(response.data);
        } catch (error) {
            console.error("Failed to fetch interviews", error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this interview?")) return;
        try {
            await interviewService.delete(id);
            setInterviews(interviews.filter(i => i.id !== id));
        } catch (error) {
            alert("Failed to delete interview");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 bg-grid-pattern pt-20 pb-12 flex items-center justify-center">
                <div className="text-center font-mono text-slate-400 animate-pulse">
                    &gt; loading_interviews_manifest...
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 bg-grid-pattern pt-20 pb-12">
            <div className="container mx-auto p-4 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-mono font-bold text-slate-100 flex items-center gap-2">
                            <span className="text-blue-500">&gt;</span> interviews_manifest.log
                        </h1>
                        <p className="text-slate-500 text-xs font-mono mt-1">// Active interview sessions scheduler logs</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 shrink-0">
                        {/* Filter Dropdown */}
                        <div className="relative inline-block w-44">
                            <select
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}
                                className="w-full bg-slate-900 text-slate-200 border border-slate-800 hover:border-slate-700 rounded px-3.5 py-1.5 appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all cursor-pointer font-mono text-xs font-semibold shadow-inner"
                            >
                                <option value="Upcoming">filter: Upcoming</option>
                                <option value="Ongoing">filter: Ongoing</option>
                                <option value="Past History">filter: History</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-500">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>

                        {user.role === 'HR' && (
                            <Link to="/interviews/create">
                                <Button className="py-1.5 px-4 text-xs font-mono">
                                    + schedule_session()
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Filtered List */}
                <div className="mb-10">
                    <h2 className={`text-xs font-mono font-bold uppercase tracking-wider mb-6 flex items-center gap-2 ${
                        filter === 'Upcoming' ? 'text-blue-400' :
                        filter === 'Ongoing' ? 'text-indigo-400' : 'text-slate-500'
                    }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                            filter === 'Upcoming' ? 'bg-blue-500' :
                            filter === 'Ongoing' ? 'bg-indigo-500' : 'bg-slate-700'
                        }`}></span>
                        {filter}
                    </h2>

                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg flex flex-col hover:border-slate-700 transition-all overflow-hidden shadow-lg">
                        {/* Top window decorations */}
                        <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2 bg-slate-950/60 select-none">
                            <div className="flex items-center gap-1.5">
                                <span className="console-dot-close"></span>
                                <span className="console-dot-minimize"></span>
                                <span className="console-dot-maximize"></span>
                            </div>
                            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                                active_interviews.db
                            </span>
                        </div>

                        <InterviewTable
                            interviews={getFilteredInterviews()}
                            user={user}
                            handleDelete={handleDelete}
                            fetchInterviews={fetchInterviews}
                            emptyMessage={`No ${filter.toLowerCase()} interviews found.`}
                            isPast={filter !== 'Upcoming'}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const InterviewTable = ({ interviews, user, handleDelete, fetchInterviews, emptyMessage, isPast }) => {
    if (interviews.length === 0) {
        return <div className="p-8 text-center text-slate-500 italic font-mono text-xs">// {emptyMessage}</div>;
    }

    const getBadgeStyle = (status) => {
        switch (status) {
            case 'SCHEDULED':
                return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
            case 'ONGOING':
                return 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 text-glow-purple animate-pulse';
            case 'COMPLETED':
                return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'PENDING':
                return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            default:
                return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
        }
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950/40 text-slate-400 font-mono text-xs border-b border-slate-800">
                    <tr>
                        <th className="p-4 uppercase tracking-wider font-semibold">Date & Time</th>
                        <th className="p-4 uppercase tracking-wider font-semibold">Round</th>
                        <th className="p-4 uppercase tracking-wider font-semibold">Participants</th>
                        <th className="p-4 uppercase tracking-wider font-semibold">Status</th>
                        <th className="p-4 uppercase tracking-wider font-semibold">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-mono text-xs">
                    {interviews.map((interview) => {
                        const isInterviewer = user.id === interview.interviewerId;
                        const isInterviewee = user.id === interview.intervieweeId;
                        
                        const now = new Date();
                        let displayStatus = interview.status;
                        if (displayStatus === 'SCHEDULED' && new Date(interview.startTime) <= now && new Date(interview.endTime) >= now) {
                            displayStatus = 'ONGOING';
                        }
                        
                        const needsAcceptance = interview.status === 'PENDING' && (
                            (isInterviewee && !interview.intervieweeAccepted)
                        );

                        return (
                            <tr key={interview.id} className={`transition-colors ${isPast ? 'hover:bg-slate-800/10 opacity-70 hover:opacity-100' : 'hover:bg-slate-800/20'}`}>
                                <td className="p-4">
                                    <div className="font-semibold text-slate-200">
                                        {new Date(interview.startTime).toLocaleDateString()}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                        {new Date(interview.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
                                        {new Date(interview.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </td>
                                <td className="p-4 text-slate-300 font-semibold">
                                    round_{interview.round}.pkg
                                </td>
                                <td className="p-4 text-xs text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-blue-500 font-bold">@interviewer:</span> 
                                        {interview.interviewer?.name || 'N/A'}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="text-indigo-400 font-bold">@candidate:</span> 
                                        {interview.interviewee?.name || 'N/A'}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block ${getBadgeStyle(displayStatus)}`}>
                                        {displayStatus}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <Link to={`/interviews/${interview.id}`}>
                                            <Button size="sm" className="py-1 px-3 text-[11px] font-mono">
                                                {interview.status === 'SCHEDULED' ? 'exec_join()' : 'view_details()'}
                                            </Button>
                                        </Link>
                                        {needsAcceptance && (
                                            <Button
                                                size="sm"
                                                className="py-1 px-3 text-[11px] font-mono bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20"
                                                onClick={async () => {
                                                    try {
                                                        await interviewService.accept(interview.id);
                                                        fetchInterviews();
                                                    } catch (e) {
                                                        alert("Failed to accept");
                                                    }
                                                }}
                                            >
                                                accept_invite()
                                            </Button>
                                        )}
                                        {user.role === 'HR' && (
                                            <button
                                                onClick={() => handleDelete(interview.id)}
                                                className="text-rose-500 hover:text-rose-400 font-semibold transition-colors text-xs font-mono ml-1"
                                            >
                                                delete()
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default Interviews;
