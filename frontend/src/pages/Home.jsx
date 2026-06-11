import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const TerminalMock = () => {
    const [lines, setLines] = useState([]);
    const [currentStep, setCurrentStep] = useState(0);

    const logSequence = [
        { text: "$ npm run test:sandbox", delay: 1000, type: "input" },
        { text: "> intervue-core@2.0.0 test:sandbox", delay: 400, type: "system" },
        { text: "> jest --passWithNoTests", delay: 200, type: "system" },
        { text: "RUNS  ./sandbox.test.js", delay: 800, type: "system" },
        { text: "✓ compiler check: Node20-JS passed (120ms)", delay: 300, type: "success" },
        { text: "✓ video monitor sandbox initialized (185ms)", delay: 300, type: "success" },
        { text: "✓ anti-cheat focus checks enabled (42ms)", delay: 300, type: "success" },
        { text: "✓ socket listener connections: OK (90ms)", delay: 400, type: "success" },
        { text: "PASS  ./sandbox.test.js (3.8s)", delay: 500, type: "success" },
        { text: "Test Suites: 1 passed, 1 total", delay: 200, type: "info" },
        { text: "Tests:       4 passed, 4 total", delay: 100, type: "info" },
        { text: "Time:        3.95s, estimated 4s", delay: 100, type: "info" },
        { text: "Ran all sandbox checks.", delay: 400, type: "info" },
        { text: "Status: Environment ready for assessment. 🚀", delay: 2000, type: "success" },
        { text: "CLEAR", delay: 100, type: "clear" }
    ];

    useEffect(() => {
        let isMounted = true;
        const executeStep = async () => {
            const step = logSequence[currentStep];
            if (!step) return;

            if (step.type === "clear") {
                if (isMounted) setLines([]);
                setTimeout(() => {
                    if (isMounted) setCurrentStep(0);
                }, step.delay);
                return;
            }

            await new Promise(resolve => setTimeout(resolve, step.delay));
            if (!isMounted) return;

            setLines(prev => [...prev, step]);
            setCurrentStep(prev => (prev + 1) % logSequence.length);
        };

        executeStep();
        return () => { isMounted = false; };
    }, [currentStep]);

    return (
        <div className="w-full bg-slate-900 border border-slate-800/80 rounded-lg shadow-2xl shadow-indigo-500/5 font-mono text-[11px] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800/60">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
                </div>
                <span className="text-[9px] text-slate-500 tracking-wider">sandbox_runner.sh</span>
            </div>
            <div className="p-4 space-y-1.5 h-64 overflow-y-auto text-left leading-relaxed hide-scrollbar bg-slate-950/40">
                {lines.map((line, idx) => (
                    <div key={idx} className={
                        line.type === "input" ? "text-slate-100 font-bold" :
                        line.type === "success" ? "text-emerald-400 font-medium" :
                        line.type === "info" ? "text-slate-400" : "text-slate-500"
                    }>
                        {line.text}
                    </div>
                ))}
                <span className="inline-block w-1.5 h-3.5 bg-blue-400 animate-pulse ml-0.5 align-middle"></span>
            </div>
        </div>
    );
};

const Home = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-950 bg-grid-pattern pt-16 relative overflow-hidden flex flex-col justify-center">
            {/* Cyberpunk Glow Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] -z-10 animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[128px] -z-10 animate-pulse-slow"></div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-16 relative z-10 w-full">
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    {/* Hero Text */}
                    <div className="lg:col-span-7 text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono tracking-widest text-slate-400 uppercase mb-6 shadow-inner">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                            SYSTEMS.STATUS = "ACTIVE"
                        </div>
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.1]">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
                                Verify Technical
                            </span>
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400 font-mono text-glow-cyan">
                                code_excellence();
                            </span>
                        </h1>

                        <p className="max-w-xl text-base text-slate-400 mb-8 leading-relaxed">
                            A high-fidelity sandbox assessment platform. InterVue empowers engineering teams with live pair coding environments, webcam anti-cheat integrations, and robust grading tools.
                        </p>

                        <div className="flex gap-4">
                            {user ? (
                                <Link to="/interviews">
                                    <Button className="text-sm px-6 py-3">
                                        Open Dashboard
                                    </Button>
                                </Link>
                            ) : (
                                <>
                                    <Link to="/signup">
                                        <Button className="text-sm px-6 py-3">
                                            Initialize Account
                                        </Button>
                                    </Link>
                                    <Link to="/login">
                                        <Button variant="outline" className="text-sm px-6 py-3">
                                            Log In
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Interactive Sandbox Mockup */}
                    <div className="lg:col-span-5 w-full flex justify-center">
                        <TerminalMock />
                    </div>
                </div>

                {/* Cyber Feature Cards */}
                <div className="grid md:grid-cols-3 gap-6 mt-24">
                    {[
                        {
                            num: "01",
                            title: "Real-time Code Syncing",
                            desc: "Experience sub-100ms collaborative typing, compiler outputs, and direct code syncing built for tech mock sessions."
                        },
                        {
                            num: "02",
                            title: "Webcam Proctoring Checks",
                            desc: "Active fullscreen compliance and webcam integrity checks prevent navigation tab switches during live examinations."
                        },
                        {
                            num: "03",
                            title: "Multi-Language Sandbox",
                            desc: "Supports JavaScript, Python, C++, and Java execution sandboxes with custom execution stdin inputs."
                        }
                    ].map((feature, i) => (
                        <div key={i} className="group p-6 rounded-lg bg-slate-900/60 backdrop-blur border border-slate-800 hover:border-slate-700/80 transition-all text-left relative overflow-hidden shadow-xl hover:-translate-y-0.5 duration-200">
                            {/* Card Accent line */}
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-blue-500/20 to-indigo-500/20 group-hover:from-blue-500 group-hover:to-indigo-500 transition-all"></div>
                            
                            <div className="font-mono text-2xl font-black text-slate-800 mb-4 group-hover:text-blue-500/40 transition-colors">
                                // {feature.num}
                            </div>
                            <h3 className="text-base font-mono font-bold text-slate-100 mb-2 group-hover:text-blue-400 transition-colors">
                                {feature.title}
                            </h3>
                            <p className="text-slate-400 text-xs leading-relaxed">
                                {feature.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;

