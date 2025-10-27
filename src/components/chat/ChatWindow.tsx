import { useEffect, useRef } from 'react';
import { Bot, User, MessageSquare, Sparkles } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useChatStore } from '@/store/chatStore';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

export const ChatWindow = () => {
  const { messages, currentChatId, addMessage } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentChatId) return;

    // Subscribe to new messages in real-time
    const channel = supabase
      .channel(`messages:${currentChatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${currentChatId}`
        },
        (payload) => {
          addMessage(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentChatId]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const calculateMessageWidth = (text: string) => {
    const charCount = text.length;
    
    if (charCount < 30) return 'max-w-[300px]';
    if (charCount < 80) return 'max-w-[400px]';
    if (charCount < 150) return 'max-w-[500px]';
    if (charCount < 250) return 'max-w-[600px]';
    return 'max-w-[700px]';
  };

  if (!currentChatId) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="relative mb-6">
            <div className="absolute -inset-4 bg-primary/10 rounded-full blur-xl"></div>
            <MessageSquare className="relative mx-auto h-20 w-20 text-primary" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
            Ready to Chat?
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            Start a new conversation to begin exploring with AI. Ask questions, get help, or discuss anything you'd like.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Intelligent conversations await</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 rounded-full bg-primary/10 p-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Start the Conversation</h3>
            <p className="text-muted-foreground max-w-sm">
              Send your first message to begin chatting with your AI assistant.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-4 group animate-in fade-in duration-300",
                message.role === 'user' && "flex-row-reverse"
              )}
            >
              {/* Avatar */}
              <div className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2",
                message.role === 'user' 
                  ? "bg-primary text-primary-foreground border-primary/20" 
                  : "bg-primary/10 text-primary border-primary/10"
              )}>
                {message.role === 'user' ? (
                  <User className="h-5 w-5" />
                ) : (
                  <Bot className="h-5 w-5" />
                )}
              </div>

              {/* Message Content */}
              <div className={cn(
                "flex-1 space-y-2",
                calculateMessageWidth(message.text)
              )}>
                <div className="flex items-center gap-3 mb-1">
                  <p className="text-sm font-medium text-foreground/80">
                    {message.role === 'user' ? 'You' : 'AI Assistant'}
                  </p>
                  <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatMessageTime(message.created_at)}
                  </span>
                </div>
                
                <div className={cn(
                  "rounded-2xl p-4 transition-all duration-200 border w-full",
                  message.role === 'user' 
                    ? cn(
                        "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground",
                        "rounded-br-md shadow-primary/10 border-primary/30"
                      )
                    : cn(
                        "bg-card text-card-foreground",
                        "rounded-bl-md shadow-sm border-border/50"
                      )
                )}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                    {message.text}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </ScrollArea>
  );
};