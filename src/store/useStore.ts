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
  maxRuntime: number;
  recommendations: Movie[];
  isLoading: boolean;
  error: string | null;
  selectedSort: string;
  currentPage: number;
  itemsPerPage: number;
  setCurrentPage: (page: number) => void;
  setCurrentStep: (step: number) => void;
  setSelectedGenres: (genres: Genre[]) => void;
  setSelectedDecades: (decades: Decade[]) => void;
  setSelectedCountries: (countries: Country[]) => void;
  setPreferredActor: (actor: string) => void;
  setPreferredDirector: (director: string) => void;
  setMaxRuntime: (max: number) => void;
  setRecommendations: (movies: Movie[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedSort: (sort: string) => void;
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
  maxRuntime: 240,
  recommendations: [],
  isLoading: false,
  error: null,
  selectedSort: "rating-desc",
  currentPage: 1,
  itemsPerPage: 18,
  setCurrentPage: (page) => set({ currentPage: page }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setSelectedGenres: (genres) => set({ selectedGenres: genres }),
  setSelectedDecades: (decades) => set({ selectedDecades: decades }),
  setSelectedCountries: (countries) => set({ selectedCountries: countries }),
  setPreferredActor: (actor) => set({ preferredActor: actor }),
  setPreferredDirector: (director) => set({ preferredDirector: director }),
  setMaxRuntime: (max) => set({ maxRuntime: max }),
  setRecommendations: (movies) => set({ recommendations: movies }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setSelectedSort: (sort) => set({ selectedSort: sort }),
  getSortedRecommendations: () => {
    const { recommendations, selectedSort } = get();
    const sortOption = sortOptions.find((option) => option.id === selectedSort);
    if (!sortOption) return recommendations;
    return [...recommendations].sort(sortOption.sortFn);
  },
  getPaginatedRecommendations: () => {
    const { recommendations, selectedSort, currentPage, itemsPerPage } = get();
    const sortOption = sortOptions.find((option) => option.id === selectedSort);
    const sortedMovies = sortOption
      ? [...recommendations].sort(sortOption.sortFn)
      : recommendations;
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
      maxRuntime: 240,
      recommendations: [],
      isLoading: false,
      error: null,
      selectedSort: "rating-desc",
      currentPage: 1,
    }),
}));
