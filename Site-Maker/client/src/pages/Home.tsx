import { Sparkles, Plus, Loader2 } from "lucide-react";
import { useCreateConversation } from "@/hooks/use-conversations";
import { useLocation } from "wouter";

export default function Home() {
  const createMutation = useCreateConversation();
  const [, setLocation] = useLocation();

  const handleStart = () => {
    createMutation.mutate("New Website", {
      onSuccess: (data) => setLocation(`/project/${data.id}`)
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-4 animate-fade-in bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background">
      <div className="w-24 h-24 mb-10 rounded-3xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-[0_0_60px_-15px_rgba(99,102,241,0.5)] rotate-3">
        <Sparkles className="w-12 h-12 text-white -rotate-3" />
      </div>
      
      <h1 className="text-4xl md:text-6xl font-bold mb-6 font-display text-transparent bg-clip-text bg-gradient-to-r from-white via-white/90 to-white/50 tracking-tight">
        What do you want to build?
      </h1>
      
      <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed">
        Start a new conversation and let our AI generate your website in real-time. 
        Full HTML, CSS, and interactive JavaScript supported.
      </p>
      
      <button
        onClick={handleStart}
        disabled={createMutation.isPending}
        className="group relative px-8 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:scale-105 active:scale-95 transition-all duration-300 disabled:opacity-50 disabled:scale-100 flex items-center space-x-3 shadow-2xl shadow-white/10 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
        {createMutation.isPending ? (
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        ) : (
          <Plus className="w-5 h-5 text-primary" />
        )}
        <span>Start a New Project</span>
      </button>

      {/* Decorative background grid */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none" />
    </div>
  );
}
