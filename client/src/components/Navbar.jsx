import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogIn, LayoutDashboard, Briefcase } from 'lucide-react';

export default function Navbar({ activeSection, setActiveSection, currentView, setCurrentView }) {
  useTheme();
  const { isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'hero', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'skills', label: 'Skills' },
    { id: 'experience', label: 'Experience' },
    { id: 'projects', label: 'Projects' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id) => {
    setCurrentView('portfolio');
    setActiveSection(id);
    setIsOpen(false);
    
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Brand Name */}
          <div 
            className="flex items-center cursor-pointer font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent select-none"
            onClick={() => handleNavClick('hero')}
          >
            Pradeep.Dev
            {isAuthenticated && (
              <span className="ml-2 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-indigo-500 text-white rounded-full">
                Admin
              </span>
            )}
          </div>

          {/* Desktop Nav Items */}
          <div className="hidden md:flex items-center space-x-1">
            {currentView === 'portfolio' && navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === item.id
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
                }`}
              >
                {item.label}
              </button>
            ))}

            {currentView !== 'portfolio' && (
              <button
                onClick={() => {
                  setCurrentView('portfolio');
                  setTimeout(() => handleNavClick('hero'), 100);
                }}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30"
              >
                Portfolio
              </button>
            )}

            <button
              onClick={() => setCurrentView('blog')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === 'blog'
                  ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/30'
              }`}
            >
              Blog
            </button>

            {/* Vertical Separator */}
            <span className="w-px h-5 bg-slate-200 dark:bg-slate-800 mx-2" />

            {/* Admin Dashboard / Login */}
            {isAuthenticated ? (
              <button
                onClick={() => setCurrentView('admin')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  currentView === 'admin'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20'
                }`}
              >
                <LayoutDashboard size={16} />
                <span>Dashboard</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('login')}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Admin Login"
              >
                <LogIn size={18} />
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center space-x-2">
            {isAuthenticated ? (
              <button
                onClick={() => setCurrentView('admin')}
                className="p-2 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
              >
                <LayoutDashboard size={18} />
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('login')}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300"
              >
                <LogIn size={18} />
              </button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden glass-panel mx-4 my-2 border shadow-xl animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {currentView === 'portfolio' && navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`block w-full text-left px-3 py-2.5 rounded-lg text-base font-medium transition-all ${
                  activeSection === item.id
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                }`}
              >
                {item.label}
              </button>
            ))}

            {currentView !== 'portfolio' && (
              <button
                onClick={() => {
                  setCurrentView('portfolio');
                  setIsOpen(false);
                }}
                className="block w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
              >
                Portfolio
              </button>
            )}

            <button
              onClick={() => {
                setCurrentView('blog');
                setIsOpen(false);
              }}
              className="block w-full text-left px-3 py-2.5 rounded-lg text-base font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
            >
              Blog
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
