import { useState, useEffect } from "react";
import { SidebarContent } from "./Sidebar";
import { Menu, Code } from "lucide-react";
import { useLocation } from "wouter";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  // Close mobile menu on navigation
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30 selection:text-white">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 shrink-0 z-10 relative shadow-2xl">
        <SidebarContent />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative z-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
              <Code className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-semibold text-lg">AI Builder</span>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)} 
            className="p-2 -mr-2 text-zinc-400 hover:text-white transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fade-in">
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsMobileMenuOpen(false)} 
          />
          <div className="relative w-[85%] max-w-sm h-full shadow-2xl animate-slide-in-right">
             <SidebarContent onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
