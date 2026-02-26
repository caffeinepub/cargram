import React from 'react';
import { useNavigate } from '@tanstack/react-router';

interface ClickableUsernameProps {
  userId: string;
  displayName?: string;
  className?: string;
  /** If true, renders as @username format */
  showAt?: boolean;
}

/**
 * Renders a user's display name (or username) as a clickable inline element
 * that navigates to their profile page.
 */
export default function ClickableUsername({
  userId,
  displayName,
  className = '',
  showAt = false,
}: ClickableUsernameProps) {
  const navigate = useNavigate();

  const label = displayName || userId;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate({ to: '/profile/$userId', params: { userId } });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`font-semibold text-foreground hover:text-primary hover:underline underline-offset-2 transition-colors cursor-pointer inline ${className}`}
    >
      {showAt ? `@${label}` : label}
    </button>
  );
}
