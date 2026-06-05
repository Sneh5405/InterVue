import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
        const minutes = Math.floor((diff / 1000 / 60) % 60);
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        let countdownStr = '';
        if (days > 0) countdownStr += `${days}d `;
        if (hours > 0 || days > 0) countdownStr += `${hours}h `;
        if (minutes > 0 || hours > 0 || days > 0) countdownStr += `${minutes}m `;
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
                setState(getAssessmentState()); // Recalculate state to enable join
            } else {
                setTimeLeft(countdown);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [assessment.startTime, item.status, item.startedAt]);

    const { isPast, isUpcoming } = state;

    return (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col hover:border-slate-600 transition-colors">
            <h2 className="text-xl font-bold mb-2 text-white">{item.assessment.title}</h2>
            <p className="text-slate-400 text-sm mb-4 line-clamp-2">{item.assessment.description || "No description provided."}</p>
            
            {item.assessment.startTime && (
                <div className="text-sm text-indigo-300 mb-4 bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
                    <strong>Starts:</strong> {new Date(item.assessment.startTime).toLocaleString()}
                </div>
            )}

            {isUpcoming && timeLeft && (
                <div className="text-sm font-semibold text-amber-400 mb-4 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20 flex flex-col items-center">
                    <span className="text-xs uppercase text-slate-400 mb-1">Starts In</span>
                    <span className="text-lg font-mono tracking-wider">{timeLeft}</span>
                </div>
            )}
            
            <div className="flex justify-between text-sm text-slate-300 mb-6 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                <span>⏱ {item.assessment.duration} min</span>
                <span className={`capitalize font-semibold ${
                    item.status === 'COMPLETED' ? 'text-emerald-400' :
                    item.status === 'CHEATED' ? 'text-rose-400' :
                    item.status === 'IN_PROGRESS' ? 'text-amber-400' : 'text-slate-400'
                }`}>
                    {item.status === 'CHEATED' ? 'disqualified' : item.status.toLowerCase().replace('_', ' ')}
                </span>
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-700">
                {item.status === 'COMPLETED' ? (
                    <div className="text-center text-emerald-400 font-bold p-2.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        Completed
                    </div>
                ) : item.status === 'CHEATED' ? (
                    <div className="text-center text-rose-400 font-bold p-2.5 bg-rose-500/10 rounded-lg border border-rose-500/20">
                        Disqualified
                    </div>
                ) : isPast ? (
                    <div className="text-center text-rose-400 font-bold p-2.5 bg-rose-500/10 rounded-lg border border-rose-500/20">
                        Expired
                    </div>
                ) : isUpcoming ? (
                    <button 
                        disabled
                        className="w-full bg-slate-700 text-slate-400 py-2.5 rounded-lg font-bold cursor-not-allowed border border-slate-600"
                    >
                        Not Started Yet
                    </button>
                ) : (
                    <button 
                        onClick={() => navigate(`/oa/exam/${item.assessmentId}`)}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-bold transition-colors shadow-lg shadow-indigo-600/20"
                    >
                        Join Test
                    </button>
                )}
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

    if (loading) return <div className="p-8 text-center text-slate-400">Loading assessments...</div>;

    const filtered = getFilteredAssessments();

    return (
        <div className="container mx-auto p-4 md:p-8 mt-6">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-indigo-400">My Assessments</h1>
                
                {/* Filter Dropdown */}
                <div className="relative inline-block w-48">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full bg-slate-800 text-white border border-slate-600 hover:border-slate-500 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all cursor-pointer font-medium text-sm"
                    >
                        <option value="Upcoming">Upcoming</option>
                        <option value="Ongoing">Ongoing</option>
                        <option value="Past History">Past History</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>
            
            {/* Filtered List */}
            <div className="mb-10">
                <h2 className={`text-xl font-semibold mb-6 flex items-center gap-2 ${
                    filter === 'Upcoming' ? 'text-white' :
                    filter === 'Ongoing' ? 'text-purple-400' : 'text-slate-400'
                }`}>
                    <span className={`w-2 h-2 rounded-full ${
                        filter === 'Upcoming' ? 'bg-blue-500' :
                        filter === 'Ongoing' ? 'bg-purple-500' : 'bg-slate-500'
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
                        <div className="col-span-full text-center text-slate-500 py-16 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
                            <div className="text-4xl mb-4">📋</div>
                            <p className="text-lg">No {filter.toLowerCase()} assessments found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CandidateAssessments;
