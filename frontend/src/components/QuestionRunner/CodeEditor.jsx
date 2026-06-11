import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import Button from '../ui/Button';

const CodeEditor = ({ value, onChange, onRun, isReadOnly }) => {
    const [language, setLanguage] = useState('javascript');
    const [output, setOutput] = useState('');
    const [isRunning, setIsRunning] = useState(false);
    const [outputHeight, setOutputHeight] = useState(160);

    const handleMouseDown = (e) => {
        e.preventDefault();
        const startY = e.clientY;
        const startHeight = outputHeight;

        const handleMouseMove = (moveEvent) => {
            const deltaY = startY - moveEvent.clientY;
            const newHeight = Math.max(80, Math.min(500, startHeight + deltaY));
            setOutputHeight(newHeight);
        };

        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    const handleEditorChange = (newValue) => {
        onChange(newValue);
    };

    const handleRun = async () => {
        setIsRunning(true);
        if (onRun) {
            const result = await onRun(value, language);
            setOutput(result);
        } else {
            // Mock execution
            setTimeout(() => {
                try {
                    let logs = [];
                    const originalLog = console.log;
                    console.log = (...args) => logs.push(args.join(' '));

                    if (language === 'javascript') {
                        // eslint-disable-next-line no-eval
                        eval(value);
                    } else {
                        logs.push(`Execution for ${language} is not supported in this demo runner.`);
                    }

                    console.log = originalLog;
                    setOutput(logs.join('\n') || 'No output');
                } catch (err) {
                    setOutput(`Error: ${err.message}`);
                }
                setIsRunning(false);
            }, 1000);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950 rounded-lg overflow-hidden border border-slate-800/80 shadow-2xl">
            <div className="flex justify-between items-center px-4 py-2.5 bg-slate-900/60 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">const language =</span>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs font-mono font-semibold text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-inner"
                    >
                        <option value="javascript">"javascript"</option>
                        <option value="python">"python"</option>
                        <option value="java">"java"</option>
                        <option value="cpp">"cpp"</option>
                    </select>
                    <span className="text-xs font-mono text-slate-500">;</span>
                </div>
                <Button
                    onClick={handleRun}
                    disabled={isRunning}
                    className="py-1 px-3.5 text-xs flex items-center gap-1.5"
                >
                    {isRunning ? 'executing...' : 'run_code()'}
                </Button>
            </div>

            <div className="flex-1 min-h-[150px] bg-slate-950">
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    language={language}
                    value={value}
                    theme="vs-dark"
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: isReadOnly,
                        padding: { top: 12 },
                        fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
                    }}
                />
            </div>

            {/* Draggable Divider */}
            <div
                className="h-1.5 cursor-ns-resize bg-slate-900 hover:bg-blue-500 active:bg-blue-600 transition-colors shrink-0"
                onMouseDown={handleMouseDown}
            />

            <div 
                style={{ height: `${outputHeight}px` }} 
                className="bg-slate-950 flex flex-col shrink-0 border-t border-slate-800/80"
            >
                <div className="px-4 py-1.5 bg-slate-900/40 text-[9px] font-mono text-slate-500 uppercase tracking-widest select-none border-b border-slate-800/40">
                    terminal_output.log
                </div>
                <div className="flex-1 p-4 font-mono text-xs overflow-auto text-slate-300 whitespace-pre-wrap selection:bg-indigo-500/20 selection:text-white">
                    {output || <span className="text-slate-650 italic">// Execute solution script to view test log details</span>}
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
