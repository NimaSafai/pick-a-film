import { create } from "zustand";

export type Genre = {
  id: number;
  name: string;
};

export type Decade = {
  start: number;
  end: number;
  label: string;
};

export type Mood = {
  id: string;
  name: string;
};

export type Movie = {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  overview: string;
  vote_average: number;
  genres: Genre[];
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
      profile_path: string | null;
    }>;
  };
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
  selectedMoods: Mood[];
  preferredActor: string;
  preferredDirector: string;
  recommendations: Movie[];
  isLoading: boolean;
  error: string | null;
  selectedSort: string;
  setCurrentStep: (step: number) => void;
  setSelectedGenres: (genres: Genre[]) => void;
  setSelectedDecades: (decades: Decade[]) => void;
  setSelectedMoods: (moods: Mood[]) => void;
  setPreferredActor: (actor: string) => void;
  setPreferredDirector: (director: string) => void;
  setRecommendations: (movies: Movie[]) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setSelectedSort: (sort: string) => void;
  getSortedRecommendations: () => Movie[];
  resetState: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  currentStep: 1,
  selectedGenres: [],
  selectedDecades: [],
  selectedMoods: [],
  preferredActor: "",
  preferredDirector: "",
  recommendations: [],
  isLoading: false,
  error: null,
  selectedSort: "rating-desc",
  setCurrentStep: (step) => set({ currentStep: step }),
  setSelectedGenres: (genres) => set({ selectedGenres: genres }),
  setSelectedDecades: (decades) => set({ selectedDecades: decades }),
  setSelectedMoods: (moods) => set({ selectedMoods: moods }),
  setPreferredActor: (actor) => set({ preferredActor: actor }),
  setPreferredDirector: (director) => set({ preferredDirector: director }),
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
  resetState: () =>
    set({
      currentStep: 1,
      selectedGenres: [],
      selectedDecades: [],
      selectedMoods: [],
      preferredActor: "",
      preferredDirector: "",
      recommendations: [],
      isLoading: false,
      error: null,
      selectedSort: "rating-desc",
    }),
}));
