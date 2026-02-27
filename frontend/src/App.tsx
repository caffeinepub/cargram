import React, { Suspense, lazy } from 'react';
import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet, redirect } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingFallback from './components/LoadingFallback';
import AuthGate from './components/AuthGate';
import Layout from './components/Layout';

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const ReelsPage = lazy(() => import('./pages/ReelsPage'));
const ReelsSearchPage = lazy(() => import('./pages/ReelsSearchPage'));
const BuildsPage = lazy(() => import('./pages/BuildsPage'));
const BuildDetailPage = lazy(() => import('./pages/BuildDetailPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const MechanicsPage = lazy(() => import('./pages/MechanicsPage'));
const MechanicThreadPage = lazy(() => import('./pages/MechanicThreadPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));
const DiscoverPage = lazy(() => import('./pages/DiscoverPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const ChatThreadPage = lazy(() => import('./pages/ChatThreadPage'));
const CreateFeedPostPage = lazy(() => import('./pages/CreateFeedPostPage'));
const CreateReelPage = lazy(() => import('./pages/CreateReelPage'));
const CreateBuildPage = lazy(() => import('./pages/CreateBuildPage'));
const CreateMechanicQuestionPage = lazy(() => import('./pages/CreateMechanicQuestionPage'));
const CreateListingPage = lazy(() => import('./pages/CreateListingPage'));
const CreateEventPage = lazy(() => import('./pages/CreateEventPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const TunerShopPage = lazy(() => import('./pages/TunerShopPage'));
const InstallPage = lazy(() => import('./pages/InstallPage'));
const StreetTubePage = lazy(() => import('./pages/StreetTubePage'));
const FollowersPage = lazy(() => import('./pages/FollowersPage'));
const FollowingPage = lazy(() => import('./pages/FollowingPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

// Root route with AuthGate wrapping everything
const rootRoute = createRootRoute({
  component: () => (
    <AuthGate>
      <Outlet />
    </AuthGate>
  ),
  errorComponent: ({ error }) => (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <img src="/assets/generated/revgrid-logo.dim_256x256.png" alt="RevGrid" className="w-16 h-16 mx-auto mb-4 opacity-80" />
        <h1 className="text-2xl font-heading text-primary mb-2">Page Error</h1>
        <p className="text-muted-foreground mb-4 text-sm">{(error as Error)?.message || 'An unexpected error occurred.'}</p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium hover:opacity-90 transition-opacity"
        >
          Go Home
        </button>
      </div>
    </div>
  ),
});

// Layout route
const layoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'layout',
  component: Layout,
});

// Page routes
const indexRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/',
  component: () => <Suspense fallback={<LoadingFallback />}><HomePage /></Suspense>,
});

const reelsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/reels',
  component: () => <Suspense fallback={<LoadingFallback />}><ReelsPage /></Suspense>,
});

const reelsSearchRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/reels-search',
  component: () => <Suspense fallback={<LoadingFallback />}><ReelsSearchPage /></Suspense>,
});

const buildsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/builds',
  component: () => <Suspense fallback={<LoadingFallback />}><BuildsPage /></Suspense>,
});

const buildDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/builds/$buildId',
  component: () => <Suspense fallback={<LoadingFallback />}><BuildDetailPage /></Suspense>,
});

const eventsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/events',
  component: () => <Suspense fallback={<LoadingFallback />}><EventsPage /></Suspense>,
});

const eventDetailRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/events/$eventId',
  component: () => <Suspense fallback={<LoadingFallback />}><EventDetailPage /></Suspense>,
});

const marketplaceRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/marketplace',
  component: () => <Suspense fallback={<LoadingFallback />}><MarketplacePage /></Suspense>,
});

const mechanicsRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/mechanics',
  component: () => <Suspense fallback={<LoadingFallback />}><MechanicsPage /></Suspense>,
});

const mechanicThreadRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/mechanics/$postId',
  component: () => <Suspense fallback={<LoadingFallback />}><MechanicThreadPage /></Suspense>,
});

const leaderboardRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/leaderboard',
  component: () => <Suspense fallback={<LoadingFallback />}><LeaderboardPage /></Suspense>,
});

const discoverRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/discover',
  component: () => <Suspense fallback={<LoadingFallback />}><DiscoverPage /></Suspense>,
});

const profileRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/profile/$userId',
  component: () => <Suspense fallback={<LoadingFallback />}><ProfilePage /></Suspense>,
});

const messagesRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/messages',
  component: () => <Suspense fallback={<LoadingFallback />}><MessagesPage /></Suspense>,
});

const chatThreadRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/messages/$userId',
  component: () => <Suspense fallback={<LoadingFallback />}><ChatThreadPage /></Suspense>,
});

const createPostRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/create-post',
  component: () => <Suspense fallback={<LoadingFallback />}><CreateFeedPostPage /></Suspense>,
});

const createReelRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/create-reel',
  component: () => <Suspense fallback={<LoadingFallback />}><CreateReelPage /></Suspense>,
});

const createBuildRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/builds/create',
  component: () => <Suspense fallback={<LoadingFallback />}><CreateBuildPage /></Suspense>,
});

const createMechanicQuestionRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/mechanics/create',
  component: () => <Suspense fallback={<LoadingFallback />}><CreateMechanicQuestionPage /></Suspense>,
});

const createListingRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/marketplace/create',
  component: () => <Suspense fallback={<LoadingFallback />}><CreateListingPage /></Suspense>,
});

const createEventRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/events/create',
  component: () => <Suspense fallback={<LoadingFallback />}><CreateEventPage /></Suspense>,
});

const aboutRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/about',
  component: () => <Suspense fallback={<LoadingFallback />}><AboutPage /></Suspense>,
});

const tunerShopRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/tuner-shop',
  component: () => <Suspense fallback={<LoadingFallback />}><TunerShopPage /></Suspense>,
});

const installRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/install',
  component: () => <Suspense fallback={<LoadingFallback />}><InstallPage /></Suspense>,
});

const streetTubeRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/streettube',
  component: () => <Suspense fallback={<LoadingFallback />}><StreetTubePage /></Suspense>,
});

const followersRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/profile/$userId/followers',
  component: () => <Suspense fallback={<LoadingFallback />}><FollowersPage /></Suspense>,
});

const followingRoute = createRoute({
  getParentRoute: () => layoutRoute,
  path: '/profile/$userId/following',
  component: () => <Suspense fallback={<LoadingFallback />}><FollowingPage /></Suspense>,
});

const routeTree = rootRoute.addChildren([
  layoutRoute.addChildren([
    indexRoute,
    reelsRoute,
    reelsSearchRoute,
    buildsRoute,
    buildDetailRoute,
    eventsRoute,
    eventDetailRoute,
    marketplaceRoute,
    mechanicsRoute,
    mechanicThreadRoute,
    leaderboardRoute,
    discoverRoute,
    profileRoute,
    messagesRoute,
    chatThreadRoute,
    createPostRoute,
    createReelRoute,
    createBuildRoute,
    createMechanicQuestionRoute,
    createListingRoute,
    createEventRoute,
    aboutRoute,
    tunerShopRoute,
    installRoute,
    streetTubeRoute,
    followersRoute,
    followingRoute,
  ]),
]);

const router = createRouter({
  routeTree,
  defaultErrorComponent: ({ error }) => (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-heading text-primary mb-2">Navigation Error</h1>
        <p className="text-muted-foreground mb-4 text-sm">{(error as Error)?.message || 'Page not found.'}</p>
        <button
          onClick={() => window.location.href = '/'}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-medium"
        >
          Go Home
        </button>
      </div>
    </div>
  ),
});

export default function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <RouterProvider router={router} />
          <Toaster richColors position="top-center" />
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
