import { useNavigate } from '@tanstack/react-router';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Camera, Film, Wrench, Car } from 'lucide-react';

interface CreatePostSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const OPTIONS = [
  {
    icon: Camera,
    label: 'Feed Post',
    description: 'Share a photo to your feed',
    path: '/create/feed' as const,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Film,
    label: 'Reel',
    description: 'Create a short car reel',
    path: '/create/reel' as const,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: Car,
    label: 'Build Showcase',
    description: 'Show off your build',
    path: '/builds/create' as const,
    color: 'text-primary',
    bg: 'bg-primary/10',
  },
  {
    icon: Wrench,
    label: 'Mechanic Question',
    description: 'Ask the community for help',
    path: '/mechanics/create' as const,
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
];

export default function CreatePostSheet({ open, onOpenChange }: CreatePostSheetProps) {
  const navigate = useNavigate();

  const handleSelect = (path: string) => {
    onOpenChange(false);
    navigate({ to: path as '/' });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="bg-card border-border rounded-t-2xl pb-8">
        <SheetHeader className="mb-6">
          <SheetTitle className="font-heading text-xl text-foreground tracking-wider">CREATE CONTENT</SheetTitle>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-3">
          {OPTIONS.map((opt) => {
            const Icon = opt.icon;
            return (
              <button
                key={opt.path}
                onClick={() => handleSelect(opt.path)}
                className="flex flex-col items-start gap-3 p-4 rounded-xl bg-secondary border border-border hover:border-primary/50 transition-all active:scale-95"
              >
                <div className={`w-10 h-10 rounded-lg ${opt.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${opt.color}`} />
                </div>
                <div className="text-left">
                  <p className="font-heading font-bold text-foreground">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
}
