import { useEffect, useState } from 'react';
import { Plus, MessageSquare, LogOut, Loader2, Trash2, Edit2, Check, X } from 'lucide-react';
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
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [deleteChatId, setDeleteChatId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState('');

  useEffect(() => {
    if (user) loadChats();
  }, [user]);

  const loadChats = async () => {
    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && data) setChats(data);
  };

  const createNewChat = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('chats')
      .insert({ user_id: user.id, title: 'New Chat' })
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
    if (data) useChatStore.getState().setMessages(data as any);
  };

  const updateChatTitle = async (chatId: string, newTitle: string) => {
    if (!newTitle.trim()) {
      setEditingChatId(null); // cancel if empty
      return;
    }

    const { data, error } = await supabase
      .from('chats')
      .update({ title: newTitle })
      .eq('id', chatId)
      .select()
      .single();

    if (!error && data) setChats(chats.map((c) => (c.id === chatId ? data : c)));
    setEditingChatId(null);
  };

  const confirmDeleteChat = async (chatId: string) => {
    await supabase.from('messages').delete().eq('chat_id', chatId);
    await supabase.from('chats').delete().eq('id', chatId);
    setChats(chats.filter((c) => c.id !== chatId));
    if (currentChatId === chatId) {
      setCurrentChatId('');
      useChatStore.getState().setMessages([]);
    }
    setDeleteChatId(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, chatId: string) => {
    if (e.key === 'Enter') {
      updateChatTitle(chatId, tempTitle);
    } else if (e.key === 'Escape') {
      setEditingChatId(null);
    }
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <div className="p-4">
        <Button onClick={createNewChat} className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
          New Chat
        </Button>
      </div>

      <Separator />

      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-3">
          {chats.map((chat) => (
            <div key={chat.id} className="flex items-center justify-between gap-2 relative">
              <button
                onClick={() => selectChat(chat.id)}
                className={cn(
                  "flex-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                  "hover:bg-sidebar-accent",
                  currentChatId === chat.id && "bg-sidebar-accent"
                )}
              >
                <MessageSquare className="h-4 w-4 flex-shrink-0" />
                {editingChatId === chat.id ? (
                  <input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, chat.id)}
                    autoFocus
                    className="flex-1 bg-gray-700 text-white px-2 py-1 rounded"
                  />
                ) : (
                  <span className="truncate text-left">{chat.title}</span>
                )}
              </button>

              <div className="flex gap-1">
                {editingChatId !== chat.id && (
                  <>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => { setEditingChatId(chat.id); setTempTitle(chat.title); }}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {deleteChatId === chat.id ? (
                      <>
                        <Button size="icon" variant="destructive" onClick={() => confirmDeleteChat(chat.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => setDeleteChatId(null)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button size="icon" variant="ghost" onClick={() => setDeleteChatId(chat.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator />

      <div className="p-4">
        <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};
