import { create } from 'zustand';

type SortType = 'latest' | 'hottest' | 'essence';

interface ForumState {
  activeCategory: number | null;
  sortType: SortType;
  keyword: string;
  page: number;
  pageSize: number;
  setActiveCategory: (categoryId: number | null) => void;
  setSortType: (sort: SortType) => void;
  setKeyword: (k: string) => void;
  setPage: (p: number) => void;
  resetFilters: () => void;
}

export const useForumStore = create<ForumState>((set) => ({
  activeCategory: null,
  sortType: 'latest',
  keyword: '',
  page: 1,
  pageSize: 5,

  setActiveCategory: (categoryId) =>
    set({ activeCategory: categoryId, page: 1 }),

  setSortType: (sort) =>
    set({ sortType: sort, page: 1 }),

  setKeyword: (k) =>
    set({ keyword: k, page: 1 }),

  setPage: (p) =>
    set({ page: p }),

  resetFilters: () =>
    set({ activeCategory: null, sortType: 'latest', keyword: '', page: 1 }),
}));
