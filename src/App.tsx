import { useState, useEffect } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/sonner';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MessageSquare, Send, Upload, Moon, Sun } from 'lucide-react';
import { generateUsername } from '@/lib/utils';
import { ChatRoom } from '@/components/chat-room';
import { UserOnboarding } from '@/components/user-onboarding';

function App() {
  const [username, setUsername] = useState<string>('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const handleThemeToggle = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newTheme);
  };

  return (
    <ThemeProvider defaultTheme={isDarkMode ? 'dark' : 'light'}>
      <div className="min-h-screen bg-background text-foreground">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-8 w-8" />
              <h1 className="text-2xl font-bold">P2P Chat</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="theme-toggle"
                  checked={isDarkMode}
                  onCheckedChange={handleThemeToggle}
                />
                <Label htmlFor="theme-toggle">
                  {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                </Label>
              </div>
            </div>
          </div>

          {!username ? (
            <UserOnboarding onUsernameSet={setUsername} />
          ) : (
            <ChatRoom username={username} />
          )}
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;