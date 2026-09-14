import { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, AlertCircle } from 'lucide-react';
import { generateResponse } from '../services/aiService';
import { suggestedPrompts } from '../data/aiResponses';
import Avatar from '../components/ui/Avatar';
import { useApp } from '../contexts/AppContext';

export default function AIAssistant() {
  const { currentUser } = useApp();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'ai',
      content:
        "Hello! I'm your WorkNest AI assistant powered by your company's live context. I can help summarize projects, check deadlines, prioritize tasks, and answer team questions. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (text) => {
    // Prevent duplicate requests while waiting for AI response
    if (isTyping) return;

    const prompt = text || input;
    if (!prompt.trim()) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await generateResponse(prompt);
      const aiMessage = {
        id: `ai-${Date.now()}`,
        role: 'ai',
        content: response,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: 'ai',
          isError: true,
          content: err?.message || 'Sorry, I encountered an error. Please try again.',
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const showSuggestions = messages.length <= 1;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg">
            <Bot size={20} className="text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">AI Assistant</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Your WorkNest productivity assistant
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-4 mb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 animate-fadeIn ${
              message.role === 'user' ? 'justify-end' : ''
            }`}
          >
            {message.role === 'ai' && (
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.isError
                    ? 'bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                    : 'bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400'
                }`}
              >
                {message.isError ? <AlertCircle size={16} /> : <Bot size={16} />}
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'bg-primary-600 text-white rounded-br-sm'
                  : message.isError
                  ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 rounded-bl-sm'
                  : 'bg-gray-50 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-bl-sm'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
            {message.role === 'user' && (
              <Avatar name={currentUser?.name || 'User'} size="sm" />
            )}
          </div>
        ))}

        {/* Loading / Typing indicator */}
        {isTyping && (
          <div className="flex gap-3 animate-fadeIn">
            <div className="flex-shrink-0 w-8 h-8 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center">
              <Bot size={16} className="text-primary-600 dark:text-primary-400" />
            </div>
            <div className="bg-gray-50 dark:bg-slate-700 px-4 py-3 rounded-xl rounded-bl-sm flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400">WorkNest AI is thinking</span>
              <div className="flex gap-1 items-center">
                <div
                  className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      {showSuggestions && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={isTyping}
              onClick={() => handleSend(prompt)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-full hover:border-primary-300 dark:hover:border-primary-600 hover:text-primary-700 dark:hover:text-primary-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles size={12} />
              {prompt}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isTyping ? 'WorkNest AI is generating response...' : 'Ask WorkNest AI...'}
            disabled={isTyping}
            className="w-full px-4 py-3 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 disabled:opacity-50"
          />
        </div>
        <button
          type="button"
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          className="px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
