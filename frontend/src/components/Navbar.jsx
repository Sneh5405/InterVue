import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from './ui/Button';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();

    // Hide navbar during assessments to prevent layout cut-off and distraction
    if (location.pathname.startsWith('/oa/exam/')) {
        return null;
    }

    const isAuthPage = ['/login', '/signup', '/forgot-password'].includes(location.pathname);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <Link to="/" className="flex items-center gap-1.5 font-mono group">
                        <span className="text-blue-500 font-bold">&lt;/&gt;</span>
                        <span className="text-base font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                            inter<span className="text-indigo-400">_vue</span>
                        </span>
                    </Link>

                    <div className="hidden md:flex items-center gap-3">
                        {user ? (
                            <>
                                <Link to="/interviews">
                                    <Button variant="ghost" className="text-slate-400 hover:text-slate-100 py-1.5 px-3">
                                        ~/interviews
                                    </Button>
                                </Link>
                                {user.role === 'INTERVIEWEE' && (
                                    <Link to="/my-assessments">
                                        <Button variant="ghost" className="text-slate-400 hover:text-slate-100 py-1.5 px-3">
                                            ~/my-exams
                                        </Button>
                                    </Link>
                                )}
                                {(user.role === 'HR' || user.role === 'ADMIN' || user.role === 'INTERVIEWER') && (
                                    <>
                                        <Link to="/assessments">
                                            <Button variant="ghost" className="text-slate-400 hover:text-slate-100 py-1.5 px-3">
                                                ~/assessments
                                            </Button>
                                        </Link>
                                        <Link to="/questions">
                                            <Button variant="ghost" className="text-slate-400 hover:text-slate-100 py-1.5 px-3">
                                                ~/questions
                                            </Button>
                                        </Link>
                                    </>
                                )}
                                {user.email === 'admin@gmail.com' && (
                                    <Link to="/admin">
                                        <Button variant="ghost" className="text-slate-400 hover:text-slate-100 py-1.5 px-3">
                                            ~/admin
                                        </Button>
                                    </Link>
                                )}
                                <span className="text-slate-500 font-mono text-xs border-l border-slate-800 pl-4 py-1 mr-2">
                                    user: <span className="text-indigo-400 font-semibold">{user.name}</span>
                                </span>
                                <Button variant="secondary" onClick={logout} className="py-1 px-3 text-xs">
                                    Logout
                                </Button>
                            </>
                        ) : (
                            !isAuthPage && (
                                <>
                                    <Link to="/login">
                                        <Button variant="ghost" className="text-slate-400 hover:text-slate-100">
                                            Sign_In
                                        </Button>
                                    </Link>
                                    <Link to="/signup">
                                        <Button variant="primary" className="shadow-none">
                                            Sign_Up
                                        </Button>
                                    </Link>
                                </>
                            )
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

