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
        <div className="flex flex-col h-full bg-[#1e1e1e] rounded-xl overflow-hidden border border-slate-700">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-800 border-b border-slate-700">
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Language:</span>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-slate-900 border border-slate-600 rounded px-2 py-1 text-xs text-white focus:outline-none"
                    >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="java">Java</option>
                        <option value="cpp">C++</option>
                    </select>
                </div>
                <Button
                    onClick={handleRun}
                    disabled={isRunning}
                    className="py-1 px-3 text-sm flex items-center gap-2 bg-green-600 hover:bg-green-700"
                >
                    {isRunning ? 'Running...' : '▶ Run Code'}
                </Button>
            </div>

            <div className="flex-1 min-h-[150px]">
                <Editor
                    height="100%"
                    defaultLanguage="javascript"
                    language={language}
                    value={value}
                    theme="vs-dark"
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        readOnly: isReadOnly,
                    }}
                />
            </div>

            {/* Draggable Divider */}
            <div
                className="h-1.5 cursor-ns-resize bg-slate-700 hover:bg-blue-500 active:bg-blue-600 transition-colors shrink-0"
                onMouseDown={handleMouseDown}
            />

            <div 
                style={{ height: `${outputHeight}px` }} 
                className="bg-black flex flex-col shrink-0"
            >
                <div className="px-4 py-1 bg-slate-800 text-xs text-slate-400 font-medium uppercase tracking-wider">
                    Output
                </div>
                <div className="flex-1 p-4 font-mono text-sm overflow-auto text-slate-300 whitespace-pre-wrap">
                    {output || <span className="text-slate-600 italic">Run your code to see output...</span>}
                </div>
            </div>
        </div>
    );
};

export default CodeEditor;
