import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import Editor from '@monaco-editor/react';

const defaultTemplates = {
    javascript: "/**\n * @param {any} input\n * @return {any}\n */\nfunction solve() {\n    // Write your code here\n    \n}\n",
    python: "# Write your code here\ndef solve(input):\n    pass\n"
};

const AssessmentExam = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [activeIdx, setActiveIdx] = useState(0);
    const [loading, setLoading] = useState(true);
    const [answers, setAnswers] = useState({}); 
    const [timeLeft, setTimeLeft] = useState(0);
    const [waitingMode, setWaitingMode] = useState(false);
    const [targetStartTime, setTargetStartTime] = useState(null);
    const [waitLeft, setWaitLeft] = useState(0);

    const [selectedLanguages, setSelectedLanguages] = useState({}); // { [questionId]: 'javascript' | 'python' | 'java' | 'cpp' }
    const [codeDrafts, setCodeDrafts] = useState({}); // { [questionId]: { javascript: '...', python: '...', java: '...', cpp: '...' } }

    const [customStdin, setCustomStdin] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [isRunningCode, setIsRunningCode] = useState(false);
    const [isSubmittingCode, setIsSubmittingCode] = useState(false);
    const [runResults, setRunResults] = useState(null); // { stdout, stderr, exitCode, status }
    const [submitResults, setSubmitResults] = useState(null); // { overallVerdict, results: [...] }
    const [activeTab, setActiveTab] = useState('RUN'); // 'RUN' | 'SUBMIT'

    // Horizontal split resizing state and handler
    const [leftWidth, setLeftWidth] = useState(50); // percentage

    const handleHorizontalMouseDown = (e) => {
        e.preventDefault();
        const startX = e.clientX;
        const startWidth = leftWidth;
        const container = e.currentTarget.parentElement;
        const containerWidth = container.getBoundingClientRect().width;

        const handleMouseMove = (moveEvent) => {
            const deltaX = moveEvent.clientX - startX;
            const deltaPercent = (deltaX / containerWidth) * 100;
            const newWidth = Math.max(25, Math.min(75, startWidth + deltaPercent));
            setLeftWidth(newWidth);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    // Security & Anti-cheat States
    const [cheated, setCheated] = useState(false);
    const [systemCheckPassed, setSystemCheckPassed] = useState(false);
    const [cameraStream, setCameraStream] = useState(null);
    const [cameraOk, setCameraOk] = useState(false);
    const [cameraError, setCameraError] = useState("");

    const checkVideoRef = React.useRef(null);
    const examVideoRef = React.useRef(null);

    const enableCamera = async () => {
        try {
            setCameraError("");
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
            setCameraStream(stream);
            setCameraOk(true);
        } catch (err) {
            console.error("Camera error:", err);
            setCameraOk(false);
            setCameraError("Could not access camera. Please make sure webcam permissions are granted.");
        }
    };

    const handleStartExam = async () => {
        if (!cameraOk) {
            alert("Please enable and verify your camera to proceed.");
            return;
        }
        try {
            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            }
            setSystemCheckPassed(true);
            setLoading(true);
            await startExam();
        } catch (err) {
            console.error("Fullscreen error:", err);
            alert("Fullscreen mode is required to start the exam. Please allow fullscreen.");
        }
    };

    const startExam = async () => {
        try {
            const res = await api.post(`/assessments/${id}/start`);
            setQuestions(res.data.questions);
            setTimeLeft(res.data.duration); 
            setWaitingMode(false);
            setLoading(false);
        } catch (err) {
            if (err.response?.data?.isEarly) {
                setWaitingMode(true);
                setTargetStartTime(err.response.data.startTime);
                setLoading(false);
            } else if (err.response?.data?.cheated) {
                setCheated(true);
                setLoading(false);
            } else {
                console.error(err);
                alert("Could not start exam. Have you accepted the invite or already completed it?");
                navigate('/');
            }
        }
    };

    // Preflight Status Check on Mount
    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await api.get('/assessments/upcoming');
                const matching = res.data.find(item => item.assessmentId === parseInt(id));
                if (matching) {
                    if (matching.status === 'CHEATED') {
                        setCheated(true);
                        setLoading(false);
                        return;
                    }
                    if (matching.status === 'COMPLETED') {
                        alert("You have already completed this assessment.");
                        navigate('/');
                        return;
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error("Status check failed:", err);
                setLoading(false);
            }
        };
        checkStatus();
    }, [id, navigate]);

    // Automatically request camera when in checklist view
    useEffect(() => {
        if (!loading && !systemCheckPassed && !cheated) {
            enableCamera();
        }
    }, [loading, systemCheckPassed, cheated]);

    // Bind media stream to check video preview
    useEffect(() => {
        if (checkVideoRef.current && cameraStream) {
            checkVideoRef.current.srcObject = cameraStream;
        }
    }, [cameraStream, systemCheckPassed]);

    // Bind media stream to active exam video preview
    useEffect(() => {
        if (examVideoRef.current && cameraStream) {
            examVideoRef.current.srcObject = cameraStream;
        }
    }, [cameraStream, systemCheckPassed]);

    // Cleanup camera tracks on unmount
    useEffect(() => {
        return () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
        };
    }, [cameraStream]);

    // Anti-cheat Listeners
    useEffect(() => {
        if (!systemCheckPassed || loading || waitingMode || cheated) return;

        const handleCheating = async () => {
            if (cameraStream) {
                cameraStream.getTracks().forEach(track => track.stop());
            }
            setCheated(true);
            try {
                if (document.fullscreenElement) {
                    await document.exitFullscreen();
                }
            } catch (e) {
                // Ignore exit errors
            }
            try {
                await api.post(`/assessments/${id}/cheat`);
            } catch (err) {
                console.error("Failed to post cheating status:", err);
            }
        };

        const onFullscreenChange = () => {
            if (!document.fullscreenElement) {
                console.warn("Fullscreen exited");
                handleCheating();
            }
        };

        const onVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                console.warn("Tab switched (hidden)");
                handleCheating();
            }
        };

        document.addEventListener('fullscreenchange', onFullscreenChange);
        document.addEventListener('visibilitychange', onVisibilityChange);

        return () => {
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            document.removeEventListener('visibilitychange', onVisibilityChange);
        };
    }, [systemCheckPassed, loading, waitingMode, cheated, cameraStream, id]);

    useEffect(() => {
        if (!waitingMode || !targetStartTime) return;
        
        const calcWait = () => {
            const now = new Date();
            const start = new Date(targetStartTime);
            const diff = Math.floor((start - now) / 1000);
            return diff > 0 ? diff : 0;
        };

        setWaitLeft(calcWait());

        const timerId = setInterval(() => {
            const w = calcWait();
            setWaitLeft(w);
            if (w <= 0) {
                clearInterval(timerId);
                setLoading(true);
                startExam();
            }
        }, 1000);

        return () => clearInterval(timerId);
    }, [waitingMode, targetStartTime]);

    useEffect(() => {
        if (waitingMode || !systemCheckPassed) return;
        if (timeLeft <= 0 && !loading) {
            handleFinish();
            return;
        }
        const timerId = setInterval(() => setTimeLeft(t => t - 1), 1000);
        return () => clearInterval(timerId);
    }, [timeLeft, loading, waitingMode, systemCheckPassed]);

    const formatTime = (seconds) => {
        if (!seconds || seconds < 0) return '00:00';
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return h > 0 ? `${h}:${m}:${s}` : `${m}:${s}`;
    };

    const handleCodeChange = (value) => {
        const qId = questions[activeIdx].questionId;
        const lang = selectedLanguages[qId] || 'javascript';
        
        // 1. Update the codeDrafts for this language
        const drafts = codeDrafts[qId] || {};
        setCodeDrafts(prev => ({
            ...prev,
            [qId]: { ...drafts, [lang]: value }
        }));

        // 2. Update the active answer state
        setAnswers(prev => ({ ...prev, [qId]: value }));
    };

    const handleLanguageChange = (lang) => {
        const qId = questions[activeIdx].questionId;
        setSelectedLanguages(prev => ({
            ...prev,
            [qId]: lang
        }));

        // Retrieve draft for this language
        const draft = codeDrafts[qId]?.[lang] || defaultTemplates[lang];
        
        // Update answers[qId] so that it holds the draft of the new language
        setAnswers(prev => ({
            ...prev,
            [qId]: draft
        }));
    };

    const saveAnswer = async () => {
        if(questions.length === 0) return;
        const qId = questions[activeIdx].questionId;
        const lang = selectedLanguages[qId] || 'javascript';
        const answer = answers[qId] || codeDrafts[qId]?.[lang] || defaultTemplates[lang];
        if(!answer) return;
        
        try {
            await api.post(`/assessments/${id}/submit`, { questionId: qId, answer });
        } catch (err) {
            console.error(err);
        }
    };

    const handleFinish = async () => {
        if (timeLeft > 0 && !window.confirm("Are you sure you want to submit your exam? You cannot undo this.")) return;
        try {
            await saveAnswer(); 
            await api.post(`/assessments/${id}/finish`);
            navigate('/');
            alert("Exam submitted successfully!");
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-400 font-mono">Initializing Sandbox Environment...</p>
        </div>
    );

    if (cheated) return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <div className="bg-slate-900 border border-red-500/30 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
                <div className="text-6xl mb-6 mt-4">🚫</div>
                <h1 className="text-3xl font-bold text-red-500 mb-4">Disqualified</h1>
                <p className="text-slate-300 mb-8 leading-relaxed">
                    You have been disqualified from this assessment because you exited fullscreen mode, switched tabs, or lost window focus. This activity is flagged as cheating.
                </p>
                <button 
                    onClick={() => navigate('/')} 
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all border border-slate-700 hover:border-slate-600"
                >
                    Return Home
                </button>
            </div>
        </div>
    );

    if (!systemCheckPassed) return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-white">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-4xl w-full shadow-[0_0_50px_rgba(79,70,229,0.1)] relative overflow-hidden flex flex-col gap-6">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Assessment System Check</h1>
                    <p className="text-slate-400">Please complete the setup to start your monitored exam session.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mt-4">
                    {/* Camera Panel */}
                    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group shadow-inner">
                        <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center relative mb-4">
                            {cameraOk ? (
                                <video ref={checkVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center p-4">
                                    <span className="text-4xl mb-2">📸</span>
                                    <span className="text-slate-500 text-sm font-mono">Camera Feed Offline</span>
                                </div>
                            )}
                        </div>

                        <div className="w-full flex items-center justify-between px-2">
                            <span className="text-sm font-semibold text-slate-300">Webcam Stream Check</span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${cameraOk ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                {cameraOk ? "Active" : "Required"}
                            </span>
                        </div>

                        {cameraError && (
                            <p className="text-rose-400 text-xs mt-3 bg-rose-500/5 border border-rose-500/10 p-2.5 rounded-lg w-full">
                                ⚠️ {cameraError}
                            </p>
                        )}
                        {!cameraOk && (
                            <button
                                onClick={enableCamera}
                                className="mt-4 w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2 px-4 rounded-xl border border-slate-700 transition-all text-sm"
                            >
                                Grant Camera Permission
                            </button>
                        )}
                    </div>

                    {/* Instructions Panel */}
                    <div className="bg-slate-950 rounded-2xl border border-slate-800 p-6 flex flex-col justify-between shadow-inner">
                        <div>
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <span className="text-indigo-400">🛡️</span> Security & Anti-Cheat Rules
                            </h2>
                            <ul className="space-y-4 text-sm text-slate-300">
                                <li className="flex gap-3">
                                    <span className="text-amber-400 font-bold">1.</span>
                                    <span><strong>Fullscreen Requirement:</strong> Entering the exam will trigger fullscreen. Do not press ESC or exit fullscreen. Doing so triggers instant disqualification.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-amber-400 font-bold">2.</span>
                                    <span><strong>Focus & Tab Monitoring:</strong> Switching tabs, opening dev tools, or losing window focus is strictly prohibited and flags your session.</span>
                                </li>
                                <li className="flex gap-3">
                                    <span className="text-amber-400 font-bold">3.</span>
                                    <span><strong>Webcam Monitoring:</strong> Your camera must remain on throughout the exam. Ensure your face is visible.</span>
                                </li>
                            </ul>
                        </div>

                        <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl text-xs text-amber-400 leading-relaxed font-medium">
                            ⚠️ Violating these rules will terminate the test session immediately and submit a cheating verdict.
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-4 pt-6 border-t border-slate-800">
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-3.5 rounded-xl font-medium bg-slate-800 border border-slate-700 hover:bg-slate-700 hover:border-slate-600 transition-all text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleStartExam}
                        disabled={!cameraOk}
                        className={`px-8 py-3.5 rounded-xl font-bold transition-all text-sm flex items-center gap-2 shadow-lg ${
                            cameraOk 
                                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 hover:shadow-indigo-600/40 cursor-pointer'
                                : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        }`}
                    >
                        Enter Fullscreen & Start Exam 🚀
                    </button>
                </div>
            </div>
        </div>
    );

    if (waitingMode) return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-lg w-full text-center shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                <div className="text-5xl mb-6 mt-4">⏳</div>
                <h1 className="text-3xl font-bold text-white mb-2">Assessment Starting Soon</h1>
                <p className="text-slate-400 mb-8">Please wait. The exam will automatically launch when the timer reaches zero.</p>
                <div className="text-5xl font-mono font-bold text-indigo-400 bg-slate-950 py-6 rounded-2xl border border-slate-800 shadow-inner">
                    {formatTime(waitLeft)}
                </div>
            </div>
        </div>
    );

    const activeQuestion = questions[activeIdx]?.question;

    return (
        <div className="h-screen flex flex-col bg-slate-950 text-slate-100 font-sans overflow-hidden">
            {/* HackerRank Style Header */}
            <header className="h-14 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between px-6 shrink-0 shadow-md z-10">
                <div className="flex items-center gap-3 font-mono">
                    <span className="text-blue-500 font-bold">&lt;/&gt;</span>
                    <span className="font-bold text-slate-200 tracking-wide text-sm border-r border-slate-800 pr-4">inter_vue_sandbox</span>
                    <span className="text-xs text-slate-500 hidden sm:inline">assessment_session_{id.substring(0, 8)}.json</span>
                </div>
                
                <div className={`font-mono text-base font-bold bg-slate-900 px-4 py-1.5 rounded border border-slate-800 shadow-inner ${timeLeft < 300 ? 'text-rose-400 animate-pulse border-rose-500/50 bg-rose-500/10' : 'text-emerald-400'}`}>
                    timer: {formatTime(timeLeft)}
                </div>
                
                <button onClick={handleFinish} className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 px-5 py-1.5 rounded font-mono text-sm font-bold transition-all shadow-lg shadow-emerald-500/5">
                    submit_test()
                </button>
            </header>

            <div className="flex flex-1 overflow-hidden select-none">
                {/* Left Pane - Questions (HackerRank Layout) */}
                <div 
                    style={{ width: `${leftWidth}%` }} 
                    className="flex flex-col border-r border-slate-800/80 bg-slate-950 overflow-hidden"
                >
                    {/* Question Nav Tabs */}
                    <div className="flex bg-slate-950/60 px-2 pt-2 overflow-x-auto border-b border-slate-800/80 hide-scrollbar shrink-0 gap-1">
                        {questions.map((q, idx) => (
                            <button 
                                key={q.id} 
                                onClick={() => { saveAnswer(); setActiveIdx(idx); }}
                                className={`px-4 py-2 rounded-t font-mono text-xs transition-all border-t border-x ${activeIdx === idx 
                                        ? 'bg-slate-900 text-blue-400 border-slate-850 border-b-transparent shadow-[0_-2px_10px_rgba(255,255,255,0.02)]' 
                                        : answers[q.questionId] 
                                            ? 'text-emerald-400 hover:text-emerald-300 border-transparent' 
                                            : 'text-slate-500 hover:text-slate-350 border-transparent'}`}
                                style={{ marginBottom: activeIdx === idx ? '-1px' : '0' }}
                            >
                                question_{idx + 1}.md
                                {answers[q.questionId] && activeIdx !== idx && <span className="ml-1.5 text-[10px]">✓</span>}
                            </button>
                        ))}
                    </div>

                    {/* Question Content */}
                    <div className="flex-1 overflow-y-auto p-8 bg-slate-900/10 hide-scrollbar max-w-none">
                        <div className="mb-6 pb-4 border-b border-slate-800/80">
                            <h2 className="text-xl font-mono font-bold text-slate-100 mb-3 flex items-center gap-2">
                                <span className="text-blue-500 font-normal">#</span> {activeQuestion?.text}
                            </h2>
                            <div className="flex gap-2">
                                <span className="bg-slate-900 text-[10px] px-2 py-0.5 rounded font-mono text-slate-400 border border-slate-800/60">{activeQuestion?.type}</span>
                                <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold border ${activeQuestion?.difficulty === 'EASY' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : activeQuestion?.difficulty === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>{activeQuestion?.difficulty}</span>
                            </div>
                        </div>
                        
                        {/* MCQ Options */}
                        {activeQuestion?.type === 'MCQ' && (
                            <div className="mt-6 space-y-3 font-mono">
                                {activeQuestion.options?.map((opt, i) => (
                                    <label key={i} className={`flex items-start gap-4 p-4 rounded border cursor-pointer transition-all text-sm
                                        ${answers[activeQuestion.id] === opt ? 'bg-indigo-500/5 border-indigo-500/50 shadow-sm' : 'bg-slate-900/30 border-slate-850 hover:border-slate-700'}`}>
                                        <div className="mt-0.5">
                                            <input 
                                                type="radio" 
                                                name={`q-${activeQuestion.id}`} 
                                                value={opt} 
                                                checked={answers[activeQuestion.id] === opt}
                                                onChange={() => setAnswers({ ...answers, [activeQuestion.id]: opt })}
                                                className="w-4 h-4 accent-indigo-500 bg-slate-950 border-slate-800"
                                            />
                                        </div>
                                        <span className="text-slate-300 leading-snug">{opt}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                        
                        {/* Code Problem Statement Placeholder */}
                        {activeQuestion?.type === 'CODE' && (
                            <div className="text-slate-400 font-mono text-xs leading-relaxed space-y-4">
                                <p>// Write a program to solve the problem described above. Your code will be evaluated against hidden test cases.</p>
                                <div>
                                    <h3 className="text-slate-200 font-bold mt-4 mb-1">### Input Format</h3>
                                    <p>Standard input containing the parameters.</p>
                                </div>
                                <div>
                                    <h3 className="text-slate-200 font-bold mt-4 mb-1">### Output Format</h3>
                                    <p>Return or print the expected result.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Draggable Divider */}
                <div
                    className="w-1.5 cursor-col-resize bg-slate-900 hover:bg-blue-500 active:bg-blue-600 transition-colors shrink-0 flex items-center justify-center group"
                    onMouseDown={handleHorizontalMouseDown}
                    title="Drag to resize panels"
                >
                    <div className="w-0.5 h-8 bg-slate-700 group-hover:bg-white rounded transition-colors" />
                </div>

                {/* Right Pane - Monaco Editor */}
                <div 
                    style={{ width: `${100 - leftWidth}%` }} 
                    className="flex flex-col bg-slate-950"
                >
                    {activeQuestion?.type === 'CODE' ? (
                        <>
                            <div className="h-10 bg-slate-900/60 border-b border-slate-800/80 flex items-center px-4 shrink-0 justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
                                    <span className="text-xs font-mono text-slate-500 ml-3">
                                        solution.{(selectedLanguages[activeQuestion.id] || 'javascript') === 'python' ? 'py' : 'js'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <select
                                        value={selectedLanguages[activeQuestion.id] || 'javascript'}
                                        onChange={(e) => handleLanguageChange(e.target.value)}
                                        className="bg-slate-950 text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider border border-slate-800 rounded px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-inner"
                                    >
                                        <option value="javascript">JavaScript (Node.js)</option>
                                        <option value="python">Python 3</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex-1 relative bg-slate-950">
                                <Editor
                                    height="100%"
                                    language={selectedLanguages[activeQuestion.id] || 'javascript'}
                                    theme="vs-dark"
                                    value={answers[activeQuestion.id] !== undefined ? answers[activeQuestion.id] : (codeDrafts[activeQuestion.id]?.[selectedLanguages[activeQuestion.id] || 'javascript'] || defaultTemplates[selectedLanguages[activeQuestion.id] || 'javascript'])}
                                    onChange={handleCodeChange}
                                    options={{
                                        minimap: { enabled: false },
                                        fontSize: 13,
                                        padding: { top: 16 },
                                        scrollBeyondLastLine: false,
                                        smoothScrolling: true,
                                        cursorBlinking: "smooth",
                                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                                        renderLineHighlight: "all",
                                    }}
                                />
                                <div className="absolute bottom-4 right-6 flex gap-3">
                                    <button onClick={saveAnswer} className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 px-4 py-1.5 rounded font-mono text-xs shadow-lg transition-all">
                                        save_draft()
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-650 bg-slate-950 border-l border-slate-900 select-none">
                            <div className="text-5xl mb-4 opacity-20">⌨️</div>
                            <h3 className="text-sm font-mono font-bold text-slate-400 mb-1">no_editor_required</h3>
                            <p className="text-xs font-mono text-slate-500">Please select correct MCQ option in left pane.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AssessmentExam;

