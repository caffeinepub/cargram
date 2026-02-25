import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useGetMessages, useSendMessage, useGetCallerUserProfile } from '../hooks/useQueries';
import { formatDistanceToNow } from '../lib/utils';
import { toast } from 'sonner';

export default function ChatThreadPage() {
  const { conversationId } = useParams({ from: '/messages/$conversationId' });
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  // Extract receiverId from conversationId and current user
  const { data: currentProfile } = useGetCallerUserProfile();
  const { data: messages = [], isLoading } = useGetMessages(conversationId);
  const sendMessage = useSendMessage();

  // Derive receiverId: conversationId is sorted([senderId, receiverId]).join('')
  // We need to figure out who the other person is from messages or state
  const receiverId = messages.length > 0
    ? (messages[0].senderId === currentProfile?.username ? messages[0].receiverId : messages[0].senderId)
    : conversationId.replace(currentProfile?.username || '', '');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !receiverId) return;
    try {
      await sendMessage.mutateAsync({ receiverId, text: text.trim() });
      setText('');
    } catch {
      toast.error('Failed to send message');
    }
  };

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/messages' })} className="text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <Avatar className="w-9 h-9">
          <AvatarImage src="/assets/generated/default-avatar.dim_128x128.png" />
          <AvatarFallback className="bg-secondary text-foreground text-xs font-bold">
            {(receiverId || '??').slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm text-foreground">@{receiverId || 'Chat'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-muted-foreground text-sm">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map(msg => {
            const isOwn = msg.senderId === currentProfile?.username;
            return (
              <div key={msg.id} className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isOwn && (
                  <Avatar className="w-7 h-7 flex-shrink-0">
                    <AvatarImage src="/assets/generated/default-avatar.dim_128x128.png" />
                    <AvatarFallback className="bg-secondary text-xs font-bold text-foreground">
                      {msg.senderId.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                  <div className={`px-3 py-2 rounded-2xl text-sm ${
                    isOwn
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-secondary text-foreground rounded-tl-sm'
                  }`}>
                    {msg.text}
                  </div>
                  <p className="text-[10px] text-muted-foreground">{formatDistanceToNow(msg.createdAt)}</p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border flex gap-2">
        <Input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-secondary border-border text-foreground"
          onKeyDown={e => e.key === 'Enter' && handleSend()}
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!text.trim() || sendMessage.isPending || !receiverId}
          className="bg-primary text-primary-foreground"
        >
          {sendMessage.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </Button>
      </div>
    </div>
  );
}
