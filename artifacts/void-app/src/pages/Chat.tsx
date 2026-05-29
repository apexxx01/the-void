import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListOpenaiConversations,
  useCreateOpenaiConversation,
  useListOpenaiMessages,
  getListOpenaiMessagesQueryKey,
  OpenaiMessage,
} from "@workspace/api-client-react";
import { ParticleField } from "@/components/ParticleField";

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
    <div className="flex items-center gap-1 px-1 py-2 text-white/30">
      <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
      <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
      <span className="w-1.5 h-1.5 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
    </div>
  );
}

function Message({ msg, isNew = false }: { msg: OpenaiMessage; isNew?: boolean }) {
  const isUser = msg.role === "user";
  return (
    <div
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} message-appear`}
      data-testid={`message-${msg.id}`}
    >
      {!isUser && (
        <div className="flex flex-col items-start max-w-[78%] md:max-w-[65%] gap-1">
          <span className="text-[10px] text-white/20 tracking-[0.3em] uppercase font-mono pl-1">void</span>
          <div className="text-white/75 font-mono text-sm leading-relaxed whitespace-pre-wrap pl-1 border-l border-white/10">
            <span className="text-white/20 pr-2 select-none">&gt;</span>
            {msg.content}
          </div>
        </div>
      )}
      {isUser && (
        <div className="flex flex-col items-end max-w-[78%] md:max-w-[65%] gap-1">
          <span className="text-[10px] text-white/20 tracking-[0.3em] uppercase font-mono pr-1">you</span>
          <div className="bg-white/5 border border-white/15 px-4 py-3 text-white/80 font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {msg.content}
          </div>
        </div>
      )}
    </div>
  );
}

function StreamingMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-start w-full">
      <div className="flex flex-col items-start max-w-[78%] md:max-w-[65%] gap-1">
        <span className="text-[10px] text-white/20 tracking-[0.3em] uppercase font-mono pl-1">void</span>
        <div className="text-white/75 font-mono text-sm leading-relaxed whitespace-pre-wrap pl-1 border-l border-white/10">
          <span className="text-white/20 pr-2 select-none">&gt;</span>
          {content}
          <span className="animate-pulse opacity-60">_</span>
        </div>
      </div>
    </div>
  );
}

export default function Chat() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [inputMsg, setInputMsg] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { data: conversations, refetch: refetchConvs, isLoading: isLoadingConvs } =
    useListOpenaiConversations();
  const createConv = useCreateOpenaiConversation();
  const { data: messages = [], isLoading: isLoadingMsgs } = useListOpenaiMessages(
    activeConvId ?? 0,
    { query: { enabled: !!activeConvId, queryKey: ["listOpenaiMessages", activeConvId ?? 0] } }
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  const handleNewChat = () => {
    createConv.mutate(
      { data: { title: `session ${Date.now()}` } },
      {
        onSuccess: (conv) => {
          setActiveConvId(conv.id);
          setSidebarOpen(false);
          refetchConvs();
        },
      }
    );
  };

  const handleSend = async (text?: string) => {
    const msg = text ?? inputMsg;
    if (!msg.trim() || !activeConvId || isStreaming) return;
    setInputMsg("");
    setIsStreaming(true);
    setStreamingContent("");

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
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        for (const line of chunk.split("\n")) {
          if (line.startsWith("data: ") && line !== "data: [DONE]") {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.content) {
                accumulated += data.content;
                setStreamingContent(accumulated);
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      console.error("Chat error", err);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      if (activeConvId) {
        queryClient.invalidateQueries({
          queryKey: getListOpenaiMessagesQueryKey(activeConvId),
        });
      }
    }
  };

  const handleStarterClick = (starter: string) => {
    if (!activeConvId) {
      createConv.mutate(
        { data: { title: "session" } },
        {
          onSuccess: async (conv) => {
            setActiveConvId(conv.id);
            refetchConvs();
            await new Promise((r) => setTimeout(r, 300));
            handleSend(starter);
          },
        }
      );
    } else {
      handleSend(starter);
    }
  };

  const isEmpty = !isLoadingMsgs && messages.length === 0 && !isStreaming;

  return (
    <div className="flex h-[100dvh] w-full bg-black text-white font-mono overflow-hidden relative">
      <ParticleField count={30} />

      {/* Deep vignette */}
      <div className="fixed inset-0 pointer-events-none z-[1]" style={{
        background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
      }} />

      {/* ── Sidebar ── */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-30
          w-72 flex flex-col bg-black border-r border-white/8
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-5 border-b border-white/8 flex items-center justify-between">
          <div>
            <Link
              href="/dashboard"
              className="text-white/30 hover:text-white/70 text-xs tracking-widest block mb-3 transition-colors"
              data-testid="link-back"
            >
              &lt; back
            </Link>
            <div className="text-white/60 text-sm tracking-[0.3em]">void.chat</div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-white/30 hover:text-white text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-4 border-b border-white/8">
          <button
            onClick={handleNewChat}
            disabled={createConv.isPending}
            className="w-full py-3 border border-white/20 hover:border-white/50 text-white/50 hover:text-white text-xs tracking-[0.3em] transition-all disabled:opacity-30"
            data-testid="button-new-chat"
          >
            + new session
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {conversations?.map((conv) => (
            <button
              key={conv.id}
              onClick={() => { setActiveConvId(conv.id); setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-3 text-xs truncate transition-all duration-200 ${
                activeConvId === conv.id
                  ? "text-white bg-white/6 border-l border-white/50"
                  : "text-white/30 hover:text-white/60 hover:bg-white/3"
              }`}
              data-testid={`button-chat-${conv.id}`}
            >
              <span className="text-white/20 mr-2">›</span>
              {conv.title || "untitled session"}
            </button>
          ))}
        </div>

        {/* Signal strength indicator */}
        <div className="p-4 border-t border-white/8">
          <div className="text-[10px] text-white/20 tracking-widest mb-2">CONNECTION</div>
          <div className="flex gap-1">
            {[1,2,3,4,5].map((i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-sm"
                style={{ background: i <= 4 ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.1)" }}
              />
            ))}
          </div>
        </div>
      </aside>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main chat area ── */}
      <main className="relative flex-1 flex flex-col min-w-0 z-10">

        {/* Topbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8 shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-white/30 hover:text-white text-sm tracking-widest"
          >
            ≡ sessions
          </button>
          <div className="hidden md:block text-white/20 text-xs tracking-[0.4em] uppercase">
            {conversations?.find(c => c.id === activeConvId)?.title || "void.chat"}
          </div>
          <div className="text-[10px] text-white/20 tracking-[0.3em] uppercase">
            {isStreaming ? (
              <span className="text-white/40 animate-pulse">transmitting...</span>
            ) : (
              "connected"
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 py-8 space-y-8 pb-40">

            {/* Empty state */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-10">
                <div>
                  <div className="text-white/10 text-5xl mb-4 font-bold tracking-tighter">void.</div>
                  <p className="text-white/20 text-xs font-mono tracking-widest">
                    the void is listening. begin when you are ready.
                  </p>
                </div>
                <div className="w-full space-y-3">
                  <div className="text-white/15 text-[10px] tracking-[0.5em] uppercase mb-4">
                    or begin with a signal
                  </div>
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStarterClick(s)}
                      className="w-full text-left text-white/25 hover:text-white/60 text-xs font-mono py-3 px-4 border border-white/8 hover:border-white/25 transition-all duration-300 leading-relaxed"
                    >
                      <span className="text-white/15 mr-2">&gt;</span>{s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isLoadingMsgs && (
              <div className="flex justify-center py-20">
                <div className="text-white/20 text-xs tracking-widest animate-pulse">
                  decrypting transmission...
                </div>
              </div>
            )}

            {messages.map((msg: OpenaiMessage) => (
              <Message key={msg.id} msg={msg} />
            ))}

            {isStreaming && !streamingContent && <TypingIndicator />}
            {isStreaming && streamingContent && (
              <StreamingMessage content={streamingContent} />
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="absolute bottom-0 left-0 right-0 z-20">
          <div
            className="px-6 pt-12 pb-6"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,1) 60%, transparent)" }}
          >
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex items-end gap-3 border border-white/15 focus-within:border-white/40 bg-black/80 backdrop-blur-sm transition-colors duration-300">
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
                  className="flex-1 bg-transparent px-4 py-4 text-sm text-white/80 placeholder:text-white/20 resize-none focus:outline-none leading-relaxed min-h-[52px] max-h-[160px]"
                  style={{ fieldSizing: "content" } as React.CSSProperties}
                  disabled={isStreaming}
                  data-testid="input-chat"
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim() || isStreaming}
                  className="shrink-0 px-5 py-4 text-white/40 hover:text-white disabled:opacity-20 transition-colors text-xs tracking-widest"
                  data-testid="button-send-message"
                >
                  {isStreaming ? "..." : "send"}
                </button>
              </div>
              <div className="mt-2 text-center text-white/10 text-[10px] tracking-widest">
                shift+enter for newline · everything is private
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
