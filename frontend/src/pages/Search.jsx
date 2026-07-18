import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  FileText,
  Search as SearchIcon,
  Sparkles,
  ListFilter,
  CheckCircle2,
  CircleDashed,
} from "lucide-react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

const AGENT_STEPS = [
  { key: "searching", label: "Searching knowledge base", icon: SearchIcon },
  { key: "analyzing", label: "Analyzing relevant chunks", icon: ListFilter },
];

export default function Search() {
  const { email } = useAuth();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef(null);
  const initial = email ? email.charAt(0).toUpperCase() : "?";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  async function runSearch(q) {
    const question = q.trim();
    if (!question || busy) return;

    const userMsgId = `u-${Date.now()}`;
    const botMsgId = `b-${Date.now()}`;

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, role: "user", text: question },
      { id: botMsgId, role: "assistant", status: "searching", results: null, error: "" },
    ]);
    setQuery("");
    setBusy(true);

    function updateBot(patch) {
      setMessages((prev) =>
        prev.map((m) => (m.id === botMsgId ? { ...m, ...patch } : m))
      );
    }

    try {
      const stepDelay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

      await stepDelay(450);
      updateBot({ status: "analyzing" });

      const data = await api.search(question, 5);

      await stepDelay(400);
      updateBot({ status: "done", results: data.results });
    } catch (err) {
      updateBot({ status: "error", error: err.message || "Search failed" });
    } finally {
      setBusy(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    runSearch(query);
  }

  return (
    <div className="chat-page">
      <div className="chat-page-header">
        <h1>AI Search</h1>
        <p className="page-subtitle">Ask a question and get answers sourced from your knowledge base.</p>
      </div>

      <div className="chat-scroll" ref={scrollRef}>
        <div className="chat-thread">
          {messages.length === 0 && (
            <div className="chat-empty">
              <h2>Hi I am Retriva</h2>
              <p>Ask me about office info</p>
            </div>
          )}

          {messages.map((m) =>
            m.role === "user" ? (
              <div className="chat-row user" key={m.id}>
                <div className="chat-avatar user">{initial}</div>
                <div className="chat-bubble-col">
                  <div className="chat-bubble user">{m.text}</div>
                </div>
              </div>
            ) : (
              <div className="chat-row assistant" key={m.id}>
                <div className="chat-avatar bot">
                  <Sparkles size={15} strokeWidth={2.2} />
                </div>
                <div className="chat-bubble-col">
                  {(m.status === "searching" || m.status === "analyzing") && (
                    <div className="agent-trace">
                      {AGENT_STEPS.map((step, idx) => {
                        const stepIdx = AGENT_STEPS.findIndex((s) => s.key === m.status);
                        const state =
                          idx < stepIdx ? "done" : idx === stepIdx ? "active" : "pending";
                        const Icon = step.icon;
                        return (
                          <div className={`agent-step ${state}`} key={step.key}>
                            <span className="agent-step-icon">
                              {state === "done" && <CheckCircle2 size={15} strokeWidth={2.2} />}
                              {state === "active" && <span className="agent-step-spinner" />}
                              {state === "pending" && <CircleDashed size={15} strokeWidth={2} />}
                            </span>
                            {step.label}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {m.status === "error" && (
                    <div className="chat-bubble assistant error">{m.error}</div>
                  )}

                  {m.status === "done" && m.results && m.results.length === 0 && (
                    <div className="chat-bubble assistant empty">
                      No matching results found in the knowledge base for that question.
                    </div>
                  )}

                  {m.status === "done" && m.results && m.results.length > 0 && (
                    <div className="chat-bubble assistant">
                      <div className="chat-answer-list">
                        {m.results.map((r, i) => (
                          <div className="chat-answer-item" key={i}>
                            <span className="chat-answer-source">
                              <FileText size={13} strokeWidth={2} />
                              {r.document_title || "Untitled document"}
                            </span>
                            <p className="chat-answer-text">{r.chunk_text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <div className="chat-composer">
        <form className="chat-composer-inner" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Ask a question about your documents..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={busy}
          />
          <button type="submit" className="chat-send-btn" disabled={busy || !query.trim()}>
            <ArrowUp size={16} strokeWidth={2.4} />
          </button>
        </form>
        <p className="chat-composer-hint">Answers are generated from your organization's uploaded documents.</p>
      </div>
    </div>
  );
}
