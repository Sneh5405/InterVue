import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/ui/Button';

const AssessmentsHR = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Upcoming');

    const handleCopyLink = (token) => {
        const link = `${window.location.origin}/oa/invite/${token}`;
        navigator.clipboard.writeText(link);
        alert("Copied shareable link to clipboard!");
    };

    useEffect(() => {
        fetchAssessments();
    }, []);

    const fetchAssessments = async () => {
        try {
            const response = await api.get('/assessments');
            setAssessments(response.data);
        } catch (error) {
            console.error("Error fetching assessments", error);
        } finally {
            setLoading(false);
        }
    };

    const getAssessmentState = (assessment) => {
        const now = new Date();
        
        let isPast = false;
        if (assessment.startTime) {
            const end = new Date(new Date(assessment.startTime).getTime() + assessment.duration * 60000);
            isPast = now > end;
        }

        let isUpcoming = false;
        if (!isPast && assessment.startTime) {
            isUpcoming = new Date(assessment.startTime) > now;
        }

        const isOngoing = !isPast && !isUpcoming;

        return { isPast, isUpcoming, isOngoing };
    };

    const getFilteredAssessments = () => {
        return assessments.filter(assessment => {
            const { isPast, isUpcoming, isOngoing } = getAssessmentState(assessment);

            if (filter === 'Upcoming') return isUpcoming;
            if (filter === 'Ongoing') return isOngoing;
            if (filter === 'Past History') return isPast;
            return true;
        });
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    const filtered = getFilteredAssessments();

    return (
        <div className="min-h-screen bg-slate-950 bg-grid-pattern pt-20 pb-12">
            <div className="container mx-auto p-4 md:p-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-mono font-bold text-slate-100 flex items-center gap-2">
                            <span className="text-blue-500">&gt;</span> manage_assessments()
                        </h1>
                        <p className="text-slate-500 text-xs font-mono mt-1">// Active assessment schemas and invite registers</p>
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

                        <Link to="/assessments/create">
                            <Button className="py-1.5 px-4 text-xs">
                                + create_schema()
                            </Button>
                        </Link>
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

                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filtered.map(assessment => {
                            const { isPast, isUpcoming } = getAssessmentState(assessment);
                            
                            let badgeColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                            let badgeText = 'Upcoming';
                            if (isPast) {
                                badgeColor = 'bg-rose-500/10 text-rose-455 border-rose-500/20';
                                badgeText = 'Expired';
                            } else if (!isUpcoming) {
                                badgeColor = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                                badgeText = 'Ongoing';
                            }

                            return (
                                <div key={assessment.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg flex flex-col hover:border-slate-700 transition-all relative overflow-hidden group shadow-lg">
                                    {/* Top window decorations */}
                                    <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2 bg-slate-950/60 select-none">
                                        <div className="flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-rose-500/70"></span>
                                            <span className="w-2 h-2 rounded-full bg-amber-500/70"></span>
                                            <span className="w-2 h-2 rounded-full bg-emerald-500/70"></span>
                                        </div>
                                        <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                                            schema_{assessment.id.slice(-6)}.json
                                        </span>
                                    </div>

                                    <div className="p-6 flex flex-col flex-1 justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <h2 className="text-base font-mono font-bold text-slate-100 leading-tight line-clamp-1 group-hover:text-blue-400 transition-colors">
                                                    &gt; {assessment.title}
                                                </h2>
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border shrink-0 ${badgeColor}`}>
                                                    {badgeText}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-xs mb-4 line-clamp-2 leading-relaxed">{assessment.description || "No description provided."}</p>
                                            
                                            {assessment.startTime && (
                                                <div className="text-[11px] font-mono text-slate-400 mb-4 bg-slate-955 p-2.5 rounded border border-slate-850">
                                                    <span className="text-slate-600">// launch schedule</span>
                                                    <br />
                                                    starts: {new Date(assessment.startTime).toLocaleString()}
                                                </div>
                                            )}

                                            <div className="flex justify-between text-[10px] font-mono text-slate-400 mb-6 bg-slate-950/80 p-3 rounded border border-slate-850/80">
                                                <span className="flex items-center gap-1">⏱ {assessment.duration}m</span>
                                                <span className="flex items-center gap-1">💻 {assessment._count?.questions || 0}q_nodes</span>
                                                <span className="flex items-center gap-1">👥 {assessment._count?.candidates || 0} candidates</span>
                                            </div>
                                        </div>
                                        
                                        <Button 
                                            onClick={() => handleCopyLink(assessment.shareableToken)}
                                            variant="secondary"
                                            className="w-full py-2 text-xs"
                                        >
                                            copy_invite_link()
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                        {filtered.length === 0 && (
                            <div className="col-span-full text-center py-16 border border-dashed border-slate-800 rounded bg-slate-900/10 flex flex-col items-center justify-center">
                                <div className="text-3xl mb-3 opacity-30">📂</div>
                                <p className="font-mono text-xs text-slate-500">No {filter.toLowerCase()} assessments established in standard buffers.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssessmentsHR;
