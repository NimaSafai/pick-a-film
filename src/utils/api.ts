import axios from "axios";
import { Genre, Decade, Country, Movie } from "@/types";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

export const fetchMovies = async (
  genres: Genre[],
  decades: Decade[],
  countries: Country[],
  preferredActor: string,
  preferredDirector: string,
  maxRuntime: number,
  page: number = 1,
  itemsPerPage: number = 12
): Promise<{ movies: Movie[]; totalPages: number }> => {
  try {
    const genreIds = genres.map((genre) => genre.id).join(",");
    const decadeRanges = decades.map((decade) => decade.range).join(",");
    const countryCodes = countries.map((country) => country.code).join(",");

    // First, fetch the total number of results
    const totalResponse = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        with_genres: genreIds || undefined,
        primary_release_date: decadeRanges || undefined,
        with_origin_country: countryCodes || undefined,
        with_cast: preferredActor || undefined,
        with_crew: preferredDirector || undefined,
        "with_runtime.lte": maxRuntime,
        page: 1,
      },
    });

    const totalResults = totalResponse.data.total_results;
    const totalPages = Math.ceil(totalResults / itemsPerPage);

    // Then fetch the current page of results
    const response = await axios.get(`${TMDB_BASE_URL}/discover/movie`, {
      params: {
        api_key: TMDB_API_KEY,
        with_genres: genreIds || undefined,
        primary_release_date: decadeRanges || undefined,
        with_origin_country: countryCodes || undefined,
        with_cast: preferredActor || undefined,
        with_crew: preferredDirector || undefined,
        "with_runtime.lte": maxRuntime,
        page,
      },
    });

    const movies = response.data.results.map((movie: TMDBMovie) => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      vote_count: movie.vote_count,
      runtime: movie.runtime,
      genres: movie.genre_ids
        .map((id: number) => genres.find((g) => g.id === id)?.name || "")
        .filter(Boolean),
    }));

    return { movies, totalPages };
  } catch (error) {
    console.error("Error fetching movies:", error);
    throw error;
  }
};

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime: number;
  genre_ids: number[];
}
