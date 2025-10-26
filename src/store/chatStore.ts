import { create } from 'zustand';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  created_at: string;
};

export type Chat = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type ChatStore = {
  currentChatId: string | null;
  chats: Chat[];
  messages: Message[];
  selectedModel: 'anum' | 'aanum';
  isLoading: boolean;
  
  setCurrentChatId: (id: string | null) => void;
  setChats: (chats: Chat[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setSelectedModel: (model: 'anum' | 'aanum') => void;
  setIsLoading: (loading: boolean) => void;
  reset: () => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  currentChatId: null,
  chats: [],
  messages: [],
  selectedModel: 'anum',
  isLoading: false,
  
  setCurrentChatId: (id) => set({ currentChatId: id }),
  setChats: (chats) => set({ chats }),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  setSelectedModel: (model) => set({ selectedModel: model }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  reset: () => set({ 
    currentChatId: null, 
    messages: [], 
    isLoading: false 
  }),
}));
