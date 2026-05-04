import { useTranslation } from 'react-i18next';
import { PagePlaceholder } from '../components/layout/PagePlaceholder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function AiChatPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <PagePlaceholder label={t('ai.chatInterface')} icon="mdi:robot-happy-outline" />
      <Card>
        <CardHeader>
          <CardTitle>{t('ai.conversation')}</CardTitle>
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
