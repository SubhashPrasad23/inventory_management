import { useState, useRef, useEffect } from "react";
import { HiOutlineX, HiOutlinePaperAirplane } from "react-icons/hi";
import API from "../api/axios";
import aiIcon from "../assets/icons/aiassistant.png";

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "Hey there! \u{1F44B}\n\nI'm Dukan AI \u2014 your smart business assistant.\n\nAsk me anything about your inventory, sales, or business performance. Let's get things done!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async (question) => {
    const query = question || input;
    if (!query.trim()) return;

    setMessages((prev) => [...prev, { role: "user", content: query }]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await API.post("/ai/ask", { question: query });
      setMessages((prev) => [...prev, { role: "ai", content: data.answer }]);
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to get AI response";
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: `Sorry, ${errorMsg}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const suggestedQuestions = [
    "What are my top selling products?",
    "Which products have low stock?",
    "How are my sales this month?",
  ];

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg shadow-indigo-500/30 flex items-center justify-center hover:scale-110 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/40 overflow-hidden"
          title="Dukan AI"
        >
          <img src={aiIcon} alt="Dukan AI" className="w-full h-full object-cover" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] max-h-[80vh] bg-white rounded-2xl shadow-2xl shadow-black/20 flex flex-col overflow-hidden border border-gray-100 animate-in">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
            <div className="flex items-center gap-3">
              <img src={aiIcon} alt="Dukan AI" className="w-9 h-9 rounded-full object-cover" />
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Dukan AI</h3>
                <p className="text-xs text-gray-400">Smart Business Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-gray-50/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white rounded-2xl rounded-br-md"
                      : "bg-white text-gray-700 rounded-2xl rounded-bl-md shadow-sm border border-gray-100"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}

            {/* Loading */}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.15s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.3s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            {messages.length <= 1 && !loading && (
              <div className="flex flex-wrap gap-2 pt-2">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs px-3 py-2 bg-white text-indigo-600 rounded-full border border-indigo-100 hover:bg-indigo-50 hover:border-indigo-200 transition-colors shadow-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input and btn*/}
          <div className="px-4 py-3 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-4 py-2 border border-gray-200 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none"
                placeholder="Ask Dukan AI anything..."
                disabled={loading}
              />
              <button
                onClick={() => handleSend()}
                disabled={loading || !input.trim()}
                className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <HiOutlinePaperAirplane className="w-4 h-4 rotate-90" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AiAssistant;
