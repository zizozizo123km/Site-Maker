import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Bot, User } from 'lucide-react';
import type { Message } from '@shared/schema';

export function ChatMessage({ message }: { message: Partial<Message> }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`
        flex max-w-[85%] rounded-2xl px-5 py-4 space-x-4
        ${isUser
          ? 'bg-primary text-primary-foreground rounded-br-sm shadow-lg shadow-primary/20'
          : 'bg-zinc-900 border border-white/5 text-zinc-100 rounded-bl-sm shadow-md'}
      `}>
        {!isUser && (
          <div className="shrink-0 w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mt-1">
            <Bot className="w-5 h-5 text-primary" />
          </div>
        )}
        
        <div className="overflow-hidden">
          {isUser && (
            <div className="flex items-center space-x-2 mb-1 text-primary-foreground/70 text-xs font-medium">
              <User className="w-3 h-3" />
              <span>You</span>
            </div>
          )}
          
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              p: (props) => <p className="text-sm mb-2" {...props} />,
              a: (props) => <a className="text-primary hover:text-primary/80 underline" {...props} />,
              code: (props) => <code className="bg-black/30 px-1.5 py-0.5 rounded text-xs font-mono" {...props} />,
              pre: (props) => <pre className="bg-black/50 border border-white/10 rounded-xl overflow-x-auto p-3 mb-2" {...props} />,
              ul: (props) => <ul className="list-disc list-inside mb-2 space-y-1" {...props} />,
              ol: (props) => <ol className="list-decimal list-inside mb-2 space-y-1" {...props} />,
              blockquote: (props) => <blockquote className="border-l-4 border-primary/50 pl-4 italic opacity-80 mb-2" {...props} />,
              h1: (props) => <h1 className="text-lg font-bold mb-2" {...props} />,
              h2: (props) => <h2 className="text-base font-bold mb-2" {...props} />,
              h3: (props) => <h3 className="text-sm font-bold mb-2" {...props} />,
            }}
          >
            {message.content || ""}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
