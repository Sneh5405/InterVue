import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

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

    if (loading) return <div className="p-8 text-center text-slate-400">Loading assessments...</div>;

    const filtered = getFilteredAssessments();

    return (
        <div className="container mx-auto p-4 md:p-8 mt-6">
            <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold text-indigo-400">Online Assessments</h1>
                    <p className="text-sm text-slate-400">Manage your company's online tests and review results.</p>
                </div>
                
                <div className="flex items-center gap-4">
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

                    <Link to="/assessments/create" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-600/20">
                        + Create Assessment
                    </Link>
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
                    {filtered.map(assessment => {
                        const { isPast, isUpcoming } = getAssessmentState(assessment);
                        
                        let badgeColor = 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                        let badgeText = 'Upcoming';
                        if (isPast) {
                            badgeColor = 'bg-rose-500/20 text-rose-400 border-rose-500/30';
                            badgeText = 'Expired';
                        } else if (!isUpcoming) {
                            badgeColor = 'bg-purple-500/20 text-purple-400 border-purple-500/30';
                            badgeText = 'Ongoing';
                        }

                        return (
                            <div key={assessment.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-slate-600 transition-colors flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2 gap-2">
                                        <h2 className="text-xl font-bold text-white leading-tight line-clamp-1">{assessment.title}</h2>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeColor}`}>
                                            {badgeText}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{assessment.description || "No description provided."}</p>
                                    
                                    {assessment.startTime && (
                                        <div className="text-xs text-indigo-300 mb-4 bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/20 font-medium">
                                            <strong>Scheduled:</strong> {new Date(assessment.startTime).toLocaleString()}
                                        </div>
                                    )}

                                    <div className="flex justify-between text-xs text-slate-300 mb-6 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50 font-medium">
                                        <span className="flex items-center gap-1">⏱ {assessment.duration}m</span>
                                        <span className="flex items-center gap-1">📝 {assessment._count?.questions || 0} Qs</span>
                                        <span className="flex items-center gap-1">👥 {assessment._count?.candidates || 0} Candidates</span>
                                    </div>
                                </div>
                                
                                <button 
                                    onClick={() => handleCopyLink(assessment.shareableToken)}
                                    className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-medium transition-colors border border-slate-600"
                                >
                                    Copy Shareable Link
                                </button>
                            </div>
                        );
                    })}
                    {filtered.length === 0 && (
                        <div className="col-span-full text-center text-slate-500 py-16 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
                            <div className="text-4xl mb-4">📄</div>
                            <p className="text-lg">No {filter.toLowerCase()} assessments found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssessmentsHR;
