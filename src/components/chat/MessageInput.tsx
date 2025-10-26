import { useState } from 'react';
import { Send, Loader2, Bot, User } from 'lucide-react';
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
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

      // Call local FastAPI endpoint based on model
      const endpoint =
        selectedModel === 'anum'
          ? 'http://localhost:8000/predictes'
          : 'http://localhost:8000/predict';

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
    <div className="border-t border-border bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Model Selector with enhanced styling */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
    
              <span className="text-sm font-medium text-muted-foreground">
                 Model
              </span>
            </div>
            <Select
              value={selectedModel}
              onValueChange={(v: 'anum' | 'aanum') => setSelectedModel(v)}
            >
              <SelectTrigger className="w-48 bg-background border-2 data-[state=open]:border-primary/20 transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="anum" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      ANUM
                    </Badge>
      
                  </div>
                </SelectItem>
                <SelectItem value="aanum" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      AANUM
                    </Badge>
            
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {!currentChatId && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Select or create a chat to start messaging</span>
            </div>
          )}
        </div>

        {/* Message input area with enhanced styling */}
        <Card className="shadow-sm border-2 transition-all duration-200 focus-within:border-primary/20 focus-within:shadow-md">
          <CardContent className="p-0">
            <div className="flex gap-2 p-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  currentChatId 
                    ? "Type your message... (Press Enter to send, Shift+Enter for new line)" 
                    : "Please select or create a chat to start messaging"
                }
                className="min-h-[80px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-base"
                disabled={!currentChatId || isLoading}
              />
              <Button
                onClick={sendMessage}
                disabled={!input.trim() || !currentChatId || isLoading}
                size="icon"
                className="h-12 w-12 shrink-0 transition-all duration-200 hover:scale-105 active:scale-95"
                variant={isLoading ? "secondary" : "default"}
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            {/* Input footer with character count and status */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-t">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className={`${input.length > 0 ? 'text-foreground/80' : ''}`}>
                  {input.length} characters
                </span>
                {isLoading && (
                  <div className="flex items-center gap-1 text-primary">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                {selectedModel === 'anum' ? 'ANUM Model' : 'AANUM Model'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};