import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { api } from "../api/axios.js";
import { Loader } from "../components/Loader.jsx";

export function Chat() {
  const { encodedUrl } = useParams();
  const githubUrl = decodeURIComponent(encodedUrl);

  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleAsk(e) {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;

    const userMessage = { role: "user", content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setAsking(true);

    try {
      const res = await api.post("/ai/ask", { githubUrl, question: trimmed });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.data.data.answer },
      ]);
    } catch (err) {
      const message = err?.response?.data?.message || "The AI could not answer that";
      toast.error(message);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ ${message}`, isError: true },
      ]);
    } finally {
      setAsking(false);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-73px)] max-w-4xl flex-col px-6 py-6">
      <div className="mb-4">
        <Link to="/dashboard" className="text-xs text-slate-500 hover:text-signal-400">
          ← Back to dashboard
        </Link>
        <h1 className="font-display text-lg font-semibold text-slate-100">
          {githubUrl.replace("https://github.com/", "")}
        </h1>
      </div>

      <div className="card flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-500">
              Ask anything about this repository's code — structure, purpose, specific
              files, you name it. The repo is re-cloned fresh for every question.
            </p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "ml-auto bg-signal-500/15 text-slate-100"
                    : m.isError
                      ? "border border-red-500/30 bg-red-500/10 text-red-300"
                      : "bg-ink-800 text-slate-200"
                }`}
              >
                {m.content}
              </div>
            ))
          )}
          {asking && (
            <div className="bg-ink-800 max-w-[85%] rounded-lg px-4 py-3">
              <Loader label="Cloning repo and thinking…" size="sm" />
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleAsk} className="flex gap-3 border-t border-ink-700 p-4">
          <input
            type="text"
            className="input-field flex-1"
            placeholder="What does this repo do?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={asking}
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="btn-primary !px-5"
          >
            {asking ? "Asking…" : "Ask"}
          </button>
        </form>
      </div>
    </div>
  );
}
