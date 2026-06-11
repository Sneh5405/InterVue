import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { questionService } from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const QuestionForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        text: '',
        type: 'MCQ',
        difficulty: 'MEDIUM',
        tags: '',
        options: [],
        correctAnswer: '',
        testCases: []
    });

    useEffect(() => {
        if (isEdit) {
            const fetchQuestion = async () => {
                try {
                    const response = await questionService.getById(id);
                    const q = response.data;
                    setFormData({
                        text: q.text,
                        type: q.type,
                        difficulty: q.difficulty,
                        tags: q.tags ? q.tags.join(', ') : '',
                        options: q.options || [],
                        correctAnswer: q.correctAnswer || '',
                        testCases: q.testCases || []
                    });
                } catch (error) {
                    console.error("Failed to fetch question details", error);
                }
            };
            fetchQuestion();
        }
    }, [id, isEdit, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...formData.options];
        newOptions[index] = value;
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const addOption = () => {
        setFormData(prev => ({ ...prev, options: [...prev.options, ''] }));
    };

    const removeOption = (index) => {
        const newOptions = formData.options.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, options: newOptions }));
    };

    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...formData.testCases];
        newTestCases[index] = { ...newTestCases[index], [field]: value };
        setFormData(prev => ({ ...prev, testCases: newTestCases }));
    };

    const addTestCase = () => {
        setFormData(prev => ({ ...prev, testCases: [...prev.testCases, { input: '', output: '' }] }));
    };

    const removeTestCase = (index) => {
        const newTestCases = formData.testCases.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, testCases: newTestCases }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            if (isEdit) {
                await questionService.update(id, payload);
            } else {
                await questionService.create(payload);
            }
            navigate('/questions');
        } catch (error) {
            console.error("Failed to save question", error);
            alert("Failed to save question");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 bg-grid-pattern pt-20 pb-12">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-2xl font-mono font-bold text-slate-100 flex items-center gap-2">
                        <span className="text-blue-500">&gt;</span> {isEdit ? 'edit_question_node()' : 'create_question_node()'}
                    </h1>
                    <p className="text-slate-500 text-xs font-mono mt-1">// {isEdit ? 'Modify existing question parameters in bank' : 'Append a new node to the interview question list'}</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2.5 bg-slate-950/60 select-none">
                            <div className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
                            </div>
                            <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                                question_metadata.json
                            </span>
                        </div>

                        <div className="p-6 md:p-8 space-y-5">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase ml-0.5">
                                    question_text
                                </label>
                                <textarea
                                    name="text"
                                    required
                                    value={formData.text}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full bg-slate-900/80 border border-slate-700/80 rounded px-4 py-2.5 text-sm text-slate-100 placeholder-slate-650 font-mono outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-150 shadow-inner resize-y"
                                    placeholder="/* Describe the problem requirements... */"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase ml-0.5 block mb-1.5">
                                        question_type
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900 border border-slate-705 focus:border-blue-500 focus:ring-blue-500/20 rounded px-4 py-2 text-sm text-slate-200 font-mono outline-none focus:ring-2 transition-all duration-150 cursor-pointer shadow-inner"
                                    >
                                        <option value="MCQ">Multiple Choice</option>
                                        <option value="SCENARIO">Scenario Based</option>
                                        <option value="CODE">Coding Problem</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase ml-0.5 block mb-1.5">
                                        difficulty
                                    </label>
                                    <select
                                        name="difficulty"
                                        value={formData.difficulty}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900 border border-slate-705 focus:border-blue-500 focus:ring-blue-500/20 rounded px-4 py-2 text-sm text-slate-200 font-mono outline-none focus:ring-2 transition-all duration-150 cursor-pointer shadow-inner"
                                    >
                                        <option value="EASY">Easy</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HARD">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <Input
                                    type="text"
                                    name="tags"
                                    label="tags_list"
                                    value={formData.tags}
                                    onChange={handleChange}
                                    placeholder="e.g. javascript, react, design"
                                />
                            </div>
                        </div>
                    </div>

                    {/* MCQ Specific Option Fields */}
                    {formData.type === 'MCQ' && (
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2 bg-slate-950/60 select-none">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-rose-500/70"></span>
                                    <span className="w-2 h-2 rounded-full bg-amber-500/70"></span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500/70"></span>
                                </div>
                                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                                    mcq_options_registry.json
                                </span>
                            </div>

                            <div className="p-6 md:p-8 space-y-4">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-850">
                                    <span className="text-xs font-mono text-slate-500">// Configure multiple-choice choices</span>
                                    <Button type="button" variant="ghost" onClick={addOption} className="py-1 px-3 text-[10px]">
                                        + add_option()
                                    </Button>
                                </div>

                                {formData.options.map((option, index) => (
                                    <div key={index} className="flex gap-2 items-center">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => handleOptionChange(index, e.target.value)}
                                            placeholder={`Option ${index + 1}`}
                                            className="flex-1 bg-slate-955 border border-slate-800 focus:border-blue-500 rounded px-4 py-2 text-xs font-mono text-slate-200 outline-none focus:ring-1 focus:ring-blue-500/20 transition-all shadow-inner"
                                        />
                                        <Button 
                                            type="button" 
                                            variant="ghost" 
                                            onClick={() => removeOption(index)} 
                                            className="py-1.5 px-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/5 text-xs font-bold shrink-0"
                                        >
                                            remove()
                                        </Button>
                                    </div>
                                ))}

                                <div className="pt-4 border-t border-slate-850">
                                    <Input
                                        type="text"
                                        name="correctAnswer"
                                        label="correct_answer_match"
                                        value={formData.correctAnswer}
                                        onChange={handleChange}
                                        placeholder="Enter the text of the correct option"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CODE Specific Test Case Fields */}
                    {formData.type === 'CODE' && (
                        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
                            <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2 bg-slate-950/60 select-none">
                                <div className="flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-rose-500/70"></span>
                                    <span className="w-2 h-2 rounded-full bg-amber-500/70"></span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500/70"></span>
                                </div>
                                <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                                    test_suite.json
                                </span>
                            </div>

                            <div className="p-6 md:p-8 space-y-4">
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-850">
                                    <span className="text-xs font-mono text-slate-550">// Setup test asserts</span>
                                    <Button type="button" variant="ghost" onClick={addTestCase} className="py-1 px-3 text-[10px]">
                                        + add_test_case()
                                    </Button>
                                </div>

                                {formData.testCases.map((testCase, index) => (
                                    <div key={index} className="space-y-3 p-4 bg-slate-955 rounded border border-slate-800 shadow-inner">
                                        <div className="flex justify-between items-center select-none border-b border-slate-900 pb-2">
                                            <span className="text-[10px] font-mono text-slate-550 font-bold uppercase">test_case_{index + 1}</span>
                                            <Button 
                                                type="button" 
                                                variant="ghost" 
                                                onClick={() => removeTestCase(index)} 
                                                className="py-0.5 px-2 text-[10px] text-rose-400 hover:text-rose-300"
                                            >
                                                delete()
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-mono text-slate-500">stdin</span>
                                                <textarea
                                                    value={testCase.input}
                                                    onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)}
                                                    placeholder="Input stdin..."
                                                    rows={2}
                                                    className="bg-slate-900 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-550 rounded px-3 py-1.5 text-xs text-slate-200 font-mono outline-none resize-y"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[9px] font-mono text-slate-500">expected_output</span>
                                                <textarea
                                                    value={testCase.output}
                                                    onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)}
                                                    placeholder="Expected stdout..."
                                                    rows={2}
                                                    className="bg-slate-900 border border-slate-800 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-550 rounded px-3 py-1.5 text-xs text-slate-200 font-mono outline-none resize-y"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-6 border-t border-slate-800/80 select-none">
                        <Button 
                            type="button" 
                            variant="secondary" 
                            onClick={() => navigate('/questions')}
                            className="py-2 px-5 text-xs font-semibold"
                        >
                            cancel()
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="py-2 px-8 text-xs font-bold"
                        >
                            {loading ? 'saving...' : 'save_question()'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuestionForm;
