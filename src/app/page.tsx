"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS = [
  "Namoz qanday o'qiladi?",
  "Ro'za tutish haqida",
  "Zakot nima?",
  "Qur'on haqida",
  "Islomda axloq",
  "Haj ibodati",
];

export default function HomePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [showAbout, setShowAbout] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setSessionId(crypto.randomUUID().slice(0, 16));
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: msg,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Auto-resize textarea back
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId }),
      });

      const data = await res.json();

      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      const assistantMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.reply || data.error || "Xatolik yuz berdi.",
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Tarmoq xatosi. Iltimos, qayta urinib ko'ring.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTextareaInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const clearChat = () => {
    setMessages([]);
    setSessionId(crypto.randomUUID().slice(0, 16));
  };

  return (
    <div className="flex h-dvh flex-col islamic-pattern">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-emerald-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-200 glow-effect">
              <span className="text-lg font-bold text-white">ف</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-emerald-800 leading-tight">
                Furqon AI
              </h1>
              <p className="text-xs text-emerald-600/70">
                Islomiy bilimlar yordamchisi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAbout(true)}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
            >
              Haqida
            </button>
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                ✨ Yangi suhbat
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-4 py-6">
          {messages.length === 0 ? (
            /* Welcome Screen */
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-xl shadow-emerald-200/50 glow-effect">
                <span className="text-3xl font-bold text-white">ف</span>
              </div>

              <h2 className="mb-2 text-2xl font-bold text-slate-800">
                Assalomu alaykum! 👋
              </h2>
              <p className="mb-8 max-w-md text-sm text-slate-500">
                Men Furqon AI — Qur&apos;on va Hadis asosida savollarga javob beruvchi
                yordamchiman. Istalgan islomiy savolni bering!
              </p>

              {/* Bismillah */}
              <div className="mb-8 rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4">
                <p className="text-lg font-semibold text-emerald-800" dir="rtl">
                  بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
                </p>
                <p className="mt-1 text-xs text-emerald-600">
                  Mehribon va rahmli Alloh nomi bilan
                </p>
              </div>

              {/* Quick Questions */}
              <div className="w-full max-w-lg">
                <p className="mb-3 text-xs font-medium uppercase tracking-wider text-slate-400">
                  Tez savollar
                </p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {QUICK_QUESTIONS.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="rounded-xl border border-emerald-100 bg-white px-3 py-2.5 text-sm text-emerald-700 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md active:scale-[0.97]"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Chat Messages */
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`animate-fade-in-up flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                      msg.role === "user"
                        ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-md"
                        : "bg-white border border-slate-100 text-slate-700 rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" && (
                      <div className="mb-1 flex items-center gap-1.5">
                        <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-[10px] font-bold text-emerald-700">
                          ف
                        </span>
                        <span className="text-xs font-semibold text-emerald-700">
                          Furqon AI
                        </span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {loading && (
                <div className="animate-fade-in-up flex justify-start">
                  <div className="flex items-center gap-2 rounded-2xl rounded-bl-md border border-slate-100 bg-white px-4 py-3 shadow-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-emerald-100 text-[10px] font-bold text-emerald-700">
                      ف
                    </span>
                    <div className="flex gap-1">
                      <span className="dot-1 h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="dot-2 h-2 w-2 rounded-full bg-emerald-400" />
                      <span className="dot-3 h-2 w-2 rounded-full bg-emerald-400" />
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
      <footer className="flex-shrink-0 border-t border-emerald-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-end gap-2 px-4 py-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={handleKeyDown}
            placeholder="Savolingizni yozing..."
            rows={1}
            disabled={loading}
            className="flex-1 resize-none rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm text-slate-800 shadow-sm outline-none transition-all placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-200 transition-all hover:shadow-lg hover:shadow-emerald-300 active:scale-95 disabled:opacity-40 disabled:shadow-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
        <div className="mx-auto max-w-3xl px-4 pb-3">
          <p className="text-center text-[10px] text-slate-400">
            Furqon AI xato qilishi mumkin. Muhim masalalarda ulamolardan so&apos;rang.
          </p>
        </div>
      </footer>

      {/* About Modal */}
      {showAbout && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setShowAbout(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <span className="text-xl font-bold text-white">ف</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Furqon AI</h3>
                <p className="text-xs text-slate-500">v1.0.0</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-600">
              <p>
                <strong className="text-emerald-700">Furqon AI</strong> — bu
                sun&apos;iy intellekt yordamida islomiy bilimlarni o&apos;rganish uchun
                yaratilgan yordamchi.
              </p>
              <p>
                🕌 Qur&apos;on va Hadis asosida ishlaydi
              </p>
              <p>
                📚 Islomiy masalalarda maslahat beradi
              </p>
              <p>
                🤲 O&apos;zbek tilida javob beradi
              </p>
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700">
                ⚠️ <strong>Eslatma:</strong> Furqon AI sun&apos;iy intellekt bo&apos;lib, xato
                qilishi mumkin. Muhim diniy masalalarda doim malakali ulamolarga
                murojaat qiling.
              </div>
            </div>

            <button
              onClick={() => setShowAbout(false)}
              className="mt-5 w-full rounded-xl bg-emerald-500 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Tushundim
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
