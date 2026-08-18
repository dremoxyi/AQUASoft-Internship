import { create } from "zustand";
import { search as searchApi } from "../search-api";

const PAGE_SIZE = 100;
const RESET = { results: [], total: 0, hasMore: false };

interface SearchStore {
  query: string;
  results: any[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  hasSearched: boolean;
  total: number;
  setQuery: (query: string) => void;
  setResults: (results: any[]) => void;
  setLoading: (loading: boolean) => void;
  performSearch: (text: string) => Promise<void>;
  loadMore: () => Promise<void>;
}

export const useSearch = create<SearchStore>((set, get) => {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let searchId = 0;
  let offset = 0;

  const fetch = async (text: string, append = false) => {
    const id = searchId;

    try {
      const { items = [], total = 0 } =
        (await searchApi(text, { limit: PAGE_SIZE, offset })) ?? {};

      if (id !== searchId) return;

      set((s) => {
        const results = append ? [...s.results, ...items] : items;
        return { results, total, hasMore: results.length < total };
      });

      offset += items.length;
    } catch (e) {
      if (id !== searchId) return;
      console.error(e);
      if (!append) set(RESET);
    } finally {
      if (id === searchId) set({ isLoading: false, isLoadingMore: false });
    }
  };

const search = async (text: string) => {
  text = text.trim();
  searchId++;
  offset = 0;

  set({...RESET, isLoading: true, hasSearched: true});

  await fetch(text);
};

  return {
    query: "",
    results: [],
    isLoading: false,
    isLoadingMore: false,
    hasMore: false,
    hasSearched: false,
    total: 0,

    setQuery: (query) => {
      const text = query.trim();

      set({query,...RESET,isLoading: !!text,hasSearched: !!text});

      clearTimeout(timer!);

      if (!text) {
        return;
      }

      timer = setTimeout(() => void search(text), 300);
    },

    loadMore: async () => {
      const { query, hasMore, isLoadingMore, hasSearched } = get();

      if (!hasSearched || !hasMore || isLoadingMore) return;

      set({ isLoadingMore: true });
      await fetch(query.trim(), true);
    },

    setResults: (results) => set({ results }),
    setLoading: (isLoading) => set({ isLoading }),

    performSearch: async (text) => {
      clearTimeout(timer!);
      set({query: text, ...RESET, isLoading: true, hasSearched: true});
      await search(text);
    },
  };
});