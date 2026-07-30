import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../context/AuthContext';

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "Hi there! I am Pradeep's AI Assistant. Ask me anything about his skills, education, projects, or internship availability!"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const suggestionChips = [
    "What is his B.Tech CGPA?",
    "Tell me about his Diabetic Eye project.",
    "What programming languages does he know?",
    "Is he looking for internships?"
  ];

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: query }]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/chat`, { message: query });
      setMessages(prev => [...prev, { sender: 'bot', text: res.data.reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev, 
        { sender: 'bot', text: "Sorry, I'm having trouble connecting right now. Please try again or reach out to Pradeep directly!" }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-full shadow-lg shadow-indigo-500/30 hover:scale-110 active:scale-95 transition-all duration-200"
          title="Ask AI Assistant"
        >
          <Bot size={26} className="animate-float" />
        </button>
      )}

      {/* Floating Chat Container */}
      {isOpen && (
        <div className="flex flex-col w-[350px] sm:w-[380px] h-[500px] bg-white dark:bg-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 animate-scale-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
            <div className="flex items-center space-x-2">
              <div className="p-1 bg-white/20 rounded-lg">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="font-bold text-sm">Ask About Pradeep</h4>
                <p className="text-[10px] text-indigo-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Gemini-Powered AI
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-indigo-100 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/40">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start space-x-2 ${
                  msg.sender === 'user' ? 'justify-end space-x-reverse' : 'justify-start'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 p-1.5 rounded-full text-white ${
                    msg.sender === 'user' ? 'bg-indigo-600' : 'bg-purple-600'
                  }`}
                >
                  {msg.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[75%] px-3 py-2 text-xs rounded-2xl shadow-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white dark:bg-dark-card text-slate-800 dark:text-slate-200 border border-slate-200/50 dark:border-slate-800 rounded-tl-none'
                  }`}
                >
                  {msg.text.split('\n').map((line, lIdx) => (
                    <p key={lIdx} className={lIdx > 0 ? 'mt-1' : ''}>
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-purple-600 rounded-full text-white">
                  <Bot size={12} />
                </div>
                <div className="bg-white dark:bg-dark-card border border-slate-200/50 dark:border-slate-800 px-4 py-2.5 rounded-2xl rounded-tl-none shadow-sm flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          {messages.length === 1 && (
            <div className="px-4 py-2 border-t border-slate-200/50 dark:border-slate-800 bg-white dark:bg-dark-card flex flex-wrap gap-1.5">
              {suggestionChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="text-[10px] px-2.5 py-1 bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-full transition-all duration-150"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card flex items-center space-x-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your question..."
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || loading}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl disabled:opacity-50 transition-colors"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
