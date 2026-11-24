import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { answerHistorian } from '../services/historian';
import { ILLUSTRATIONS } from '../constants';
import { ChatMessage } from '../types';
import HistoricImage from './HistoricImage';

const ChatInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: '艙燈還亮着。航路、港口，或是這艘船為甚麼造成這樣，你直接問就行。' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = answerHistorian(userMsg.text, messages.map(m => ({ role: m.role, text: m.text })));
      await new Promise(resolve => setTimeout(resolve, 160));
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: '簿子這一頁被風掀過去了。你再問一次港口或某一次航行，我接着說。' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 left-4 z-50 bg-imperial-gold hover:bg-yellow-600 text-imperial-ink font-bold p-4 rounded-full shadow-xl transition-transform hover:scale-105 flex items-center gap-2 border-2 border-imperial-parchment"
      >
        <MessageSquare size={24} />
        <span className="hidden md:inline font-serif">詢問史官</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex w-[min(94vw,28rem)] h-[min(82vh,40rem)] flex-col bg-imperial-parchment text-imperial-ink rounded-xl border-2 border-imperial-ink/30 shadow-2xl overflow-hidden font-serif">
      <div className="flex items-center gap-3 p-3 border-b border-imperial-ink/10 bg-imperial-gold/15 shrink-0">
        <HistoricImage
          src={ILLUSTRATIONS.historian.src}
          alt={ILLUSTRATIONS.historian.alt}
          className="h-28 w-24 shrink-0 rounded-md border border-imperial-ink/20"
          imgClassName="object-top"
        />
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-imperial-ink flex items-center gap-2 text-lg">
            <span className="text-xl">📜</span> 隨船史官
          </h3>
          <p className="text-xs text-imperial-ink/70 mt-1 leading-relaxed">問港口、季候風或這艘船。舊話還在上面，可以往上翻。</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-imperial-ink/50 hover:text-imperial-red transition-colors shrink-0" aria-label="關閉史官">
          <X size={18} />
        </button>
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 bg-imperial-parchment">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm leading-relaxed shadow-sm break-words ${
              msg.role === 'user' 
                ? 'bg-imperial-ocean text-white' 
                : 'bg-white border border-imperial-ink/10 text-imperial-ink'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/50 text-imperial-ink/60 rounded-lg p-3 text-sm flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" /> 查閱檔案中...
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-imperial-ink/10 bg-white/50">
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="詢問..."
            className="flex-1 bg-white border border-imperial-ink/20 text-imperial-ink rounded-md px-3 py-2 text-sm focus:outline-none focus:border-imperial-gold"
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-imperial-gold text-imperial-ink p-2 rounded-md hover:bg-yellow-600 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;