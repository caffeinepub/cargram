import { useNavigate } from '@tanstack/react-router';
import { Car, Plus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGetAllBuilds } from '../hooks/useQueries';

export default function BuildsPage() {
  const navigate = useNavigate();
  const { data: builds = [], isLoading } = useGetAllBuilds();

  return (
    <div className="max-w-lg mx-auto">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-foreground">BUILD SHOWCASES</h2>
          <p className="text-xs text-muted-foreground">Show off your ride</p>
        </div>
        <Button
          onClick={() => navigate({ to: '/builds/create' })}
          size="sm"
          className="bg-primary text-primary-foreground font-bold"
        >
          <Plus className="w-4 h-4 mr-1" /> New Build
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : builds.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 p-8">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <Car className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground">NO BUILDS YET</h3>
          <p className="text-muted-foreground text-center text-sm">Be the first to showcase your build!</p>
          <Button
            onClick={() => navigate({ to: '/builds/create' })}
            className="bg-primary text-primary-foreground font-bold"
          >
            Create Build
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-0.5">
          {builds.map(build => (
            <button
              key={build.id}
              onClick={() => navigate({ to: '/builds/$buildId', params: { buildId: build.id } })}
              className="aspect-square bg-secondary overflow-hidden relative group"
            >
              {build.images[0] ? (
                <img
                  src={build.images[0].getDirectURL()}
                  alt={build.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              ) : (
                <img
                  src="/assets/generated/build-placeholder.dim_800x600.png"
                  alt="build"
                  className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-2">
                <p className="text-white text-xs font-bold truncate">{build.title}</p>
                <p className="text-white/70 text-[10px] truncate">@{build.authorId}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
