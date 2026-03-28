import React, { useState, useEffect } from 'react';
import { getAnalyticsData } from '../services/analyticsService';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalyticsData();
        setAnalytics(data);
      } catch (err) {
        setError('Failed to load analytics data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const getStatusColor = (status) => {
    const s = status.toLowerCase();
    if (s === 'todo') return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
    if (s === 'in progress') return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
    if (s === 'completed' || s === 'done') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    return 'bg-violet-500/20 text-violet-300 border-violet-500/30';
  };

  const getPriorityColor = (priority) => {
    const p = priority.toUpperCase();
    if (p === 'HIGH') return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    if (p === 'MEDIUM') return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    if (p === 'LOW') return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
    return 'bg-slate-500/20 text-slate-300 border-slate-500/30';
  };

  const renderBreakdown = (data, type) => {
    if (!data || typeof data !== 'object') return String(data);

    return (
      <div className="flex flex-wrap gap-2 justify-center">
        {Object.entries(data).map(([key, value]) => {
          let colorClass = 'bg-white/10 text-white/80 border-white/20';
          if (type === 'statusBreakdown') colorClass = getStatusColor(key);
          if (type === 'priorityBreakdown') colorClass = getPriorityColor(key);

          return (
            <div
              key={key}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-2 ${colorClass}`}
            >
              <span className="capitalize">{key}</span>
              <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs">{value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <section className="py-24 bg-[#0F172A] text-white min-h-[400px] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10 pointer-events-none"></div>
        <div className="max-w-6xl mx-auto px-5 relative z-10">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-4"></div>
            <p className="text-blue-200/70 font-medium tracking-wide">Synthesizing Analytics...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-24 bg-[#0F172A] text-white flex items-center justify-center">
        <div className="max-w-6xl mx-auto px-5 text-center">
          <div className="bg-rose-500/10 border border-rose-500/20 p-8 rounded-3xl backdrop-blur-xl max-w-md mx-auto">
            <div className="text-rose-400 text-5xl mb-4">⚠️</div>
            <h3 className="text-xl font-bold mb-2">Analysis Failed</h3>
            <p className="text-rose-200/60 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-xl transition-all"
            >
              Retry Analysis
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-24 bg-[#0F172A] text-white relative overflow-hidden">
      {/* Background blobs for premium look */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-5 relative z-10">
        <div className="text-center mb-20 text-balance">
          <h2 className="text-5xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Insightful Analytics
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Real-time performance metrics and deep dive into your productivity patterns across all projects and tasks.
          </p>
        </div>

        {analytics ? (
          <div className="space-y-24">
            {/* Overview Grid */}
            {analytics.overview && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(analytics.overview).map(([key, value]) => (
                  <div 
                    key={key} 
                    className="group bg-white/5 border border-white/10 p-8 rounded-[2rem] hover:bg-white/10 transition-all duration-500 hover:border-white/20"
                  >
                    <p className="text-gray-400 text-sm font-semibold uppercase tracking-widest mb-6">
                      {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                    <div className="flex items-end justify-between">
                      <p className="text-4xl font-bold tracking-tighter">
                        {typeof value === 'number' ? 
                          (key.includes('Rate') ? `${(value * 100).toFixed(0)}%` : value.toLocaleString()) : 
                          String(value)}
                      </p>
                      <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                        📊
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Structured Insights (Projects & Tasks) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Projects Breakdown */}
              {analytics.projects && (
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 text-6xl opacity-5 pointer-events-none">🏢</div>
                  <h3 className="text-2xl font-bold mb-10 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-blue-500 rounded-full"></span>
                    Project Distribution
                  </h3>
                  <div className="space-y-10">
                    {Object.entries(analytics.projects).map(([key, value]) => (
                      <div key={key} className="relative z-10">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4 border-l border-white/10 pl-3">
                          {key.replace(/([A-Z])/g, ' $1').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                          {renderBreakdown(value, key)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Breakdown */}
              {analytics.tasks && (
                <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-10 backdrop-blur-3xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-8 text-6xl opacity-5 pointer-events-none">✅</div>
                  <h3 className="text-2xl font-bold mb-10 flex items-center gap-3">
                    <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
                    Task Metrics
                  </h3>
                  <div className="space-y-10">
                    {Object.entries(analytics.tasks).map(([key, value]) => (
                      <div key={key} className="relative z-10">
                        <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4 border-l border-white/10 pl-3">
                          {key.replace(/([A-Z])/g, ' $1').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <div className="bg-black/20 p-6 rounded-2xl border border-white/5">
                          {renderBreakdown(value, key)}
                        </div>
                      </div>
                    ))}

                    {/* Metrics Sub-section inside tasks for better space usage */}
                    {analytics.metrics && (
                      <div className="pt-6 border-t border-white/10 mt-10">
                        <div className="grid grid-cols-2 gap-4">
                          {Object.entries(analytics.metrics).map(([key, value]) => (
                            <div key={key} className="bg-white/5 p-4 rounded-xl border border-white/5">
                              <p className="text-[10px] text-gray-500 uppercase tracking-tighter mb-1 font-bold">
                                {key.replace(/([A-Z])/g, ' $1')}
                              </p>
                              <p className="text-xl font-bold text-blue-400">
                                {typeof value === 'number' ? value.toFixed(1) : value}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Recent Activity Timeline */}
            {analytics.recentActivity && (
              <div className="relative">
                <div className="text-center mb-12">
                  <h3 className="text-3xl font-bold mb-2">Live Stream</h3>
                  <p className="text-gray-500">Chronological history of major productivity events</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {analytics.recentActivity.slice(0, 6).map((activity, index) => (
                    <div 
                      key={index} 
                      className="group bg-white/5 border border-white/10 p-6 rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/10 border-l-4 border-l-blue-500"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          activity.changeType === 'create' ? 'bg-emerald-500/10 text-emerald-400' :
                          activity.changeType === 'update' ? 'bg-blue-500/10 text-blue-400' :
                          'bg-amber-500/10 text-amber-400'
                        }`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {activity.changeType}
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">
                          {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm font-semibold mb-3 line-clamp-2 leading-relaxed">
                        {activity.changeSummary}
                      </p>
                      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-white/5">
                        <div className="w-6 h-6 rounded-md bg-blue-500/20 flex items-center justify-center text-[10px]">
                          📁
                        </div>
                        <span className="text-[11px] text-gray-400 truncate max-w-[150px]">
                          {activity.projectTitle}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-[3rem] border border-dashed border-white/10">
            <div className="text-5xl mb-6 opacity-30">📉</div>
            <p className="text-gray-400 text-xl">No analytics data available for the selected period.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Analytics;

