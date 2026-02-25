import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { User } from '../backend';

interface UserListItemProps {
  user: User;
  onClick?: () => void;
}

export default function UserListItem({ user, onClick }: UserListItemProps) {
  const navigate = useNavigate();

  const avatarUrl = user.profilePicData
    ? `data:image/jpeg;base64,${user.profilePicData}`
    : '/assets/generated/default-avatar.dim_128x128.png';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate({ to: `/profile/${user.username}` });
    }
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-3 w-full px-4 py-3 hover:bg-muted/50 transition-colors text-left"
    >
      <img
        src={avatarUrl}
        alt={user.displayName}
        className="w-10 h-10 rounded-full object-cover border border-border flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{user.displayName}</p>
        <p className="text-xs text-muted-foreground truncate">@{user.username}</p>
        {user.carInfo && (
          <p className="text-xs text-primary truncate">{user.carInfo}</p>
        )}
      </div>
    </button>
  );
}
