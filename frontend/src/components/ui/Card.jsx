import React from 'react';

const Card = ({ children, className = '', title, subtitle }) => {
    return (
        <div className={`bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-lg shadow-2xl relative overflow-hidden flex flex-col ${className}`}>
            {/* Terminal Top Window Bar Decoration */}
            <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2.5 bg-slate-950/60 select-none">
                <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70"></span>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70"></span>
                </div>
                {title && (
                    <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
                        panel.stdout
                    </span>
                )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
                {(title || subtitle) && (
                    <div className="mb-5 border-b border-slate-800/60 pb-4">
                        {title && (
                            <h2 className="text-xl font-mono font-bold tracking-tight text-slate-100 flex items-center gap-2">
                                <span className="text-blue-400 font-normal">&gt;</span> {title}
                            </h2>
                        )}
                        {subtitle && <p className="text-slate-400 font-sans text-xs mt-1">{subtitle}</p>}
                    </div>
                )}
                <div className="flex-1 flex flex-col">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Card;

