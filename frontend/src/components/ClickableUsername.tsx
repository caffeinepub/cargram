import React from 'react';
import { useNavigate } from '@tanstack/react-router';

export interface ClickableUsernameProps {
  userId: string;
  displayName: string;
  className?: string;
  showAt?: boolean;
}

export default function ClickableUsername({
  userId,
  displayName,
  className = '',
  showAt = false,
}: ClickableUsernameProps) {
  const navigate = useNavigate();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/profile/$userId', params: { userId } });
  };

  return (
    <button
      onClick={handleClick}
      className={`hover:underline text-primary transition-colors font-medium ${className}`}
    >
      {showAt ? `@${displayName}` : displayName}
    </button>
  );
}
