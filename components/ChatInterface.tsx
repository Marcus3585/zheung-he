import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Loader2 } from 'lucide-react';
import { chatWithHistorian } from '../services/gemini';
import { ChatMessage } from '../types';

const ChatInterface: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'model', text: '您好。我是隨船史官。關於艦隊的決策或風土人情，您儘管問。' }
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

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const responseText = await chatWithHistorian(history, userMsg.text);
    
    setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'model', text: responseText }]);
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-imperial-gold hover:bg-yellow-600 text-imperial-ink font-bold p-4 rounded-full shadow-xl transition-transform hover:scale-105 flex items-center gap-2 border-2 border-imperial-parchment"
      >
        <MessageSquare size={24} />
        <span className="hidden md:inline font-serif">詢問史官</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[90vw] md:w-96 h-[400px] flex flex-col bg-imperial-parchment text-imperial-ink rounded-xl border-2 border-imperial-ink/30 shadow-2xl overflow-hidden font-serif">
      <div className="flex items-center justify-between p-4 border-b border-imperial-ink/10 bg-imperial-gold/20">
        <h3 className="font-bold text-imperial-ink flex items-center gap-2">
          <span className="text-xl">📜</span> 隨船史官
        </h3>
        <button onClick={() => setIsOpen(false)} className="text-imperial-ink/50 hover:text-imperial-red transition-colors">
          <X size={18} />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-imperial-parchment">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm shadow-sm ${
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