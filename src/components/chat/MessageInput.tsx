import { useState, useRef } from 'react';
import { Send, Loader2, Bot, User, Upload, FileText, X } from 'lucide-react';
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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { currentChatId, selectedModel, setSelectedModel, isLoading, setIsLoading } =
    useChatStore();
  const { toast } = useToast();

  const handleFileUpload = async (file: File) => {
    // Validate file type
    const allowedTypes = [
      'text/plain', 
      'application/pdf', 
      'image/jpeg', 
      'image/png', 
      'image/gif',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    const allowedExtensions = ['.txt', '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.csv', '.doc', '.docx'];
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload text, PDF, image, or document files only',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload files smaller than 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploadedFile(file);
    toast({
      title: 'File uploaded',
      description: `${file.name} has been added to your message`,
    });
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      
      if (file.type === 'text/plain' || file.type === 'text/csv') {
        reader.readAsText(file);
      } else {
        // For non-text files, we'll just send the filename and metadata
        resolve(`[File: ${file.name}, Type: ${file.type}, Size: ${(file.size / 1024).toFixed(2)}KB]`);
      }
    });
  };

  const sendMessage = async () => {
    if ((!input.trim() && !uploadedFile) || !currentChatId || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);
    setIsUploading(true);

    try {
      let messageContent = userMessage;
      let fileContent = '';
      
      // Add file content to message if file is uploaded
      if (uploadedFile) {
        try {
          fileContent = await readFileContent(uploadedFile);
          messageContent = messageContent 
            ? `${messageContent}\n\n--- Uploaded File ---\n${fileContent}`
            : `--- Uploaded File ---\n${fileContent}`;
        } catch (error) {
          console.error('Error reading file:', error);
          messageContent = messageContent 
            ? `${messageContent}\n\n--- Uploaded File ---\n[File: ${uploadedFile.name} - Error reading content]`
            : `--- Uploaded File ---\n[File: ${uploadedFile.name} - Error reading content]`;
        }
      }

      // Insert user message into Supabase
      const { data: userMsg, error: userError } = await supabase
        .from('messages')
        .insert({
          chat_id: currentChatId,
          role: 'user',
          text: messageContent,
          file_name: uploadedFile?.name || null,
          file_type: uploadedFile?.type || null,
          file_size: uploadedFile?.size || null,
        })
        .select()
        .single();

      if (userError) throw userError;

      // Call local FastAPI endpoint based on model
      const endpoint =
        selectedModel === 'anum'
          ? 'http://localhost:8001/predictes'
          : 'http://localhost:8000/predict';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: messageContent,
          file_name: uploadedFile?.name,
          file_type: uploadedFile?.type,
          has_file: !!uploadedFile
        }),
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
        const title = uploadedFile 
          ? `File: ${uploadedFile.name}`
          : userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
        await supabase.from('chats').update({ title }).eq('id', currentChatId);
      }

      // Clear file after successful send
      removeFile();

    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive',
      });
      // Restore input if there was an error
      setInput(input);
    } finally {
      setIsLoading(false);
      setIsUploading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (fileType.includes('text/') || fileType === 'text/csv') return '📝';
    if (fileType.includes('word') || fileType.includes('document')) return '📄';
    return '📎';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="border-t border-border bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Model Selector and File Upload */}
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                AI Model
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
                    <span>Model Anum</span>
                  </div>
                </SelectItem>
                <SelectItem value="aanum" className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      AANUM
                    </Badge>
                    <span>Model Aanum</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInputChange}
              accept=".txt,.pdf,.jpg,.jpeg,.png,.gif,.csv,.doc,.docx"
              className="hidden"
              disabled={!currentChatId || isLoading}
            />
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={!currentChatId || isLoading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Upload File</span>
            </Button>

            {!currentChatId && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="hidden md:inline">Select or create a chat to start messaging</span>
                <span className="md:hidden">Select a chat</span>
              </div>
            )}
          </div>
        </div>

        {/* Uploaded File Preview */}
        {uploadedFile && (
          <div className="mb-3 animate-in fade-in duration-200">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-lg">{getFileIcon(uploadedFile.type)}</span>
                      <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {uploadedFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadedFile.size)} • {uploadedFile.type || 'Unknown type'}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={removeFile}
                    disabled={isLoading}
                    className="h-8 w-8 flex-shrink-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Message input area */}
        <Card 
          className="shadow-sm border-2 transition-all duration-200 focus-within:border-primary/20 focus-within:shadow-md"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          <CardContent className="p-0">
            <div className="flex gap-2 p-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  currentChatId 
                    ? "Type your message or upload a file... (Press Enter to send, Shift+Enter for new line)" 
                    : "Please select or create a chat to start messaging"
                }
                className="min-h-[80px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-base flex-1"
                disabled={!currentChatId || isLoading}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={sendMessage}
                  disabled={(!input.trim() && !uploadedFile) || !currentChatId || isLoading}
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
                
                {/* Mobile file upload button */}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!currentChatId || isLoading}
                  className="h-10 w-10 md:hidden flex-shrink-0"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Input footer */}
            <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-t">
              <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                <span className={`${input.length > 0 ? 'text-foreground/80' : ''}`}>
                  {input.length} characters
                </span>
                {(isLoading || isUploading) && (
                  <div className="flex items-center gap-1 text-primary">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>{isUploading ? 'Processing file...' : 'Processing...'}</span>
                  </div>
                )}
                {uploadedFile && (
                  <div className="flex items-center gap-1 text-green-600">
                    <FileText className="h-3 w-3" />
                    <span>File attached</span>
                  </div>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground hidden sm:block">
                {selectedModel === 'anum' ? 'ANUM Model' : 'AANUM Model'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* File type hints and drag & drop */}
        <div className="mt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <div className="text-center sm:text-left">
            Supported files: .txt, .pdf, .jpg, .png, .gif, .csv, .doc, .docx (Max 5MB)
          </div>
          <div className="flex items-center gap-1">
            <Upload className="h-3 w-3" />
            <span>Drag & drop files here</span>
          </div>
        </div>
      </div>
    </div>
  );
};