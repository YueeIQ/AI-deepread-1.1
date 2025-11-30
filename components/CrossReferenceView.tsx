
import React from 'react';
import { CrossReference } from '../types';
import { GitCompare, ThumbsUp, ThumbsDown, BookOpen, Quote } from 'lucide-react';

interface CrossReferenceViewProps {
  references: CrossReference[];
}

const CrossReferenceView: React.FC<CrossReferenceViewProps> = ({ references }) => {
  return (
    <div className="space-y-12 pb-24 animate-fade-in">
      <div className="mb-10 border-b border-paper-200 pb-8">
          <div className="flex items-center space-x-4 mb-3">
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-paper-100">
                <GitCompare className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-3xl font-serif font-bold text-ink-900 tracking-tight">思想光谱 & 跨书索引</h3>
          </div>
          <p className="text-ink-500 ml-1 text-lg max-w-2xl leading-relaxed">分析本书核心观点在人类知识图谱中的位置，寻找共鸣与交锋。</p>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {references?.map((ref, index) => (
          <div key={index} className="bg-white rounded-3xl shadow-soft border border-paper-100 p-10 relative overflow-hidden group hover:shadow-card-hover transition-all duration-500">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-paper-50 to-paper-100 rounded-bl-full -mr-16 -mt-16 transition-transform group-hover:scale-110 duration-700 opacity-50"></div>

            <div className="relative z-10">
                <div className="flex items-start mb-10">
                <div className="flex-shrink-0 w-14 h-14 bg-ink-900 text-white rounded-2xl flex items-center justify-center font-serif font-bold text-2xl mr-8 shadow-xl">
                    {index + 1}
                </div>
                <div>
                    <h4 className="text-xs font-bold text-accent-600 uppercase tracking-widest mb-3">Core Idea Analysis</h4>
                    <p className="text-2xl md:text-3xl font-serif font-bold text-ink-900 leading-tight">
                        {ref.mainIdea}
                    </p>
                </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Similar Perspectives */}
                <div className="flex flex-col h-full bg-emerald-50/40 rounded-3xl p-8 border border-emerald-100/50 hover:bg-emerald-50 transition-colors duration-300">
                    <h5 className="flex items-center text-xs font-bold text-emerald-700 mb-8 uppercase tracking-widest border-b border-emerald-200 pb-4">
                    <ThumbsUp className="w-4 h-4 mr-2" />
                    相似共鸣
                    </h5>
                    {ref.similarBooks && ref.similarBooks.length > 0 ? (
                    <div className="space-y-8 flex-1">
                        {ref.similarBooks.map((book, i) => (
                        <div key={i} className="group/item">
                            <div className="font-bold text-emerald-900 flex items-center text-lg font-serif mb-3">
                            <BookOpen className="w-5 h-5 mr-3 text-emerald-500" />
                            《{book.bookTitle}》
                            </div>
                            <p className="text-ink-600 leading-relaxed text-sm text-justify pl-8 border-l-2 border-emerald-200 group-hover/item:border-emerald-400 transition-colors">
                            {book.explanation}
                            </p>
                        </div>
                        ))}
                    </div>
                    ) : <span className="text-sm text-ink-400 italic">暂无收录强相关的相似著作。</span>}
                </div>

                {/* Opposing Perspectives */}
                <div className="flex flex-col h-full bg-rose-50/40 rounded-3xl p-8 border border-rose-100/50 hover:bg-rose-50 transition-colors duration-300">
                    <h5 className="flex items-center text-xs font-bold text-rose-700 mb-8 uppercase tracking-widest border-b border-rose-200 pb-4">
                    <ThumbsDown className="w-4 h-4 mr-2" />
                    对立交锋
                    </h5>
                    {ref.opposingBooks && ref.opposingBooks.length > 0 ? (
                    <div className="space-y-8 flex-1">
                        {ref.opposingBooks.map((book, i) => (
                        <div key={i} className="group/item">
                            <div className="font-bold text-rose-900 flex items-center text-lg font-serif mb-3">
                            <BookOpen className="w-5 h-5 mr-3 text-rose-500" />
                            《{book.bookTitle}》
                            </div>
                            <p className="text-ink-600 leading-relaxed text-sm text-justify pl-8 border-l-2 border-rose-200 group-hover/item:border-rose-400 transition-colors">
                            {book.explanation}
                            </p>
                        </div>
                        ))}
                    </div>
                    ) : <span className="text-sm text-ink-400 italic">暂无收录明显的对立著作。</span>}
                </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CrossReferenceView;
