import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ForumSearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortType: string;
  onSortChange: (value: string) => void;
  totalPosts: number;
}

export function ForumSearchBar({
  searchQuery,
  onSearchChange,
  sortType,
  onSortChange,
  totalPosts,
}: ForumSearchBarProps) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1 max-w-full sm:max-w-sm">
        <Icon icon="mdi:magnify" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t('forum.searchPosts')}
          className="pl-9 h-9"
        />
      </div>
      <Tabs value={sortType} onValueChange={onSortChange}>
        <TabsList className="h-9">
          <TabsTrigger value="latest" className="text-xs px-3">
            <Icon icon="mdi:clock-outline" className="h-3 w-3 mr-1" />
            {t('forum.latest')}
          </TabsTrigger>
          <TabsTrigger value="hottest" className="text-xs px-3">
            <Icon icon="mdi:trending-up" className="h-3 w-3 mr-1" />
            {t('forum.hottest')}
          </TabsTrigger>
          <TabsTrigger value="essence" className="text-xs px-3">
            <Icon icon="mdi:sparkles" className="h-3 w-3 mr-1" />
            {t('forum.essence')}
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <span className="text-xs text-muted-foreground ml-auto">
        {t('forum.totalPosts', { count: totalPosts })}
      </span>
    </div>
  );
}
