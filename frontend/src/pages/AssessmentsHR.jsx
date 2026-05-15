import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const AssessmentsHR = () => {
    const [assessments, setAssessments] = useState([]);
    const [loading, setLoading] = useState(true);

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



    if (loading) return <div className="p-8 text-center">Loading assessments...</div>;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-indigo-400">Online Assessments</h1>
                <Link to="/assessments/create" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                    + Create Assessment
                </Link>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {assessments.map(assessment => (
                    <div key={assessment.id} className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg hover:border-slate-600 transition-colors">
                        <h2 className="text-xl font-bold mb-2 text-white">{assessment.title}</h2>
                        <p className="text-slate-400 text-sm mb-4 line-clamp-2">{assessment.description || "No description provided."}</p>
                        <div className="flex justify-between text-sm text-slate-300 mb-6 bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                            <span className="flex items-center gap-1">⏱ {assessment.duration}m</span>
                            <span className="flex items-center gap-1">📝 {assessment._count?.questions || 0} Qs</span>
                            <span className="flex items-center gap-1">👥 {assessment._count?.candidates || 0}</span>
                        </div>
                        <button 
                            onClick={() => handleCopyLink(assessment.shareableToken)}
                            className="w-full bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-medium transition-colors"
                        >
                            Copy Shareable Link
                        </button>
                    </div>
                ))}
                {assessments.length === 0 && (
                    <div className="col-span-full text-center text-slate-500 py-16 border-2 border-dashed border-slate-700 rounded-xl bg-slate-800/30">
                        <div className="text-4xl mb-4">📄</div>
                        <p className="text-lg">No assessments created yet. Click "+ Create Assessment" to start hiring.</p>
                    </div>
                )}
            </div>


        </div>
    );
};

export default AssessmentsHR;
