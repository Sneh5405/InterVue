import React from 'react';

const Input = ({ label, error, className = '', ...props }) => {
    return (
        <div className={`flex flex-col gap-1.5 ${className}`}>
            {label && (
                <label className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase ml-0.5">
                    {label}
                </label>
            )}
            <input
                className={`bg-slate-900/80 border ${error ? 'border-rose-500 focus:ring-rose-500/30' : 'border-slate-700/80 focus:border-blue-500 focus:ring-blue-500/20'} 
              rounded px-4 py-2 text-sm text-slate-100 placeholder-slate-600 font-mono outline-none focus:ring-2 transition-all duration-150 shadow-inner`}
                {...props}
            />
            {error && (
                <span className="text-[10px] font-mono text-rose-400 ml-0.5 animate-pulse">✖ {error}</span>
            )}
        </div>
    );
};

export default Input;

