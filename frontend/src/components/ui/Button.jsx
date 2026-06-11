import React from 'react';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
    const baseStyles = "px-5 py-2 rounded font-mono text-sm font-semibold tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

    const variants = {
        primary: "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-slate-950 font-bold border border-blue-400/20 shadow-md shadow-blue-500/10 hover:shadow-blue-500/25",
        secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600",
        outline: "border border-blue-500 text-blue-400 hover:bg-blue-500/10 hover:border-blue-400 hover:text-blue-300 shadow-sm shadow-blue-500/5",
        ghost: "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default Button;

