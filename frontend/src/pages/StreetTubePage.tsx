import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  PlayCircle,
  Menu,
  Search,
  Home,
  TrendingUp,
  History,
  ThumbsUp,
  Bell,
  Plus,
  X,
  Play,
  Share2,
  Bookmark,
  LogOut,
  Video,
  Users,
  AlertCircle,
  MoreVertical,
  Sun,
  Moon,
  Clock,
  Trash2,
  Edit3,
  Check,
  ArrowLeft,
  ChevronLeft,
  Tag,
} from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

interface STUser {
  id: string;
  email: string;
  password: string;
  channelName: string;
  subscribers: number;
  joined: string;
}

interface STVideo {
  id: string;
  title: string;
  description: string;
  category: string;
  videoUrl: string;
  thumbnail: string;
  duration: string;
  userId: string;
  channelName: string;
  views: number;
  likes: number;
  uploadDate: string;
  tags?: string[];
}

interface STComment {
  id: string;
  videoId: string;
  userId: string;
  channelName: string;
  text: string;
  timestamp: string;
}

interface STNotification {
  id: string;
  type: 'new_upload' | 'like' | 'comment';
  videoId: string;
  channelId?: string;
  channelName?: string;
  videoTitle?: string;
  timestamp: string;
  read: boolean;
}

type ViewMode = 'home' | 'trending' | 'subscriptions' | 'history' | 'liked' | 'profile' | 'search' | 'watchlater';
type STTheme = 'dark' | 'light';

// ─── LocalStorage helpers ─────────────────────────────────────────────────────

const LS_KEYS = {
  users: 'streettube_users',
  videos: 'streettube_videos',
  subscriptions: 'streettube_subscriptions',
  likes: 'streettube_likes',
  history: 'streettube_history',
  currentUser: 'streettube_currentUser',
  comments: 'streettube_comments',
  watchlater: 'streettube_watchlater',
  notifications: 'streettube_notifications',
  theme: 'streettube_theme',
};

function lsGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore quota errors
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  if (diff < 31536000) return `${Math.floor(diff / 2592000)}mo ago`;
  return `${Math.floor(diff / 31536000)}y ago`;
}

function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function avatarInitial(name: string): string {
  return name.charAt(0).toUpperCase();
}

const CATEGORIES = ['All', 'Street Racing', 'Drag Racing', 'Roll Racing', 'Highway Runs', 'Car Meet', 'Build', 'Other'];

// ─── Theme helpers ────────────────────────────────────────────────────────────

function getThemeColors(theme: STTheme) {
  if (theme === 'light') {
    return {
      bg: '#ffffff',
      secondary: '#f5f5f5',
      card: '#f0f0f0',
      text: '#0f0f0f',
      textSecondary: '#606060',
      border: '#e0e0e0',
      accent: '#ff0000',
      headerBg: '#ffffff',
      sidebarBg: '#f5f5f5',
      inputBg: '#f0f0f0',
      modalBg: '#ffffff',
      overlay: 'rgba(0,0,0,0.5)',
      hoverBg: '#e8e8e8',
    };
  }
  return {
    bg: '#0f0f0f',
    secondary: '#1f1f1f',
    card: '#272727',
    text: '#ffffff',
    textSecondary: '#aaaaaa',
    border: '#303030',
    accent: '#ff0000',
    headerBg: '#0f0f0f',
    sidebarBg: '#0f0f0f',
    inputBg: '#121212',
    modalBg: '#0f0f0f',
    overlay: 'rgba(0,0,0,0.7)',
    hoverBg: '#272727',
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface VideoCardProps {
  video: STVideo;
  onClick: (id: string) => void;
  onChannelClick?: (userId: string) => void;
  theme: STTheme;
}

function VideoCard({ video, onClick, onChannelClick, theme }: VideoCardProps) {
  const c = getThemeColors(theme);
  return (
    <div
      className="st-video-card"
      onClick={() => onClick(video.id)}
      style={{
        cursor: 'pointer',
        background: c.secondary,
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.02)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 20px rgba(0,0,0,0.5)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: c.card, overflow: 'hidden' }}>
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={40} color="#444" />
          </div>
        )}
        <div
          className="st-play-overlay"
          style={{
            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            opacity: 0, transition: 'opacity 0.2s',
          }}
        >
          <div style={{ width: 68, height: 48, background: 'rgba(0,0,0,0.8)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Play size={20} color="white" fill="white" />
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(0,0,0,0.8)', padding: '2px 6px', borderRadius: 4, fontSize: 12, fontWeight: 500, color: '#fff' }}>
          {video.duration}
        </div>
      </div>
      {/* Info */}
      <div style={{ display: 'flex', gap: 12, padding: 12 }}>
        <div
          onClick={e => { e.stopPropagation(); onChannelClick?.(video.userId); }}
          style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', cursor: 'pointer' }}
        >
          {avatarInitial(video.channelName)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.4, marginBottom: 4, color: c.text, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {video.title}
          </div>
          <div
            onClick={e => { e.stopPropagation(); onChannelClick?.(video.userId); }}
            style={{ fontSize: 13, color: c.textSecondary, marginBottom: 2, cursor: 'pointer' }}
          >
            {video.channelName}
          </div>
          <div style={{ fontSize: 13, color: c.textSecondary }}>{video.views.toLocaleString()} views • {formatDate(video.uploadDate)}</div>
          {video.tags && video.tags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
              {video.tags.slice(0, 3).map(tag => (
                <span key={tag} style={{ fontSize: 11, background: 'rgba(255,0,0,0.15)', color: '#ff6666', padding: '2px 6px', borderRadius: 10, border: '1px solid rgba(255,0,0,0.3)' }}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Upload Progress Bar ──────────────────────────────────────────────────────

interface UploadProgressBarProps {
  progress: number;
  label: string;
}

function UploadProgressBar({ progress, label }: UploadProgressBarProps) {
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#aaa' }}>
        <span>{label}</span>
        <span style={{ color: '#ff0000', fontWeight: 600 }}>{Math.round(progress)}%</span>
      </div>
      <div style={{ width: '100%', height: 6, background: '#333', borderRadius: 3, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #cc0000, #ff0000)',
            borderRadius: 3,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
    </div>
  );
}

// ─── Video Player with Fallback ───────────────────────────────────────────────

interface VideoPlayerProps {
  video: STVideo;
  videoRef: React.RefObject<HTMLVideoElement | null>;
}

function VideoPlayerWithFallback({ video, videoRef }: VideoPlayerProps) {
  const [videoError, setVideoError] = useState(false);

  if (videoError) {
    return (
      <div style={{ width: '100%', aspectRatio: '16/9', background: '#1a1a1a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, borderRadius: 8 }}>
        <AlertCircle size={48} color="#555" />
        <div style={{ color: '#888', fontSize: 16, fontWeight: 500 }}>Video unavailable</div>
        <div style={{ color: '#555', fontSize: 13, textAlign: 'center', maxWidth: 320, lineHeight: 1.5 }}>
          This video is no longer available in this session. Videos uploaded in previous browser sessions cannot be replayed.
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      src={video.videoUrl}
      controls
      autoPlay
      style={{ width: '100%', borderRadius: 8, background: '#000', display: 'block' }}
      onError={() => setVideoError(true)}
    />
  );
}

// ─── Search Result Card ───────────────────────────────────────────────────────

interface SearchResultCardProps {
  video: STVideo;
  onClick: (id: string) => void;
  onChannelClick?: (userId: string) => void;
  theme: STTheme;
}

function SearchResultCard({ video, onClick, onChannelClick, theme }: SearchResultCardProps) {
  const c = getThemeColors(theme);
  return (
    <div
      onClick={() => onClick(video.id)}
      style={{ display: 'flex', gap: 16, padding: '12px 0', borderBottom: `1px solid ${c.border}`, cursor: 'pointer' }}
      onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = c.hoverBg}
      onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'transparent'}
    >
      <div style={{ position: 'relative', width: 240, minWidth: 240, aspectRatio: '16/9', background: c.card, borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
        {video.thumbnail ? (
          <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Video size={32} color="#444" />
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.8)', padding: '2px 5px', borderRadius: 3, fontSize: 11, color: '#fff' }}>
          {video.duration}
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 500, color: c.text, marginBottom: 6, lineHeight: 1.4 }}>{video.title}</div>
        <div style={{ fontSize: 13, color: c.textSecondary, marginBottom: 8 }}>{video.views.toLocaleString()} views • {formatDate(video.uploadDate)}</div>
        <div
          onClick={e => { e.stopPropagation(); onChannelClick?.(video.userId); }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, cursor: 'pointer' }}
        >
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
            {avatarInitial(video.channelName)}
          </div>
          <span style={{ fontSize: 13, color: c.textSecondary }}>{video.channelName}</span>
        </div>
        <div style={{ fontSize: 13, color: c.textSecondary, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {video.description?.slice(0, 120) || ''}
        </div>
        {video.tags && video.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
            {video.tags.slice(0, 4).map(tag => (
              <span key={tag} style={{ fontSize: 11, background: 'rgba(255,0,0,0.15)', color: '#ff6666', padding: '2px 6px', borderRadius: 10, border: '1px solid rgba(255,0,0,0.3)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function StreetTubePage() {
  // Theme
  const [theme, setTheme] = useState<STTheme>(() => lsGet<STTheme>(LS_KEYS.theme, 'dark'));
  const c = getThemeColors(theme);

  // Core state
  const [users, setUsers] = useState<STUser[]>(() => lsGet<STUser[]>(LS_KEYS.users, []));
  const [videos, setVideos] = useState<STVideo[]>(() => lsGet<STVideo[]>(LS_KEYS.videos, []));
  const [subscriptions, setSubscriptions] = useState<Record<string, string[]>>(() => lsGet(LS_KEYS.subscriptions, {}));
  const [likes, setLikes] = useState<Record<string, string[]>>(() => lsGet(LS_KEYS.likes, {}));
  const [watchHistory, setWatchHistory] = useState<{ videoId: string; watchedAt: string }[]>(() => lsGet(LS_KEYS.history, []));
  const [currentUser, setCurrentUser] = useState<STUser | null>(() => lsGet<STUser | null>(LS_KEYS.currentUser, null));
  const [comments, setComments] = useState<Record<string, STComment[]>>(() => lsGet(LS_KEYS.comments, {}));
  const [watchLater, setWatchLater] = useState<Record<string, string[]>>(() => lsGet(LS_KEYS.watchlater, {}));
  const [notifications, setNotifications] = useState<Record<string, STNotification[]>>(() => lsGet(LS_KEYS.notifications, {}));

  // UI state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('home');
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Toast
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({ message: '', visible: false });

  // Auth modal
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authChannelName, setAuthChannelName] = useState('');
  const [authError, setAuthError] = useState('');

  // Upload modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Street Racing');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadProgressLabel, setUploadProgressLabel] = useState('Processing video…');
  const [capturedThumbnail, setCapturedThumbnail] = useState('');
  const [capturedDuration, setCapturedDuration] = useState('');
  const [thumbnailSliderValue, setThumbnailSliderValue] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [uploadObjectUrl, setUploadObjectUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbnailVideoRef = useRef<HTMLVideoElement>(null);
  const thumbnailCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Video player modal
  const [playerVideo, setPlayerVideo] = useState<STVideo | null>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  // Player actions
  const [commentText, setCommentText] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  // Channel profile modal
  const [channelProfileUserId, setChannelProfileUserId] = useState<string | null>(null);

  // Edit/Delete video
  const [editVideoId, setEditVideoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editTags, setEditTags] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [videoMenuOpen, setVideoMenuOpen] = useState(false);

  // ─── Persist ─────────────────────────────────────────────────────────────

  useEffect(() => { lsSet(LS_KEYS.users, users); }, [users]);
  useEffect(() => { lsSet(LS_KEYS.videos, videos); }, [videos]);
  useEffect(() => { lsSet(LS_KEYS.subscriptions, subscriptions); }, [subscriptions]);
  useEffect(() => { lsSet(LS_KEYS.likes, likes); }, [likes]);
  useEffect(() => { lsSet(LS_KEYS.history, watchHistory); }, [watchHistory]);
  useEffect(() => { lsSet(LS_KEYS.currentUser, currentUser); }, [currentUser]);
  useEffect(() => { lsSet(LS_KEYS.comments, comments); }, [comments]);
  useEffect(() => { lsSet(LS_KEYS.watchlater, watchLater); }, [watchLater]);
  useEffect(() => { lsSet(LS_KEYS.notifications, notifications); }, [notifications]);
  useEffect(() => { lsSet(LS_KEYS.theme, theme); }, [theme]);

  // ─── URL param auto-open ──────────────────────────────────────────────────

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vId = params.get('v');
    if (vId) {
      const allVideos = lsGet<STVideo[]>(LS_KEYS.videos, []);
      const found = allVideos.find(v => v.id === vId);
      if (found) {
        setVideos(allVideos);
        openPlayer(found);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Keyboard close ───────────────────────────────────────────────────────

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAuthModalOpen(false);
        if (!uploading) setUploadModalOpen(false);
        setPlayerVideo(null);
        setChannelProfileUserId(null);
        setNotifOpen(false);
        setVideoMenuOpen(false);
        setEditVideoId(null);
        setShowDeleteConfirm(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [uploading]);

  // ─── Toast helper ─────────────────────────────────────────────────────────

  const showToast = useCallback((message: string) => {
    setToast({ message, visible: true });
    setTimeout(() => setToast({ message: '', visible: false }), 3000);
  }, []);

  // ─── Theme toggle ─────────────────────────────────────────────────────────

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');

  // ─── Auth ─────────────────────────────────────────────────────────────────

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthEmail('');
    setAuthPassword('');
    setAuthChannelName('');
    setAuthError('');
    setAuthModalOpen(true);
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (authMode === 'signup') {
      if (!authChannelName.trim()) { setAuthError('Please enter a channel name'); return; }
      if (users.find(u => u.email === authEmail)) { setAuthError('Email already registered'); return; }
      const newUser: STUser = {
        id: Date.now().toString(),
        email: authEmail,
        password: authPassword,
        channelName: authChannelName.trim(),
        subscribers: 0,
        joined: new Date().toISOString(),
      };
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setAuthModalOpen(false);
    } else {
      const user = users.find(u => u.email === authEmail && u.password === authPassword);
      if (!user) { setAuthError('Invalid email or password'); return; }
      setCurrentUser(user);
      setAuthModalOpen(false);
    }
  };

  const signOut = () => {
    setCurrentUser(null);
    setViewMode('home');
  };

  // ─── Player ───────────────────────────────────────────────────────────────

  const openPlayer = useCallback((video: STVideo) => {
    // Increment view count
    setVideos(prev => {
      const updated = prev.map(v => v.id === video.id ? { ...v, views: v.views + 1 } : v);
      lsSet(LS_KEYS.videos, updated);
      return updated;
    });
    // Add to history
    setWatchHistory(prev => {
      const filtered = prev.filter(h => h.videoId !== video.id);
      return [{ videoId: video.id, watchedAt: new Date().toISOString() }, ...filtered].slice(0, 100);
    });
    setPlayerVideo({ ...video, views: video.views + 1 });
    setCommentText('');
    setVideoMenuOpen(false);
    setEditVideoId(null);
    setShowDeleteConfirm(false);
  }, []);

  const openPlayerById = useCallback((id: string) => {
    const v = videos.find(v => v.id === id);
    if (v) openPlayer(v);
  }, [videos, openPlayer]);

  // ─── Like ─────────────────────────────────────────────────────────────────

  const toggleLike = (videoId: string) => {
    if (!currentUser) { openAuthModal('signin'); return; }
    const userId = currentUser.id;
    const current = likes[videoId] || [];
    const isLiked = current.includes(userId);
    const updated = isLiked ? current.filter(id => id !== userId) : [...current, userId];
    setLikes(prev => ({ ...prev, [videoId]: updated }));
    setVideos(prev => prev.map(v => v.id === videoId ? { ...v, likes: updated.length } : v));
    if (playerVideo?.id === videoId) {
      setPlayerVideo(prev => prev ? { ...prev, likes: updated.length } : prev);
    }
    // Notify video owner on like
    if (!isLiked) {
      const vid = videos.find(v => v.id === videoId);
      if (vid && vid.userId !== userId) {
        addNotification(vid.userId, { type: 'like', videoId, videoTitle: vid.title });
      }
    }
  };

  const isLiked = (videoId: string) => currentUser ? (likes[videoId] || []).includes(currentUser.id) : false;

  // ─── Subscribe ────────────────────────────────────────────────────────────

  const toggleSubscribe = (channelUserId: string) => {
    if (!currentUser) { openAuthModal('signin'); return; }
    const myId = currentUser.id;
    const mySubs = subscriptions[myId] || [];
    const isSubbed = mySubs.includes(channelUserId);
    const updated = isSubbed ? mySubs.filter(id => id !== channelUserId) : [...mySubs, channelUserId];
    setSubscriptions(prev => ({ ...prev, [myId]: updated }));
    // Update subscriber count
    setUsers(prev => prev.map(u => u.id === channelUserId ? { ...u, subscribers: isSubbed ? Math.max(0, u.subscribers - 1) : u.subscribers + 1 } : u));
  };

  const isSubscribed = (channelUserId: string) => currentUser ? (subscriptions[currentUser.id] || []).includes(channelUserId) : false;

  // ─── Watch Later ──────────────────────────────────────────────────────────

  const toggleWatchLater = (videoId: string) => {
    if (!currentUser) { openAuthModal('signin'); return; }
    const myId = currentUser.id;
    const myList = watchLater[myId] || [];
    const isSaved = myList.includes(videoId);
    const updated = isSaved ? myList.filter(id => id !== videoId) : [...myList, videoId];
    setWatchLater(prev => ({ ...prev, [myId]: updated }));
    showToast(isSaved ? 'Removed from Watch Later' : 'Saved to Watch Later');
  };

  const isWatchLater = (videoId: string) => currentUser ? (watchLater[currentUser.id] || []).includes(videoId) : false;

  // ─── Share ────────────────────────────────────────────────────────────────

  const shareVideo = (videoId: string) => {
    const url = `${window.location.origin}${window.location.pathname}?v=${videoId}`;
    navigator.clipboard.writeText(url).then(() => showToast('Link copied!')).catch(() => showToast('Could not copy link'));
  };

  // ─── Comments ─────────────────────────────────────────────────────────────

  const submitComment = (videoId: string) => {
    if (!currentUser || !commentText.trim()) return;
    const newComment: STComment = {
      id: Date.now().toString(),
      videoId,
      userId: currentUser.id,
      channelName: currentUser.channelName,
      text: commentText.trim(),
      timestamp: new Date().toISOString(),
    };
    setComments(prev => ({ ...prev, [videoId]: [...(prev[videoId] || []), newComment] }));
    setCommentText('');
    // Notify video owner
    const vid = videos.find(v => v.id === videoId);
    if (vid && vid.userId !== currentUser.id) {
      addNotification(vid.userId, { type: 'comment', videoId, videoTitle: vid.title, channelName: currentUser.channelName });
    }
  };

  // ─── Notifications ────────────────────────────────────────────────────────

  const addNotification = (targetUserId: string, data: Omit<STNotification, 'id' | 'timestamp' | 'read'>) => {
    const notif: STNotification = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...data,
    };
    setNotifications(prev => ({
      ...prev,
      [targetUserId]: [notif, ...(prev[targetUserId] || [])].slice(0, 50),
    }));
  };

  const getMyNotifications = (): STNotification[] => {
    if (!currentUser) return [];
    return (notifications[currentUser.id] || []).slice(0, 20);
  };

  const unreadCount = () => getMyNotifications().filter(n => !n.read).length;

  const markAllRead = () => {
    if (!currentUser) return;
    setNotifications(prev => ({
      ...prev,
      [currentUser.id]: (prev[currentUser.id] || []).map(n => ({ ...n, read: true })),
    }));
  };

  const openNotifications = () => {
    setNotifOpen(true);
    markAllRead();
  };

  // ─── Edit/Delete video ────────────────────────────────────────────────────

  const startEdit = (video: STVideo) => {
    setEditVideoId(video.id);
    setEditTitle(video.title);
    setEditDesc(video.description);
    setEditCategory(video.category);
    setEditTags((video.tags || []).join(', '));
    setVideoMenuOpen(false);
  };

  const saveEdit = () => {
    if (!editVideoId) return;
    const parsedTags = editTags.split(',').map(t => t.trim()).filter(Boolean);
    setVideos(prev => prev.map(v => v.id === editVideoId ? { ...v, title: editTitle, description: editDesc, category: editCategory, tags: parsedTags } : v));
    if (playerVideo?.id === editVideoId) {
      setPlayerVideo(prev => prev ? { ...prev, title: editTitle, description: editDesc, category: editCategory, tags: parsedTags } : prev);
    }
    setEditVideoId(null);
    showToast('Video updated!');
  };

  const deleteVideo = (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
    // Clean up related data
    setLikes(prev => { const n = { ...prev }; delete n[videoId]; return n; });
    setComments(prev => { const n = { ...prev }; delete n[videoId]; return n; });
    setWatchLater(prev => {
      const n: Record<string, string[]> = {};
      for (const k in prev) n[k] = prev[k].filter(id => id !== videoId);
      return n;
    });
    setWatchHistory(prev => prev.filter(h => h.videoId !== videoId));
    setPlayerVideo(null);
    setShowDeleteConfirm(false);
    showToast('Video deleted');
  };

  // ─── Upload ───────────────────────────────────────────────────────────────

  const openUploadModal = () => {
    if (!currentUser) { openAuthModal('signin'); return; }
    setUploadTitle('');
    setUploadDesc('');
    setUploadCategory('Street Racing');
    setUploadTags('');
    setUploadFile(null);
    setUploadError('');
    setUploadSuccess('');
    setUploading(false);
    setUploadProgress(0);
    setUploadProgressLabel('Processing video…');
    setCapturedThumbnail('');
    setCapturedDuration('');
    setThumbnailSliderValue(0);
    setVideoDuration(0);
    setUploadObjectUrl('');
    setUploadModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadFile(file);
    setUploadError('');
    setCapturedThumbnail('');
    setCapturedDuration('');
    setThumbnailSliderValue(0);
    setVideoDuration(0);
    if (uploadObjectUrl) URL.revokeObjectURL(uploadObjectUrl);
    setUploadObjectUrl('');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setUploadFile(file);
      setUploadError('');
    } else if (file) {
      setUploadError('Please drop a valid video file.');
    }
  };

  const processVideoFile = (objectUrl: string): Promise<{ duration: string; thumbnail: string; durationSeconds: number }> => {
    return new Promise((resolve, reject) => {
      const videoEl = document.createElement('video');
      videoEl.muted = true;
      videoEl.preload = 'metadata';
      videoEl.playsInline = true;
      let timeoutId: ReturnType<typeof setTimeout>;

      const cleanup = () => {
        clearTimeout(timeoutId);
        videoEl.removeAttribute('src');
        videoEl.load();
      };

      const captureFrame = () => {
        try {
          const canvas = document.createElement('canvas');
          const w = videoEl.videoWidth || 640;
          const h = videoEl.videoHeight || 360;
          const maxDim = 1280;
          const scale = Math.min(1, maxDim / Math.max(w, h));
          canvas.width = Math.round(w * scale);
          canvas.height = Math.round(h * scale);
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
          const thumbnail = canvas.toDataURL('image/jpeg', 0.75);
          const durationSeconds = videoEl.duration || 0;
          const duration = formatDuration(durationSeconds);
          cleanup();
          resolve({ duration, thumbnail, durationSeconds });
        } catch (err) {
          cleanup();
          reject(err);
        }
      };

      videoEl.addEventListener('loadedmetadata', () => {
        const seekTo = Math.min(1, (videoEl.duration || 0) * 0.1);
        if (seekTo > 0 && isFinite(seekTo)) {
          videoEl.currentTime = seekTo;
        } else {
          captureFrame();
        }
      });

      videoEl.addEventListener('seeked', () => captureFrame());
      videoEl.addEventListener('error', () => {
        cleanup();
        reject(new Error('Could not process video file. Please try another file.'));
      });

      timeoutId = setTimeout(() => {
        cleanup();
        reject(new Error('Video processing timed out. Please try a different file format.'));
      }, 30000);

      videoEl.src = objectUrl;
    });
  };

  const handlePreviewThumbnail = async () => {
    if (!uploadFile) return;
    setUploadError('');
    setUploadProgress(10);
    setUploadProgressLabel('Extracting thumbnail…');
    setUploading(true);
    try {
      const objUrl = URL.createObjectURL(uploadFile);
      setUploadObjectUrl(objUrl);
      const { duration, thumbnail, durationSeconds } = await processVideoFile(objUrl);
      setCapturedThumbnail(thumbnail);
      setCapturedDuration(duration);
      setVideoDuration(durationSeconds);
      setThumbnailSliderValue(Math.min(1, durationSeconds * 0.1));
      // Set up thumbnail video element
      if (thumbnailVideoRef.current) {
        thumbnailVideoRef.current.src = objUrl;
      }
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Failed to process video');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSliderChange = (val: number) => {
    setThumbnailSliderValue(val);
    if (thumbnailVideoRef.current) {
      thumbnailVideoRef.current.currentTime = val;
    }
  };

  const captureThumbnailFromSlider = () => {
    const videoEl = thumbnailVideoRef.current;
    const canvas = thumbnailCanvasRef.current;
    if (!videoEl || !canvas) return;
    const w = videoEl.videoWidth || 640;
    const h = videoEl.videoHeight || 360;
    const maxDim = 1280;
    const scale = Math.min(1, maxDim / Math.max(w, h));
    canvas.width = Math.round(w * scale);
    canvas.height = Math.round(h * scale);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
      setCapturedThumbnail(canvas.toDataURL('image/jpeg', 0.75));
      showToast('Thumbnail captured!');
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) { setUploadError('Please select a video file'); return; }
    if (!uploadTitle.trim()) { setUploadError('Please enter a title'); return; }
    if (!currentUser) return;

    setUploading(true);
    setUploadError('');
    setUploadProgress(10);
    setUploadProgressLabel('Creating video URL…');

    try {
      const objectUrl = uploadObjectUrl || URL.createObjectURL(uploadFile);
      if (!uploadObjectUrl) setUploadObjectUrl(objectUrl);
      setUploadProgress(25);
      setUploadProgressLabel('Extracting video metadata…');

      let thumbnail = capturedThumbnail;
      let duration = capturedDuration;
      if (!thumbnail) {
        const result = await processVideoFile(objectUrl);
        thumbnail = result.thumbnail;
        duration = result.duration;
      }

      setUploadProgress(80);
      setUploadProgressLabel('Saving video…');

      const parsedTags = uploadTags.split(',').map(t => t.trim()).filter(Boolean);

      const newVideo: STVideo = {
        id: Date.now().toString(),
        title: uploadTitle.trim(),
        description: uploadDesc.trim(),
        category: uploadCategory,
        videoUrl: objectUrl,
        thumbnail,
        duration,
        userId: currentUser.id,
        channelName: currentUser.channelName,
        views: 0,
        likes: 0,
        uploadDate: new Date().toISOString(),
        tags: parsedTags,
      };

      setVideos(prev => [newVideo, ...prev]);
      setUploadProgress(100);
      setUploadProgressLabel('Done!');
      setUploadSuccess('Video uploaded successfully!');

      // Notify subscribers
      const myId = currentUser.id;
      for (const userId in subscriptions) {
        if ((subscriptions[userId] || []).includes(myId)) {
          addNotification(userId, { type: 'new_upload', videoId: newVideo.id, channelId: myId, channelName: currentUser.channelName, videoTitle: newVideo.title });
        }
      }

      setTimeout(() => {
        setUploadModalOpen(false);
        setUploading(false);
        setUploadProgress(0);
        setUploadSuccess('');
        setCapturedThumbnail('');
        setCapturedDuration('');
        setUploadObjectUrl('');
      }, 1500);
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // ─── Filtered videos ──────────────────────────────────────────────────────

  const getFilteredVideos = (): STVideo[] => {
    let result = [...videos];
    if (viewMode === 'home') {
      if (activeCategory !== 'All') result = result.filter(v => v.category === activeCategory);
      return result.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    }
    if (viewMode === 'trending') {
      return result.sort((a, b) => b.views - a.views).slice(0, 20);
    }
    if (viewMode === 'subscriptions') {
      if (!currentUser) return [];
      const mySubs = subscriptions[currentUser.id] || [];
      return result.filter(v => mySubs.includes(v.userId)).sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
    }
    if (viewMode === 'history') {
      const historyIds = watchHistory.map(h => h.videoId);
      return historyIds.map(id => result.find(v => v.id === id)).filter(Boolean) as STVideo[];
    }
    if (viewMode === 'liked') {
      if (!currentUser) return [];
      const likedIds = Object.entries(likes).filter(([, ids]) => ids.includes(currentUser.id)).map(([id]) => id);
      return result.filter(v => likedIds.includes(v.id));
    }
    if (viewMode === 'watchlater') {
      if (!currentUser) return [];
      const myList = watchLater[currentUser.id] || [];
      return myList.map(id => result.find(v => v.id === id)).filter(Boolean) as STVideo[];
    }
    if (viewMode === 'search') {
      const q = searchQuery.toLowerCase();
      return result.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.description.toLowerCase().includes(q) ||
        v.channelName.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q) ||
        (v.tags || []).some(t => t.toLowerCase().includes(q))
      );
    }
    return result;
  };

  const filteredVideos = getFilteredVideos();

  // ─── Channel profile ──────────────────────────────────────────────────────

  const channelUser = channelProfileUserId ? users.find(u => u.id === channelProfileUserId) : null;
  const channelVideos = channelProfileUserId ? videos.filter(v => v.userId === channelProfileUserId) : [];

  // ─── Sidebar nav items ────────────────────────────────────────────────────

  const navItems: { icon: React.ReactNode; label: string; view: ViewMode }[] = [
    { icon: <Home size={20} />, label: 'Home', view: 'home' },
    { icon: <TrendingUp size={20} />, label: 'Trending', view: 'trending' },
    { icon: <Users size={20} />, label: 'Subscriptions', view: 'subscriptions' },
  ];

  const libraryItems: { icon: React.ReactNode; label: string; view: ViewMode }[] = [
    { icon: <History size={20} />, label: 'History', view: 'history' },
    { icon: <ThumbsUp size={20} />, label: 'Liked Videos', view: 'liked' },
    { icon: <Clock size={20} />, label: 'Watch Later', view: 'watchlater' },
  ];

  // ─── View title ───────────────────────────────────────────────────────────

  const viewTitle: Record<ViewMode, string> = {
    home: 'Home',
    trending: '🔥 Trending',
    subscriptions: 'Subscriptions',
    history: 'Watch History',
    liked: 'Liked Videos',
    profile: 'My Channel',
    search: `Results for "${searchQuery}"`,
    watchlater: 'Watch Later',
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ minHeight: '100vh', background: c.bg, color: c.text, fontFamily: "'Roboto', 'Arial', sans-serif", position: 'relative' }}>
      {/* CSS for hover effects */}
      <style>{`
        .st-video-card:hover .st-play-overlay { opacity: 1 !important; }
        .st-sidebar-item:hover { background: ${c.hoverBg} !important; }
        .st-nav-btn:hover { background: ${c.hoverBg} !important; }
        .st-notif-item:hover { background: ${c.hoverBg} !important; }
      `}</style>

      {/* ── Toast ── */}
      {toast.visible && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#ff0000', color: '#fff', padding: '10px 24px', borderRadius: 24,
          fontWeight: 600, fontSize: 14, zIndex: 9999, boxShadow: '0 4px 20px rgba(255,0,0,0.4)',
          pointerEvents: 'none',
        }}>
          {toast.message}
        </div>
      )}

      {/* ── Header ── */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: c.headerBg, borderBottom: `1px solid ${c.border}`,
        display: 'flex', alignItems: 'center', gap: 16, padding: '0 16px', height: 56,
      }}>
        {/* Left */}
        <button
          className="st-nav-btn"
          onClick={() => setSidebarOpen(o => !o)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, padding: 8, borderRadius: 8 }}
        >
          <Menu size={22} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: c.text }}>
          <PlayCircle size={28} color="#ff0000" fill="#ff0000" />
          <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: -0.5 }}>StreetTube</span>
        </div>

        {/* Search */}
        <form
          onSubmit={e => { e.preventDefault(); if (searchInput.trim()) { setSearchQuery(searchInput.trim()); setViewMode('search'); } else { setViewMode('home'); } }}
          style={{ flex: 1, display: 'flex', maxWidth: 600, margin: '0 auto' }}
        >
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search videos, channels, tags…"
            style={{
              flex: 1, height: 40, padding: '0 16px', background: c.inputBg,
              border: `1px solid ${c.border}`, borderRight: 'none',
              borderRadius: '20px 0 0 20px', color: c.text, fontSize: 15, outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              height: 40, padding: '0 20px', background: c.secondary,
              border: `1px solid ${c.border}`, borderLeft: 'none',
              borderRadius: '0 20px 20px 0', cursor: 'pointer', color: c.text,
            }}
          >
            <Search size={18} />
          </button>
          {viewMode === 'search' && (
            <button
              type="button"
              onClick={() => { setSearchInput(''); setSearchQuery(''); setViewMode('home'); }}
              style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: c.textSecondary, padding: 4 }}
            >
              <X size={18} />
            </button>
          )}
        </form>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Theme toggle */}
          <button
            className="st-nav-btn"
            onClick={toggleTheme}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, padding: 8, borderRadius: 8 }}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* Notifications */}
          {currentUser && (
            <div style={{ position: 'relative' }}>
              <button
                className="st-nav-btn"
                onClick={notifOpen ? () => setNotifOpen(false) : openNotifications}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.text, padding: 8, borderRadius: 8, position: 'relative' }}
              >
                <Bell size={22} />
                {unreadCount() > 0 && (
                  <span style={{
                    position: 'absolute', top: 4, right: 4, background: '#ff0000', color: '#fff',
                    borderRadius: '50%', width: 16, height: 16, fontSize: 10, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {unreadCount() > 9 ? '9+' : unreadCount()}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: 44, width: 360, maxHeight: 480,
                  background: c.secondary, border: `1px solid ${c.border}`, borderRadius: 12,
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)', zIndex: 200, overflow: 'hidden',
                }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${c.border}`, fontWeight: 600, fontSize: 15 }}>
                    Notifications
                  </div>
                  <div style={{ overflowY: 'auto', maxHeight: 400 }}>
                    {getMyNotifications().length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: c.textSecondary, fontSize: 14 }}>No notifications yet</div>
                    ) : getMyNotifications().map(n => (
                      <div
                        key={n.id}
                        className="st-notif-item"
                        onClick={() => { openPlayerById(n.videoId); setNotifOpen(false); }}
                        style={{
                          padding: '12px 16px', cursor: 'pointer', borderBottom: `1px solid ${c.border}`,
                          background: n.read ? 'transparent' : 'rgba(255,0,0,0.08)',
                        }}
                      >
                        <div style={{ fontSize: 13, color: c.text, marginBottom: 4 }}>
                          {n.type === 'new_upload' && `📹 ${n.channelName} uploaded: ${n.videoTitle}`}
                          {n.type === 'like' && `❤️ Someone liked your video: ${n.videoTitle}`}
                          {n.type === 'comment' && `💬 ${n.channelName} commented on: ${n.videoTitle}`}
                        </div>
                        <div style={{ fontSize: 11, color: c.textSecondary }}>{formatDate(n.timestamp)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Upload */}
          {currentUser && (
            <button
              onClick={openUploadModal}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px',
                background: c.secondary, border: `1px solid ${c.border}`, borderRadius: 20,
                cursor: 'pointer', color: c.text, fontSize: 14, fontWeight: 500,
              }}
            >
              <Plus size={16} /> Upload
            </button>
          )}

          {/* Auth */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div
                onClick={() => setViewMode('profile')}
                style={{ width: 32, height: 32, borderRadius: '50%', background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', cursor: 'pointer' }}
              >
                {avatarInitial(currentUser.channelName)}
              </div>
              <button
                className="st-nav-btn"
                onClick={signOut}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textSecondary, padding: 6, borderRadius: 8 }}
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => openAuthModal('signin')}
              style={{ padding: '6px 16px', background: 'transparent', border: '1px solid #3ea6ff', borderRadius: 20, color: '#3ea6ff', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}
            >
              Sign in
            </button>
          )}
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display: 'flex' }}>
        {/* ── Sidebar ── */}
        {sidebarOpen && (
          <aside style={{
            width: 240, flexShrink: 0, background: c.sidebarBg,
            borderRight: `1px solid ${c.border}`, minHeight: 'calc(100vh - 56px)',
            padding: '12px 0', position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflowY: 'auto',
          }}>
            {navItems.map(item => (
              <button
                key={item.view}
                className="st-sidebar-item"
                onClick={() => setViewMode(item.view)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, width: '100%',
                  padding: '10px 24px', background: viewMode === item.view ? (theme === 'dark' ? '#272727' : '#e8e8e8') : 'transparent',
                  border: 'none', cursor: 'pointer', color: viewMode === item.view ? c.text : c.textSecondary,
                  fontSize: 14, fontWeight: viewMode === item.view ? 600 : 400, textAlign: 'left',
                  borderLeft: viewMode === item.view ? '3px solid #ff0000' : '3px solid transparent',
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            <div style={{ margin: '12px 24px', borderTop: `1px solid ${c.border}` }} />
            <div style={{ padding: '4px 24px 8px', fontSize: 13, fontWeight: 600, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>Library</div>

            {libraryItems.map(item => (
              <button
                key={item.view}
                className="st-sidebar-item"
                onClick={() => { if (!currentUser && (item.view === 'liked' || item.view === 'watchlater')) { openAuthModal('signin'); return; } setViewMode(item.view); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16, width: '100%',
                  padding: '10px 24px', background: viewMode === item.view ? (theme === 'dark' ? '#272727' : '#e8e8e8') : 'transparent',
                  border: 'none', cursor: 'pointer', color: viewMode === item.view ? c.text : c.textSecondary,
                  fontSize: 14, fontWeight: viewMode === item.view ? 600 : 400, textAlign: 'left',
                  borderLeft: viewMode === item.view ? '3px solid #ff0000' : '3px solid transparent',
                }}
              >
                {item.icon}
                {item.label}
              </button>
            ))}

            {currentUser && (
              <>
                <div style={{ margin: '12px 24px', borderTop: `1px solid ${c.border}` }} />
                <div style={{ padding: '4px 24px 8px', fontSize: 13, fontWeight: 600, color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 }}>My Channel</div>
                <button
                  className="st-sidebar-item"
                  onClick={() => setViewMode('profile')}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, width: '100%',
                    padding: '10px 24px', background: viewMode === 'profile' ? (theme === 'dark' ? '#272727' : '#e8e8e8') : 'transparent',
                    border: 'none', cursor: 'pointer', color: viewMode === 'profile' ? c.text : c.textSecondary,
                    fontSize: 14, fontWeight: viewMode === 'profile' ? 600 : 400, textAlign: 'left',
                    borderLeft: viewMode === 'profile' ? '3px solid #ff0000' : '3px solid transparent',
                  }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                    {avatarInitial(currentUser.channelName)}
                  </div>
                  {currentUser.channelName}
                </button>
              </>
            )}

            {/* Footer */}
            <div style={{ padding: '24px 24px 12px', fontSize: 11, color: c.textSecondary, lineHeight: 1.8 }}>
              <div>© {new Date().getFullYear()} StreetTube</div>
              <div>Built with ❤️ using <a href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`} target="_blank" rel="noopener noreferrer" style={{ color: '#ff0000', textDecoration: 'none' }}>caffeine.ai</a></div>
            </div>
          </aside>
        )}

        {/* ── Main Content ── */}
        <main style={{ flex: 1, minWidth: 0, padding: '24px 24px 80px' }}>
          {/* Category pills (home only) */}
          {viewMode === 'home' && (
            <div style={{ display: 'flex', gap: 8, overflowX: 'auto', marginBottom: 24, paddingBottom: 4 }}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  style={{
                    padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                    background: activeCategory === cat ? c.text : c.secondary,
                    color: activeCategory === cat ? c.bg : c.text,
                    fontSize: 14, fontWeight: activeCategory === cat ? 600 : 400,
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* View title */}
          {viewMode !== 'home' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              {viewMode === 'search' && (
                <button
                  onClick={() => { setViewMode('home'); setSearchInput(''); setSearchQuery(''); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textSecondary, padding: 4 }}
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <h2 style={{ fontSize: 22, fontWeight: 700, color: c.text, margin: 0 }}>{viewTitle[viewMode]}</h2>
            </div>
          )}

          {/* Search results */}
          {viewMode === 'search' && (
            <div>
              {filteredVideos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: c.textSecondary }}>
                  <Search size={48} style={{ marginBottom: 16, opacity: 0.4 }} />
                  <div style={{ fontSize: 18, fontWeight: 500 }}>No results found for "{searchQuery}"</div>
                  <div style={{ fontSize: 14, marginTop: 8 }}>Try different keywords or check your spelling</div>
                </div>
              ) : (
                <div>
                  {filteredVideos.map(v => (
                    <SearchResultCard
                      key={v.id}
                      video={v}
                      onClick={openPlayerById}
                      onChannelClick={setChannelProfileUserId}
                      theme={theme}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Profile view */}
          {viewMode === 'profile' && currentUser && (
            <div>
              <div style={{ background: c.secondary, borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: '#fff' }}>
                    {avatarInitial(currentUser.channelName)}
                  </div>
                  <div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: c.text }}>{currentUser.channelName}</div>
                    <div style={{ fontSize: 14, color: c.textSecondary, marginTop: 4 }}>
                      {users.find(u => u.id === currentUser.id)?.subscribers || 0} subscribers • {videos.filter(v => v.userId === currentUser.id).length} videos
                    </div>
                    <div style={{ fontSize: 13, color: c.textSecondary, marginTop: 2 }}>Joined {formatDate(currentUser.joined)}</div>
                  </div>
                </div>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16, color: c.text }}>Your Videos</h3>
              {videos.filter(v => v.userId === currentUser.id).length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: c.textSecondary }}>
                  <Video size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
                  <div>No videos yet. Upload your first video!</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                  {videos.filter(v => v.userId === currentUser.id).map(v => (
                    <VideoCard key={v.id} video={v} onClick={openPlayerById} onChannelClick={setChannelProfileUserId} theme={theme} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Grid views */}
          {viewMode !== 'search' && viewMode !== 'profile' && (
            <>
              {filteredVideos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '80px 0', color: c.textSecondary }}>
                  <Video size={64} style={{ marginBottom: 16, opacity: 0.3 }} />
                  <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8 }}>
                    {viewMode === 'home' ? 'No videos yet' :
                      viewMode === 'subscriptions' ? 'Subscribe to channels to see their videos here' :
                        viewMode === 'watchlater' ? 'No saved videos yet' :
                          viewMode === 'history' ? 'No watch history yet' :
                            viewMode === 'liked' ? 'No liked videos yet' :
                              viewMode === 'trending' ? 'No videos to trend yet' : 'Nothing here'}
                  </div>
                  {viewMode === 'home' && (
                    <button
                      onClick={openUploadModal}
                      style={{ marginTop: 16, padding: '10px 24px', background: '#ff0000', color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 15, fontWeight: 600 }}
                    >
                      Upload First Video
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
                  {filteredVideos.map(v => (
                    <VideoCard key={v.id} video={v} onClick={openPlayerById} onChannelClick={setChannelProfileUserId} theme={theme} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ── Auth Modal ── */}
      {authModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: c.overlay, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setAuthModalOpen(false)}
        >
          <div
            style={{ background: c.secondary, borderRadius: 16, padding: 32, width: '100%', maxWidth: 400, border: `1px solid ${c.border}` }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: c.text, margin: 0 }}>
                {authMode === 'signin' ? 'Sign in to StreetTube' : 'Create Account'}
              </h2>
              <button onClick={() => setAuthModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textSecondary }}>
                <X size={22} />
              </button>
            </div>
            <form onSubmit={handleAuth}>
              {authMode === 'signup' && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: c.textSecondary, marginBottom: 6 }}>Channel Name</label>
                  <input
                    value={authChannelName}
                    onChange={e => setAuthChannelName(e.target.value)}
                    placeholder="Your channel name"
                    required
                    style={{ width: '100%', padding: '10px 14px', background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>
              )}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, color: c.textSecondary, marginBottom: 6 }}>Email</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={e => setAuthEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{ width: '100%', padding: '10px 14px', background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 13, color: c.textSecondary, marginBottom: 6 }}>Password</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={e => setAuthPassword(e.target.value)}
                  placeholder="Password"
                  required
                  style={{ width: '100%', padding: '10px 14px', background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              {authError && <div style={{ color: '#ff4444', fontSize: 13, marginBottom: 16 }}>{authError}</div>}
              <button
                type="submit"
                style={{ width: '100%', padding: '12px', background: '#ff0000', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16, fontWeight: 600 }}
              >
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: c.textSecondary }}>
              {authMode === 'signin' ? (
                <>Don't have an account? <button onClick={() => setAuthMode('signup')} style={{ background: 'none', border: 'none', color: '#3ea6ff', cursor: 'pointer', fontSize: 14 }}>Sign up</button></>
              ) : (
                <>Already have an account? <button onClick={() => setAuthMode('signin')} style={{ background: 'none', border: 'none', color: '#3ea6ff', cursor: 'pointer', fontSize: 14 }}>Sign in</button></>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Upload Modal ── */}
      {uploadModalOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: c.overlay, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, overflowY: 'auto' }}
          onClick={() => { if (!uploading) setUploadModalOpen(false); }}
        >
          <div
            style={{ background: c.secondary, borderRadius: 16, padding: 32, width: '100%', maxWidth: 560, border: `1px solid ${c.border}`, margin: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: c.text, margin: 0 }}>Upload Video</h2>
              {!uploading && (
                <button onClick={() => setUploadModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textSecondary }}>
                  <X size={22} />
                </button>
              )}
            </div>

            {uploadSuccess ? (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#4caf50' }}>{uploadSuccess}</div>
              </div>
            ) : (
              <form onSubmit={handleUpload}>
                {/* Drop zone */}
                {!uploadFile ? (
                  <div
                    onDrop={handleDrop}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${isDragging ? '#ff0000' : c.border}`,
                      borderRadius: 12, padding: '40px 20px', textAlign: 'center',
                      cursor: 'pointer', marginBottom: 20, background: isDragging ? 'rgba(255,0,0,0.05)' : 'transparent',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Video size={48} color={isDragging ? '#ff0000' : '#555'} style={{ marginBottom: 12 }} />
                    <div style={{ fontSize: 16, fontWeight: 500, color: c.text, marginBottom: 8 }}>
                      {isDragging ? 'Drop your video here' : 'Click or drag & drop a video'}
                    </div>
                    <div style={{ fontSize: 13, color: c.textSecondary }}>MP4, MOV, AVI, MKV — any size supported</div>
                    <input ref={fileInputRef} type="file" accept="video/*" onChange={handleFileSelect} style={{ display: 'none' }} />
                  </div>
                ) : (
                  <div style={{ background: c.card, borderRadius: 10, padding: 14, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Video size={24} color="#ff0000" />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 500, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{uploadFile.name}</div>
                      <div style={{ fontSize: 12, color: c.textSecondary }}>{formatFileSize(uploadFile.size)}</div>
                    </div>
                    {!uploading && (
                      <button
                        type="button"
                        onClick={() => { setUploadFile(null); setCapturedThumbnail(''); setCapturedDuration(''); setUploadObjectUrl(''); }}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textSecondary }}
                      >
                        <X size={18} />
                      </button>
                    )}
                  </div>
                )}

                {/* Thumbnail preview & customization */}
                {uploadFile && !capturedThumbnail && !uploading && (
                  <button
                    type="button"
                    onClick={handlePreviewThumbnail}
                    style={{ width: '100%', padding: '10px', background: c.card, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, cursor: 'pointer', fontSize: 14, marginBottom: 16 }}
                  >
                    Preview & Customize Thumbnail
                  </button>
                )}

                {capturedThumbnail && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: c.text, marginBottom: 10 }}>Thumbnail</div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <img src={capturedThumbnail} alt="thumbnail" style={{ width: 160, borderRadius: 8, aspectRatio: '16/9', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: c.textSecondary, marginBottom: 8 }}>Drag slider to pick a frame:</div>
                        <input
                          type="range"
                          min={0}
                          max={videoDuration || 100}
                          step={0.1}
                          value={thumbnailSliderValue}
                          onChange={e => handleSliderChange(parseFloat(e.target.value))}
                          style={{ width: '100%', accentColor: '#ff0000', marginBottom: 8 }}
                        />
                        <div style={{ fontSize: 12, color: c.textSecondary, marginBottom: 8 }}>
                          {formatDuration(thumbnailSliderValue)} / {capturedDuration}
                        </div>
                        <button
                          type="button"
                          onClick={captureThumbnailFromSlider}
                          style={{ padding: '6px 14px', background: '#ff0000', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
                        >
                          Capture Frame
                        </button>
                      </div>
                    </div>
                    {/* Hidden video for seeking */}
                    <video ref={thumbnailVideoRef} muted playsInline style={{ display: 'none' }} />
                    <canvas ref={thumbnailCanvasRef} style={{ display: 'none' }} />
                  </div>
                )}

                {/* Title */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: c.textSecondary, marginBottom: 6 }}>Title *</label>
                  <input
                    value={uploadTitle}
                    onChange={e => setUploadTitle(e.target.value)}
                    placeholder="Give your video a title"
                    required
                    style={{ width: '100%', padding: '10px 14px', background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Description */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: c.textSecondary, marginBottom: 6 }}>Description</label>
                  <textarea
                    value={uploadDesc}
                    onChange={e => setUploadDesc(e.target.value)}
                    placeholder="Describe your video…"
                    rows={3}
                    style={{ width: '100%', padding: '10px 14px', background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, fontSize: 15, outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
                  />
                </div>

                {/* Category */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 13, color: c.textSecondary, marginBottom: 6 }}>Category</label>
                  <select
                    value={uploadCategory}
                    onChange={e => setUploadCategory(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                  >
                    {CATEGORIES.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, color: c.textSecondary, marginBottom: 6 }}>
                    <Tag size={13} style={{ display: 'inline', marginRight: 4 }} />
                    Tags (comma-separated)
                  </label>
                  <input
                    value={uploadTags}
                    onChange={e => setUploadTags(e.target.value)}
                    placeholder="JDM, turbo, Honda, street racing…"
                    style={{ width: '100%', padding: '10px 14px', background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                  />
                </div>

                {uploadError && <div style={{ color: '#ff4444', fontSize: 13, marginBottom: 16 }}>{uploadError}</div>}
                {uploading && <UploadProgressBar progress={uploadProgress} label={uploadProgressLabel} />}

                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    width: '100%', padding: '12px', background: uploading ? '#555' : '#ff0000',
                    color: '#fff', border: 'none', borderRadius: 8, cursor: uploading ? 'not-allowed' : 'pointer',
                    fontSize: 16, fontWeight: 600, marginTop: 8,
                  }}
                >
                  {uploading ? 'Uploading…' : 'Upload Video'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ── Video Player Modal ── */}
      {playerVideo && (
        <div
          style={{ position: 'fixed', inset: 0, background: c.overlay, zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' }}
          onClick={() => { setPlayerVideo(null); setVideoMenuOpen(false); setEditVideoId(null); setShowDeleteConfirm(false); }}
        >
          <div
            style={{ background: c.modalBg, borderRadius: 16, width: '100%', maxWidth: 900, border: `1px solid ${c.border}`, overflow: 'hidden', margin: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Video */}
            <VideoPlayerWithFallback video={playerVideo} videoRef={videoPlayerRef} />

            {/* Info */}
            <div style={{ padding: '16px 20px' }}>
              {/* Title row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
                {editVideoId === playerVideo.id ? (
                  <div style={{ flex: 1 }}>
                    <input
                      value={editTitle}
                      onChange={e => setEditTitle(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, fontSize: 18, fontWeight: 700, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                    />
                    <textarea
                      value={editDesc}
                      onChange={e => setEditDesc(e.target.value)}
                      rows={3}
                      style={{ width: '100%', padding: '8px 12px', background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, fontSize: 14, outline: 'none', resize: 'vertical', boxSizing: 'border-box', marginBottom: 8 }}
                    />
                    <select
                      value={editCategory}
                      onChange={e => setEditCategory(e.target.value)}
                      style={{ width: '100%', padding: '8px 12px', background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, fontSize: 14, outline: 'none', marginBottom: 8 }}
                    >
                      {CATEGORIES.filter(cat => cat !== 'All').map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <input
                      value={editTags}
                      onChange={e => setEditTags(e.target.value)}
                      placeholder="Tags (comma-separated)"
                      style={{ width: '100%', padding: '8px 12px', background: c.inputBg, border: `1px solid ${c.border}`, borderRadius: 8, color: c.text, fontSize: 14, outline: 'none', boxSizing: 'border-box', marginBottom: 8 }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={saveEdit} style={{ padding: '8px 20px', background: '#ff0000', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Save</button>
                      <button onClick={() => setEditVideoId(null)} style={{ padding: '8px 20px', background: c.secondary, color: c.text, border: `1px solid ${c.border}`, borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: c.text, margin: 0, flex: 1, lineHeight: 1.3 }}>{playerVideo.title}</h2>
                )}

                {/* Owner menu */}
                {currentUser && currentUser.id === playerVideo.userId && editVideoId !== playerVideo.id && (
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <button
                      onClick={() => setVideoMenuOpen(o => !o)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textSecondary, padding: 6, borderRadius: 8 }}
                    >
                      <MoreVertical size={20} />
                    </button>
                    {videoMenuOpen && (
                      <div style={{ position: 'absolute', right: 0, top: 36, background: c.secondary, border: `1px solid ${c.border}`, borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', zIndex: 10, minWidth: 140, overflow: 'hidden' }}>
                        <button
                          onClick={() => startEdit(playerVideo)}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: c.text, fontSize: 14 }}
                        >
                          <Edit3 size={16} /> Edit
                        </button>
                        <button
                          onClick={() => { setShowDeleteConfirm(true); setVideoMenuOpen(false); }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444', fontSize: 14 }}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Close */}
                <button
                  onClick={() => { setPlayerVideo(null); setVideoMenuOpen(false); setEditVideoId(null); setShowDeleteConfirm(false); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: c.textSecondary, padding: 6, flexShrink: 0 }}
                >
                  <X size={22} />
                </button>
              </div>

              {/* Delete confirm */}
              {showDeleteConfirm && (
                <div style={{ background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 15, fontWeight: 600, color: c.text, marginBottom: 12 }}>Delete this video?</div>
                  <div style={{ fontSize: 13, color: c.textSecondary, marginBottom: 16 }}>This action cannot be undone. The video will be permanently removed.</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => deleteVideo(playerVideo.id)} style={{ padding: '8px 20px', background: '#ff0000', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Delete</button>
                    <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: '8px 20px', background: c.secondary, color: c.text, border: `1px solid ${c.border}`, borderRadius: 8, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              )}

              {/* Stats row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
                <div style={{ fontSize: 14, color: c.textSecondary }}>
                  {playerVideo.views.toLocaleString()} views • {formatDate(playerVideo.uploadDate)} • {playerVideo.category}
                </div>
                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => toggleLike(playerVideo.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                      background: isLiked(playerVideo.id) ? 'rgba(255,0,0,0.15)' : c.secondary,
                      border: `1px solid ${isLiked(playerVideo.id) ? '#ff0000' : c.border}`,
                      borderRadius: 20, cursor: 'pointer', color: isLiked(playerVideo.id) ? '#ff0000' : c.text, fontSize: 14,
                    }}
                  >
                    <ThumbsUp size={16} fill={isLiked(playerVideo.id) ? '#ff0000' : 'none'} />
                    {playerVideo.likes}
                  </button>
                  <button
                    onClick={() => shareVideo(playerVideo.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: c.secondary, border: `1px solid ${c.border}`, borderRadius: 20, cursor: 'pointer', color: c.text, fontSize: 14 }}
                  >
                    <Share2 size={16} /> Share
                  </button>
                  <button
                    onClick={() => toggleWatchLater(playerVideo.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                      background: isWatchLater(playerVideo.id) ? 'rgba(255,0,0,0.15)' : c.secondary,
                      border: `1px solid ${isWatchLater(playerVideo.id) ? '#ff0000' : c.border}`,
                      borderRadius: 20, cursor: 'pointer', color: isWatchLater(playerVideo.id) ? '#ff0000' : c.text, fontSize: 14,
                    }}
                  >
                    <Bookmark size={16} fill={isWatchLater(playerVideo.id) ? '#ff0000' : 'none'} />
                    {isWatchLater(playerVideo.id) ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Channel row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderTop: `1px solid ${c.border}`, borderBottom: `1px solid ${c.border}`, marginBottom: 16 }}>
                <div
                  style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                  onClick={() => setChannelProfileUserId(playerVideo.userId)}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 16, color: '#fff' }}>
                    {avatarInitial(playerVideo.channelName)}
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: c.text }}>{playerVideo.channelName}</div>
                    <div style={{ fontSize: 13, color: c.textSecondary }}>
                      {(users.find(u => u.id === playerVideo.userId)?.subscribers || 0).toLocaleString()} subscribers
                    </div>
                  </div>
                </div>
                {currentUser && currentUser.id !== playerVideo.userId && (
                  <button
                    onClick={() => toggleSubscribe(playerVideo.userId)}
                    style={{
                      padding: '8px 20px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
                      background: isSubscribed(playerVideo.userId) ? c.secondary : '#ff0000',
                      color: isSubscribed(playerVideo.userId) ? c.text : '#fff',
                    }}
                  >
                    {isSubscribed(playerVideo.userId) ? 'Subscribed ✓' : 'Subscribe'}
                  </button>
                )}
              </div>

              {/* Description */}
              {playerVideo.description && editVideoId !== playerVideo.id && (
                <div style={{ fontSize: 14, color: c.textSecondary, lineHeight: 1.6, marginBottom: 12, whiteSpace: 'pre-wrap' }}>
                  {playerVideo.description}
                </div>
              )}

              {/* Tags */}
              {playerVideo.tags && playerVideo.tags.length > 0 && editVideoId !== playerVideo.id && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {playerVideo.tags.map(tag => (
                    <span
                      key={tag}
                      onClick={() => { setSearchInput(tag); setSearchQuery(tag); setViewMode('search'); setPlayerVideo(null); }}
                      style={{ fontSize: 13, background: 'rgba(255,0,0,0.15)', color: '#ff6666', padding: '4px 10px', borderRadius: 12, border: '1px solid rgba(255,0,0,0.3)', cursor: 'pointer' }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Comments */}
              <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: c.text, marginBottom: 16 }}>
                  {(comments[playerVideo.id] || []).length} Comments
                </h3>

                {/* Comment input */}
                {currentUser ? (
                  <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#ff0000', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0 }}>
                      {avatarInitial(currentUser.channelName)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <input
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitComment(playerVideo.id); } }}
                        placeholder="Add a comment…"
                        style={{ width: '100%', padding: '8px 0', background: 'transparent', border: 'none', borderBottom: `2px solid ${c.border}`, color: c.text, fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
                      />
                      {commentText.trim() && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 8 }}>
                          <button onClick={() => setCommentText('')} style={{ padding: '6px 14px', background: 'none', border: 'none', cursor: 'pointer', color: c.textSecondary, fontSize: 13 }}>Cancel</button>
                          <button onClick={() => submitComment(playerVideo.id)} style={{ padding: '6px 14px', background: '#ff0000', color: '#fff', border: 'none', borderRadius: 20, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>Comment</button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '12px 16px', background: c.secondary, borderRadius: 10, marginBottom: 20, fontSize: 14, color: c.textSecondary, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span>Sign in to leave a comment</span>
                    <button onClick={() => openAuthModal('signin')} style={{ padding: '6px 16px', background: 'transparent', border: '1px solid #3ea6ff', borderRadius: 20, color: '#3ea6ff', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>Sign in</button>
                  </div>
                )}

                {/* Comment list */}
                <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                  {(comments[playerVideo.id] || []).slice().reverse().map(comment => (
                    <div key={comment.id} style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                      <div
                        onClick={() => { const u = users.find(u => u.id === comment.userId); if (u) setChannelProfileUserId(u.id); }}
                        style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: '#fff', flexShrink: 0, cursor: 'pointer' }}
                      >
                        {avatarInitial(comment.channelName)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                          <span
                            onClick={() => { const u = users.find(u => u.id === comment.userId); if (u) setChannelProfileUserId(u.id); }}
                            style={{ fontSize: 13, fontWeight: 600, color: c.text, cursor: 'pointer' }}
                          >
                            {comment.channelName}
                          </span>
                          <span style={{ fontSize: 12, color: c.textSecondary }}>{formatDate(comment.timestamp)}</span>
                        </div>
                        <div style={{ fontSize: 14, color: c.text, lineHeight: 1.5 }}>{comment.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Channel Profile Modal ── */}
      {channelProfileUserId && channelUser && (
        <div
          style={{ position: 'fixed', inset: 0, background: c.overlay, zIndex: 1100, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 16px', overflowY: 'auto' }}
          onClick={() => setChannelProfileUserId(null)}
        >
          <div
            style={{ background: c.modalBg, borderRadius: 16, width: '100%', maxWidth: 800, border: `1px solid ${c.border}`, overflow: 'hidden', margin: 'auto' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Channel header */}
            <div style={{ background: 'linear-gradient(135deg, #1a1a2e, #16213e)', padding: '32px 24px', display: 'flex', alignItems: 'center', gap: 20, position: 'relative' }}>
              <button
                onClick={() => setChannelProfileUserId(null)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#aaa' }}
              >
                <X size={22} />
              </button>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#667eea,#764ba2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                {avatarInitial(channelUser.channelName)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{channelUser.channelName}</div>
                <div style={{ fontSize: 14, color: '#aaa', marginBottom: 4 }}>
                  {channelUser.subscribers.toLocaleString()} subscribers • {channelVideos.length} videos
                </div>
                <div style={{ fontSize: 13, color: '#888' }}>Joined {formatDate(channelUser.joined)}</div>
              </div>
              {currentUser && currentUser.id !== channelProfileUserId && (
                <button
                  onClick={() => toggleSubscribe(channelProfileUserId)}
                  style={{
                    padding: '10px 24px', borderRadius: 20, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15,
                    background: isSubscribed(channelProfileUserId) ? '#333' : '#ff0000',
                    color: '#fff',
                  }}
                >
                  {isSubscribed(channelProfileUserId) ? 'Subscribed ✓' : 'Subscribe'}
                </button>
              )}
            </div>

            {/* Channel videos */}
            <div style={{ padding: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: c.text, marginBottom: 16 }}>Videos</h3>
              {channelVideos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: c.textSecondary }}>
                  <Video size={48} style={{ marginBottom: 12, opacity: 0.4 }} />
                  <div>No videos uploaded yet</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
                  {channelVideos.map(v => (
                    <VideoCard
                      key={v.id}
                      video={v}
                      onClick={id => { setChannelProfileUserId(null); openPlayerById(id); }}
                      theme={theme}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
