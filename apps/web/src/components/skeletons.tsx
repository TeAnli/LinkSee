import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export function PageLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-4 animate-in fade-in-0', className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-xl" />
        <Skeleton className="h-5 w-32" />
      </div>

      {/* Content blocks */}
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border p-4 flex flex-col gap-3"
        >
          {/* Badges */}
          <div className="flex gap-2">
            <Skeleton className="h-5 w-12 rounded-lg" />
            <Skeleton className="h-5 w-16 rounded-lg" />
          </div>
          {/* Title */}
          <Skeleton className="h-4 w-3/4" />
          {/* Summary */}
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
          </div>
          {/* Tags */}
          <div className="flex gap-1.5">
            <Skeleton className="h-5 w-14 rounded-md" />
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-12 rounded-md" />
          </div>
          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded-full" />
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-12" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function PostDetailSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in-0">
      {/* Title */}
      <Skeleton className="h-8 w-3/4" />
      {/* Meta */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      {/* Badges */}
      <div className="flex gap-2">
        <Skeleton className="h-6 w-16 rounded-lg" />
        <Skeleton className="h-6 w-20 rounded-lg" />
      </div>
      {/* Content */}
      <div className="flex flex-col gap-3">
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className={cn('h-4', i % 3 === 0 ? 'w-full' : i % 3 === 1 ? 'w-11/12' : 'w-4/5')} />
        ))}
      </div>
      {/* Actions */}
      <div className="flex gap-2">
        <Skeleton className="h-9 w-20 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-xl" />
        <Skeleton className="h-9 w-20 rounded-xl" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in-0">
      {/* Profile Card */}
      <div className="rounded-xl border border-border p-6 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex gap-2 mt-1">
          <Skeleton className="h-6 w-14 rounded-md" />
          <Skeleton className="h-6 w-16 rounded-md" />
          <Skeleton className="h-6 w-12 rounded-md" />
          <Skeleton className="h-6 w-18 rounded-md" />
        </div>
        <div className="flex gap-4 pt-2">
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-20 rounded-xl" />
      </div>
      {/* Posts */}
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-xl border border-border p-4 flex flex-col gap-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
