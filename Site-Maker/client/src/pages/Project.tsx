import { useParams } from "wouter";
import { useState } from "react";
import { Loader2, MessageSquare, Layout } from "lucide-react";
import { useConversation } from "@/hooks/use-conversations";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { BrowserPreview } from "@/components/preview/BrowserPreview";

export default function Project() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0");
  
  const { data, isLoading, error } = useConversation(id);
  const [activeTab, setActiveTab] = useState<'chat' | 'preview'>('chat');

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center animate-fade-in space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading workspace...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-full flex items-center justify-center text-red-400">
        <div className="bg-red-500/10 p-6 rounded-2xl border border-red-500/20 text-center">
          <h2 className="text-xl font-bold mb-2">Project Not Found</h2>
          <p className="text-sm opacity-80">This project may have been deleted or never existed.</p>
        </div>
      </div>
    );
  }

  const { conversation, messages } = data;

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Mobile Tabs Header */}
      <div className="md:hidden flex border-b border-border bg-card shrink-0 px-2 pt-2 space-x-2">
        <button
          onClick={() => setActiveTab('chat')}
          className={`
            flex-1 py-3 px-4 text-sm font-semibold rounded-t-xl transition-all flex items-center justify-center space-x-2
            ${activeTab === 'chat' ? 'bg-background text-primary border-t border-l border-r border-border shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}
          `}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`
            flex-1 py-3 px-4 text-sm font-semibold rounded-t-xl transition-all flex items-center justify-center space-x-2
            ${activeTab === 'preview' ? 'bg-background text-primary border-t border-l border-r border-border shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}
          `}
        >
          <Layout className="w-4 h-4" />
          <span>Preview</span>
        </button>
      </div>

      {/* Split Pane Layout */}
      
      {/* Chat Panel - Left side on desktop */}
      <div className={`
        flex-1 md:w-[400px] md:min-w-[350px] md:max-w-[450px] md:border-r md:border-border overflow-hidden
        ${activeTab === 'chat' ? 'flex' : 'hidden md:flex'}
      `}>
        <ChatPanel conversationId={id} messages={messages} />
      </div>

      {/* Preview Panel - Right side on desktop */}
      <div className={`
        flex-1 overflow-hidden p-2 md:p-6 bg-zinc-950/50 relative
        ${activeTab === 'preview' ? 'flex' : 'hidden md:flex'}
      `}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent pointer-events-none" />
        <BrowserPreview code={conversation.currentCode} />
      </div>
    </div>
  );
}
