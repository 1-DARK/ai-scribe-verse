import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { MessageInput } from '@/components/chat/MessageInput';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

const Chat = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Sidebar with transition */}
      <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out absolute md:relative h-full z-10`}>
        <ChatSidebar />
      </div>
      
      <div className="flex flex-1 flex-col">
        {/* Hamburger Button */}
        <div className="border-b border-border/50 bg-background/50 backdrop-blur-sm">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="m-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <ChatWindow />
        </div>
        <MessageInput />
      </div>
    </div>
  );
};

export default Chat;
