import { RefreshCw, ExternalLink, Lock, Monitor, Smartphone } from "lucide-react";
import { useState, useRef, useEffect } from "react";

const defaultHtml = `
  <!DOCTYPE html>
  <html>
    <head>
      <style>
        body {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: #ffffff;
          color: #a1a1aa;
        }
        .container { text-align: center; }
        h2 { font-weight: 500; margin-bottom: 8px; color: #71717a; font-size: 20px; }
        p { font-size: 14px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Live Preview</h2>
        <p>Your generated website will appear here.</p>
      </div>
    </body>
  </html>
`;

export function BrowserPreview({ code }: { code?: string | null }) {
  const [key, setKey] = useState(0);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  
  const handleOpenInNewTab = () => {
    if (!code) return;
    const blob = new Blob([code], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex flex-col w-full h-full bg-zinc-950/80 rounded-2xl border border-white/10 shadow-2xl overflow-hidden backdrop-blur-xl animate-fade-in">
      {/* Browser Chrome */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80 shadow-sm shadow-red-500/20" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80 shadow-sm shadow-yellow-500/20" />
            <div className="w-3 h-3 rounded-full bg-green-500/80 shadow-sm shadow-green-500/20" />
          </div>
          
          <div className="hidden lg:flex bg-black/40 rounded-lg p-1 space-x-1 border border-white/5">
             <button 
               onClick={() => setDevice('desktop')}
               className={`p-1.5 rounded-md transition-colors ${device === 'desktop' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               <Monitor className="w-3.5 h-3.5" />
             </button>
             <button 
               onClick={() => setDevice('mobile')}
               className={`p-1.5 rounded-md transition-colors ${device === 'mobile' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               <Smartphone className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>

        <div className="flex-1 max-w-md mx-4">
          <div className="bg-black/40 rounded-md py-1.5 px-3 text-center text-xs text-zinc-400 font-mono flex items-center justify-center space-x-2 border border-white/5 shadow-inner">
            <Lock className="w-3 h-3 text-emerald-500/80" />
            <span className="truncate">localhost:preview</span>
          </div>
        </div>

        <div className="flex space-x-2">
          <button 
            onClick={() => setKey(k => k + 1)} 
            className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 transition-colors"
            title="Refresh preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button 
            onClick={handleOpenInNewTab} 
            disabled={!code}
            className="p-1.5 rounded-md hover:bg-white/10 text-zinc-400 transition-colors disabled:opacity-50"
            title="Open in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Iframe content */}
      <div className={`flex-1 bg-zinc-950 flex items-center justify-center relative ${device === 'mobile' ? 'p-4 md:p-8' : ''}`}>
        <div className={`
          relative bg-white h-full w-full transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${device === 'mobile' ? 'max-w-[375px] max-h-[812px] rounded-[3rem] border-[8px] border-zinc-900 shadow-2xl overflow-hidden' : ''}
        `}>
          <iframe
            key={key}
            srcDoc={code || defaultHtml}
            className="absolute inset-0 w-full h-full border-0 bg-white"
            title="Preview"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    </div>
  );
}
