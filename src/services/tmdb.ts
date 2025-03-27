import axios from "axios";
import { Genre, Movie } from "@/store/useStore";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export const tmdbApi = {
  getGenres: async (): Promise<Genre[]> => {
    const response = await axios.get(`${TMDB_BASE_URL}/genre/movie/list`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });
    return response.data.genres;
  },

  searchPerson: async (
    query: string
  ): Promise<{ id: number; name: string }[]> => {
    const response = await axios.get(`${TMDB_BASE_URL}/search/person`, {
      params: {
        api_key: TMDB_API_KEY,
        query,
      },
    });
    return response.data.results;
  },

  getMoviesByCriteria: async (params: {
    genres?: string;
    "primary_release_date.gte"?: string;
    "primary_release_date.lte"?: string;
    "vote_average.gte"?: number;
    "vote_average.lte"?: number;
    "runtime.gte"?: number;
    "runtime.lte"?: number;
    page?: number;
    with_cast?: string;
    with_crew?: string;
  }): Promise<{ results: Movie[]; total_pages: number }> => {
    const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        ...params,
        with_genres: params.genres,
      },
    });
    return {
      results: response.data.results,
      total_pages: response.data.total_pages,
    };
  },

  getMovieDetails: async (movieId: number): Promise<Movie> => {
    const response = await axios.get(`${TMDB_BASE_URL}/movie/${movieId}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: "genres,credits",
      },
    });
    return response.data;
  },

  getImageUrl: (path: string, size: "w500" | "original" = "w500"): string => {
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  },
};
