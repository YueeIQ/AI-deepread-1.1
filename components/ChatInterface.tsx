import React, { useRef, useEffect, useState } from 'react';
import { ChatMessage } from '../types';
import { Send, Bot, Loader2, Sparkles, User } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isSending: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isSending }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white text-ink-800">
      {/* Header */}
      <div className="p-6 border-b border-paper-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <h3 className="font-serif font-bold text-ink-900 flex items-center text-lg">
          <div className="bg-accent-100 p-1.5 rounded-lg mr-3">
             <Bot className="w-5 h-5 text-accent-700" />
          </div>
          阅读助手 AI
        </h3>
        <p className="text-xs text-ink-500 mt-1 pl-11">基于全书内容为您解答疑问、提供分析。</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-paper-50 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-10 text-ink-400 text-sm bg-white rounded-xl border border-paper-100 p-6 mx-4 shadow-sm">
             <Sparkles className="w-8 h-8 mx-auto mb-3 text-accent-400" />
            <p className="font-medium text-ink-600">我是您的专属阅读助手。</p>
            <p className="mt-2">您可以试着问：“作者的核心论点是什么？” 或 “详细解释一下第三章。”</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-ink-800 text-white ml-3' 
                    : 'bg-white text-accent-600 border border-paper-200 mr-3'
                }`}>
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                className={`rounded-2xl px-5 py-4 text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                    ? 'bg-ink-800 text-white rounded-tr-none'
                    : 'bg-white text-ink-800 border border-paper-200 rounded-tl-none'
                }`}
                >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className={`text-[10px] mt-2 opacity-60 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
                </div>
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
             <div className="w-8 h-8 mr-3"></div>
            <div className="bg-white border border-paper-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center space-x-2">
              <Loader2 className="w-4 h-4 animate-spin text-accent-500" />
              <span className="text-xs text-ink-500 font-medium">正在思考...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-5 bg-white border-t border-paper-200">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入您的问题..."
            className="w-full pl-5 pr-14 py-4 rounded-xl border border-paper-300 bg-paper-50 focus:bg-white focus:border-accent-500 focus:ring-4 focus:ring-accent-50 outline-none transition-all text-sm font-medium shadow-inner placeholder:text-ink-400"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-ink-900 text-white rounded-lg hover:bg-accent-600 disabled:opacity-50 disabled:hover:bg-ink-900 transition-colors flex items-center justify-center shadow-sm"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;