import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const CandidateAssessments = () => {
    const [upcoming, setUpcoming] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUpcoming = async () => {
            try {
                const res = await api.get('/assessments/upcoming');
                setUpcoming(res.data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchUpcoming();
    }, []);

    if (loading) return <div className="p-8 text-center text-slate-400">Loading assessments...</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold text-indigo-400 mb-8">My Assessments</h1>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {upcoming.map(item => (
                    <div key={item.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg flex flex-col">
                        <h2 className="text-xl font-bold mb-2 text-white">{item.assessment.title}</h2>
                        
                        {item.assessment.startTime && (
                            <div className="text-sm text-indigo-300 mb-4 bg-indigo-500/10 p-3 rounded-lg border border-indigo-500/20">
                                <strong>Starts:</strong> {new Date(item.assessment.startTime).toLocaleString()}
                            </div>
                        )}
                        
                        <div className="flex justify-between text-sm text-slate-300 mb-6 bg-slate-900/50 p-3 rounded-lg">
                            <span>⏱ {item.assessment.duration} min</span>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-slate-700">
                            {item.status === 'COMPLETED' ? (
                                <div className="text-center text-emerald-400 font-bold p-2 bg-emerald-500/10 rounded-lg">
                                    Completed
                                </div>
                            ) : (
                                <button 
                                    onClick={() => navigate(`/oa/exam/${item.assessmentId}`)}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-bold transition-colors"
                                >
                                    Launch Exam
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                
                {upcoming.length === 0 && (
                    <div className="col-span-full text-center text-slate-500 py-16 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
                        <div className="text-4xl mb-4">📋</div>
                        <p className="text-lg">You don't have any upcoming assessments.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CandidateAssessments;
