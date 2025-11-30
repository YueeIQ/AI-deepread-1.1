
import React from 'react';
import { ReadBookLog, ReadingStats } from '../types';
import { Book, Calendar, Award, TrendingUp, ArrowUpRight } from 'lucide-react';

interface HistoryViewProps {
  logs: ReadBookLog[];
  stats: ReadingStats;
  onSelectBook?: (log: ReadBookLog) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ logs, stats, onSelectBook }) => {
  
  // Consistent color generation
  const stringToColor = (str: string) => {
    if (!str || typeof str !== 'string') return 'hsl(0, 0%, 92%)';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 25%, 92%)`; // Very light, pastel
  };

  const stringToAccent = (str: string) => {
     if (!str || typeof str !== 'string') return 'hsl(0, 60%, 40%)';
     let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 60%, 40%)`; // Darker accent
  }

  const StatCard = ({ icon, value, label, colorClass, textClass }: any) => (
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-paper-100 flex flex-col items-center justify-center text-center hover:shadow-card-hover transition-all duration-300 group">
          <div className={`p-4 rounded-2xl mb-4 transition-transform group-hover:scale-110 duration-300 ${colorClass}`}>
            {icon}
          </div>
          <span className="text-4xl font-serif font-bold text-ink-900 mb-1">{value}</span>
          <span className="text-xs text-ink-500 font-bold uppercase tracking-widest">{label}</span>
      </div>
  )

  const safeLogs = Array.isArray(logs) ? logs : [];

  return (
    <div className="space-y-12 pb-20 animate-fade-in">
      {/* Statistics Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <StatCard 
            icon={<Book className="w-6 h-6 text-blue-600" />}
            value={stats.total}
            label="累计阅读"
            colorClass="bg-blue-50"
        />
        <StatCard 
            icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
            value={stats.thisWeek}
            label="本周阅读"
            colorClass="bg-emerald-50"
        />
        <StatCard 
            icon={<Calendar className="w-6 h-6 text-purple-600" />}
            value={stats.thisMonth}
            label="本月阅读"
            colorClass="bg-purple-50"
        />
        <StatCard 
            icon={<Award className="w-6 h-6 text-amber-600" />}
            value={stats.thisYear}
            label="今年阅读"
            colorClass="bg-amber-50"
        />
      </div>

      {/* History Grid */}
      <div>
        <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif font-bold text-ink-900 tracking-tight">
            我的书架
            </h3>
            <span className="text-sm font-bold text-ink-500 bg-white border border-paper-200 px-4 py-1.5 rounded-full shadow-sm">{safeLogs.length} 本书</span>
        </div>
        
        {safeLogs.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-paper-200 border-dashed">
            <div className="bg-paper-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Book className="w-8 h-8 text-paper-300" />
            </div>
            <p className="text-ink-400 text-lg font-medium">您的书架是空的，开始阅读第一本书吧。</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {safeLogs.map((log) => {
               const bgColor = stringToColor(log.title);
               const accentColor = stringToAccent(log.title);
               
               return (
                <div 
                    key={log.id} 
                    onClick={() => onSelectBook && onSelectBook(log)}
                    className="bg-white rounded-2xl shadow-card border border-paper-100 overflow-hidden hover:shadow-card-hover hover:-translate-y-2 transition-all duration-500 group cursor-pointer flex flex-col h-full relative"
                >
                  <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-white rounded-full p-2.5 shadow-lg text-ink-900 hover:text-accent-600 transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                      </div>
                  </div>

                  {/* Book Cover Simulation */}
                  <div 
                    className="h-56 w-full flex items-center justify-center p-8 relative overflow-hidden transition-colors duration-500"
                    style={{ backgroundColor: bgColor }}
                  >
                     {/* Pseudo-cover */}
                     <div className="w-2/3 h-full bg-white shadow-[5px_0_15px_rgba(0,0,0,0.1)] rounded-r-lg border-l-4 border-l-black/5 flex flex-col items-center justify-center p-5 text-center relative transform transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-2">
                         {/* Spine texture */}
                         <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-r from-black/10 to-transparent"></div>
                         
                         <h4 className="font-serif font-bold text-ink-900 text-base line-clamp-3 leading-snug">
                            {log.title}
                         </h4>
                         <div className="w-8 h-1 mt-4 mb-2 opacity-50 rounded-full" style={{ backgroundColor: accentColor }}></div>
                         <p className="text-[10px] text-ink-400 uppercase tracking-widest mt-auto mb-1">{log.author}</p>
                     </div>
                  </div>

                  <div className="p-6 flex flex-col flex-1">
                    <h4 className="font-bold text-ink-900 text-lg line-clamp-1 mb-1 group-hover:text-accent-700 transition-colors font-serif tracking-tight">
                      {log.title}
                    </h4>
                    <p className="text-ink-500 text-sm mb-6 line-clamp-1 font-medium">{log.author}</p>
                    
                    <div className="mt-auto pt-4 border-t border-paper-100 flex justify-between items-center text-xs text-ink-400 font-semibold uppercase tracking-wider">
                      <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                          已读完
                      </span>
                      <span>{new Date(log.completedAt).toLocaleDateString('zh-CN')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryView;
