import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { generateUsername } from '@/lib/utils';
import { Wand2 } from 'lucide-react';

interface UserOnboardingProps {
  onUsernameSet: (username: string) => void;
}

export function UserOnboarding({ onUsernameSet }: UserOnboardingProps) {
  const [inputUsername, setInputUsername] = useState('');

  const handleGenerate = () => {
    const newUsername = generateUsername();
    setInputUsername(newUsername);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputUsername.trim()) {
      onUsernameSet(inputUsername.trim());
    }
  };

  return (
    <Card className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">Welcome to P2P Chat</h2>
      <p className="text-muted-foreground mb-6">
        Choose a unique username to start chatting with others instantly.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter username"
            value={inputUsername}
            onChange={(e) => setInputUsername(e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleGenerate}
            className="flex-shrink-0"
          >
            <Wand2 className="h-4 w-4 mr-2" />
            Generate
          </Button>
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={!inputUsername.trim()}
        >
          Start Chatting
        </Button>
      </form>
    </Card>
  );
}