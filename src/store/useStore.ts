import { create } from "zustand";
import { Movie } from "@/types/movie";

export type Genre = {
  id: number;
  name: string;
};

export interface Decade {
  id: number;
  label: string;
  start: number;
  end: number;
}

export type Country = {
  id: string;
  label: string;
  code: string;
};

export type SortOption = {
  id: string;
  label: string;
  sortFn: (a: Movie, b: Movie) => number;
};

export const sortOptions: SortOption[] = [
  {
    id: "rating-desc",
    label: "Rating (High to Low)",
    sortFn: (a, b) => b.vote_average - a.vote_average,
  },
  {
    id: "rating-asc",
    label: "Rating (Low to High)",
    sortFn: (a, b) => a.vote_average - b.vote_average,
  },
  {
    id: "date-desc",
    label: "Release Date (Newest)",
    sortFn: (a, b) =>
      new Date(b.release_date).getTime() - new Date(a.release_date).getTime(),
  },
  {
    id: "date-asc",
    label: "Release Date (Oldest)",
    sortFn: (a, b) =>
      new Date(a.release_date).getTime() - new Date(b.release_date).getTime(),
  },
  {
    id: "title-asc",
    label: "Title (A-Z)",
    sortFn: (a, b) => a.title.localeCompare(b.title),
  },
  {
    id: "title-desc",
    label: "Title (Z-A)",
    sortFn: (a, b) => b.title.localeCompare(a.title),
  },
];

interface StoreState {
  currentStep: number;
  selectedGenres: Genre[];
  selectedDecades: Decade[];
  selectedCountries: Country[];
  preferredActor: string;
  preferredDirector: string;
  recommendations: Movie[];
  isLoading: boolean;
  error: string | null;
  selectedSort: string;
  maxRuntime: number;
  currentPage: number;
  itemsPerPage: number;
  totalPages: number;
  setCurrentStep: (step: number) => void;
  setSelectedGenres: (genres: Genre[]) => void;
  setSelectedDecades: (decades: Decade[]) => void;
  setSelectedCountries: (countries: Country[]) => void;
  setPreferredActor: (actor: string) => void;
  setPreferredDirector: (director: string) => void;
  setRecommendations: (movies: Movie[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedSort: (sort: string) => void;
  setMaxRuntime: (runtime: number) => void;
  setCurrentPage: (page: number) => void;
  setTotalPages: (pages: number) => void;
  getSortedRecommendations: () => Movie[];
  getPaginatedRecommendations: () => Movie[];
  resetState: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  currentStep: 1,
  selectedGenres: [],
  selectedDecades: [],
  selectedCountries: [],
  preferredActor: "",
  preferredDirector: "",
  recommendations: [],
  isLoading: false,
  error: null,
  selectedSort: "rating-desc",
  maxRuntime: 240,
  currentPage: 1,
  itemsPerPage: 18,
  totalPages: 0,
  setCurrentStep: (step) => set({ currentStep: step }),
  setSelectedGenres: (genres) => set({ selectedGenres: genres }),
  setSelectedDecades: (decades) => set({ selectedDecades: decades }),
  setSelectedCountries: (countries) => set({ selectedCountries: countries }),
  setPreferredActor: (actor) => set({ preferredActor: actor }),
  setPreferredDirector: (director) => set({ preferredDirector: director }),
  setRecommendations: (movies) => set({ recommendations: movies }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSelectedSort: (sort) => set({ selectedSort: sort }),
  setMaxRuntime: (runtime) => set({ maxRuntime: runtime }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setTotalPages: (pages) => set({ totalPages: pages }),
  getSortedRecommendations: () => {
    const { recommendations, selectedSort } = get();
    const sortOption = sortOptions.find((option) => option.id === selectedSort);
    if (!sortOption) return recommendations;
    return [...recommendations].sort(sortOption.sortFn);
  },
  getPaginatedRecommendations: () => {
    const { currentPage, itemsPerPage } = get();
    const sortedMovies = get().getSortedRecommendations();
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedMovies.slice(startIndex, startIndex + itemsPerPage);
  },
  resetState: () =>
    set({
      currentStep: 1,
      selectedGenres: [],
      selectedDecades: [],
      selectedCountries: [],
      preferredActor: "",
      preferredDirector: "",
      recommendations: [],
      isLoading: false,
      error: null,
      selectedSort: "rating-desc",
      maxRuntime: 240,
      currentPage: 1,
      totalPages: 0,
    }),
}));
