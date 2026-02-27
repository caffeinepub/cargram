import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from '@tanstack/react-router';
import AuthRequiredWrapper from '../components/AuthRequiredWrapper';
import { useGetCallerUserProfile, useGetMessages, useSendMessage, useGetFollowers, useGetFollowing, useFollowUser } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';
import { Send, Lock } from 'lucide-react';
import { toast } from 'sonner';

function ChatContent() {
  const { userId } = useParams({ from: '/messages/$userId' });
  const navigate = useNavigate();
  const { data: currentProfile } = useGetCallerUserProfile();
  const conversationId = currentProfile ? currentProfile.username + userId : '';
  const { data: messages = [], isLoading } = useGetMessages(conversationId);
  const { mutate: sendMessage, isPending } = useSendMessage();
  const { data: followers = [] } = useGetFollowers(currentProfile?.username || '');
  const { data: following = [] } = useGetFollowing(currentProfile?.username || '');
  const { mutate: followUser } = useFollowUser();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const isConnected = React.useMemo(() => {
    if (!currentProfile) return false;
    const followerSet = new Set(followers);
    const followingSet = new Set(following);
    return followerSet.has(userId) || followingSet.has(userId);
  }, [followers, following, userId, currentProfile]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || !currentProfile) return;
    sendMessage(
      { receiverId: userId, text: text.trim() },
      {
        onSuccess: () => setText(''),
        onError: () => toast.error('Failed to send message'),
      }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-lg mx-auto px-4 py-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className={`h-10 w-2/3 rounded-2xl ${i % 2 === 0 ? '' : 'ml-auto'}`} />
        ))}
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-lg mx-auto px-4 py-12 text-center">
        <Lock className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-semibold mb-2">Not Connected</h2>
        <p className="text-muted-foreground text-sm mb-6">
          You need to follow @{userId} or they need to follow you to message them.
        </p>
        <button
          onClick={() => followUser(userId, { onSuccess: () => toast.success(`Following @${userId}`) })}
          className="bg-amber-500 text-white px-6 py-2 rounded-full font-medium hover:bg-amber-600 transition-colors"
        >
          Follow @{userId}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isOwn = msg.senderId === currentProfile?.username;
          return (
            <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  isOwn
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="px-4 py-3 border-t border-border flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-muted rounded-full px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-primary"
        />
        <button
          onClick={handleSend}
          disabled={isPending || !text.trim()}
          className="w-10 h-10 bg-primary rounded-full flex items-center justify-center disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {isPending ? (
            <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4 text-primary-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function ChatThreadPage() {
  return (
    <AuthRequiredWrapper message="Sign in to send messages">
      <ChatContent />
    </AuthRequiredWrapper>
  );
}
