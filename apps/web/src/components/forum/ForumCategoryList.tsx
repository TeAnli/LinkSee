import React from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatCount } from '@/lib/format';
import { Category } from '@linksee/shared';

export function ForumCategoryPill({
  name,
  icon,
  color,
  active,
  count,
  onClick,
}: {
  name: string;
  icon: React.ReactNode;
  color: string;
  active: boolean;
  count: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap border-[1.5px] transition-all duration-200 shrink-0',
        active
          ? 'border-transparent text-white shadow-flat'
          : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground'
      )}
      style={
        active
          ? {
            backgroundColor: color,
            boxShadow: `2px 2px 0px 0px ${color}88`,
          }
          : undefined
      }
    >
      {icon}
      <span>{name}</span>
      <span
        className={cn(
          'text-[10px] ml-0.5',
          active ? 'text-white/80' : 'text-muted-foreground'
        )}
      >
        {formatCount(count)}
      </span>
    </button>
  );
}

interface ForumCategoryListProps {
  categories: Category[];
  activeCategory: number | null;
  totalPosts: number;
  onCategoryChange: (id: number | null) => void;
}

export function ForumCategoryList({
  categories,
  activeCategory,
  totalPosts,
  onCategoryChange,
}: ForumCategoryListProps) {
  const { t } = useTranslation();

  return (
    <div className="flex gap-2 pb-2">
      <ForumCategoryPill
        name={t('forum.allCategories')}
        icon={<Sparkles className="h-3.5 w-3.5" />}
        color="#6366F1"
        active={activeCategory === null}
        count={totalPosts}
        onClick={() => onCategoryChange(null)}
      />
      {categories.map((cat) => (
        <ForumCategoryPill
          key={cat.id}
          name={cat.name}
          icon={
            <Icon
              icon={cat.icon}
              className="h-3.5 w-3.5"
            />
          }
          color={cat.themeColor}
          active={activeCategory === cat.id}
          count={cat.postCount}
          onClick={() => onCategoryChange(cat.id)}
        />
      ))}
    </div>
  );
}
