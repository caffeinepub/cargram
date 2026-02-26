import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Download, Smartphone, Chrome, MoreVertical, PlusSquare, CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const steps = [
  {
    icon: <Chrome className="w-5 h-5" />,
    title: 'Open in Chrome',
    description: 'Make sure you\'re visiting RevGrid in Google Chrome on your Android device.',
  },
  {
    icon: <MoreVertical className="w-5 h-5" />,
    title: 'Tap the Menu',
    description: 'Tap the three-dot menu (⋮) in the top-right corner of Chrome.',
  },
  {
    icon: <PlusSquare className="w-5 h-5" />,
    title: 'Add to Home Screen',
    description: 'Select "Add to Home Screen" from the dropdown menu.',
  },
  {
    icon: <CheckCircle className="w-5 h-5" />,
    title: 'Confirm Installation',
    description: 'Tap "Add" to confirm. RevGrid will appear on your home screen like a native app.',
  },
];

export default function InstallPage() {
  const navigate = useNavigate();
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    setIsInstalling(true);
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setInstallPrompt(null);
      }
    } catch (err) {
      console.error('[RevGrid] Install prompt error:', err);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border/50 px-4 py-3 flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/about' })}
          className="text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="font-heading text-lg font-bold text-foreground tracking-wider">INSTALL APP</h1>
      </div>

      <div className="px-5 pt-6 space-y-6 max-w-lg mx-auto">
        {/* Hero */}
        <section className="text-center py-4">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <img
                src="/assets/generated/revgrid-icon-192.dim_192x192.png"
                alt="RevGrid App Icon"
                className="w-24 h-24 rounded-2xl shadow-lg border border-primary/30"
              />
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-md">
                <Download className="w-4 h-4 text-black" />
              </div>
            </div>
          </div>
          <h2 className="font-heading text-3xl font-bold text-primary tracking-widest mb-2">
            REVGRID
          </h2>
          <p className="text-foreground/70 text-sm max-w-xs mx-auto leading-relaxed">
            Install RevGrid on your device for a faster, full-screen experience — no app store required.
          </p>
          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            <Badge variant="outline" className="border-primary/40 text-primary/80 text-xs font-heading tracking-wider">
              <Smartphone className="w-3 h-3 mr-1" />
              Works Offline
            </Badge>
            <Badge variant="outline" className="border-primary/40 text-primary/80 text-xs font-heading tracking-wider">
              Full Screen
            </Badge>
            <Badge variant="outline" className="border-primary/40 text-primary/80 text-xs font-heading tracking-wider">
              Home Screen Icon
            </Badge>
          </div>
        </section>

        {/* One-tap install button (shown when browser supports it) */}
        {installPrompt && !isInstalled && (
          <section className="relative overflow-hidden rounded-xl border border-primary/50 p-5 bg-gradient-to-br from-amber-900/30 to-background">
            <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl" />
            <div className="pl-3">
              <p className="font-heading text-sm font-bold text-primary tracking-wider mb-1">READY TO INSTALL</p>
              <p className="text-foreground/70 text-sm mb-4">
                Your browser supports one-tap installation. Tap the button below to install RevGrid instantly.
              </p>
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="w-full bg-primary text-black font-heading font-bold tracking-wider hover:bg-primary/90 gap-2"
              >
                {isInstalling ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Install RevGrid
                  </>
                )}
              </Button>
            </div>
          </section>
        )}

        {/* Already installed state */}
        {isInstalled && (
          <section className="rounded-xl border border-green-500/40 p-5 bg-green-900/10 flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0" />
            <div>
              <p className="font-heading text-sm font-bold text-green-400 tracking-wider">ALREADY INSTALLED</p>
              <p className="text-foreground/60 text-xs mt-0.5">RevGrid is installed on your device. Enjoy the full experience!</p>
            </div>
          </section>
        )}

        {/* Manual steps */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-bold text-foreground tracking-wider">HOW TO INSTALL</h2>
          </div>
          <p className="text-foreground/60 text-sm mb-4">
            Follow these steps to install RevGrid on Android Chrome:
          </p>
          <div className="space-y-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-4 flex items-start gap-3 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex-shrink-0 flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                    {step.icon}
                  </div>
                  <span className="text-primary/50 text-xs font-heading font-bold">{index + 1}</span>
                </div>
                <div className="pt-1">
                  <p className="font-heading text-sm font-bold text-foreground tracking-wide mb-1">{step.title}</p>
                  <p className="text-foreground/65 text-xs leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* iOS note */}
        <section className="glass-card rounded-xl p-4 border border-border/50">
          <p className="text-muted-foreground text-xs leading-relaxed">
            <span className="font-heading font-bold text-foreground/80 tracking-wide">On iPhone/iPad (Safari):</span>{' '}
            Tap the Share button (□↑) at the bottom of Safari, then select "Add to Home Screen" and tap "Add".
          </p>
        </section>

        {/* What you get */}
        <section className="glass-card rounded-xl p-5 border border-border/50">
          <h3 className="font-heading text-base font-bold text-foreground tracking-wider mb-3">WHAT YOU GET</h3>
          <ul className="space-y-2">
            {[
              'Full-screen experience without browser chrome',
              'Faster load times with offline caching',
              'App icon on your home screen',
              'Feels like a native app — no Play Store needed',
              'Always up-to-date — no manual updates required',
            ].map((benefit, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/75">
                <CheckCircle className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                {benefit}
              </li>
            ))}
          </ul>
        </section>

        {/* Footer note */}
        <p className="text-center text-muted-foreground text-xs pb-4">
          RevGrid is a Progressive Web App (PWA) — it works in your browser and can be installed for a native-like experience.
        </p>
      </div>
    </div>
  );
}
