import { Link, useLocation } from "wouter";
import { Plus, Trash2, Code, Loader2, Sparkles } from "lucide-react";
import { useConversations, useCreateConversation, useDeleteConversation } from "@/hooks/use-conversations";

export function SidebarContent({ onClose }: { onClose?: () => void }) {
  const [location, setLocation] = useLocation();
  const { data: conversations, isLoading } = useConversations();
  const createMutation = useCreateConversation();
  const deleteMutation = useDeleteConversation();

  const handleCreate = () => {
    createMutation.mutate("Untitled Project", {
      onSuccess: (data) => {
        setLocation(`/project/${data.id}`);
        onClose?.();
      }
    });
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          if (location === `/project/${id}`) {
            setLocation("/");
          }
        }
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-card/40 backdrop-blur-xl border-r border-border text-foreground">
      {/* Header */}
      <div className="p-6 shrink-0 flex items-center space-x-3 cursor-pointer" onClick={() => { setLocation("/"); onClose?.(); }}>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
          <Code className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
          AI Builder
        </span>
      </div>

      {/* New Project Button */}
      <div className="px-4 pb-4 shrink-0">
        <button
          onClick={handleCreate}
          disabled={createMutation.isPending}
          className="w-full py-3.5 px-4 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary font-semibold rounded-xl flex items-center justify-center space-x-2 transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm"
        >
          {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>New Project</span>
        </button>
      </div>

      <div className="px-6 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
        Your Projects
      </div>

      {/* Project List */}
      <div className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
        {isLoading ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map(i => <div key={i} className="h-12 bg-white/5 rounded-xl animate-pulse" />)}
          </div>
        ) : conversations?.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground opacity-60 mt-10 space-y-3">
            <Sparkles className="w-8 h-8" />
            <p className="text-sm">No projects yet.<br/>Create one to start building.</p>
          </div>
        ) : (
          conversations?.map((p) => {
            const isActive = location === `/project/${p.id}`;
            return (
              <Link 
                key={p.id} 
                href={`/project/${p.id}`}
                onClick={onClose}
                className={`
                  group flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200
                  ${isActive 
                    ? 'bg-primary/15 text-primary-foreground shadow-sm shadow-primary/5' 
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'}
                `}
              >
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-primary' : 'bg-zinc-700 group-hover:bg-zinc-500'} transition-colors`} />
                  <span className="truncate font-medium text-sm">
                    {p.title || "Untitled Project"}
                  </span>
                </div>
                <button
                  onClick={(e) => handleDelete(e, p.id)}
                  disabled={deleteMutation.isPending}
                  className={`
                    p-1.5 rounded-lg transition-all
                    ${isActive ? 'text-primary-foreground/60 hover:text-white hover:bg-white/20' : 'text-zinc-500 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10'}
                  `}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
