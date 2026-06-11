import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { questionService } from '../services/api';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const Questions = () => {
    const { user } = useAuth();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        difficulty: '',
        type: '',
        page: 1
    });
    const [totalPages, setTotalPages] = useState(1);

    const fetchQuestions = async () => {
        setLoading(true);
        try {
            const response = await questionService.getAll(filters);
            setQuestions(response.data.questions);
            setTotalPages(response.data.totalPages);
        } catch (error) {
            console.error("Failed to fetch questions", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [filters.page, filters.difficulty, filters.type]);

    const handleSearch = (e) => {
        e.preventDefault();
        setFilters(prev => ({ ...prev, page: 1 }));
        fetchQuestions();
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this question?")) {
            try {
                await questionService.delete(id);
                fetchQuestions();
            } catch (error) {
                console.error("Failed to delete question", error);
            }
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'EASY': return 'text-green-400 bg-green-400/10 border-green-500/20';
            case 'MEDIUM': return 'text-yellow-400 bg-yellow-400/10 border-yellow-500/20';
            case 'HARD': return 'text-rose-405 bg-rose-500/10 border-rose-500/20';
            default: return 'text-slate-400 bg-slate-400/10 border-slate-500/20';
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 bg-grid-pattern pt-20 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-mono font-bold text-slate-100 flex items-center gap-2">
                            <span className="text-blue-500">&gt;</span> query_question_bank()
                        </h1>
                        <p className="text-slate-500 text-xs font-mono mt-1">// Manage global coding, MCQ, and scenario libraries</p>
                    </div>
                    {(user.role === 'HR' || user.role === 'INTERVIEWER') && (
                        <Link to="/questions/create">
                            <Button className="py-1.5 px-4 text-xs font-bold">+ add_new_node()</Button>
                        </Link>
                    )}
                </div>

                {/* Filters */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-850 rounded-lg p-5 mb-8 shadow-md">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="col-span-1 md:col-span-2">
                            <input
                                type="text"
                                name="search"
                                placeholder="Search repository..."
                                value={filters.search}
                                onChange={handleFilterChange}
                                className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 focus:ring-blue-500/25 rounded px-4 py-2 text-slate-200 placeholder-slate-650 font-mono text-xs outline-none focus:ring-2 transition-all shadow-inner"
                            />
                        </div>
                        <select
                            name="difficulty"
                            value={filters.difficulty}
                            onChange={handleFilterChange}
                            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-350 font-mono text-xs outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-inner"
                        >
                            <option value="">difficulty: ALL</option>
                            <option value="EASY">difficulty: EASY</option>
                            <option value="MEDIUM">difficulty: MEDIUM</option>
                            <option value="HARD">difficulty: HARD</option>
                        </select>
                        <select
                            name="type"
                            value={filters.type}
                            onChange={handleFilterChange}
                            className="bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-350 font-mono text-xs outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-inner"
                        >
                            <option value="">type: ALL</option>
                            <option value="MCQ">type: MCQ</option>
                            <option value="SCENARIO">type: SCENARIO</option>
                            <option value="CODE">type: CODE</option>
                        </select>
                    </form>
                </div>

                {/* Questions List */}
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {questions.length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-slate-800 rounded bg-slate-900/10 flex flex-col items-center justify-center">
                                <div className="text-3xl mb-3 opacity-30">🔍</div>
                                <p className="font-mono text-xs text-slate-500">No matching question records found in registry.</p>
                            </div>
                        ) : (
                            questions.map((question) => (
                                <div key={question.id} className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg p-5 hover:border-slate-700 transition-all flex flex-col relative overflow-hidden group shadow-lg">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-3 select-none">
                                                <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${getDifficultyColor(question.difficulty)}`}>
                                                    {question.difficulty}
                                                </span>
                                                <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    {question.type}
                                                </span>
                                                {question.tags && question.tags.map((tag, idx) => (
                                                    <span key={idx} className="px-2 py-0.5 rounded text-[9px] font-mono bg-slate-950 border border-slate-850 text-slate-500">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <h3 className="text-xs font-mono font-bold text-slate-200 mb-2 leading-relaxed flex items-start gap-2">
                                                <span className="text-blue-500 font-normal shrink-0 select-none">&gt;</span>
                                                <span>{question.text}</span>
                                            </h3>
                                        </div>

                                        {(user.role === 'HR' || user.role === 'INTERVIEWER') && (
                                            <div className="flex gap-2 shrink-0 select-none">
                                                <Link to={`/questions/${question.id}/edit`}>
                                                    <Button variant="secondary" className="py-1 px-3 text-[10px]">edit()</Button>
                                                </Link>
                                                <Button
                                                    variant="ghost"
                                                    className="py-1 px-3 text-[10px] text-rose-400 hover:text-rose-300 hover:bg-rose-500/5"
                                                    onClick={() => handleDelete(question.id)}
                                                >
                                                    delete()
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-8 select-none">
                        <Button
                            variant="secondary"
                            disabled={filters.page === 1}
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                            className="py-1 px-3 text-xs"
                        >
                            ← prev()
                        </Button>
                        <span className="text-xs font-mono text-slate-500">
                            page {filters.page} of {totalPages}
                        </span>
                        <Button
                            variant="secondary"
                            disabled={filters.page === totalPages}
                            onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                            className="py-1 px-3 text-xs"
                        >
                            next() →
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Questions;
