
import React from 'react';
import { ChapterAnalysis } from '../types';
import { Lightbulb, CheckCircle2, Bookmark, Info, BookOpenCheck, Quote } from 'lucide-react';

interface SummaryViewProps {
  chapters: ChapterAnalysis[];
  introduction: string;
  onMarkAsRead: () => void;
  isRead: boolean;
}

const SummaryView: React.FC<SummaryViewProps> = ({ chapters, introduction, onMarkAsRead, isRead }) => {
  return (
    <div className="space-y-16 pb-24 animate-fade-in">
      
      {/* Introduction Section */}
      <div className="bg-white p-10 rounded-3xl shadow-card border border-paper-100/50 relative overflow-hidden group hover:shadow-card-hover transition-all duration-500">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600"></div>
          
          <div className="flex items-start space-x-6">
             <div className="p-4 bg-accent-50 text-accent-600 rounded-2xl flex-shrink-0 hidden md:block shadow-sm">
                <Info className="w-8 h-8" />
             </div>
             <div className="space-y-6 flex-1">
                <h3 className="text-2xl font-serif font-bold text-ink-900 tracking-tight">全书导读</h3>
                <div className="prose prose-lg prose-stone max-w-none">
                    <p className="text-ink-600 leading-relaxed text-justify font-serif-sc">
                        {introduction}
                    </p>
                </div>
             </div>
          </div>
      </div>

      <div className="flex items-center justify-between mb-8 mt-16 px-2">
        <h3 className="text-2xl font-serif font-bold text-ink-900 flex items-center">
          <Bookmark className="w-6 h-6 text-accent-600 mr-3 fill-accent-100" />
          全书章节精读
        </h3>
        
        <button
          onClick={onMarkAsRead}
          disabled={isRead}
          className={`flex items-center px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 shadow-sm hover:shadow-md ${
            isRead
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 cursor-default'
              : 'bg-white text-ink-900 hover:text-accent-700 border border-paper-200 hover:border-accent-200'
          }`}
        >
          {isRead ? (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              已归档到书架
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 mr-2" />
              标记为已读
            </>
          )}
        </button>
      </div>
      
      <div className="space-y-10">
        {chapters?.map((chapter, index) => (
            <div key={index} className="bg-white rounded-3xl shadow-soft border border-paper-100 overflow-hidden hover:shadow-card-hover transition-all duration-500 group">
            
            <div className="px-10 pt-10 pb-2 flex items-start justify-between">
                <div>
                    <div className="flex items-center space-x-3 mb-3">
                        <span className="px-3 py-1 bg-ink-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-md">Chapter {index + 1}</span>
                    </div>
                    <h4 className="font-serif font-bold text-2xl text-ink-900 leading-tight group-hover:text-accent-700 transition-colors duration-300">{chapter.chapterTitle}</h4>
                </div>
            </div>
            
            <div className="px-10 py-8 space-y-8">
                {/* Summary */}
                <div className="prose prose-lg prose-stone max-w-none">
                    <p className="text-ink-600 leading-8 text-lg text-justify font-serif-sc border-l-2 border-paper-200 pl-6">
                        {chapter.summary}
                    </p>
                </div>

                {/* Key Quotes - New Section */}
                {chapter.keyQuotes && chapter.keyQuotes.length > 0 && (
                  <div className="bg-paper-50 rounded-2xl p-8 border border-paper-100 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                          <Quote className="w-24 h-24 text-ink-900" />
                      </div>
                      <h5 className="text-xs font-bold text-ink-500 mb-6 uppercase tracking-widest flex items-center relative z-10">
                          <Quote className="w-4 h-4 mr-2 text-ink-400" />
                          核心原文摘录 (Key Quotes)
                      </h5>
                      <div className="space-y-6 relative z-10">
                          {chapter.keyQuotes.map((quote, i) => (
                              <figure key={i} className="relative pl-4 border-l-2 border-accent-300">
                                  <blockquote className="text-ink-700 font-serif italic text-base leading-relaxed">
                                      “{quote}”
                                  </blockquote>
                              </figure>
                          ))}
                      </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
                {/* Core Points */}
                <div className="bg-white p-8 rounded-2xl border border-paper-200 shadow-sm">
                    <h5 className="text-xs font-bold text-ink-400 mb-6 uppercase tracking-widest flex items-center">
                    <span className="w-2 h-2 bg-ink-400 rounded-full mr-2"></span>
                    核心论点
                    </h5>
                    <ul className="space-y-4">
                    {chapter.corePoints?.map((point, i) => (
                        <li key={i} className="text-ink-700 flex items-start leading-relaxed text-base">
                        <span className="mr-3 mt-2 w-1.5 h-1.5 bg-ink-300 rounded-full flex-shrink-0"></span>
                        <span>{point}</span>
                        </li>
                    ))}
                    </ul>
                </div>

                {/* Novel Insights */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-8 rounded-2xl border border-orange-100/50 relative overflow-hidden group/insight">
                    <div className="absolute top-4 right-4 p-2 opacity-10 group-hover/insight:opacity-20 transition-opacity">
                        <Lightbulb className="w-16 h-16 text-amber-500" />
                    </div>
                    <h5 className="flex items-center text-xs font-bold text-amber-700 mb-6 uppercase tracking-widest relative z-10">
                    <Lightbulb className="w-4 h-4 mr-2 text-amber-500 fill-amber-100" />
                    新颖洞察
                    </h5>
                    <ul className="space-y-4 relative z-10">
                    {chapter.novelInsights?.map((insight, i) => (
                        <li key={i} className="text-ink-800 flex items-start leading-relaxed text-base">
                         <span className="mr-3 mt-0.5 text-amber-600 font-serif font-bold italic text-lg">{i+1}.</span>
                        <span>{insight}</span>
                        </li>
                    ))}
                    </ul>
                </div>
                </div>
            </div>
            </div>
        ))}
      </div>
      
      {!isRead && (
         <div className="flex justify-center pt-16 pb-8">
            <button
              onClick={onMarkAsRead}
              className="px-12 py-5 bg-gradient-to-r from-ink-900 to-ink-800 text-white rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 font-bold text-lg flex items-center group"
            >
              <BookOpenCheck className="w-6 h-6 mr-3 group-hover:text-accent-200 transition-colors" />
              标记为已读完本书
            </button>
         </div>
      )}
    </div>
  );
};

export default SummaryView;
