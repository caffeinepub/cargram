import { useNavigate } from '@tanstack/react-router';
import { Wrench, Plus, Loader2, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useGetFeed } from '../hooks/useQueries';
import { PostType } from '../backend';
import { formatDistanceToNow } from '../lib/utils';

export default function MechanicsPage() {
  const navigate = useNavigate();
  const { data: questions = [], isLoading } = useGetFeed(PostType.mechanic);

  return (
    <div className="max-w-lg mx-auto">
      {/* Hero */}
      <div className="relative h-40 overflow-hidden">
        <img
          src="/assets/generated/mechanics-hero.dim_800x400.png"
          alt="Mechanics"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h2 className="font-heading text-2xl font-bold text-foreground">MECHANICS HELP</h2>
          <p className="text-muted-foreground text-sm">Ask the community for advice</p>
        </div>
      </div>

      {/* Ask button */}
      <div className="px-4 py-3 border-b border-border">
        <Button
          onClick={() => navigate({ to: '/mechanics/create' })}
          className="w-full bg-primary text-primary-foreground font-heading font-bold tracking-wider"
        >
          <Plus className="w-4 h-4 mr-2" /> ASK A QUESTION
        </Button>
      </div>

      {/* Questions list */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : questions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4 p-8">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
            <Wrench className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-heading text-xl font-bold text-foreground">NO QUESTIONS YET</h3>
          <p className="text-muted-foreground text-center text-sm">Be the first to ask for help!</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {questions.map(question => (
            <button
              key={question.id}
              onClick={() => navigate({ to: '/mechanics/$postId', params: { postId: question.id } })}
              className="w-full flex gap-3 p-4 hover:bg-secondary/30 transition-colors text-left"
            >
              {question.image ? (
                <img
                  src={question.image.getDirectURL()}
                  alt="question"
                  className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                  <Wrench className="w-6 h-6 text-primary" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground line-clamp-2">{question.caption}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted-foreground">@{question.authorId}</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(question.createdAt)}</span>
                </div>
                {question.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {question.tags.slice(0, 2).map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] h-4 px-1 bg-primary/10 text-primary border-0">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0 self-center" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
