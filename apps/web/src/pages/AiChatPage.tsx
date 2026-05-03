import { PagePlaceholder } from '../components/layout/PagePlaceholder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AiChatPage() {
  return (
    <div className="flex flex-col gap-4">
      <PagePlaceholder label="AI Chat Interface" icon="mdi:robot-happy-outline" />
      <Card>
        <CardHeader>
          <CardTitle>Conversation</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-12 w-3/4 rounded-lg ml-auto" />
          <Skeleton className="h-12 w-2/3 rounded-lg" />
          <Skeleton className="h-12 w-4/5 rounded-lg ml-auto" />
        </CardContent>
      </Card>
    </div>
  );
}
