import { useTranslation } from 'react-i18next';
import { PagePlaceholder } from '../components/layout/PagePlaceholder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function ForumPage() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col gap-4">
      <PagePlaceholder label={t('forum.forumCategories')} icon="mdi:text-box-multiple-outline" />
      <Card>
        <CardHeader>
          <CardTitle>{t('forum.categories')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  );
}
