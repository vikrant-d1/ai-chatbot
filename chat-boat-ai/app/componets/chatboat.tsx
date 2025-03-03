"use client";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { PaperAirplaneIcon, DocumentDuplicateIcon, CheckIcon } from "@heroicons/react/24/solid";
import { motion } from "framer-motion";

type Message = {
  role: "user" | "bot";
  content: string;
};

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null); 
  const chatEndRef = useRef<HTMLDivElement>(null);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3001/chat", { message: input });
      const botMessage: Message = { role: "bot", content: response.data.reply.content };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
    }finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);

    setTimeout(() => {
      setCopiedIndex(null);
    }, 1500); // Reset after 1.5s
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`p-3 m-1 rounded-lg relative max-w-xs sm:max-w-md lg:max-w-lg ${
                msg.role === "user" ? "bg-blue-500 text-white" : "bg-gray-300 text-black"
              }`}
            >
              {msg.role === "bot" ? (
                <div className="prose prose-sm">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              ) : (
                msg.content
              )}
              {msg.role === "bot" && (
                <button
                  className="absolute top-[-15px] right-1 p-1 rounded-lg bg-white shadow-md hover:bg-gray-200 transition"
                  onClick={() => copyToClipboard(msg.content, index)}
                >
                  {copiedIndex === index ? (
                    <CheckIcon className="h-5 w-5 text-green-500" />
                  ) : (
                    <DocumentDuplicateIcon className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              )}
            </div>
          </motion.div>
        ))}

        {/* 🔹 Animated Typing Dots Loader */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse" }}
            className="flex justify-start"
          >
            <div className="p-3 m-1 rounded-lg bg-gray-300 text-black max-w-xs sm:max-w-md lg:max-w-lg">
              <div className="flex items-center space-x-2">
                <div className="dot-flashing"></div>
                <div className="dot-flashing"></div>
                <div className="dot-flashing"></div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="flex items-center p-4 bg-white border-t">
        <input
          type="text"
          className="flex-1 border rounded-lg p-2 mr-2 focus:outline-none"
          placeholder="Type a message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          disabled={loading}
        />
        <button
          className={`p-2 rounded-lg ${
            loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 text-white"
          }`}
          onClick={sendMessage}
          disabled={loading}
        >
          <PaperAirplaneIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  );
};

export default Chatbot;
