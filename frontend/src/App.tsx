import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ReelsPage from './pages/ReelsPage';
import ReelsSearchPage from './pages/ReelsSearchPage';
import DiscoverPage from './pages/DiscoverPage';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import ProfilePage from './pages/ProfilePage';
import FollowersPage from './pages/FollowersPage';
import FollowingPage from './pages/FollowingPage';
import MessagesPage from './pages/MessagesPage';
import ChatThreadPage from './pages/ChatThreadPage';
import MechanicsPage from './pages/MechanicsPage';
import MechanicThreadPage from './pages/MechanicThreadPage';
import CreateMechanicQuestionPage from './pages/CreateMechanicQuestionPage';
import BuildsPage from './pages/BuildsPage';
import BuildDetailPage from './pages/BuildDetailPage';
import CreateBuildPage from './pages/CreateBuildPage';
import CreateFeedPostPage from './pages/CreateFeedPostPage';
import CreateReelPage from './pages/CreateReelPage';
import MarketplacePage from './pages/MarketplacePage';
import CreateListingPage from './pages/CreateListingPage';
import AboutPage from './pages/AboutPage';
import TunerShopPage from './pages/TunerShopPage';
import AuthGate from './components/AuthGate';

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <AuthGate>
      <Layout />
    </AuthGate>
  ),
});

const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: HomePage });
const reelsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/reels', component: ReelsPage });
const reelsSearchRoute = createRoute({ getParentRoute: () => rootRoute, path: '/reels-search', component: ReelsSearchPage });
const discoverRoute = createRoute({ getParentRoute: () => rootRoute, path: '/discover', component: DiscoverPage });

const eventsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/events', component: EventsPage });
const eventsCreateRoute = createRoute({ getParentRoute: () => rootRoute, path: '/events/create', component: CreateEventPage });
const eventDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/events/$eventId', component: EventDetailPage });

const profileRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile', component: ProfilePage });
const profileUserRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile/$userId', component: ProfilePage });
const followersRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile/$userId/followers', component: FollowersPage });
const followingRoute = createRoute({ getParentRoute: () => rootRoute, path: '/profile/$userId/following', component: FollowingPage });

const messagesRoute = createRoute({ getParentRoute: () => rootRoute, path: '/messages', component: MessagesPage });
const chatThreadRoute = createRoute({ getParentRoute: () => rootRoute, path: '/messages/$conversationId', component: ChatThreadPage });

const mechanicsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/mechanics', component: MechanicsPage });
const mechanicsCreateRoute = createRoute({ getParentRoute: () => rootRoute, path: '/mechanics/create', component: CreateMechanicQuestionPage });
const mechanicThreadRoute = createRoute({ getParentRoute: () => rootRoute, path: '/mechanics/$postId', component: MechanicThreadPage });

const buildsRoute = createRoute({ getParentRoute: () => rootRoute, path: '/builds', component: BuildsPage });
const buildsCreateRoute = createRoute({ getParentRoute: () => rootRoute, path: '/builds/create', component: CreateBuildPage });
const buildDetailRoute = createRoute({ getParentRoute: () => rootRoute, path: '/builds/$buildId', component: BuildDetailPage });

const createFeedRoute = createRoute({ getParentRoute: () => rootRoute, path: '/create/feed', component: CreateFeedPostPage });
const createReelRoute = createRoute({ getParentRoute: () => rootRoute, path: '/create/reel', component: CreateReelPage });

const marketplaceRoute = createRoute({ getParentRoute: () => rootRoute, path: '/marketplace', component: MarketplacePage });
const marketplaceCreateRoute = createRoute({ getParentRoute: () => rootRoute, path: '/marketplace/create', component: CreateListingPage });

const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/about', component: AboutPage });
const tunerShopRoute = createRoute({ getParentRoute: () => rootRoute, path: '/tuner-shop', component: TunerShopPage });

const routeTree = rootRoute.addChildren([
  indexRoute,
  reelsRoute,
  reelsSearchRoute,
  discoverRoute,
  eventsRoute,
  eventsCreateRoute,
  eventDetailRoute,
  profileRoute,
  profileUserRoute,
  followersRoute,
  followingRoute,
  messagesRoute,
  chatThreadRoute,
  mechanicsRoute,
  mechanicsCreateRoute,
  mechanicThreadRoute,
  buildsRoute,
  buildsCreateRoute,
  buildDetailRoute,
  createFeedRoute,
  createReelRoute,
  marketplaceRoute,
  marketplaceCreateRoute,
  aboutRoute,
  tunerShopRoute,
]);

const router = createRouter({ routeTree });

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" />
    </ThemeProvider>
  );
}
