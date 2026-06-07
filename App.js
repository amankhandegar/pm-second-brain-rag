import { useState, useRef, useEffect } from "react";

const WEBHOOK_URL = "YOUR_N8N_WEBHOOK_URL_HERE";

const SUGGESTED_QUESTIONS = [
  "What did we decide about auto-remediation scope?",
  "What is our win rate against Tanium?",
  "What were the action items from Sprint 24 review?",
  "What did Vikram Singh say about the cost model?",
  "What are our Q3 2026 P0 priorities?",
  "What did customers say in the beta program?",
];

function SourceBadge({ source }) {
  const colors = {
    "01_PRD": { bg: "#E6F1FB", color: "#1A5FB4" },
    "02_Meeting": { bg: "#E1F5EE", color: "#0D7377" },
    "03_Stakeholder": { bg: "#EEEDFE", color: "#4A3B8C" },
    "04_AI_Roadmap": { bg: "#FFF3CD", color: "#8B5E00" },
    "05_Meeting": { bg: "#FDECEA", color: "#B5400A" },
    "06_Competitive": { bg: "#E8F5E0", color: "#2D6A0F" },
    "07_Decision": { bg: "#FCE8F3", color: "#8B0D5E" },
    "08_User": { bg: "#E6F1FB", color: "#1A5FB4" },
    "09_Sprint": { bg: "#E1F5EE", color: "#0D7377" },
    "10_Customer": { bg: "#EEEDFE", color: "#4A3B8C" },
  };

  const key = Object.keys(colors).find(k => source.startsWith(k));
  const style = colors[key] || { bg: "#F5F5F5", color: "#555" };

  const label = source
    .replace(/_/g, " ")
    .replace(/^\d+\s/, "")
    .replace("AI Features", "")
    .replace("AI Compliance Assistant", "PRD")
    .replace("2026", "")
    .trim();

  return (
    <span style={{
      display: "inline-block",
      fontSize: 11,
      fontWeight: 600,
      padding: "2px 8px",
      borderRadius: 10,
      background: style.bg,
      color: style.color,
      margin: "2px 3px 2px 0",
      border: `1px solid ${style.color}30`
    }}>
      📄 {label}
    </span>
  );
}

function Message({ msg }) {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <div style={{
          maxWidth: "70%",
          background: "#1A5FB4",
          color: "#fff",
          borderRadius: "16px 16px 4px 16px",
          padding: "10px 14px",
          fontSize: 13,
          lineHeight: 1.6
        }}>
          {msg.content}
        </div>
      </div>
    );
  }

  if (msg.role === "loading") {
    return (
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "flex-start" }}>
        <div style={{
          width: 32, height: 32, borderRadius: "50%",
          background: "linear-gradient(135deg, #1A5FB4, #0D7377)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, flexShrink: 0
        }}>🧠</div>
        <div style={{
          background: "#fff", border: "1px solid #e8e6e0",
          borderRadius: "4px 16px 16px 16px",
          padding: "12px 16px", display: "flex", gap: 6, alignItems: "center"
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 7, height: 7, borderRadius: "50%",
              background: "#1A5FB4", opacity: 0.4,
              animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`
            }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "flex-start" }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        background: "linear-gradient(135deg, #1A5FB4, #0D7377)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 14, flexShrink: 0
      }}>🧠</div>
      <div style={{ flex: 1 }}>
        <div style={{
          background: "#fff", border: "1px solid #e8e6e0",
          borderRadius: "4px 16px 16px 16px",
          padding: "12px 16px", fontSize: 13, lineHeight: 1.7,
          color: "#2a2a2a", whiteSpace: "pre-line"
        }}>
          {msg.content}
        </div>
        {msg.sources && msg.sources.length > 0 && (
          <div style={{ marginTop: 8, paddingLeft: 4 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 4 }}>
              Sources
            </div>
            {msg.sources.map((s, i) => <SourceBadge key={i} source={s} />)}
          </div>
        )}
        {msg.error && (
          <div style={{
            marginTop: 8, padding: "8px 12px",
            background: "#FDECEA", borderRadius: 8,
            fontSize: 12, color: "#B5400A"
          }}>
            ⚠️ {msg.error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I'm your PM Second Brain. I've read all your BigFix Compliance documents — PRDs, meeting notes, decision logs, competitive analysis, and more.\n\nAsk me anything about your work. I'll find the answer and tell you exactly which document it came from.",
      sources: []
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendQuestion = async (question) => {
    if (!question.trim() || loading) return;

    const userMsg = { role: "user", content: question };
    setMessages(prev => [...prev, userMsg, { role: "loading" }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question })
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      setMessages(prev => [
        ...prev.filter(m => m.role !== "loading"),
        {
          role: "assistant",
          content: data.answer || "I couldn't find an answer in my documents.",
          sources: data.sources || []
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev.filter(m => m.role !== "loading"),
        {
          role: "assistant",
          content: "I couldn't reach the Second Brain right now.",
          error: "Make sure your n8n Query workflow is published and the webhook URL is correct.",
          sources: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendQuestion(input);
    }
  };

  return (
    <div style={{
      fontFamily: "'DM Sans', system-ui, sans-serif",
      background: "#f7f6f3",
      height: "100vh",
      display: "flex",
      flexDirection: "column"
    }}>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>

      {/* Header */}
      <div style={{
        background: "#0f1923",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        gap: 12,
        flexShrink: 0
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "linear-gradient(135deg, #1A5FB4, #0D7377)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18
        }}>🧠</div>
        <div>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 15 }}>PM Second Brain</div>
          <div style={{ color: "#8899aa", fontSize: 11 }}>BigFix Compliance · 10 documents indexed · RAG powered by Gemini</div>
        </div>
        <div style={{
          marginLeft: "auto", background: "#1a2a3a",
          border: "1px solid #2a3a4a", borderRadius: 6,
          padding: "4px 10px", color: "#4a9fff", fontSize: 11, fontWeight: 500
        }}>
          ● Live
        </div>
      </div>

      {/* Suggested questions */}
      {messages.length === 1 && (
        <div style={{ padding: "12px 16px", flexShrink: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#aaa", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
            Try asking
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button key={i} onClick={() => sendQuestion(q)} style={{
                padding: "6px 12px", borderRadius: 16,
                border: "1px solid #e0ddd8", background: "#fff",
                fontSize: 12, color: "#555", cursor: "pointer",
                transition: "all 0.15s"
              }}
                onMouseEnter={e => { e.target.style.borderColor = "#1A5FB4"; e.target.style.color = "#1A5FB4"; }}
                onMouseLeave={e => { e.target.style.borderColor = "#e0ddd8"; e.target.style.color = "#555"; }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: "12px 16px",
        background: "#fff",
        borderTop: "1px solid #e8e6e0",
        flexShrink: 0
      }}>
        <div style={{
          display: "flex", gap: 8, alignItems: "flex-end",
          background: "#f7f6f3", borderRadius: 12,
          border: "1px solid #e0ddd8", padding: "8px 12px"
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask your Second Brain anything about your PM work..."
            disabled={loading}
            rows={1}
            style={{
              flex: 1, border: "none", background: "transparent",
              resize: "none", fontSize: 13, lineHeight: 1.5,
              color: "#2a2a2a", outline: "none", fontFamily: "inherit"
            }}
          />
          <button
            onClick={() => sendQuestion(input)}
            disabled={loading || !input.trim()}
            style={{
              width: 32, height: 32, borderRadius: "50%",
              background: loading || !input.trim() ? "#e0ddd8" : "#1A5FB4",
              border: "none", cursor: loading || !input.trim() ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, flexShrink: 0, transition: "background 0.15s"
            }}
          >
            {loading ? "⏳" : "↑"}
          </button>
        </div>
        <div style={{ fontSize: 10, color: "#bbb", textAlign: "center", marginTop: 6 }}>
          Press Enter to send · Answers sourced from your indexed documents
        </div>
      </div>
    </div>
  );
}
