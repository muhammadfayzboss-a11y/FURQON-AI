"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

function generateSessionId() {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

function formatMessage(text: string) {
  const lines = text.split("\n");
  const elements: string[] = [];

  for (const line of lines) {
    let processed = line;
    
    // Bold
    processed = processed.replace(
      /\*\*(.+?)\*\*/g,
      '<strong class="text-amber-400 font-semibold">$1</strong>'
    );
    // Italic
    processed = processed.replace(
      /(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g,
      '<em class="text-blue-300 italic">$1</em>'
    );
    // Arabic Quran text
    processed = processed.replace(
      /﴿(.+?)﴾/g,
      '<span class="arabic-font text-xl leading-loose text-amber-300 block my-2 text-right bg-amber-900/20 p-2 rounded">﴿$1﴾</span>'
    );
    // Section headers with special styling
    if (processed.includes("**ASOSIY JAVOB**") || processed.includes("ASOSIY JAVOB")) {
      processed = `<div class="mt-3 mb-2 text-lg font-bold text-green-400 border-b border-green-900/30 pb-1">✅ ${processed.replace(/\*\*/g, '')}</div>`;
    } else if (processed.includes("DALIL: QUR'ON") || processed.includes("DALIL: QURON")) {
      processed = `<div class="mt-4 mb-2 text-lg font-bold text-amber-400 border-b border-amber-900/30 pb-1">📖 ${processed.replace(/\*\*/g, '')}</div>`;
    } else if (processed.includes("DALIL: HADIS")) {
      processed = `<div class="mt-4 mb-2 text-lg font-bold text-blue-400 border-b border-blue-900/30 pb-1"> ${processed.replace(/\*\*/g, '')}</div>`;
    } else if (processed.includes("XULOSA")) {
      processed = `<div class="mt-4 mb-2 text-lg font-bold text-purple-400 border-b border-purple-900/30 pb-1">💡 ${processed.replace(/\*\*/g, '')}</div>`;
    } else if (
      processed.startsWith("") ||
      processed.startsWith("📚") ||
      processed.startsWith("💡") ||
      processed.startsWith("") ||
      processed.startsWith("⭐") ||
      processed.startsWith("🕌") ||
      processed.startsWith("📌")
    ) {
      processed = `<div class="mt-2 mb-1 text-base font-semibold">${processed}</div>`;
    }
    // Warning/error messages
    if (processed.includes("️") || processed.includes("❌") || processed.includes("✅")) {
      processed = `<div class="my-1">${processed}</div>`;
    }
    elements.push(processed);
  }
  return elements.join("<br/>");
}

const EXAMPLE_QUESTIONS = [
  "Namoz o'qishning fazilati haqida oyat va hadis keltiring",
  "Sabr qilish haqida Qurʼonda nima deyilgan?",
  "Ota-onaga hurmat haqida hadislar",
  "Sadaqa berishning savoblari haqida",
];

// Modal Component
function Modal({ isOpen, onClose, title, children }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-[#162040] border border-amber-900/30 rounded-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl glow-border"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#162040] border-b border-amber-900/20 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-amber-400">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors text-2xl">&times;</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("furqon_session_id");
      if (saved) return saved;
      const newId = generateSessionId();
      localStorage.setItem("furqon_session_id", newId);
      return newId;
    }
    return generateSessionId();
  });
  
  // Modal states
  const [showHelp, setShowHelp] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch(`/api/chat?sessionId=${sessionId}`);
        const data = await res.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(
            data.messages.map((m: { role: string; content: string }) => ({
              role: m.role as "user" | "assistant",
              content: m.content,
            }))
          );
        }
      } catch {}
    }
    loadHistory();
  }, [sessionId]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;

    const userMessage: Message = { role: "user", content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText, sessionId }),
      });

      const data = await res.json();

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: `⚠️ Xatolik: ${data.error}` },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response || "Javob topilmadi" },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "⚠️ Tarmoq xatoligi yuz berdi." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([]);
    const newId = generateSessionId();
    localStorage.setItem("furqon_session_id", newId);
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex flex-col pattern-overlay">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0a1628]/90 border-b border-amber-900/30">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-700/20 glow-border"></div>
              <span className="text-2xl">☪</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-300 bg-clip-text text-transparent">
                Furqon AI
              </h1>
              <p className="text-[10px] text-amber-600/80 tracking-widest uppercase">
                Qurʼon va Hadis Yordamchisi
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHelp(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all"
              title="Yordam"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="hidden sm:inline">Yordam</span>
            </button>
            
            <button
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all"
              title="Yaratuvchi haqida"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="hidden sm:inline">Muallif</span>
            </button>
            
            <button
              onClick={startNewChat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 hover:bg-amber-500/20 transition-all"
              title="Yangi suhbat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">Yangi</span>
            </button>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <div className="relative mb-8">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-800/20 flex items-center justify-center glow-border">
                  <span className="text-5xl">🕌</span>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-amber-500/30 flex items-center justify-center">
                  <span className="text-xs">✨</span>
                </div>
              </div>

              <h2 className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent mb-3">
                Bismillahir Rohmanir Rohiym
              </h2>
              <p className="text-slate-400 mb-2 max-w-md text-sm">
                Furqon AI — Qurʼon oyatlari va sahih hadislar asosida savollaringizga javob beruvchi sunʼiy intellekt yordamchisi
              </p>
              <p className="arabic-font text-amber-400/70 text-xl mb-8">
                ﴿ وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ ﴾
              </p>

              <div className="w-full max-w-2xl">
                <p className="text-xs text-slate-500 mb-3 uppercase tracking-wider">Namuna savollar</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EXAMPLE_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(q)}
                      className="text-left p-3 rounded-xl bg-[#162040]/80 border border-amber-900/20 hover:border-amber-500/40 hover:bg-[#1a2850] transition-all text-sm text-slate-300 hover:text-amber-300 group"
                    >
                      <span className="text-amber-500/60 group-hover:text-amber-400 mr-2">→</span>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`message-enter flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] ${
                      msg.role === "user"
                        ? "bg-gradient-to-r from-amber-600/30 to-amber-700/20 border border-amber-500/30 rounded-2xl rounded-br-md"
                        : "bg-[#162040]/90 border border-slate-700/50 rounded-2xl rounded-bl-md"
                    } px-4 py-3`}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/30">
                        <span className="text-sm">☪</span>
                        <span className="text-xs font-semibold text-amber-400">Furqon AI</span>
                      </div>
                    )}
                    <div
                      className={`chat-content text-sm leading-relaxed whitespace-pre-wrap ${
                        msg.role === "user" ? "text-amber-100" : "text-slate-200"
                      }`}
                      dangerouslySetInnerHTML={{
                        __html: msg.role === "assistant" ? formatMessage(msg.content) : msg.content.replace(/</g, "&lt;").replace(/>/g, "&gt;"),
                      }}
                    />
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start message-enter">
                  <div className="bg-[#162040]/90 border border-slate-700/50 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-700/30">
                      <span className="text-sm">☪</span>
                      <span className="text-xs font-semibold text-amber-400">Furqon AI</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                      <span className="text-xs">Qurʼon va hadislardan izlamoqda...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="sticky bottom-0 backdrop-blur-xl bg-[#0a1628]/90 border-t border-amber-900/20">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Savolingizni yozing... (masalan: Namoz haqida oyat va hadis)"
                rows={1}
                className="w-full resize-none rounded-xl bg-[#162040] border border-slate-700/50 focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/30 px-4 py-3 text-sm text-slate-200 placeholder-slate-500 outline-none transition-all"
                style={{ maxHeight: "120px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = target.scrollHeight + "px";
                }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-lg shadow-amber-900/30 disabled:shadow-none"
            >
              {isLoading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19V5m0 0l-7 7m7-7l7 7" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-center text-[10px] text-slate-600 mt-2">
            Furqon AI — Qurʼon va Hadis asosida ishlaydigan sunʼiy intellekt. Har doim olimlardan maslahat oling.
          </p>
        </div>
      </footer>

      {/* Help Modal */}
      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="📖 Yordam">
        <div className="space-y-4 text-slate-300">
          <div>
            <h3 className="text-amber-400 font-semibold mb-2">🕌 Furqon AI nima?</h3>
            <p className="text-sm">
              Furqon AI — bu Qurʼon oyatlari va sahih hadislarni oʻrganish uchun maxsus yaratilgan sunʼiy intellekt yordamchisi. 
              U sizning Islomiy savollaringizga oyat va hadislar bilan javob beradi.
            </p>
          </div>
          
          <div>
            <h3 className="text-amber-400 font-semibold mb-2">📝 Qanday foydalanish kerak?</h3>
            <ol className="text-sm space-y-2 list-decimal list-inside">
              <li>Savolni pastdagi maydonga yozing</li>
              <li>Enter tugmasini bosing yoki yuborish tugmasini bosing</li>
              <li>AI Qurʼon va hadislardan javob qaytaradi</li>
              <li>Yangi suhbat boshlash uchun "Yangi" tugmasini bosing</li>
            </ol>
          </div>
          
          <div>
            <h3 className="text-amber-400 font-semibold mb-2">⭐ Namuna savollar</h3>
            <ul className="text-sm space-y-1">
              {EXAMPLE_QUESTIONS.map((q, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  <button onClick={() => { sendMessage(q); setShowHelp(false); }} className="text-left hover:text-amber-400 transition-colors">{q}</button>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="bg-amber-900/20 border border-amber-900/30 rounded-lg p-3">
            <p className="text-xs text-amber-400/80">
              ⚠️ <strong>Eslatma:</strong> Furqon AI faqat maʼlumot beradi. Har doim ishonchli olimlardan maslahat oling!
            </p>
          </div>
        </div>
      </Modal>

      {/* About Modal */}
      <Modal isOpen={showAbout} onClose={() => setShowAbout(false)} title="👤 Yaratuvchi haqida">
        <div className="space-y-6 text-slate-300">
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-700/30 mx-auto flex items-center justify-center mb-3 glow-border">
              <span className="text-4xl">👨‍💻</span>
            </div>
            <h3 className="text-xl font-bold text-amber-400">Muhammad Fayz</h3>
            <p className="text-sm text-slate-500">Dasturchi & Loyiha Muallifi</p>
          </div>
          
          <div className="bg-[#0a1628] rounded-xl p-4 space-y-4">
            <p className="text-sm text-center">
              Furqon AI — Islomiy bilimlarni raqamli shaklda yetkazish maqsadida yaratilgan loyiha. 
              Maqsadim — har bir musulmonga Qurʼon va Hadis oʻrganishni osonlashtirish.
            </p>
            
            <div className="space-y-3">
              <a 
                href="https://t.me/tahrirchi_admin" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg bg-[#162040] hover:bg-[#1a2850] border border-slate-700/50 hover:border-amber-500/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.46-.42-1.4-.88.03-.24.37-.49 1.03-.74 4.04-1.76 6.74-2.92 8.09-3.5 3.83-1.64 4.63-1.93 5.14-1.94.11 0 .37.03.54.17.14.12.18.28.2.45-.02.07-.02.13-.03.18z"/>
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-200">Telegram</p>
                  <p className="text-xs text-slate-500">@tahrirchi_admin</p>
                </div>
                <svg className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
              
              <a 
                href="mailto:muhammadfayzq@gmail.com" 
                className="flex items-center gap-3 p-3 rounded-lg bg-[#162040] hover:bg-[#1a2850] border border-slate-700/50 hover:border-amber-500/30 transition-all group"
              >
                <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-200">Email</p>
                  <p className="text-xs text-slate-500">muhammadfayzq@gmail.com</p>
                </div>
                <svg className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-slate-500 mb-2">Loyiha texnologiyalari</p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-2 py-1 text-[10px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Next.js 16</span>
              <span className="px-2 py-1 text-[10px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">PostgreSQL</span>
              <span className="px-2 py-1 text-[10px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">AI/ML</span>
              <span className="px-2 py-1 text-[10px] rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">Tailwind</span>
            </div>
          </div>
          
          <div className="text-center pt-2 border-t border-slate-700/30">
            <p className="text-xs text-slate-600">© 2026 Furqon AI. Barcha huquqlar himoyalangan.</p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
