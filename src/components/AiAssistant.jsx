import { useEffect, useId, useRef, useState } from "react";
import { aiAssistant } from "../lib/aiConfig.js";

function isEnabled() {
  const envFlag = import.meta.env.VITE_AI_ASSISTANT_ENABLED;
  if (envFlag === "false" || envFlag === "0") return false;
  if (envFlag === "true" || envFlag === "1") return true;
  return aiAssistant.enabled;
}

function createSessionId() {
  try {
    const existing = sessionStorage.getItem("km_ai_session");
    if (existing) return existing;
    const id = crypto.randomUUID?.() || `km-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    sessionStorage.setItem("km_ai_session", id);
    return id;
  } catch {
    return `km-${Date.now()}`;
  }
}

function pushAiEvent(event, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState(() => [
    { id: "welcome", role: "assistant", content: aiAssistant.welcomeMessage },
  ]);
  const sessionIdRef = useRef(createSessionId());
  const listRef = useRef(null);
  const inputRef = useRef(null);
  const titleId = useId();
  const enabled = isEnabled();

  useEffect(() => {
    if (!open) return undefined;
    const timer = window.setTimeout(() => inputRef.current?.focus(), 120);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, busy, open]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!enabled) return null;

  const toggle = () => {
    setOpen((current) => {
      const next = !current;
      pushAiEvent(next ? "ai_assistant_open" : "ai_assistant_close");
      return next;
    });
  };

  const send = async (rawText) => {
    const text = (rawText ?? input).trim();
    if (!text || busy) return;

    const userMessage = { id: `u-${Date.now()}`, role: "user", content: text };
    const nextMessages = [...messages, userMessage].slice(-aiAssistant.maxMessages);
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    pushAiEvent("ai_assistant_message", { page_path: window.location.pathname });

    try {
      const history = nextMessages
        .filter((item) => item.role === "user" || item.role === "assistant")
        .map(({ role, content }) => ({ role, content }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          sessionId: sessionIdRef.current,
          page: window.location.pathname,
        }),
      });

      const data = await response.json().catch(() => ({}));
      const reply =
        (typeof data.reply === "string" && data.reply.trim()) ||
        (typeof data.message === "string" && data.message.trim()) ||
        (response.status === 503
          ? aiAssistant.offlineMessage
          : "Не вдалося отримати відповідь. Спробуйте ще раз або залиште заявку на сайті.");

      setMessages((current) => [
        ...current,
        { id: `a-${Date.now()}`, role: "assistant", content: reply },
      ]);
    } catch (error) {
      console.warn("AI assistant request failed", error);
      setMessages((current) => [
        ...current,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: aiAssistant.offlineMessage,
        },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    send();
  };

  return (
    <div className={`ai-assistant${open ? " is-open" : ""}`} data-ai-assistant>
      {open ? (
        <section
          className="ai-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
        >
          <header className="ai-panel-header">
            <div className="ai-panel-identity">
              <span className="ai-panel-avatar" aria-hidden="true">
                AI
              </span>
              <div>
                <h2 id={titleId} className="ai-panel-title">
                  {aiAssistant.name}
                </h2>
                <p className="ai-panel-subtitle">{aiAssistant.subtitle}</p>
              </div>
            </div>
            <button
              type="button"
              className="ai-panel-close"
              onClick={() => setOpen(false)}
              aria-label="Закрити чат"
            >
              ×
            </button>
          </header>

          <div className="ai-panel-messages" ref={listRef} aria-live="polite">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`ai-bubble ai-bubble-${message.role === "user" ? "user" : "assistant"}`}
              >
                {message.content}
              </div>
            ))}
            {busy ? (
              <div className="ai-bubble ai-bubble-assistant ai-bubble-typing" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            ) : null}
            {!busy && messages.length <= 1 ? (
              <div className="ai-suggestions">
                {aiAssistant.suggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    className="ai-suggestion"
                    onClick={() => send(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <form className="ai-panel-form" onSubmit={onSubmit}>
            <label className="visually-hidden" htmlFor="ai-assistant-input">
              Ваше повідомлення
            </label>
            <input
              id="ai-assistant-input"
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={aiAssistant.inputPlaceholder}
              autoComplete="off"
              maxLength={1000}
              disabled={busy}
            />
            <button
              type="submit"
              className="ai-send"
              disabled={busy || !input.trim()}
              aria-label="Надіслати"
            >
              →
            </button>
          </form>
        </section>
      ) : null}

      <button
        type="button"
        className="ai-fab"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? "Закрити AI-консультанта" : "Відкрити AI-консультанта"}
      >
        <span className="ai-fab-icon" aria-hidden="true">
          {open ? "×" : "AI"}
        </span>
        <span className="ai-fab-label">{open ? "Закрити" : "Питання?"}</span>
      </button>
    </div>
  );
}
