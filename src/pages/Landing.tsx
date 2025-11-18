import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageSquare, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const Landing = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      navigate('/chat');
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

  return (
    <div className="min-h-screen  bg-gradient-to-b from-zinc-950 to-zinc-800">
      <header className="container mx-auto px-4 md:px-6 py-4 md:py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
          
            <span className="text-xl md:text-2xl font-bold">AutoInsight</span>
          </div>
          <Button onClick={() => navigate('/auth')} variant="outline" className="bg-gradient-to-b from-zinc-700 to-zinc-800 text-sm md:text-base">
            Sign In
          </Button>
        </nav>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-12 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-4 md:mb-6 text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
            Chat with Advanced
            <span className="bg-clip-text text-gray-400">
              {' '}AI Models
            </span>
          </h1>
          
          <p className="mb-8 md:mb-12 text-base md:text-xl text-muted-foreground px-4">
            Experience the power of two cutting-edge AI models in one beautiful interface.
            Choose between Num and Non-Num for your perfect conversation.
          </p>

          <div className="mb-12 md:mb-16 flex flex-col sm:flex-row flex-wrap justify-center gap-3 md:gap-4 px-4">
            <Button size="lg" onClick={() => navigate('/auth')} className="bg-zinc-700 hover:bg-zinc-800 w-full sm:w-auto">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/auth')} className="bg-zinc-700 hover:bg-zinc-800 w-full sm:w-auto">
              Learn More
            </Button>
          </div>

          <div className="grid gap-6 md:gap-8 sm:grid-cols-2 md:grid-cols-3">
            <div className="rounded-lg border border-border bg-gradient-to-b from-zinc-700 to-zinc-800 p-5 md:p-6">
              <div className="mb-3 md:mb-4 inline-flex rounded-lg bg-primary/10 p-2.5 md:p-3">
                <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg md:text-xl font-semibold">Dual AI Models</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Switch between two powerful AI models tailored for different conversation styles
              </p>
            </div>

            <div className="rounded-lg border border-border bg-gradient-to-b from-zinc-700 to-zinc-800 p-5 md:p-6">
              <div className="mb-3 md:mb-4 inline-flex rounded-lg bg-primary/10 p-2.5 md:p-3">
                <MessageSquare className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg md:text-xl font-semibold">Chat History</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Access all your conversations anytime with organized chat history
              </p>
            </div>

            <div className="rounded-lg border border-border bg-gradient-to-b from-zinc-700 to-zinc-800 p-5 md:p-6 sm:col-span-2 md:col-span-1">
              <div className="mb-3 md:mb-4 inline-flex rounded-lg bg-primary/10 p-2.5 md:p-3">
                <Zap className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg md:text-xl font-semibold">Real-time Updates</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Instant responses with smooth, real-time message synchronization
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Landing;
