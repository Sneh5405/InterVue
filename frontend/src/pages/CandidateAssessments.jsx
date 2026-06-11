import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/ui/Button';

const AssessmentCard = ({ item, navigate }) => {
    const { assessment } = item;
    
    const getAssessmentState = () => {
        const now = new Date();
        
        let isPast = false;
        if (item.status === 'COMPLETED' || item.status === 'CHEATED') {
            isPast = true;
        } else if (assessment.startTime) {
            const end = new Date(new Date(assessment.startTime).getTime() + assessment.duration * 60000);
            isPast = now > end;
        } else if (item.status === 'IN_PROGRESS' && item.startedAt) {
            const end = new Date(new Date(item.startedAt).getTime() + assessment.duration * 60000);
            isPast = now > end;
        }

        let isUpcoming = false;
        if (!isPast && assessment.startTime) {
            isUpcoming = new Date(assessment.startTime) > now;
        }

        const isOngoing = !isPast && !isUpcoming;

        return { isPast, isUpcoming, isOngoing };
    };

    const [state, setState] = useState(getAssessmentState());

    const getCountdownString = () => {
        if (!assessment.startTime) return '';
        const diff = new Date(assessment.startTime) - new Date();
        if (diff <= 0) return '';
        const seconds = Math.floor((diff / 1000) % 60);
        const fontMinutes = Math.floor((diff / 1000 / 60) % 60);
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        let countdownStr = '';
        if (days > 0) countdownStr += `${days}d `;
        if (hours > 0 || days > 0) countdownStr += `${hours}h `;
        if (fontMinutes > 0 || hours > 0 || days > 0) countdownStr += `${fontMinutes}m `;
        countdownStr += `${seconds}s`;
        return countdownStr;
    };

    const [timeLeft, setTimeLeft] = useState(getCountdownString());

    useEffect(() => {
        const { isPast, isUpcoming } = getAssessmentState();
        if (!assessment.startTime || isPast || !isUpcoming) return;

        const interval = setInterval(() => {
            const countdown = getCountdownString();
            if (countdown === '') {
                clearInterval(interval);
                setTimeLeft('');
                setState(getAssessmentState());
            } else {
                setTimeLeft(countdown);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [assessment.startTime, item.status, item.startedAt]);

    const { isPast, isUpcoming } = state;

    return (
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg flex flex-col hover:border-slate-700 transition-all relative overflow-hidden group shadow-lg">
            {/* Top window decorations */}
            <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2 bg-slate-950/60 select-none">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500/70"></span>
                    <span className="w-2 h-2 rounded-full bg-amber-500/70"></span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500/70"></span>
                </div>
                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                    exam_{item.id.slice(-6)}.json
                </span>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <h2 className="text-base font-mono font-bold mb-1.5 text-slate-100 flex items-center gap-1.5 group-hover:text-blue-400 transition-colors">
                    <span className="text-blue-500 font-normal">&gt;</span> {item.assessment.title}
                </h2>
                <p className="text-slate-400 font-sans text-xs mb-4 line-clamp-2 leading-relaxed">{item.assessment.description || "No description provided."}</p>
                
                {item.assessment.startTime && (
                    <div className="text-xs font-mono text-indigo-300 mb-4 bg-indigo-500/5 p-3 rounded border border-indigo-500/15">
                        <span className="text-slate-550">// schedule time</span>
                        <br />
                        starts: {new Date(item.assessment.startTime).toLocaleString()}
                    </div>
                )}

                {isUpcoming && timeLeft && (
                    <div className="text-xs font-mono font-semibold text-amber-400 mb-4 bg-amber-500/5 p-3 rounded border border-amber-500/15 flex flex-col items-center">
                        <span className="text-[10px] uppercase text-slate-500 mb-1">countdown_to_active</span>
                        <span className="text-base font-bold tracking-wider animate-pulse">{timeLeft}</span>
                    </div>
                )}
                
                <div className="flex justify-between text-xs font-mono text-slate-400 mb-6 bg-slate-950/80 p-3 rounded border border-slate-800/80">
                    <span>⏱ {item.assessment.duration}m_limit</span>
                    <span className={`font-bold uppercase tracking-wider ${
                        item.status === 'COMPLETED' ? 'text-emerald-400' :
                        item.status === 'CHEATED' ? 'text-rose-450' :
                        item.status === 'IN_PROGRESS' ? 'text-amber-400' : 'text-slate-500'
                    }`}>
                        {item.status === 'CHEATED' ? 'DISQUALIFIED' : item.status.replace('_', ' ')}
                    </span>
                </div>
                
                <div className="mt-auto pt-4 border-t border-slate-800/60">
                    {item.status === 'COMPLETED' ? (
                        <div className="text-center font-mono text-emerald-450 font-bold p-2 bg-emerald-500/10 rounded border border-emerald-500/20 text-xs">
                            COMPLETED
                        </div>
                    ) : item.status === 'CHEATED' ? (
                        <div className="text-center font-mono text-rose-450 font-bold p-2 bg-rose-500/10 rounded border border-rose-500/20 text-xs">
                            DISQUALIFIED
                        </div>
                    ) : isPast ? (
                        <div className="text-center font-mono text-rose-400 font-bold p-2 bg-rose-500/5 rounded border border-rose-500/15 text-xs">
                            EXPIRED
                        </div>
                    ) : isUpcoming ? (
                        <button 
                            disabled
                            className="w-full bg-slate-800 text-slate-500 py-2 rounded font-mono text-xs font-bold cursor-not-allowed border border-slate-850"
                        >
                            awaiting_start()
                        </button>
                    ) : (
                        <Button 
                            onClick={() => navigate(`/oa/exam/${item.assessmentId}`)}
                            className="w-full py-2"
                        >
                            run_assessment()
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

const CandidateAssessments = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Upcoming');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAssessments = async () => {
            try {
                const res = await api.get('/assessments/upcoming');
                setAssessments(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAssessments();
    }, []);

    const getAssessmentState = (item) => {
        const now = new Date();
        const assessment = item.assessment;
        
        let isPast = false;
        if (item.status === 'COMPLETED' || item.status === 'CHEATED') {
            isPast = true;
        } else if (assessment.startTime) {
            const end = new Date(new Date(assessment.startTime).getTime() + assessment.duration * 60000);
            isPast = now > end;
        } else if (item.status === 'IN_PROGRESS' && item.startedAt) {
            const end = new Date(new Date(item.startedAt).getTime() + assessment.duration * 60000);
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
        return assessments.filter(item => {
            const { isPast, isUpcoming, isOngoing } = getAssessmentState(item);

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
                            <span className="text-blue-500">&gt;</span> list_my_assessments()
                        </h1>
                        <p className="text-slate-500 text-xs font-mono mt-1">// Query active student allocations</p>
                    </div>
                    
                    {/* Filter Dropdown */}
                    <div className="relative inline-block w-48 shrink-0">
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
                        {filtered.map(item => (
                            <AssessmentCard 
                                key={item.id} 
                                item={item} 
                                navigate={navigate} 
                            />
                        ))}
                        
                        {filtered.length === 0 && (
                            <div className="col-span-full text-center py-16 border border-dashed border-slate-800 rounded bg-slate-900/10 flex flex-col items-center justify-center">
                                <div className="text-3xl mb-3 opacity-30">📂</div>
                                <p className="font-mono text-xs text-slate-500">No {filter.toLowerCase()} assessments allocated to this account.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateAssessments;
