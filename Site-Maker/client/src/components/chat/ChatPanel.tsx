import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { useChat } from "@/hooks/use-conversations";
import type { Message } from "@shared/schema";

export function ChatPanel({ conversationId, messages }: { conversationId: number, messages: Message[] }) {
  const [input, setInput] = useState("");
  const chatMutation = useChat(conversationId);
  const [pendingMsg, setPendingMsg] = useState<string | null>(null);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, pendingMsg, chatMutation.isPending]);

  const handleSend = () => {
    if (!input.trim() || chatMutation.isPending) return;
    const text = input;
    setInput("");
    setPendingMsg(text);
    chatMutation.mutate(text, {
      onSettled: () => setPendingMsg(null)
    });
  };

  return (
    <div className="flex flex-col h-full bg-background w-full relative">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
        {messages.length === 0 && !pendingMsg && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white/40" />
            </div>
            <p className="text-sm">Tell me what website you want to build...</p>
          </div>
        )}

        {messages.map(m => <ChatMessage key={m.id} message={m} />)}
        
        {pendingMsg && <ChatMessage message={{ role: 'user', content: pendingMsg }} />}
        
        {chatMutation.isPending && (
          <div className="flex justify-start animate-pulse">
            <div className="bg-zinc-900 border border-white/5 text-zinc-300 rounded-2xl px-5 py-4 max-w-[85%] rounded-bl-sm flex space-x-3 items-center shadow-md">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="font-medium text-sm">Thinking and writing code...</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-background/80 backdrop-blur-md border-t border-border shrink-0">
        <div className="relative flex items-end bg-card border border-border rounded-2xl shadow-inner focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all overflow-hidden">
          <textarea
            className="w-full bg-transparent px-5 py-4 max-h-40 min-h-[56px] outline-none resize-none text-sm placeholder:text-muted-foreground"
            placeholder="Describe what you want to build or change..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            className="m-2 p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:scale-100 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/25"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground mt-3 font-medium tracking-wide">
          AI generated code may contain errors. Please verify.
        </p>
      </div>
    </div>
  );
}
