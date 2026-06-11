import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const CreateAssessment = () => {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [duration, setDuration] = useState(60);
    const [startTime, setStartTime] = useState('');
    const [availableQuestions, setAvailableQuestions] = useState([]);
    const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const response = await api.get('/questions');
            setAvailableQuestions(response.data.questions || []);
        } catch (error) {
            console.error(error);
        }
    };

    const toggleQuestion = (id) => {
        if (selectedQuestionIds.includes(id)) {
            setSelectedQuestionIds(selectedQuestionIds.filter(qId => qId !== id));
        } else {
            setSelectedQuestionIds([...selectedQuestionIds, id]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (selectedQuestionIds.length === 0) return alert("Select at least one question.");
        setLoading(true);
        try {
            const res = await api.post('/assessments', {
                title,
                description,
                duration: parseInt(duration),
                startTime: startTime || null
            });

            await api.post(`/assessments/${res.data.id}/questions`, {
                questionIds: selectedQuestionIds
            });

            navigate('/assessments');
        } catch (error) {
            console.error(error);
            alert("Failed to create assessment");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 bg-grid-pattern pt-20 pb-12">
            <div className="container mx-auto p-4 md:p-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-2xl font-mono font-bold text-slate-100 flex items-center gap-2">
                        <span className="text-blue-500">&gt;</span> create_assessment_schema()
                    </h1>
                    <p className="text-slate-500 text-xs font-mono mt-1">// Instantiate new online exam runner template</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Details Section */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
                        {/* Header decor */}
                        <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2 bg-slate-950/60 select-none">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-500/70"></span>
                                <span className="w-2 h-2 rounded-full bg-amber-500/70"></span>
                                <span className="w-2 h-2 rounded-full bg-emerald-500/70"></span>
                            </div>
                            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                                step_1_config.json
                            </span>
                        </div>

                        <div className="p-6 md:p-8 space-y-6">
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="col-span-2">
                                    <Input 
                                        required 
                                        label="assessment_title"
                                        value={title} 
                                        onChange={e => setTitle(e.target.value)} 
                                        placeholder="e.g. Senior Backend Engineer - Node.js" 
                                    />
                                </div>
                                <div className="col-span-2 flex flex-col gap-1.5">
                                    <label className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase ml-0.5">
                                        assessment_instructions
                                    </label>
                                    <textarea 
                                        value={description} 
                                        onChange={e => setDescription(e.target.value)} 
                                        rows="3" 
                                        className="bg-slate-900/80 border border-slate-700/80 rounded px-4 py-2 text-sm text-slate-100 placeholder-slate-600 font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 shadow-inner resize-y" 
                                        placeholder="/* Specify candidate guidelines here... */"
                                    />
                                </div>
                                <div>
                                    <Input 
                                        type="number" 
                                        required 
                                        label="duration_minutes"
                                        value={duration} 
                                        onChange={e => setDuration(e.target.value)} 
                                        min="10" 
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase ml-0.5 block mb-1.5">
                                        scheduled_start_time
                                    </label>
                                    <input 
                                        type="datetime-local" 
                                        value={startTime} 
                                        onChange={e => setStartTime(e.target.value)} 
                                        className="w-full bg-slate-900 border border-slate-705 focus:border-blue-500 focus:ring-blue-500/20 rounded px-4 py-2 text-sm text-slate-200 font-mono outline-none focus:ring-2 transition-all duration-150" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Questions Section */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
                        {/* Header decor */}
                        <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2 bg-slate-950/60 select-none">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-rose-500/70"></span>
                                <span className="w-2 h-2 rounded-full bg-amber-500/70"></span>
                                <span className="w-2 h-2 rounded-full bg-emerald-500/70"></span>
                            </div>
                            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                                step_2_questions.json
                            </span>
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-850">
                                <span className="text-xs font-mono text-slate-550">// Select nodes from global question bank</span>
                                <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded font-mono text-[10px] font-bold border border-blue-500/20">
                                    count: {selectedQuestionIds.length}
                                </span>
                            </div>

                            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                                {availableQuestions.map(q => (
                                    <div 
                                        key={q.id} 
                                        onClick={() => toggleQuestion(q.id)} 
                                        className={`p-4 rounded border-2 cursor-pointer transition-all flex items-start gap-4 ${
                                            selectedQuestionIds.includes(q.id) 
                                            ? 'bg-blue-500/5 border-blue-500/80 shadow-md shadow-blue-500/5' 
                                            : 'bg-slate-950/80 border-slate-850 hover:border-slate-700'
                                        }`}
                                    >
                                        <div className="mt-1 shrink-0">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedQuestionIds.includes(q.id)} 
                                                readOnly 
                                                className="w-4 h-4 rounded border-slate-700 text-blue-500 bg-slate-950 focus:ring-0 focus:ring-offset-0 cursor-pointer" 
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-mono text-xs font-bold text-slate-200 leading-normal line-clamp-1">{q.text}</h4>
                                            <div className="flex gap-2 mt-2 select-none">
                                                <span className="text-[9px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-500 px-2 py-0.5 rounded">{q.type}</span>
                                                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                                                    q.difficulty === 'EASY' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                                    q.difficulty === 'HARD' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 
                                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>{q.difficulty}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {availableQuestions.length === 0 && (
                                    <div className="text-center p-8 border border-dashed border-slate-800 rounded bg-slate-900/20 text-slate-500 font-mono text-xs">
                                        // Empty node registry. Create questions in library first.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-4 pt-6 border-t border-slate-800/80">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => navigate('/assessments')} 
                            className="py-2.5 px-6 text-xs font-semibold"
                        >
                            cancel()
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading} 
                            className="py-2.5 px-8 text-xs font-bold"
                        >
                            {loading ? 'deploying...' : 'deploy_assessment()'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateAssessment;
