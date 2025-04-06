import React, { useState, useRef, useEffect } from 'react';
import { Send, Ghost, User, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Scroll to bottom whenever messages or loading state changes
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const callAPI = async (prompt: string) => {
    setIsLoading(true);

    try {
      const isImage = prompt.startsWith('/image');
      const apiUrl = isImage
        ? 'https://backend.buildpicoapps.com/aero/run/image-generation-api?pk=v1-Z0FBQUFBQm5HUEtMSjJkakVjcF9IQ0M0VFhRQ0FmSnNDSHNYTlJSblE0UXo1Q3RBcjFPcl9YYy1OZUhteDZWekxHdWRLM1M1alNZTkJMWEhNOWd4S1NPSDBTWC12M0U2UGc9PQ=='
        : 'https://backend.buildpicoapps.com/aero/run/llm-api?pk=v1-Z0FBQUFBQm5HUEtMSjJkakVjcF9IQ0M0VFhRQ0FmSnNDSHNYTlJSblE0UXo1Q3RBcjFPcl9YYy1OZUhteDZWekxHdWRLM1M1alNZTkJMWEhNOWd4S1NPSDBTWC12M0U2UGc9PQ==';

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (data.status === 'success') {
        return data.text;
      } else {
        throw new Error('API returned error status');
      }
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input.trim(),
      role: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const response = await callAPI(userMessage.content);
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content:
          'Failed to connect to the server. Please check your connection.',
        role: 'assistant',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-2 md:p-4 h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white rounded-t-xl p-3 md:p-4 border-b">
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Ghost className="w-6 h-6 md:w-8 md:h-8 text-blue-500" />
            Ghost
          </h1>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto py-2 md:py-4 space-y-3 md:space-y-4 px-2">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 mt-4 md:mt-8">
              <Ghost className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2 md:mb-4 text-gray-400" />
              <p className="text-base md:text-lg">Hello, I'm Md Ridoan Mahmud Zisan.</p>
              <p className="text-xs md:text-sm">
                Try asking a question or sharing your thoughts.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex items-start gap-2 md:gap-3 ${
                message.role === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="w-4 h-4 md:w-5 md:h-5 text-white" />
                ) : (
                  <Ghost className="w-4 h-4 md:w-5 md:h-5 text-white" />
                )}
              </div>
              <div
                className={`rounded-xl md:rounded-2xl px-3 py-1 md:px-4 md:py-2 max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white border text-gray-800'
                }`}
              >
                {message.content.startsWith('http') ? (
                  <img
                    src={message.content}
                    alt="AI Generated"
                    className="rounded-lg max-w-full h-auto"
                  />
                ) : (
                  <p className="text-xs md:text-sm">{message.content}</p>
                )}
                <p className="text-[10px] md:text-xs mt-1 opacity-70">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-start gap-2 md:gap-3">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <Ghost className="w-4 h-4 md:w-5 md:h-5 text-white" />
              </div>
              <div className="bg-white border rounded-xl md:rounded-2xl px-3 py-1 md:px-4 md:py-2">
                <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin text-gray-500" />
              </div>
            </div>
          )}
          
          {/* Empty div at the bottom to scroll into view */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border-t p-2 md:p-4 rounded-b-xl"
        >
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 md:px-4 md:py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-blue-500 text-white rounded-lg px-3 py-2 md:px-4 md:py-2 hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 md:gap-2"
            >
              <Send className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden md:inline">Send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
