import { useState, useRef, useEffect } from 'react';
import axios from 'axios';

const ChatWidget = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Hi! I am Shareat AI Support. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Filter out the initial welcome message and prepare history for Gemini
      // Gemini history usually expects to start with a 'user' role
      const history = messages
        .filter((_, index) => index > 0) // Skip the first 'model' welcome message
        .map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));

      const res = await axios.post('/api/support/chat', {
        message: input,
        history: history
      });

      setMessages(prev => [...prev, { role: 'model', content: res.data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg = error.response?.data?.error || 'Sorry, I am having trouble connecting.';
      setMessages(prev => [...prev, { 
        role: 'model', 
        content: `${errorMsg} Please check your server setup or contact support@shareat.org.` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white w-[95%] max-w-[450px] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[90vh] border border-outline-variant/30 relative">
        {/* Header */}
        <div className="bg-primary p-6 text-white flex justify-between items-center shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white">smart_toy</span>
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Shareat AI Support</h3>
              <p className="text-[10px] opacity-80 uppercase tracking-wider">Online 24/7</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8f9ff]">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl text-sm shadow-sm ${
                m.role === 'user' 
                  ? 'bg-secondary text-white rounded-tr-none' 
                  : 'bg-white text-primary border border-outline-variant/20 rounded-tl-none'
              }`}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-primary border border-outline-variant/20 p-4 rounded-2xl rounded-tl-none shadow-sm flex gap-1">
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-outline-variant/20 shrink-0">
          <div className="flex items-center gap-2 bg-[#f0f2ff] px-4 py-2 rounded-2xl border border-outline-variant/30 focus-within:ring-2 focus-within:ring-primary/20 transition-all">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask anything about Shareat..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-primary py-2 placeholder:text-on-surface-variant/50"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className={`p-2 rounded-xl transition-all ${
                input.trim() && !isLoading 
                  ? 'bg-primary text-white shadow-md active:scale-90' 
                  : 'text-on-surface-variant/30'
              }`}
            >
              <span className="material-symbols-outlined text-xl">send</span>
            </button>
          </div>
          <p className="text-[9px] text-center text-on-surface-variant/40 mt-3 uppercase font-medium tracking-tighter">
            Powered by Google Gemini AI
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatWidget;
