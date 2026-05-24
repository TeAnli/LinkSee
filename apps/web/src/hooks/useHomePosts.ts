import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { PostListItem, PaginatedResponse } from '@linksee/shared';

export type HomeTab = 'recommended' | 'following' | 'hot' | 'latest' | 'featured';

const TAB_SORT_MAP: Record<HomeTab, string | undefined> = {
  recommended: undefined, // default algorithmic
  following: undefined,  // handled separately
  hot: 'hot',
  latest: 'latest',
  featured: 'featured',
};

export function useHomePosts(tab: HomeTab = 'recommended') {
  const sort = TAB_SORT_MAP[tab];
  const params: Record<string, unknown> = { page: 1, size: 10 };
  if (sort) params.sort = sort;

  const { data, error, isLoading } = useSWR(
    ['/forum/posts', params],
    fetcher<PaginatedResponse<PostListItem>>,
    {
      dedupingInterval: 30_000,
      revalidateOnFocus: false,
    },
  );

  return {
    posts: data?.list ?? [],
    loading: isLoading,
    error,
  };
}
