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
import { GlitchText } from "@/components/GlitchText";
import { Loader2, Send, Plus, MessageSquare } from "lucide-react";

export default function Chat() {
  const { getToken } = useAuth();
  const queryClient = useQueryClient();
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [inputMsg, setInputMsg] = useState("");
  const [streamingContent, setStreamingContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: conversations, refetch: refetchConvs, isLoading: isLoadingConvs } = useListOpenaiConversations();
  const createConv = useCreateOpenaiConversation();
  
  const { data: messages = [], isLoading: isLoadingMsgs } = useListOpenaiMessages(
    activeConvId ?? 0,
    { query: { enabled: !!activeConvId, queryKey: ["listOpenaiMessages", activeConvId ?? 0] } }
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  // Set initial conversation if none selected
  useEffect(() => {
    if (conversations && conversations.length > 0 && !activeConvId) {
      setActiveConvId(conversations[0].id);
    }
  }, [conversations, activeConvId]);

  const handleNewChat = () => {
    createConv.mutate(
      { data: { title: "New session" } }, 
      {
        onSuccess: (conv) => {
          setActiveConvId(conv.id);
          refetchConvs();
        }
      }
    );
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim() || !activeConvId || isStreaming) return;
    
    const userMsg = inputMsg;
    setInputMsg("");
    setIsStreaming(true);
    setStreamingContent("");
    
    try {
      const token = await getToken();
      const response = await fetch(`/api/openai/conversations/${activeConvId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: userMsg }),
      });
      
      if (!response.body) throw new Error("No response body");
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = "";
      
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");
          
          for (const line of lines) {
            if (line.startsWith("data: ") && line !== "data: [DONE]") {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.content) {
                  text += data.content;
                  setStreamingContent(text);
                }
              } catch (e) {
                console.error("Error parsing SSE line", e);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsStreaming(false);
      setStreamingContent("");
      if (activeConvId) {
        queryClient.invalidateQueries({ queryKey: getListOpenaiMessagesQueryKey(activeConvId) });
      }
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-black text-white crt-effect font-mono">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 flex flex-col bg-black/80">
        <div className="p-6 border-b border-white/10">
          <Link href="/dashboard" className="text-white/50 hover:text-white transition-colors mb-6 block" data-testid="link-back">
            &lt; BACK
          </Link>
          <GlitchText text="void.chat" as="h1" className="text-xl font-bold tracking-widest" />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
          <button 
            onClick={handleNewChat}
            disabled={createConv.isPending}
            className="flex items-center gap-2 w-full p-3 border border-white/20 hover:bg-white/10 transition-colors text-left text-sm disabled:opacity-50"
            data-testid="button-new-chat"
          >
            <Plus size={16} /> new conversation
          </button>
          
          <div className="mt-4 space-y-1">
            {isLoadingConvs ? (
              <div className="p-4 text-center text-white/50">
                <Loader2 className="animate-spin mx-auto" />
              </div>
            ) : (
              conversations?.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`flex items-center gap-2 w-full p-3 border text-left text-sm truncate transition-colors ${activeConvId === conv.id ? 'border-white bg-white/5' : 'border-transparent hover:border-white/10 hover:bg-white/5'}`}
                  data-testid={`button-chat-${conv.id}`}
                >
                  <MessageSquare size={14} className="shrink-0 opacity-50" />
                  <span className="truncate">{conv.title}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative max-w-4xl mx-auto w-full">
        {!activeConvId ? (
          <div className="flex-1 flex items-center justify-center text-white/30">
            select or start a conversation
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-32">
              {isLoadingMsgs ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-white/30" />
                </div>
              ) : (
                messages.map((msg: OpenaiMessage) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    data-testid={`message-${msg.id}`}
                  >
                    <div className={`max-w-[80%] p-4 leading-relaxed ${msg.role === 'user' ? 'bg-white/10 border border-white/20' : 'bg-transparent border border-white/10'}`}>
                      <div className="text-xs text-white/30 mb-2 uppercase">{msg.role}</div>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))
              )}
              
              {isStreaming && streamingContent && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-4 leading-relaxed bg-transparent border border-white/10">
                    <div className="text-xs text-white/30 mb-2 uppercase">assistant</div>
                    <div className="whitespace-pre-wrap">{streamingContent}<span className="animate-pulse">_</span></div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black to-transparent">
              <form onSubmit={handleSendMessage} className="relative max-w-3xl mx-auto flex items-end gap-4">
                <textarea
                  value={inputMsg}
                  onChange={(e) => setInputMsg(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="speak to the void..."
                  className="w-full bg-black border border-white/20 p-4 min-h-[60px] max-h-[200px] resize-none focus:outline-none focus:border-white transition-colors"
                  data-testid="input-chat"
                  disabled={isStreaming}
                />
                <button
                  type="submit"
                  disabled={!inputMsg.trim() || isStreaming}
                  className="shrink-0 p-4 border border-white/20 bg-white/5 hover:bg-white hover:text-black transition-colors disabled:opacity-50 disabled:hover:bg-white/5 disabled:hover:text-white"
                  data-testid="button-send-message"
                >
                  <Send size={24} />
                </button>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
