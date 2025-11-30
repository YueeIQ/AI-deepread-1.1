
import React from 'react';

interface BookHeroProps {
  title: string;
  author: string;
  isRead: boolean;
  coverImageUrl?: string;
}

const BookHero: React.FC<BookHeroProps> = ({ title, author, isRead, coverImageUrl }) => {
  
  // Fallback generation logic
  const stringToColor = (str: string) => {
    if (!str || typeof str !== 'string') return 'hsl(0, 0%, 90%)';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 30%, 90%)`; 
  };

  const stringToAccent = (str: string) => {
     if (!str || typeof str !== 'string') return 'hsl(0, 0%, 40%)';
     let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 60%, 40%)`; 
  }

  const safeTitle = title || "Untitled";
  const bgColor = stringToColor(safeTitle);
  const accentColor = stringToAccent(safeTitle);

  return (
    <div className="flex flex-col md:flex-row gap-10 items-end mb-12 animate-fade-in">
        {/* Cover */}
        <div className="flex-shrink-0 mx-auto md:mx-0">
             <div className="w-48 h-64 md:w-56 md:h-80 shadow-2xl rounded-r-xl rounded-l-sm relative overflow-hidden group transform transition-transform hover:scale-[1.02] duration-500">
                
                {coverImageUrl ? (
                    <img 
                        src={coverImageUrl} 
                        alt={`Cover of ${title}`} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div 
                        className="w-full h-full relative flex flex-col p-6"
                        style={{ backgroundColor: bgColor }}
                    >
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-black/10 z-10"></div>
                        <div className="absolute left-1.5 top-0 bottom-0 w-0.5 bg-white/20 z-10"></div>
                        
                        <div className="mt-8 mb-auto">
                            <h1 className="font-serif font-bold text-ink-900 text-2xl leading-tight line-clamp-4">
                                {safeTitle}
                            </h1>
                            <div className="w-12 h-1 mt-4 opacity-60" style={{ backgroundColor: accentColor }}></div>
                        </div>

                        <div className="mt-auto">
                            <p className="text-sm font-medium text-ink-600 uppercase tracking-widest line-clamp-1">{author}</p>
                        </div>

                        {/* Texture overlay */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-black/5 to-transparent pointer-events-none"></div>
                    </div>
                )}
                
                {/* Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
             </div>
        </div>

        {/* Info */}
        <div className="flex-1 w-full text-center md:text-left">
             <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-paper-200/50 text-ink-500 text-xs font-bold uppercase tracking-widest mb-4 border border-paper-200">
                <span className={`w-2 h-2 rounded-full ${isRead ? 'bg-green-500' : 'bg-accent-500'}`}></span>
                <span>{isRead ? 'Archived' : 'Reading Now'}</span>
             </div>
             
             <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-ink-900 leading-tight mb-4 text-balance">
                {title || "Reading..."}
             </h1>
             
             <div className="flex flex-col md:flex-row items-center md:items-start text-lg text-ink-500 font-serif italic space-y-2 md:space-y-0 md:space-x-4">
                <span>By {author || "Unknown Author"}</span>
                <span className="hidden md:inline text-paper-300">•</span>
                <span>AI-Generated Deep Analysis</span>
             </div>
        </div>
    </div>
  );
};

export default BookHero;
