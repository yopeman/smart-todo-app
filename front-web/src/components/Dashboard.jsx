import React from 'react';
import Analytics from './Analytics';

const Dashboard = ({ logout }) => {
  return (
    <div className="min-h-screen bg-[#0F172A]">
      <nav className="bg-[#0F172A]/80 border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-xl text-white">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="#3B82F6" />
              <path d="M9 16l4 4 10-10" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="tracking-tight">Smart Dashboard</span>
          </div>
          <button 
            onClick={logout}
            className="px-5 py-2 bg-rose-600/10 text-rose-500 border border-rose-600/20 rounded-xl hover:bg-rose-600/20 transition-all font-semibold"
          >
            Logout
          </button>
        </div>
      </nav>

      <main className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400">Here's what's happening across your projects today.</p>
          </div>
          
          <Analytics />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
