import { useState } from 'react';
import { Check, Copy, Instagram, Heart, Flame, Zap, Users, Car, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const features = [
  {
    icon: <Zap className="w-5 h-5" />,
    text: 'Short-form videos and photos focused entirely on cars',
  },
  {
    icon: <Compass className="w-5 h-5" />,
    text: 'Swipe-based discovery to find new builds instantly',
  },
  {
    icon: <Car className="w-5 h-5" />,
    text: 'Detailed car profiles with specs, mods, and build history',
  },
  {
    icon: <Users className="w-5 h-5" />,
    text: 'Follow creators, builders, and local enthusiasts',
  },
  {
    icon: <Heart className="w-5 h-5" />,
    text: 'A community driven by passion, not algorithms chasing trends',
  },
];

export default function AboutPage() {
  const [copied, setCopied] = useState(false);

  const handleCopyCashApp = () => {
    navigator.clipboard.writeText('$alteredsol').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-amber-900/20 via-background to-background pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent" />

        <div className="relative px-6 pt-10 pb-8 text-center">
          <div className="flex justify-center mb-4">
            <img
              src="/assets/generated/revgrid-logo.dim_256x256.png"
              alt="RevGrid Logo"
              className="w-20 h-20 object-contain drop-shadow-[0_0_16px_oklch(0.72_0.18_55/0.6)]"
            />
          </div>
          <h1 className="font-heading text-5xl font-bold text-primary tracking-widest text-amber-glow mb-2">
            REVGRID
          </h1>
          <p className="text-foreground/80 text-base font-medium max-w-sm mx-auto leading-relaxed">
            The ultimate social platform built by car enthusiasts, for car enthusiasts.
          </p>
          <div className="flex justify-center gap-2 mt-4 flex-wrap">
            {['JDM', 'Muscle', 'Euro', 'Off-Road', 'Street'].map((tag) => (
              <Badge
                key={tag}
                variant="outline"
                className="border-primary/40 text-primary/80 text-xs font-heading tracking-wider"
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      <div className="px-5 space-y-6 max-w-lg mx-auto">
        {/* About Description */}
        <section className="glass-card rounded-xl p-5">
          <p className="text-foreground/85 text-sm leading-relaxed">
            Think TikTok—but every post is pure automotive culture. From slammed builds and drift clips to engine swaps,
            burnouts, restorations, and daily drivers, RevGrid is where cars take center stage.
          </p>
          <Separator className="my-4 bg-border/50" />
          <p className="text-foreground/85 text-sm leading-relaxed">
            Swipe left or right through endless car content, discover unique builds, and connect with owners from all
            over the world. Every profile is more than just a username—showcase your car with photos, videos, specs,
            build lists, future plans, and mods in progress. Whether you're into JDM, muscle, Euro, off-road, or street
            builds, RevGrid is your digital garage.
          </p>
        </section>

        {/* Features Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-bold text-foreground tracking-wider">FEATURES</h2>
          </div>
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass-card rounded-xl p-4 flex items-start gap-3 border border-border/50 hover:border-primary/30 transition-colors"
              >
                <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  {feature.icon}
                </div>
                <p className="text-foreground/85 text-sm leading-relaxed pt-1">{feature.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing Statement */}
        <section className="relative overflow-hidden rounded-xl border border-primary/30 p-5 bg-gradient-to-br from-amber-900/20 to-background">
          <div className="absolute top-0 left-0 w-1 h-full bg-primary rounded-l-xl" />
          <p className="pl-3 text-foreground font-medium text-base leading-relaxed italic">
            "RevGrid isn't just an app—it's a movement for people who live and breathe cars."
          </p>
        </section>

        {/* Support Section */}
        <section className="glass-card rounded-xl p-5 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Car className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-bold text-foreground tracking-wider">SUPPORT REVGRID</h2>
          </div>
          <p className="text-foreground/70 text-sm leading-relaxed mb-4">
            RevGrid is independently built and community-powered. If you'd like to support development, server costs,
            and future features, donations are always appreciated.
          </p>
          <div className="bg-asphalt-800 rounded-xl p-4 border border-primary/20">
            <p className="text-muted-foreground text-xs uppercase tracking-widest font-heading mb-2">Cash App</p>
            <div className="flex items-center justify-between gap-3">
              <span className="font-heading text-2xl font-bold text-primary tracking-wide">$alteredsol</span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyCashApp}
                className="border-primary/40 text-primary hover:bg-primary/10 hover:border-primary gap-1.5 flex-shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="glass-card rounded-xl p-5 border border-border/50">
          <div className="flex items-center gap-2 mb-3">
            <Instagram className="w-5 h-5 text-primary" />
            <h2 className="font-heading text-xl font-bold text-foreground tracking-wider">CONTACT</h2>
          </div>
          <p className="text-foreground/70 text-sm mb-4">
            Reach out on Instagram for questions, feedback, or collabs.
          </p>
          <a
            href="https://www.instagram.com/boddysum"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 bg-asphalt-800 rounded-xl p-4 border border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/30 to-amber-800/30 border border-primary/30 flex items-center justify-center flex-shrink-0">
              <Instagram className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-widest font-heading">Instagram</p>
              <p className="font-heading text-lg font-bold text-primary tracking-wide group-hover:text-amber-400 transition-colors">
                @boddysum
              </p>
            </div>
            <div className="ml-auto text-muted-foreground group-hover:text-primary transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          </a>
        </section>

        {/* Footer attribution */}
        <footer className="text-center py-4 text-muted-foreground text-xs">
          <p>
            © {new Date().getFullYear()} RevGrid. Built with{' '}
            <Heart className="w-3 h-3 inline text-primary" />{' '}
            using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
