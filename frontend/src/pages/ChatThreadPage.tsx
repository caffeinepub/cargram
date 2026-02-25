import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, Send, Loader2, Lock, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  useGetMessages,
  useSendMessage,
  useGetCallerUserProfile,
  useGetFollowers,
  useGetFollowing,
  useFollowUser,
  useIsFollowing,
} from '../hooks/useQueries';
import { formatDistanceToNow } from '../lib/utils';
import { toast } from 'sonner';

export default function ChatThreadPage() {
  const { conversationId } = useParams({ from: '/messages/$conversationId' });
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: currentProfile } = useGetCallerUserProfile();
  const currentUserId = currentProfile?.username;

  // Derive receiverId from conversationId and current user
  const { data: messages = [], isLoading: messagesLoading } = useGetMessages(conversationId);

  const receiverId = messages.length > 0
    ? (messages[0].senderId === currentUserId ? messages[0].receiverId : messages[0].senderId)
    : conversationId.replace(currentUserId || '', '');

  // Check follow relationship
  const { data: iFollowThem = false, isLoading: followCheckLoading } = useIsFollowing(receiverId || undefined);
  const { data: followers = [], isLoading: followersLoading } = useGetFollowers(currentUserId);
  const theyFollowMe = followers.includes(receiverId || '');

  const hasFollowRelationship = iFollowThem || theyFollowMe;
  const isCheckingRelationship = followCheckLoading || followersLoading;

  const sendMessage = useSendMessage();
  const followUser = useFollowUser();

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

  const handleFollow = async () => {
    if (!receiverId) return;
    try {
      await followUser.mutateAsync(receiverId);
      toast.success(`Now following @${receiverId}!`);
    } catch {
      toast.error('Failed to follow user');
    }
  };

  // Show loading while checking relationship
  if (isCheckingRelationship && !messagesLoading) {
    return (
      <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-7rem)]">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-background/95 backdrop-blur-sm">
          <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/messages' })} className="text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <p className="font-semibold text-sm text-foreground">@{receiverId || 'Chat'}</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Restricted state: no follow relationship
  if (!isCheckingRelationship && !hasFollowRelationship && receiverId) {
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
            <p className="font-semibold text-sm text-foreground">@{receiverId}</p>
          </div>
        </div>

        {/* Restricted state */}
        <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8">
          <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center border-2 border-amber-500/30">
            <Lock className="w-9 h-9 text-amber-500" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="font-heading text-xl font-bold text-foreground">Chat Locked</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You need to follow <span className="text-amber-500 font-semibold">@{receiverId}</span> or they need to follow you to start chatting.
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button
              onClick={handleFollow}
              disabled={followUser.isPending}
              className="w-full bg-amber-500 hover:bg-amber-600 text-asphalt-900 font-bold shadow-amber"
            >
              {followUser.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              Follow @{receiverId}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate({ to: '/messages' })}
              className="w-full border-border text-foreground"
            >
              Back to Messages
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
        {messagesLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-muted-foreground text-sm">No messages yet. Say hello! 👋</p>
          </div>
        ) : (
          messages.map(msg => {
            const isOwn = msg.senderId === currentUserId;
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
