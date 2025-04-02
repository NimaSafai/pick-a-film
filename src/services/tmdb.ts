import axios from "axios";
import { Genre, Movie } from "@/store/useStore";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 40, // TMDB's rate limit is 40 requests per 10 seconds
  timeWindow: 10000, // 10 seconds in milliseconds
  requests: [] as number[],
};

// Helper function to check if we're within rate limits
const checkRateLimit = (): boolean => {
  const now = Date.now();
  // Remove requests older than the time window
  RATE_LIMIT.requests = RATE_LIMIT.requests.filter(
    (timestamp) => now - timestamp < RATE_LIMIT.timeWindow
  );

  // Check if we're under the limit
  if (RATE_LIMIT.requests.length >= RATE_LIMIT.maxRequests) {
    return false;
  }

  // Add this request to the list
  RATE_LIMIT.requests.push(now);
  return true;
};

// Helper function to wait for rate limit
const waitForRateLimit = async (): Promise<void> => {
  while (!checkRateLimit()) {
    // Wait for 1 second before checking again
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
};

// Helper function to make API requests with retry logic
const makeRequest = async <T>(
  url: string,
  params: Record<string, string | number | undefined>,
  retries = 3
): Promise<T> => {
  try {
    await waitForRateLimit();
    const response = await axios.get<T>(url, { params });
    return response.data;
  } catch (error) {
    if (
      axios.isAxiosError(error) &&
      error.response?.status === 429 &&
      retries > 0
    ) {
      // If we hit rate limit, wait and retry
      await new Promise((resolve) => setTimeout(resolve, 2000));
      return makeRequest(url, params, retries - 1);
    }
    throw error;
  }
};

export const tmdbApi = {
  getGenres: async (): Promise<Genre[]> => {
    const data = await makeRequest<{ genres: Genre[] }>(
      `${TMDB_BASE_URL}/genre/movie/list`,
      {
        api_key: TMDB_API_KEY,
      }
    );
    return data.genres;
  },

  searchPerson: async (
    query: string
  ): Promise<{ id: number; name: string }[]> => {
    const data = await makeRequest<{ results: { id: number; name: string }[] }>(
      `${TMDB_BASE_URL}/search/person`,
      {
        api_key: TMDB_API_KEY,
        query,
      }
    );
    return data.results;
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
    region?: string;
  }): Promise<{ results: Movie[]; total_pages: number }> => {
    // If multiple genres are selected, we need to fetch movies for each genre separately
    // and then combine the results to implement OR logic
    if (params.genres && params.genres.includes(",")) {
      const genreIds = params.genres.split(",");

      // Create a copy of params without the genres parameter
      const paramsWithoutGenres = { ...params };
      delete paramsWithoutGenres.genres;

      // Fetch movies for each genre with rate limiting
      const genrePromises = genreIds.map(async (genreId) => {
        await waitForRateLimit();
        return makeRequest<{ results: Movie[] }>(
          `${TMDB_BASE_URL}/discover/movie`,
          {
            api_key: TMDB_API_KEY,
            ...paramsWithoutGenres,
            with_genres: genreId,
            "vote_count.gte": 100,
            sort_by: "vote_average.desc",
          }
        );
      });

      // Wait for all requests to complete
      const genreResults = await Promise.all(genrePromises);

      // Combine results and remove duplicates
      const allMovies = genreResults.flatMap((result) => result.results);
      const uniqueMovies = Array.from(
        new Map(allMovies.map((movie) => [movie.id, movie])).values()
      );

      // Sort by vote average
      uniqueMovies.sort((a, b) => b.vote_average - a.vote_average);

      return {
        results: uniqueMovies,
        total_pages: Math.ceil(uniqueMovies.length / 20),
      };
    }

    // If only one genre or no genres, use the original logic
    return makeRequest(`${TMDB_BASE_URL}/discover/movie`, {
      api_key: TMDB_API_KEY,
      ...params,
      with_genres: params.genres,
      "vote_count.gte": 100,
      sort_by: "vote_average.desc",
    });
  },

  getMovieDetails: async (movieId: number): Promise<Movie> => {
    return makeRequest(`${TMDB_BASE_URL}/movie/${movieId}`, {
      api_key: TMDB_API_KEY,
      append_to_response: "genres,credits",
    });
  },

  getImageUrl: (path: string, size: "w500" | "original" = "w500"): string => {
    return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
  },
};
