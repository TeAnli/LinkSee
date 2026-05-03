import { PagePlaceholder } from '../components/layout/PagePlaceholder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function HomePage() {
  return (
    <div className="flex flex-col gap-4">
      <PagePlaceholder label="Home Feed" icon="mdi:view-grid-outline" />
      <Card>
        <CardHeader>
          <CardTitle>Recommended</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
