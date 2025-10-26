import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useChatStore } from '@/store/chatStore';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const MessageInput = () => {
  const [input, setInput] = useState('');
  const { currentChatId, selectedModel, setSelectedModel, isLoading, setIsLoading } =
    useChatStore();
  const { toast } = useToast();

  const sendMessage = async () => {
    if (!input.trim() || !currentChatId || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Insert user message into Supabase
      const { data: userMsg, error: userError } = await supabase
        .from('messages')
        .insert({
          chat_id: currentChatId,
          role: 'user',
          text: userMessage,
        })
        .select()
        .single();

      if (userError) throw userError;

      // --- Call local FastAPI endpoint based on model ---
      const endpoint =
        selectedModel === 'anum'
          ? 'http://localhost:8001/predictes' // Anum model
          : 'http://localhost:8000/predict';  // Default model

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userMessage }),
      });

      if (!res.ok) {
        throw new Error('Failed to fetch AI response from local server');
      }

      const data = await res.json();
      const aiResponseText = `${data.sentiment} (Score: ${data.score})`;

      // Insert AI response into Supabase
      await supabase.from('messages').insert({
        chat_id: currentChatId,
        role: 'assistant',
        text: aiResponseText,
      });

      // Update chat title if it's the first message
      const { data: messages } = await supabase
        .from('messages')
        .select('id')
        .eq('chat_id', currentChatId);

      if (messages && messages.length === 2) {
        const title =
          userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
        await supabase.from('chats').update({ title }).eq('id', currentChatId);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="border-t border-border bg-background p-4">
      <div className="mx-auto max-w-3xl space-y-3">
        {/* Model Selector */}
        <div className="flex items-center gap-3">
          <Select
            value={selectedModel}
            onValueChange={(v: 'anum' | 'aanum') => setSelectedModel(v)}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="anum">Model Anum</SelectItem>
              <SelectItem value="aanum">Model Aanum</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Message input and send button */}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="min-h-[80px] resize-none"
            disabled={!currentChatId || isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || !currentChatId || isLoading}
            size="icon"
            className="h-auto"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
