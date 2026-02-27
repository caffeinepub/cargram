import { useInternetIdentity } from './useInternetIdentity';
import { toast } from 'sonner';

export function useGuestCheck() {
  const { identity } = useInternetIdentity();
  const isAuthenticated = !!identity;
  const isGuest = !isAuthenticated;

  function requireAuth(message?: string): boolean {
    if (isGuest) {
      toast.error(message || 'Sign in to use this feature', {
        description: 'Log in with Internet Identity to continue.',
        action: {
          label: 'Sign In',
          onClick: () => {
            // Dispatch a custom event that the app can listen to for triggering login
            window.dispatchEvent(new CustomEvent('revgrid:request-login'));
          },
        },
      });
      return false;
    }
    return true;
  }

  return { isGuest, isAuthenticated, requireAuth };
}
