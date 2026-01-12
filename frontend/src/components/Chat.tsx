import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';

interface Message {
  userId?: string;
  username: string;
  message: string;
  timestamp: Date;
}

interface ChatProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  currentUsername: string;
}

const Chat = ({ messages, onSendMessage, currentUsername }: ChatProps) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="h-full flex flex-col bg-dark-800">
      {/* Header */}
      <div className="flex items-center space-x-2 px-4 py-3 border-b border-dark-700 bg-dark-800/50 backdrop-blur-sm">
        <MessageCircle className="h-5 w-5 text-primary-500" />
        <span className="font-semibold">Chat</span>
        <span className="ml-auto text-xs text-gray-400">{messages.length} messages</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 text-sm mt-8">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((msg, idx) => {
            const isOwnMessage = msg.username === currentUsername;
            return (
              <div
                key={idx}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fadeIn`}
              >
                <div
                  className={`max-w-[80%] ${
                    isOwnMessage
                      ? 'bg-gradient-to-br from-primary-600 to-primary-700 rounded-l-xl rounded-tr-xl shadow-lg'
                      : 'bg-dark-700 rounded-r-xl rounded-tl-xl shadow-lg hover:bg-dark-600 transition-colors'
                  } px-4 py-2.5`}
                >
                  {!isOwnMessage && (
                    <div className="text-xs text-primary-400 font-semibold mb-1">
                      {msg.username}
                    </div>
                  )}
                  <div className="text-sm wrap-break-word leading-relaxed">{msg.message}</div>
                  <div className="text-xs text-gray-400 mt-1.5 opacity-70">
                    {new Date(msg.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-dark-700 bg-dark-800/50">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-dark-700 border border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 hover:border-dark-600 transition-all text-sm"
            maxLength={500}
          />
          <button
            type="submit"
            disabled={!input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all shadow-lg hover:shadow-primary-500/50 flex items-center space-x-2 hover:scale-105 active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
