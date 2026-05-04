import { useTranslation } from 'react-i18next';
import { PagePlaceholder } from '../components/layout/PagePlaceholder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function ProfilePage() {
  const { t } = useTranslation();
  return (
    <div className="flex justify-center">
      <div className="w-full max-w-[760px] flex flex-col gap-4">
        {/* Profile card */}
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-4">
              <Avatar className="size-16">
                <AvatarFallback className="text-lg">U</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-1">
                <Skeleton className="h-5 w-32 rounded-md" />
                <Skeleton className="h-3 w-48 rounded-md" />
                <div className="flex gap-2 mt-1">
                  <Badge variant="secondary">{t('profile.posts')}</Badge>
                  <Badge variant="secondary">{t('profile.followers')}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <PagePlaceholder label={t('profile.activity')} icon="mdi:history" />
      </div>
    </div>
  );
}
