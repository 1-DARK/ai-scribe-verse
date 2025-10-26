import { useEffect, useState } from 'react';
import { Plus, MessageSquare, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useChatStore } from '@/store/chatStore';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export const ChatSidebar = () => {
  const { chats, setChats, currentChatId, setCurrentChatId, reset } = useChatStore();
  const { signOut, user } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  const loadChats = async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setChats(data);
    }
  };

  const createNewChat = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('chats')
      .insert({
        user_id: user.id,
        title: 'New Chat'
      })
      .select()
      .single();

    setLoading(false);
    
    if (!error && data) {
      setChats([data, ...chats]);
      setCurrentChatId(data.id);
      reset();
    }
  };

  const selectChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true });

    if (data) {
      useChatStore.getState().setMessages(data as any);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="p-4">
        <Button 
          onClick={createNewChat} 
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          New Chat
        </Button>
      </div>
      
      <Separator />
      
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-3">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => selectChat(chat.id)}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                "hover:bg-sidebar-accent",
                currentChatId === chat.id && "bg-sidebar-accent"
              )}
            >
              <MessageSquare className="h-4 w-4 flex-shrink-0" />
              <span className="truncate text-left">{chat.title}</span>
            </button>
          ))}
        </div>
      </ScrollArea>

      <Separator />
      
      <div className="p-4">
        <Button 
          variant="ghost" 
          className="w-full justify-start"
          onClick={signOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
