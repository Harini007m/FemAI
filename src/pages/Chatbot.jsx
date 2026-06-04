import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MessageSquare, Bot, User, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Chatbot({ token, user }) {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      message: `Hello ${user?.name || 'there'}! I am your HERBUDDY AI Health Companion.\n\nI have analyzed your profile, menstrual history, and symptom logs to customize my responses. Ask me about period cramps, PCOS diets, deficiency risks, or wellness tips!`,
      timestamp: new Date().toISOString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim()) return;

    if (!textToSend) setInput('');

    // Append user message
    const userMsg = {
      sender: 'user',
      message: text,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const res = await fetch('/api/chat/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: text })
      });
      const data = await res.json();
      
      if (res.ok) {
        setMessages(prev => [...prev, {
          sender: 'bot',
          message: data.reply,
          timestamp: new Date().toISOString()
        }]);
      } else {
        throw new Error(data.message || 'Chat error');
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        sender: 'bot',
        message: 'Sorry, I encountered an issue connecting to the digital twin server. Please verify your backend configuration.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        sender: 'bot',
        message: 'Chat history cleared. How can I assist you with your health today?',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const quickPrompts = [
    { label: 'PCOS Diet Advice', text: 'Suggest a low-GI meal plan for PCOS.' },
    { label: 'Manage Period Cramps', text: 'How can I reduce severe period cramps?' },
    { label: 'Iron Deficiency Check', text: 'Am I at risk for iron deficiency based on my logs?' },
    { label: 'Ovulation Window', text: 'When is my next fertile window and ovulation day?' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-140px)] flex flex-col">
      <div className="glass-card rounded-3xl border border-pink-100 flex-1 flex flex-col overflow-hidden shadow-xl">
        
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-pink-100 flex items-center justify-between bg-white/50 backdrop-blur-md">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-pink-100 text-pink-600 rounded-xl shadow-inner animate-pulse">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-gray-800 text-md">HERBUDDY Wellness Coach</h2>
              <span className="text-[10px] text-pink-600 font-semibold uppercase tracking-wider">AI Medical Twin Model</span>
            </div>
          </div>
          <button 
            onClick={clearChat}
            className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl transition"
            title="Clear Chat History"
          >
            <Trash2 className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-pink-50/10 scrollbar-thin">
          {messages.map((m, idx) => {
            const isBot = m.sender === 'bot';
            return (
              <div 
                key={idx} 
                className={`flex items-start space-x-3.5 ${isBot ? '' : 'flex-row-reverse space-x-reverse'}`}
              >
                {/* Avatar */}
                <div className={`p-2 rounded-xl shrink-0 ${isBot ? 'bg-pink-100 text-pink-600 shadow-sm' : 'bg-purple-100 text-purple-600 shadow-sm'}`}>
                  {isBot ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>

                {/* Message body with Markdown support */}
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-xs leading-relaxed shadow-sm border ${
                  isBot 
                    ? 'bg-white border-pink-50 text-gray-800 rounded-tl-none' 
                    : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white border-pink-500 rounded-tr-none'
                }`}>
                  {isBot ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({ children }) => <h1 className="text-base font-black text-pink-700 mb-2 mt-3 first:mt-0">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-sm font-bold text-pink-600 mb-2 mt-2 first:mt-0">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-xs font-bold text-gray-800 mb-2 mt-2 first:mt-0">{children}</h3>,
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-bold text-pink-600">{children}</strong>,
                        em: ({ children }) => <em className="italic text-gray-700">{children}</em>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="ml-2">{children}</li>,
                        code: ({ inline, children }) => inline
                          ? <code className="bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded text-[10px] font-mono">{children}</code>
                          : <code className="block bg-gray-800 text-gray-100 p-2 rounded-lg font-mono text-[11px] mb-2 overflow-x-auto">{children}</code>,
                        pre: ({ children }) => <pre className="block bg-gray-800 text-gray-100 p-3 rounded-lg font-mono text-[10px] mb-2 overflow-x-auto">{children}</pre>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-pink-500 pl-3 italic text-gray-700 my-2">{children}</blockquote>,
                        a: ({ href, children }) => <a href={href} target="_blank" rel="noopener noreferrer" className="text-pink-600 underline hover:text-pink-700">{children}</a>,
                      }}
                    >
                      {m.message}
                    </ReactMarkdown>
                  ) : (
                    <div>{m.message}</div>
                  )}
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-50 text-pink-600 rounded-xl shrink-0 animate-bounce">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-white border border-pink-50 rounded-2xl rounded-tl-none px-4 py-3 text-xs text-gray-400 italic">
                Analyzing health twin parameters...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Panel */}
        <div className="px-6 py-2 border-t border-pink-50 bg-gray-50/20 flex flex-wrap gap-2">
          {quickPrompts.map(p => (
            <button
              key={p.label}
              onClick={() => handleSend(p.text)}
              className="px-3 py-1 bg-white hover:bg-pink-50/50 border border-pink-100 rounded-full text-[10px] font-semibold text-gray-500 hover:text-pink-600 transition shadow-sm"
              disabled={loading}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-pink-100 bg-white/50 backdrop-blur-md">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="flex items-center space-x-2"
          >
            <input 
              type="text"
              placeholder="Ask anything about symptoms, period pain, nutritional diet plans..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/80 border border-pink-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 text-xs"
              disabled={loading}
            />
            <button 
              type="submit"
              className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl shadow-md hover:opacity-90 transition disabled:opacity-50 shrink-0"
              disabled={loading || !input.trim()}
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
