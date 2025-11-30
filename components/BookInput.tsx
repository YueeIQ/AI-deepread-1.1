import React, { useState } from 'react';
import { InputMode } from '../types';
import { Search, Upload, BookOpen, Loader2, ArrowRight } from 'lucide-react';

interface BookInputProps {
  onAnalyze: (mode: InputMode, value: string | File) => void;
  isLoading: boolean;
  compact?: boolean;
}

const BookInput: React.FC<BookInputProps> = ({ onAnalyze, isLoading, compact = false }) => {
  const [mode, setMode] = useState<InputMode>(InputMode.SEARCH);
  const [searchText, setSearchText] = useState('');
  const [file, setFile] = useState<File | null>(null);

  // Loading text animation
  const loadingMessages = [
    "正在阅读全书...",
    "正在构建章节逻辑...",
    "正在提炼核心观点...",
    "正在分析跨书关联...",
    "即将完成..."
  ];
  const [loadingMsgIndex, setLoadingMsgIndex] = useState(0);

  React.useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      setLoadingMsgIndex(0);
      interval = setInterval(() => {
        setLoadingMsgIndex(prev => {
           if (prev < loadingMessages.length - 1) return prev + 1;
           return prev; // Stop at last message
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === InputMode.SEARCH && searchText.trim()) {
      onAnalyze(InputMode.SEARCH, searchText);
    } else if (mode === InputMode.PDF && file) {
      onAnalyze(InputMode.PDF, file);
    }
  };

  return (
    <div className={`w-full mx-auto transition-all duration-500 ease-out ${compact ? '' : 'bg-white p-10 rounded-3xl shadow-soft border border-paper-100'}`}>
      
      {!compact && (
        <div className="flex flex-col items-center justify-center mb-10">
            <div className="p-5 bg-gradient-to-br from-paper-50 to-paper-100 rounded-2xl mb-5 shadow-inner border border-white">
                <BookOpen className="w-10 h-10 text-ink-800" />
            </div>
            <h2 className="text-3xl font-serif font-bold text-ink-900 tracking-tight">开启深度阅读之旅</h2>
            <p className="text-ink-500 mt-2 font-medium">输入书名或上传 PDF，AI 为您精读全书</p>
        </div>
      )}

      {/* Toggle */}
      <div className="flex justify-center mb-8">
        <div className="bg-paper-100 p-1.5 rounded-2xl inline-flex shadow-inner border border-paper-200">
            <button
            onClick={() => setMode(InputMode.SEARCH)}
            className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                mode === InputMode.SEARCH
                ? 'bg-white text-ink-900 shadow-sm transform scale-100'
                : 'text-ink-500 hover:text-ink-700 hover:bg-paper-200/50'
            }`}
            >
            <Search className="w-4 h-4 mr-2" />
            书名搜索
            </button>
            <button
            onClick={() => setMode(InputMode.PDF)}
            className={`flex items-center px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                mode === InputMode.PDF
                ? 'bg-white text-ink-900 shadow-sm transform scale-100'
                : 'text-ink-500 hover:text-ink-700 hover:bg-paper-200/50'
            }`}
            >
            <Upload className="w-4 h-4 mr-2" />
            上传 PDF
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
        {mode === InputMode.SEARCH ? (
          <div className="relative group">
            <input
              id="book-search"
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="输入书籍标题，例如：思考快与慢..."
              className="w-full pl-6 pr-20 py-5 bg-paper-50 border border-paper-200 text-ink-900 rounded-2xl focus:ring-4 focus:ring-accent-100 focus:border-accent-500 outline-none transition-all placeholder:text-ink-400 font-medium text-lg shadow-inner group-hover:bg-white"
            />
            <div className="absolute right-3 top-3 bottom-3">
                 <button
                    type="submit"
                    disabled={isLoading || !searchText}
                    className="h-full aspect-square bg-gradient-to-br from-ink-900 to-ink-800 hover:to-accent-600 hover:from-accent-700 text-white rounded-xl transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform active:scale-95"
                 >
                     {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                 </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
             <div className="border-2 border-dashed border-paper-300 rounded-2xl p-10 flex flex-col items-center justify-center hover:bg-paper-50 hover:border-accent-400 transition-all duration-300 relative cursor-pointer group bg-paper-50/30">
              <input
                id="pdf-upload"
                type="file"
                accept="application/pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className={`p-5 rounded-full mb-4 transition-all duration-300 shadow-sm ${file ? 'bg-accent-100 text-accent-600 scale-110' : 'bg-white text-ink-400 border border-paper-200 group-hover:border-accent-300 group-hover:text-accent-500'}`}>
                <Upload className="w-8 h-8" />
              </div>
              <p className="text-lg text-ink-700 font-bold font-serif">
                {file ? file.name : "点击或拖拽 PDF 文件到此处"}
              </p>
              {!file && <p className="text-sm text-ink-400 mt-2">支持最大 20MB 的 PDF 文件</p>}
            </div>
            
            {file && (
                <button
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-gradient-to-r from-ink-900 to-ink-800 hover:from-accent-700 hover:to-accent-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 flex items-center justify-center text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    正在分析...
                  </>
                ) : (
                  '开始深度分析'
                )}
              </button>
            )}
          </div>
        )}
      </form>
      
      {isLoading && (
         <div className="mt-8 text-center animate-fade-in">
             <div className="w-full max-w-xs mx-auto h-1.5 bg-paper-200 rounded-full overflow-hidden mb-4">
                 <div className="h-full bg-accent-500 rounded-full animate-[progress_2s_ease-in-out_infinite] w-1/3"></div>
             </div>
            <p className="text-ink-800 font-serif font-bold text-xl transition-all duration-500">{loadingMessages[loadingMsgIndex]}</p>
         </div>
      )}
      
      {!isLoading && !compact && (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
            {["原子习惯", "三体", "苏菲的世界", "穷查理宝典", "人类简史"].map(book => (
                <button 
                    key={book} 
                    onClick={() => { setMode(InputMode.SEARCH); setSearchText(book); }}
                    className="px-4 py-1.5 bg-white hover:bg-paper-50 border border-paper-200 text-sm text-ink-600 hover:text-accent-700 rounded-full transition-colors shadow-sm hover:shadow-md hover:border-accent-200"
                >
                    {book}
                </button>
            ))}
        </div>
      )}
    </div>
  );
};

export default BookInput;