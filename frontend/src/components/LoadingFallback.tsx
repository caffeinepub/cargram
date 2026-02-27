import React from 'react';

export default function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <img
          src="/assets/generated/revgrid-logo.dim_256x256.png"
          alt="RevGrid"
          className="w-16 h-16 mx-auto mb-4 animate-pulse"
        />
        <div className="flex items-center gap-2 justify-center">
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
