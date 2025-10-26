import { useEffect, useRef } from 'react';
import { Bot, User } from 'lucide-react';
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

  if (!currentChatId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <MessageSquare className="mx-auto h-16 w-16 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-semibold">Start a New Chat</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Click "New Chat" to begin a conversation
          </p>
        </div>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full" ref={scrollRef}>
      <div className="mx-auto max-w-3xl space-y-4 p-6">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex gap-3 rounded-lg p-4",
              message.role === 'user' 
                ? "bg-[hsl(var(--user-message))] ml-auto max-w-[80%]" 
                : "bg-[hsl(var(--assistant-message))]"
            )}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary">
              {message.role === 'user' ? (
                <User className="h-4 w-4" />
              ) : (
                <Bot className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">
                {message.role === 'user' ? 'You' : 'AI Assistant'}
              </p>
              <p className="text-sm leading-relaxed">{message.text}</p>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};

// Missing import for placeholder
import { MessageSquare } from 'lucide-react';
