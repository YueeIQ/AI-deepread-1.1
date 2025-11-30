
import React, { useState, useEffect } from 'react';
import BookInput from './components/BookInput';
import SummaryView from './components/SummaryView';
import CrossReferenceView from './components/CrossReferenceView';
import ChatInterface from './components/ChatInterface';
import HistoryView from './components/HistoryView';
import BookHero from './components/BookHero';
import { analyzeBook, sendChatMessage } from './services/geminiService';
import { AppStatus, BookAnalysisResult, ChatMessage, InputMode, ReadBookLog, ReadingStats } from './types';
import { BookOpenText, Library, BookMarked, History, PlusCircle, MessageSquare, X } from 'lucide-react';

const STORAGE_KEY = 'deepread_history_v2';

const App: React.FC = () => {
  const [status, setStatus] = useState<AppStatus>(AppStatus.IDLE);
  const [bookData, setBookData] = useState<BookAnalysisResult | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isChatSending, setIsChatSending] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Tabs: 'history' is first. 'summary' and 'cross-ref' require a loaded book.
  const [activeTab, setActiveTab] = useState<'history' | 'summary' | 'cross-ref'>('history');
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // History State
  const [readLogs, setReadLogs] = useState<ReadBookLog[]>([]);
  const [stats, setStats] = useState<ReadingStats>({ total: 0, thisWeek: 0, thisMonth: 0, thisYear: 0 });
  const [currentBookIsRead, setCurrentBookIsRead] = useState(false);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
            setReadLogs(parsed);
            if (parsed.length === 0) setStatus(AppStatus.IDLE);
        } else {
            setReadLogs([]);
        }
      } catch (e) {
        console.error("Failed to load history", e);
        setReadLogs([]);
      }
    }
  }, []);

  // Calculate stats whenever logs change
  useEffect(() => {
    if (!Array.isArray(readLogs)) return;

    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisYear = now.getFullYear();
    const thisMonth = now.getMonth();

    const newStats: ReadingStats = {
      total: readLogs.length,
      thisWeek: 0,
      thisMonth: 0,
      thisYear: 0
    };

    readLogs.forEach(log => {
      if (!log || !log.completedAt) return;
      const logDate = new Date(log.completedAt);
      if (logDate >= oneWeekAgo) newStats.thisWeek++;
      if (logDate.getFullYear() === thisYear) {
        newStats.thisYear++;
        if (logDate.getMonth() === thisMonth) {
          newStats.thisMonth++;
        }
      }
    });
    setStats(newStats);
    
    // Check if current book is read
    if (bookData) {
      const isRead = readLogs.some(log => log.title === bookData.title);
      setCurrentBookIsRead(isRead);
    }

    // Save to local storage
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(readLogs));
    } catch (e) {
        console.error("Storage quota exceeded", e);
    }
  }, [readLogs, bookData]);


  const handleAnalyze = async (mode: InputMode, value: string | File) => {
    setStatus(AppStatus.ANALYZING);
    setErrorMsg(null);
    setCurrentBookIsRead(false); 
    setActiveTab('summary'); 

    try {
      const result = await analyzeBook(mode, value);
      loadBookIntoView(result);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "分析过程中发生错误，请重试。");
      setStatus(AppStatus.ERROR);
    }
  };

  const loadBookIntoView = (result: BookAnalysisResult, fromHistory = false) => {
      setBookData(result);
      setStatus(AppStatus.READY);
      setActiveTab('summary');
      setIsChatOpen(false); // Reset chat state
      
      const logs = Array.isArray(readLogs) ? readLogs : [];
      const alreadyRead = logs.some(log => log.title === result.title);
      setCurrentBookIsRead(alreadyRead);

      // Reset chat for new book session
      setMessages([{
        id: Date.now().toString(),
        role: 'model',
        text: fromHistory 
            ? `欢迎回来阅读《${result.title}》。您之前的分析记录已为您准备好。\n\n如果有任何新的疑问，请随时提问。`
            : `我已经通读了《${result.title}》。\n\n您可以浏览章节深度摘要和跨书对比分析。\n\n如果有任何疑问，或想进一步探讨书中的某个观点，请随时在这里向我提问。`,
        timestamp: Date.now()
      }]);
  }

  const handleRestoreFromHistory = (log: ReadBookLog) => {
      if (log.data) {
          loadBookIntoView(log.data, true);
      } else {
          alert("该记录数据不完整，请重新搜索分析。");
      }
  };

  const handleSendMessage = async (text: string) => {
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setIsChatSending(true);

    try {
      const responseText = await sendChatMessage(messages, text, bookData);
      
      const botMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsChatSending(false);
    }
  };

  const markAsRead = () => {
    if (!bookData) return;
    if (currentBookIsRead) return;

    const currentLogs = Array.isArray(readLogs) ? readLogs : [];
    const filteredLogs = currentLogs.filter(l => l.title !== bookData.title);

    const newLog: ReadBookLog = {
      id: Date.now().toString(),
      title: bookData.title,
      author: bookData.author || '未知',
      completedAt: Date.now(),
      data: bookData 
    };

    setReadLogs(prev => [newLog, ...filteredLogs]);
    setCurrentBookIsRead(true);
  };

  const handleNewAnalysis = () => {
      setBookData(null);
      setStatus(AppStatus.IDLE);
      setActiveTab('history'); 
      setMessages([]);
      setIsChatOpen(false);
  };

  const TabButton = ({ id, label, icon, subLabel }: { id: typeof activeTab, label: string, icon: React.ReactNode, subLabel?: string }) => {
     const isActive = activeTab === id;
     // Disable tabs if no book is loaded (except history)
     const isDisabled = (id === 'summary' || id === 'cross-ref') && !bookData && status !== AppStatus.ANALYZING;

     return (
        <button
            onClick={() => !isDisabled && setActiveTab(id)}
            disabled={isDisabled}
            className={`
                relative flex items-center justify-center space-x-3 px-8 py-5 transition-all duration-300 min-w-[180px]
                ${isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-paper-50'}
                ${isActive ? 'text-ink-900' : 'text-ink-500'}
            `}
        >
            <div className={`p-2 rounded-lg transition-colors duration-300 ${isActive ? 'bg-ink-900 text-white shadow-md' : 'bg-paper-100 text-ink-500'}`}>
                {icon}
            </div>
            <div className="flex flex-col items-start">
                <span className={`text-base font-bold font-serif-sc leading-none mb-1 transition-colors ${isActive ? 'text-ink-900' : 'text-ink-600'}`}>{label}</span>
                {subLabel && <span className={`text-[10px] uppercase tracking-wider font-semibold transition-colors ${isActive ? 'text-accent-600' : 'text-ink-400'}`}>{subLabel}</span>}
            </div>
            
            {/* Active Indicator */}
            {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-accent-600 rounded-t-full mx-8"></div>
            )}
        </button>
     )
  }

  return (
    <div className="h-screen flex flex-col bg-paper-50 text-ink-800 font-sans relative">
      
      {/* Top Navigation Bar with Glassmorphism */}
      <header className="bg-white/90 backdrop-blur-md border-b border-paper-200 px-8 h-24 flex items-center justify-between flex-shrink-0 z-30 sticky top-0 shadow-sm">
        <div className="flex items-center space-x-16">
            {/* Logo */}
            <div className="flex items-center space-x-4 select-none cursor-pointer group" onClick={handleNewAnalysis}>
                <div className="w-12 h-12 bg-gradient-to-br from-ink-800 to-ink-900 rounded-xl flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500">
                    <BookOpenText className="w-7 h-7 text-paper-50" />
                </div>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold font-serif text-ink-900 tracking-tight leading-none group-hover:text-accent-700 transition-colors">DeepRead</h1>
                    <span className="text-xs text-ink-500 font-medium tracking-[0.2em] uppercase mt-1">Professional AI</span>
                </div>
            </div>

            {/* Main Tabs */}
            <div className="hidden md:flex items-center h-24">
                <TabButton id="history" label="阅读书架" subLabel="My Library" icon={<History className="w-5 h-5" />} />
                <div className="w-px h-8 bg-paper-200 mx-2"></div>
                <TabButton id="summary" label="核心解析" subLabel="Deep Analysis" icon={<BookMarked className="w-5 h-5" />} />
                <div className="w-px h-8 bg-paper-200 mx-2"></div>
                <TabButton id="cross-ref" label="跨书分析" subLabel="Cross Reference" icon={<Library className="w-5 h-5" />} />
            </div>
        </div>
        
        <div className="flex items-center space-x-4">
            {bookData && (
                <button 
                    onClick={handleNewAnalysis}
                    className="flex items-center px-5 py-2.5 bg-white border border-paper-200 text-ink-600 hover:text-accent-700 hover:border-accent-200 rounded-full text-sm font-bold transition-all shadow-sm hover:shadow-md group"
                >
                    <PlusCircle className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                    阅读新书
                </button>
            )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Left/Center Panel: Content */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-paper-50 relative">
            
            {/* INPUT / EMPTY STATE (Shown in History Tab if empty or corrupted logs) */}
            {(status === AppStatus.IDLE && activeTab === 'history' && (!readLogs || readLogs.length === 0)) && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 animate-fade-in">
                    <div className="w-full max-w-3xl">
                         <BookInput onAnalyze={handleAnalyze} isLoading={false} />
                    </div>
                </div>
            )}

            {/* ANALYZING STATE */}
            {status === AppStatus.ANALYZING && (
                <div className="flex-1 flex items-center justify-center p-8">
                     <BookInput onAnalyze={handleAnalyze} isLoading={true} />
                </div>
            )}

             {/* ERROR STATE */}
             {status === AppStatus.ERROR && (
                 <div className="flex-1 flex items-center justify-center p-8">
                    <div className="bg-white border border-red-100 rounded-3xl p-10 max-w-lg text-center shadow-card">
                        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <X className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-ink-900 mb-3">抱歉，出现了一些问题</h3>
                        <p className="text-ink-500 mb-8 leading-relaxed">{errorMsg}</p>
                        <button onClick={() => setStatus(AppStatus.IDLE)} className="px-8 py-3 bg-ink-900 text-white rounded-xl hover:bg-accent-600 transition-colors shadow-lg">返回重试</button>
                    </div>
                 </div>
            )}

            {/* CONTENT VIEWS */}
            {(activeTab === 'summary' || activeTab === 'cross-ref') && status === AppStatus.READY && bookData && (
                 <div className="flex-1 overflow-y-auto custom-scrollbar scroll-smooth">
                     <div className="max-w-5xl mx-auto px-8 py-12">
                        {/* Book Header */}
                        <BookHero 
                            title={bookData.title}
                            author={bookData.author || "Unknown"}
                            isRead={currentBookIsRead}
                            coverImageUrl={bookData.coverImageUrl}
                        />

                        {activeTab === 'summary' && (
                             <SummaryView 
                                chapters={bookData.chapters} 
                                introduction={bookData.introduction}
                                onMarkAsRead={markAsRead}
                                isRead={currentBookIsRead}
                             />
                        )}

                        {activeTab === 'cross-ref' && (
                             <CrossReferenceView references={bookData.crossReferences} />
                        )}
                     </div>
                 </div>
            )}

            {/* HISTORY VIEW */}
            {activeTab === 'history' && Array.isArray(readLogs) && readLogs.length > 0 && (
                 <div className="flex-1 overflow-y-auto custom-scrollbar bg-paper-50">
                    <div className="max-w-7xl mx-auto px-8 py-12 w-full">
                        {/* Input Area in History Tab for easy access */}
                        <div className="mb-16 bg-gradient-to-br from-white to-paper-50 p-1 rounded-3xl shadow-soft">
                             <div className="bg-white rounded-[20px] p-8 border border-paper-100/50">
                                <h3 className="text-xl font-serif font-bold text-ink-900 mb-8 flex items-center">
                                    <div className="bg-accent-100 p-2 rounded-lg mr-3">
                                        <PlusCircle className="w-5 h-5 text-accent-600" />
                                    </div>
                                    开启新的阅读
                                </h3>
                                <BookInput onAnalyze={handleAnalyze} isLoading={false} compact />
                             </div>
                        </div>

                        <HistoryView 
                            logs={readLogs} 
                            stats={stats} 
                            onSelectBook={handleRestoreFromHistory}
                        />
                    </div>
                 </div>
            )}
        </div>

        {/* Floating Chat Button */}
        {(status === AppStatus.READY) && !isChatOpen && (
            <button
                onClick={() => setIsChatOpen(true)}
                className="absolute bottom-12 right-12 z-50 group flex items-center justify-center"
            >
                <div className="w-16 h-16 bg-gradient-to-tr from-ink-900 to-ink-800 text-white rounded-full shadow-glow hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center relative z-10">
                    <MessageSquare className="w-7 h-7" />
                </div>
                <div className="absolute inset-0 bg-accent-500 rounded-full opacity-0 group-hover:animate-ping z-0"></div>
                <span className="absolute right-full mr-6 px-4 py-2 bg-white text-ink-900 text-sm font-bold rounded-xl shadow-card opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0 whitespace-nowrap border border-paper-100">
                    打开阅读助手
                </span>
            </button>
        )}

        {/* Sliding Chat Drawer */}
        <div 
            className={`fixed inset-y-0 right-0 z-40 w-[450px] bg-white shadow-2xl transform transition-transform duration-500 cubic-bezier(0.16, 1, 0.3, 1) border-l border-paper-200 flex flex-col
                ${(status === AppStatus.READY && isChatOpen) ? 'translate-x-0' : 'translate-x-full'}
            `}
        >
             {/* Close button for drawer */}
             <button 
                onClick={() => setIsChatOpen(false)}
                className="absolute top-5 right-5 p-2 text-ink-400 hover:text-ink-900 hover:bg-paper-100 rounded-full transition-colors z-50"
             >
                 <X className="w-6 h-6" />
             </button>

             <ChatInterface 
               messages={messages} 
               onSendMessage={handleSendMessage} 
               isSending={isChatSending} 
             />
        </div>

      </main>
    </div>
  );
};

export default App;
