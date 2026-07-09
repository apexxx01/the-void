import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListOpenaiConversations,
  useCreateOpenaiConversation,
  useListOpenaiMessages,
  getListOpenaiMessagesQueryKey,
  getListOpenaiConversationsQueryKey,
  OpenaiMessage,
} from "@workspace/api-client-react";

const STARTERS = [
  "i've been feeling really overwhelmed lately...",
  "i don't know how to talk about this, but...",
  "i feel like no one really understands me.",
  "i've been having dark thoughts and i need to talk.",
  "i'm struggling to find a reason to keep going.",
  "can you just listen? i need to say something out loud.",
];

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 py-2 pl-1">
      <span className="w-1.5 h-1.5 bg-white/25 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 bg-white/25 rounded-full animate-bounce" style={{ animationDelay: "160ms" }} />
      <span className="w-1.5 h-1.5 bg-white/25 rounded-full animate-bounce" style={{ animationDelay: "320ms" }} />
    </div>
  );
}

function VoidMessage({ content, isStreaming = false }: { content: string; isStreaming?: boolean }) {
  return (
    <div className="flex justify-start w-full message-appear">
      <div className="flex flex-col gap-1 max-w-[82%] md:max-w-[68%]">
        <span className="text-[9px] text-white/18 tracking-[0.45em] uppercase font-mono pl-3">void</span>
        <div className="border-l border-white/12 pl-3 text-white/65 font-mono text-sm leading-[1.85] whitespace-pre-wrap">
          {content}
          {isStreaming && <span className="animate-pulse text-white/40 ml-0.5">_</span>}
        </div>
      </div>
    </div>
  );
}

function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end w-full message-appear">
      <div className="flex flex-col items-end gap-1 max-w-[82%] md:max-w-[68%]">
        <span className="text-[9px] text-white/18 tracking-[0.45em] uppercase font-mono pr-3">you</span>
        <div className="bg-white/4 border border-white/10 px-4 py-3 text-white/70 font-mono text-sm leading-[1.85] whitespace-pre-wrap">
          {content}
        </div>
      </div>
    </div>
  );
}

function Message({ msg }: { msg: OpenaiMessage }) {
  if (msg.role === "user") return <UserMessage content={msg.content} />;
  return <VoidMessage content={msg.content} />;
}

export default function Chat() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [inputMsg, setInputMsg] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [pendingUserMsg, setPendingUserMsg] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const hasAutoSelected = useRef(false);

  const {
    data: conversations,
    refetch: refetchConvs,
    isLoading: isLoadingConvs,
  } = useListOpenaiConversations();

  const createConv = useCreateOpenaiConversation();

  const {
    data: messages = [],
    isLoading: isLoadingMsgs,
    refetch: refetchMessages,
  } = useListOpenaiMessages(activeConvId ?? 0, {
    query: {
      enabled: !!activeConvId,
      staleTime: 0,
      queryKey: getListOpenaiMessagesQueryKey(activeConvId ?? 0),
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent, pendingUserMsg]);

  useEffect(() => {
    if (!hasAutoSelected.current && conversations && conversations.length > 0) {
      hasAutoSelected.current = true;
      setActiveConvId(conversations[0].id);
    }
  }, [conversations]);

  const handleNewChat = () => {
    createConv.mutate(
      { data: { title: `void session` } },
      {
        onSuccess: (conv) => {
          setActiveConvId(conv.id);
          setSidebarOpen(false);
          queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
        },
      }
    );
  };

  const handleSelectConv = (id: number) => {
    if (id === activeConvId) return;
    setActiveConvId(id);
    setSidebarOpen(false);
    setStreamingContent("");
    setPendingUserMsg(null);
    setError(null);
  };

  const handleSend = async (text?: string) => {
    const msg = (text ?? inputMsg).trim();
    if (!msg || !activeConvId || isStreaming) return;

    setInputMsg("");
    setIsStreaming(true);
    setStreamingContent("");
    setPendingUserMsg(msg);
    setError(null);

    try {
      const token = await getToken();
      const response = await fetch(
        `/api/openai/conversations/${activeConvId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ content: msg }),
        }
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                accumulated += data.content;
                setStreamingContent(accumulated);
              }
            } catch {
              // ignore malformed SSE frames
            }
          }
        }
      }
    } catch (err) {
      setError("the signal was lost. try again.");
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      setPendingUserMsg(null);
      // Use refetch() directly — query key matches automatically
      await refetchMessages();
      refetchConvs();
    }
  };

  const handleStarterClick = async (starter: string) => {
    if (!activeConvId) {
      createConv.mutate(
        { data: { title: "void session" } },
        {
          onSuccess: async (conv) => {
            setActiveConvId(conv.id);
            queryClient.invalidateQueries({ queryKey: getListOpenaiConversationsQueryKey() });
            // Small delay so the new conv ID is registered in state
            await new Promise((r) => setTimeout(r, 80));
            handleSend(starter);
          },
        }
      );
    } else {
      handleSend(starter);
    }
  };

  const isEmpty = !isLoadingMsgs && messages.length === 0 && !isStreaming && !pendingUserMsg;

  return (
    <div className="flex h-[100dvh] w-full bg-black text-white font-mono overflow-hidden relative">

      {/* Soft atmospheric gradient — no distracting particles in chat */}
      <div className="fixed inset-0 pointer-events-none" style={{
        zIndex: 0,
        background: "radial-gradient(ellipse 80% 80% at 50% 100%, rgba(255,255,255,0.015) 0%, transparent 70%)",
      }} />

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-30
          w-64 flex flex-col
          border-r border-white/6 bg-black
          transition-transform duration-500 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-5 border-b border-white/6 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-white/25 hover:text-white/55 text-[10px] tracking-[0.4em] uppercase block mb-3 transition-colors duration-300"
            >
              ← back
            </Link>
            <div className="text-white/40 text-xs tracking-[0.3em]">void.chat</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white/25 hover:text-white/60 text-lg transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-4 border-b border-white/6">
          <button
            onClick={handleNewChat}
            disabled={createConv.isPending}
            className="w-full py-2.5 border border-white/12 hover:border-white/30 text-white/35 hover:text-white/65 text-[10px] tracking-[0.4em] uppercase transition-all duration-400 disabled:opacity-25"
          >
            + new session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {isLoadingConvs ? (
            <div className="px-4 py-6 text-white/20 text-[10px] tracking-widest animate-pulse text-center">
              loading...
            </div>
          ) : conversations?.length === 0 ? (
            <div className="px-4 py-6 text-white/15 text-[10px] text-center">no sessions yet</div>
          ) : (
            conversations?.map((conv) => (
              <button
                key={conv.id}
                onClick={() => handleSelectConv(conv.id)}
                className={`w-full text-left px-4 py-3 text-[11px] truncate transition-all duration-300 border-l-2 ${
                  activeConvId === conv.id
                    ? "text-white/65 bg-white/4 border-white/30"
                    : "text-white/22 hover:text-white/45 hover:bg-white/2 border-transparent"
                }`}
              >
                {conv.title || "untitled session"}
              </button>
            ))
          )}
        </div>

        <div className="p-5 border-t border-white/6">
          <div className="text-[9px] text-white/15 tracking-[0.4em] uppercase mb-2.5">signal</div>
          <div className="flex gap-1">
            {[1,2,3,4,5].map((i) => (
              <div
                key={i}
                className="flex-1 h-0.5 rounded-full transition-opacity duration-1000"
                style={{
                  background: i <= 4 ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)",
                  opacity: i <= 4 ? 1 : 0.4,
                }}
              />
            ))}
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main ── */}
      <main className="relative flex-1 flex flex-col min-w-0 z-10">

        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/6 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-white/25 hover:text-white/55 text-[10px] tracking-[0.4em] uppercase transition-colors"
          >
            ≡ sessions
          </button>
          <div className="hidden md:block text-white/20 text-[10px] tracking-[0.4em] uppercase">
            {conversations?.find(c => c.id === activeConvId)?.title ?? "void.chat"}
          </div>
          <div className="text-[9px] tracking-[0.4em] uppercase">
            {isStreaming
              ? <span className="text-white/35 animate-pulse">receiving signal</span>
              : <span className="text-white/18">connected</span>
            }
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-xl mx-auto px-6 py-10 space-y-10 pb-44">

            {/* Empty state */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center min-h-[52vh] text-center fade-in-slow space-y-10">
                <div>
                  <div className="text-white/8 text-6xl font-bold tracking-tighter mb-5 select-none">void.</div>
                  <p className="text-white/20 text-[10px] font-mono tracking-[0.4em] uppercase">
                    the void is listening
                  </p>
                </div>
                <div className="w-full space-y-2.5">
                  <div className="text-white/12 text-[9px] tracking-[0.55em] uppercase mb-5">
                    begin with a signal
                  </div>
                  {STARTERS.map((s, i) => (
                    <button
                      key={s}
                      onClick={() => handleStarterClick(s)}
                      className="w-full text-left text-white/22 hover:text-white/50 text-xs font-mono py-3 px-4 border border-white/6 hover:border-white/18 transition-all duration-500 leading-relaxed fade-in"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      <span className="text-white/15 mr-2">›</span>{s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoadingMsgs && (
              <div className="flex justify-center py-24">
                <div className="text-white/18 text-[10px] tracking-[0.4em] uppercase animate-pulse">
                  receiving...
                </div>
              </div>
            )}

            {messages.map((msg: OpenaiMessage) => (
              <Message key={msg.id} msg={msg} />
            ))}

            {/* Optimistic user message while streaming */}
            {pendingUserMsg && <UserMessage content={pendingUserMsg} />}

            {/* Streaming AI response */}
            {isStreaming && !streamingContent && <TypingIndicator />}
            {isStreaming && streamingContent && (
              <VoidMessage content={streamingContent} isStreaming />
            )}

            {error && (
              <div className="text-white/30 text-xs font-mono text-center py-2 fade-in">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
          <div
            className="px-6 pt-16 pb-7 pointer-events-auto"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,1) 55%, transparent)" }}
          >
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="max-w-xl mx-auto"
            >
              <div className="flex items-end gap-0 border border-white/12 focus-within:border-white/30 bg-black transition-colors duration-500">
                <textarea
                  ref={textareaRef}
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder="speak to the void..."
                  rows={1}
                  className="flex-1 bg-transparent px-4 py-4 text-sm text-white/65 placeholder:text-white/18 resize-none focus:outline-none leading-relaxed min-h-[52px] max-h-[140px]"
                  style={{ fieldSizing: "content" } as React.CSSProperties}
                  disabled={isStreaming}
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim() || isStreaming}
                  className="shrink-0 px-5 py-4 text-white/28 hover:text-white/65 disabled:opacity-15 transition-colors duration-300 text-[10px] tracking-[0.35em] uppercase"
                >
                  {isStreaming ? "···" : "send"}
                </button>
              </div>
              <div className="mt-2.5 text-center text-white/10 text-[9px] tracking-[0.4em] uppercase">
                shift+enter for newline · private
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}