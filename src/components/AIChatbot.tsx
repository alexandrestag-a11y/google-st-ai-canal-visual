import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, User, Bot, HelpCircle, PhoneCall } from "lucide-react";
import { ChatMessage, Product } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface AIChatbotProps {
  currentProduct?: Product | null;
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
}

export default function AIChatbot({ currentProduct, externalPrompt, onClearExternalPrompt }: AIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "bot",
      text: "Olá! Sou o especialista técnico virtual do **Canal Visual**. Sou especialista em tintas industriais e imobiliárias **WEG**. Como posso te ajudar com seu esquema de pintura, tempo de secagem ou diluição hoje?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (externalPrompt) {
      setIsOpen(true);
      setInputValue(externalPrompt);
      if (onClearExternalPrompt) {
        onClearExternalPrompt();
      }
    }
  }, [externalPrompt, onClearExternalPrompt]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg: ChatMessage = {
      sender: "user",
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const history = messages.map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        text: m.text,
      }));
      // Include current user message
      history.push({ role: "user", text: userMsg.text });

      const response = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          currentProductContext: currentProduct ? currentProduct : null,
        }),
      });

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.text || "Desculpe, não consegui obter resposta da IA.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (error) {
      console.error("Erro ao enviar chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "Houve um erro de conexão. Lembre-se que você também pode falar com nossa equipe comercial diretamente no WhatsApp para dúvidas rápidas e cotações!",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputValue(question);
    setTimeout(() => {
      // Small timeout to allow input value state to reflect if we click directly
    }, 50);
  };

  const getWhatsAppLink = () => {
    const text = encodeURIComponent("Olá Canal Visual! Gostaria de tirar dúvidas sobre as tintas WEG.");
    return `https://wa.me/5547999999999?text=${text}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Toggle Button */}
      <motion.button
        id="btn-chatbot-toggle"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#005792] text-white shadow-xl hover:bg-[#004370] transition-colors focus:outline-none"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-window"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="absolute bottom-16 right-0 w-96 max-w-[calc(100vw-2rem)] h-[550px] rounded-2xl bg-white shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#005792] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center font-bold text-lg">
                  W
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-tight">Suporte Técnico WEG</h3>
                  <p className="text-xs text-emerald-300 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Especialista em Tintas IA
                  </p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Warning / Banner */}
            <div className="bg-blue-50 p-2.5 px-4 text-xs text-[#005792] font-medium flex items-center justify-between border-b border-blue-100">
              <span className="flex items-center gap-1">
                <PhoneCall className="h-3.5 w-3.5" /> Dúvidas ou cotação direta?
              </span>
              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noreferrer"
                className="bg-[#005792] text-white px-2.5 py-1 rounded-md text-[10px] uppercase tracking-wider font-semibold hover:bg-[#004370] transition-colors"
              >
                Chamar no WhatsApp
              </a>
            </div>

            {/* Chat Body */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
              {messages.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex items-start gap-2 max-w-[85%] ${m.sender === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.sender === "user" ? "bg-blue-100 text-[#005792]" : "bg-[#005792] text-white"}`}>
                      {m.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div>
                      <div className={`p-3 rounded-2xl text-sm shadow-sm ${m.sender === "user" ? "bg-[#005792] text-white rounded-tr-none" : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"}`}>
                        <p className="whitespace-pre-line leading-relaxed">{m.text}</p>
                      </div>
                      <span className="text-[10px] text-gray-400 mt-1 block px-1 text-right">{m.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start gap-2 max-w-[80%]">
                    <div className="h-8 w-8 rounded-full bg-[#005792] text-white flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="bg-white p-3 px-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1">
                      <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                      <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                      <span className="h-1.5 w-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Questions suggestion */}
            {messages.length < 3 && (
              <div className="p-3 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto shrink-0 max-w-full">
                <button
                  onClick={() => handleQuickQuestion("Qual o rendimento da tinta W-THANE SRD 501?")}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-1.5 px-3 rounded-full shrink-0 transition-colors"
                >
                  Rendimento W-THANE
                </button>
                <button
                  onClick={() => handleQuickQuestion("Como catalisar a tinta W-POXI IND 322?")}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-1.5 px-3 rounded-full shrink-0 transition-colors"
                >
                  Catálise Epóxi W-POXI
                </button>
                <button
                  onClick={() => handleQuickQuestion("Esquema de pintura para piso de concreto?")}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs py-1.5 px-3 rounded-full shrink-0 transition-colors"
                >
                  Esquema para Pisos
                </button>
              </div>
            )}

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2">
              <input
                id="input-chatbot"
                type="text"
                placeholder="Pergunte sobre catálise, secagem, demãos..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 text-sm border border-gray-200 rounded-full px-4 py-2 focus:outline-none focus:border-[#005792]"
              />
              <button
                type="submit"
                className="bg-[#005792] hover:bg-[#004370] text-white p-2.5 rounded-full transition-colors flex items-center justify-center shrink-0"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
