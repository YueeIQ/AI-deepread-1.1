
import React, { useState } from 'react';
import { Key, Save, AlertCircle } from 'lucide-react';

interface ApiKeyModalProps {
  onSave: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSave }) => {
  const [inputKey, setInputKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      onSave(inputKey.trim());
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-ink-900/60 backdrop-blur-sm px-4">
      <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl border border-paper-200 animate-slide-up">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-sm border border-amber-100">
            <Key className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-ink-900">需要 API Key</h2>
          <p className="text-ink-500 mt-2 text-sm leading-relaxed">
            系统未检测到环境变量配置。为了继续使用，请输入您的 Google Gemini API Key。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              value={inputKey}
              onChange={(e) => setInputKey(e.target.value)}
              placeholder="输入以 AIza 开头的 Key..."
              className="w-full pl-5 pr-5 py-4 bg-paper-50 border border-paper-200 text-ink-900 rounded-xl focus:ring-4 focus:ring-amber-50 focus:border-amber-400 outline-none transition-all font-mono text-sm shadow-inner"
              autoFocus
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-xl flex items-start space-x-3">
             <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
             <p className="text-xs text-blue-800 leading-relaxed">
               您的 Key 将仅存储在您浏览器的 <strong>本地缓存 (LocalStorage)</strong> 中，绝不会发送到除 Google API 以外的任何服务器。
             </p>
          </div>

          <button
            type="submit"
            disabled={!inputKey}
            className="w-full py-4 bg-ink-900 hover:bg-ink-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <Save className="w-5 h-5 mr-2" />
            保存并继续
          </button>
        </form>
        
        <div className="mt-6 text-center">
            <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-bold text-accent-600 hover:text-accent-700 hover:underline"
            >
                没有 API Key? 点击这里获取
            </a>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
