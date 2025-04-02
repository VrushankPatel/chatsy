import { useState, useEffect, useRef } from 'react';
import Peer, { DataConnection } from 'peerjs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { formatFileSize, getFileTypeIcon } from '@/lib/utils';
import { Send, Upload, UserPlus } from 'lucide-react';

interface Message {
  type: 'text' | 'file';
  content: string;
  sender: string;
  timestamp: number;
  fileInfo?: {
    name: string;
    size: number;
    type: string;
  };
}

interface ChatRoomProps {
  username: string;
}

export function ChatRoom({ username }: ChatRoomProps) {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [connection, setConnection] = useState<DataConnection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [peerUsername, setPeerUsername] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const newPeer = new Peer(username, {
      host: 'peerjs.com',
      port: 443,
      path: '/',
      secure: true,
      debug: 3,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
          { urls: 'stun:stun3.l.google.com:19302' },
          { urls: 'stun:stun4.l.google.com:19302' }
        ]
      },
      retries: 5,
      pingInterval: 5000,
    });

    newPeer.on('open', (id) => {
      console.log('My peer ID is:', id);
      toast({
        title: 'Connected to network',
        description: `Your ID is: ${id}`,
      });
    });

    newPeer.on('connection', handleConnection);

    newPeer.on('error', (err) => {
      console.error('Peer error:', err);
      toast({
        title: 'Connection Error',
        description: err.message,
        variant: 'destructive',
      });

      // Clear any existing reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Attempt to reconnect after a delay
      reconnectTimeoutRef.current = setTimeout(() => {
        if (newPeer.disconnected) {
          console.log('Attempting to reconnect after error...');
          try {
            newPeer.reconnect();
          } catch (e) {
            console.error('Reconnection failed:', e);
          }
        }
      }, 5000);
    });

    newPeer.on('disconnected', () => {
      console.log('Peer disconnected - attempting to reconnect...');
      toast({
        title: 'Connection Lost',
        description: 'Attempting to reconnect...',
      });

      // Clear any existing reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Attempt to reconnect after a delay
      reconnectTimeoutRef.current = setTimeout(() => {
        try {
          newPeer.reconnect();
        } catch (e) {
          console.error('Reconnection failed:', e);
          toast({
            title: 'Reconnection Failed',
            description: 'Please refresh the page to try again.',
            variant: 'destructive',
          });
        }
      }, 2000);
    });

    setPeer(newPeer);

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      newPeer.destroy();
    };
  }, [username]);

  const handleConnection = (conn: DataConnection) => {
    setConnection(conn);
    setPeerUsername(conn.peer);
    setIsConnected(true);
    
    conn.on('data', handleIncomingData);
    
    conn.on('close', () => {
      setIsConnected(false);
      toast({
        title: 'Disconnected',
        description: 'The peer has disconnected',
      });
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
      toast({
        title: 'Connection Error',
        description: 'Error in peer connection. Please try reconnecting.',
        variant: 'destructive',
      });
      setIsConnected(false);
    });
  };

  const connectToPeer = () => {
    if (!peer || !peerUsername.trim()) return;

    try {
      const conn = peer.connect(peerUsername.trim(), {
        reliable: true,
        serialization: 'json',
      });
      
      conn.on('open', () => {
        handleConnection(conn);
        toast({
          title: 'Connected',
          description: `Connected to ${peerUsername}`,
        });
      });

      conn.on('error', (err) => {
        toast({
          title: 'Connection Error',
          description: `Failed to connect to ${peerUsername}: ${err.message}`,
          variant: 'destructive',
        });
      });
    } catch (err) {
      toast({
        title: 'Connection Error',
        description: `Failed to connect to ${peerUsername}. Please check the ID and try again.`,
        variant: 'destructive',
      });
    }
  };

  const handleIncomingData = (data: any) => {
    if (typeof data === 'object' && data.type) {
      setMessages((prev) => [...prev, data]);
      scrollToBottom();
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!connection || !messageInput.trim()) return;

    const message: Message = {
      type: 'text',
      content: messageInput,
      sender: username,
      timestamp: Date.now(),
    };

    connection.send(message);
    setMessages((prev) => [...prev, message]);
    setMessageInput('');
    scrollToBottom();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !connection) return;

    const reader = new FileReader();
    reader.onload = () => {
      const message: Message = {
        type: 'file',
        content: reader.result as string,
        sender: username,
        timestamp: Date.now(),
        fileInfo: {
          name: file.name,
          size: file.size,
          type: file.type,
        },
      };

      connection.send(message);
      setMessages((prev) => [...prev, message]);
      scrollToBottom();
    };
    reader.readAsDataURL(file);
  };

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="p-4 md:col-span-1">
        <h2 className="text-lg font-semibold mb-4">Connect</h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Your ID</p>
            <p className="font-mono bg-muted p-2 rounded text-sm">{username}</p>
          </div>
          
          <div className="space-y-2">
            <Input
              placeholder="Enter peer ID"
              value={peerUsername}
              onChange={(e) => setPeerUsername(e.target.value)}
              disabled={isConnected}
            />
            <Button
              onClick={connectToPeer}
              className="w-full"
              disabled={isConnected || !peerUsername.trim()}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Connect
            </Button>
          </div>
        </div>
      </Card>

      <Card className="p-4 md:col-span-3">
        <div className="h-[600px] flex flex-col">
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.sender === username ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.sender === username
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.type === 'text' ? (
                      <p>{msg.content}</p>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span>{getFileTypeIcon(msg.fileInfo?.name || '')}</span>
                          <span className="font-medium">{msg.fileInfo?.name}</span>
                        </div>
                        <p className="text-sm opacity-70">
                          {formatFileSize(msg.fileInfo?.size || 0)}
                        </p>
                        <a
                          href={msg.content}
                          download={msg.fileInfo?.name}
                          className="text-sm underline hover:no-underline"
                        >
                          Download
                        </a>
                      </div>
                    )}
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <form onSubmit={sendMessage} className="flex gap-2">
              <Input
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                disabled={!isConnected}
              />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isConnected}
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button type="submit" disabled={!isConnected || !messageInput.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}