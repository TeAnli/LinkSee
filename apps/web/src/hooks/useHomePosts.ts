import useSWR from 'swr';
import { fetcher } from '@/lib/fetcher';
import type { PostListItem, PaginatedResponse } from '@linksee/shared';

export function useHomePosts() {
  const { data, error, isLoading } = useSWR(
    ['/forum/posts', { page: 1, size: 10 }],
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
