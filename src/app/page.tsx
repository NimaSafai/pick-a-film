"use client";

import { useStore, sortOptions, SortOption } from "@/store/useStore";
import { Movie } from "@/types/movie";
import { GenreSelection } from "@/components/steps/GenreSelection";
import { DecadeSelection } from "@/components/steps/DecadeSelection";
import { CountrySelection } from "@/components/steps/CountrySelection";
import { CreatorSelection } from "@/components/steps/CreatorSelection";
import { RuntimeSelection } from "@/components/steps/RuntimeSelection";
import { MovieCard } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { tmdbApi } from "@/services/tmdb";
import { useState, useEffect, useCallback } from "react";

// Cache for storing movie results
const movieCache = new Map<string, Movie[]>();
const movieDetailsCache = new Map<number, Movie>();

export default function Home() {
  const {
    selectedGenres,
    selectedDecades,
    selectedCountries,
    preferredActor,
    preferredDirector,
    maxRuntime,
    setRecommendations,
    setIsLoading,
    setError,
    isLoading,
    error,
    selectedSort,
    setSelectedSort,
    getSortedRecommendations,
    getPaginatedRecommendations,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    resetState,
  } = useStore();

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  // Generate a cache key based on the current filters
  const getCacheKey = useCallback(() => {
    return JSON.stringify({
      genres: selectedGenres.map((g) => g.id).sort(),
      decades: selectedDecades.map((d) => `${d.start}-${d.end}`).sort(),
      countries: selectedCountries.map((c) => c.code).sort(),
      maxRuntime,
      preferredActor,
      preferredDirector,
    });
  }, [
    selectedGenres,
    selectedDecades,
    selectedCountries,
    maxRuntime,
    preferredActor,
    preferredDirector,
  ]);

  const handleGetRecommendations = async () => {
    if (
      selectedGenres.length === 0 &&
      selectedDecades.length === 0 &&
      selectedCountries.length === 0 &&
      maxRuntime === 240 &&
      !preferredActor &&
      !preferredDirector
    ) {
      setError("Please make at least one selection");
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingProgress(0);

    try {
      // Check if we have cached results for these filters
      const cacheKey = getCacheKey();
      if (movieCache.has(cacheKey)) {
        console.log("Using cached results");
        const cachedMovies = movieCache.get(cacheKey);
        if (cachedMovies) {
          setRecommendations(cachedMovies);
        }
        setIsLoading(false);
        return;
      }

      // Get movies for each decade and combine results
      const decadePromises =
        selectedDecades.length > 0
          ? selectedDecades.map(async (decade, decadeIndex) => {
              // Fetch only the first page for each decade
              const pagePromises = [1].map((page, pageIndex) => {
                // Update progress as we fetch each page
                const progress =
                  ((decadeIndex * 1 + pageIndex) /
                    (selectedDecades.length * 1)) *
                  50;
                setLoadingProgress(Math.round(progress));

                return tmdbApi.getMoviesByCriteria({
                  genres:
                    selectedGenres.length > 0
                      ? selectedGenres.map((g) => g.id).join(",")
                      : undefined,
                  "primary_release_date.gte": `${decade.start}-01-01`,
                  "primary_release_date.lte": `${decade.end}-12-31`,
                  "vote_average.gte": 5.0,
                  page,
                  ...(selectedCountries.length > 0 && {
                    region: selectedCountries.map((c) => c.code).join(","),
                  }),
                });
              });

              const pageResults = await Promise.all(pagePromises);
              return pageResults.flatMap((result) => result.results);
            })
          : [
              // If no decades selected, get movies from all decades
              (async () => {
                // Fetch only the first page
                const pagePromises = [1].map((page, pageIndex) => {
                  // Update progress as we fetch each page
                  const progress = (pageIndex / 1) * 50;
                  setLoadingProgress(Math.round(progress));

                  return tmdbApi.getMoviesByCriteria({
                    genres:
                      selectedGenres.length > 0
                        ? selectedGenres.map((g) => g.id).join(",")
                        : undefined,
                    "vote_average.gte": 5.0,
                    page,
                    ...(selectedCountries.length > 0 && {
                      region: selectedCountries.map((c) => c.code).join(","),
                    }),
                  });
                });

                const pageResults = await Promise.all(pagePromises);
                return pageResults.flatMap((result) => result.results);
              })(),
            ];

      const decadeResults = await Promise.all(decadePromises);
      const allMovies = decadeResults.flat();

      // Remove duplicates based on movie ID
      const uniqueMovies = Array.from(
        new Map(allMovies.map((movie) => [movie.id, movie])).values()
      );

      if (uniqueMovies.length === 0) {
        setError(
          "No movies found matching your criteria. Try adjusting your selections."
        );
        return;
      }

      setLoadingProgress(60);

      // Take only the top 20 movies by vote average to reduce API calls
      const topMovies = uniqueMovies
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 20);

      // Fetch full movie details including genres and credits
      // Process in one batch to maximize parallelization
      const batchResults = await Promise.all(
        topMovies.map(async (movie) => {
          // Check if we have cached details for this movie
          if (movieDetailsCache.has(movie.id)) {
            const cachedMovie = movieDetailsCache.get(movie.id);
            if (cachedMovie) {
              return cachedMovie;
            }
          }

          const details = await tmdbApi.getMovieDetails(movie.id);
          // Cache the movie details
          movieDetailsCache.set(movie.id, details);
          return details;
        })
      );

      // Filter out any undefined values
      const detailedMovies = batchResults.filter(
        (movie): movie is Movie => movie !== undefined
      );

      setLoadingProgress(90);

      // Filter movies based on creators and runtime
      let filteredMovies = detailedMovies;

      // Filter by runtime if specified
      if (maxRuntime < 240) {
        console.log(`Filtering movies by runtime <= ${maxRuntime} minutes`);
        filteredMovies = filteredMovies.filter((movie) => {
          if (!movie.runtime) {
            console.log(`Movie ${movie.title} has no runtime data`);
            return false;
          }
          const isIncluded = movie.runtime <= maxRuntime;
          console.log(
            `Movie ${movie.title}: ${movie.runtime} minutes - ${
              isIncluded ? "included" : "excluded"
            }`
          );
          return isIncluded;
        });
        console.log(
          `After runtime filtering: ${filteredMovies.length} movies remain`
        );
      }

      // Filter by actor if selected
      if (preferredActor) {
        filteredMovies = filteredMovies.filter((movie) => {
          return (
            movie.credits?.cast?.some(
              (cast: { name: string }) =>
                cast.name.toLowerCase() === preferredActor.toLowerCase()
            ) || false
          );
        });
      }

      // Filter by director if selected
      if (preferredDirector) {
        filteredMovies = filteredMovies.filter((movie) => {
          return (
            movie.credits?.crew?.some(
              (crew: { name: string; job: string }) =>
                crew.name.toLowerCase() === preferredDirector.toLowerCase() &&
                crew.job === "Director"
            ) || false
          );
        });
      }

      if (filteredMovies.length === 0) {
        setError(
          "No movies found matching your criteria. Try adjusting your selections."
        );
        return;
      }

      setLoadingProgress(95);

      // Sort by vote average and take top 100
      const sortedMovies = filteredMovies
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 100);

      // Cache the results
      movieCache.set(cacheKey, sortedMovies);

      setLoadingProgress(100);
      setRecommendations(sortedMovies);
    } catch (error) {
      setError("Failed to fetch recommendations. Please try again.");
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoading(false);
      setLoadingProgress(0);
    }
  };

  // Clear cache when filters change
  useEffect(() => {
    // Clear the movie cache when filters change
    movieCache.clear();
  }, [
    selectedGenres,
    selectedDecades,
    selectedCountries,
    maxRuntime,
    preferredActor,
    preferredDirector,
  ]);

  if (getSortedRecommendations().length > 0) {
    const totalPages = Math.ceil(
      getSortedRecommendations().length / itemsPerPage
    );

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">
                Your Movie Recommendations
              </h1>
              <button
                onClick={resetState}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-bold rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Start Again
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="sort"
                  className="text-sm font-bold text-gray-700"
                >
                  Sort by:
                </label>
                <select
                  id="sort"
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white text-gray-900"
                >
                  {sortOptions.map((option: SortOption) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 mb-8">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {getPaginatedRecommendations().map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onClick={() => setSelectedMovie(movie)}
                  />
                ))}
              </div>
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === 1
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-md ${
                      currentPage === totalPages
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-indigo-600 text-white hover:bg-indigo-700"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
        <Modal
          isOpen={!!selectedMovie}
          onClose={() => setSelectedMovie(null)}
          movie={selectedMovie}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-8 sm:px-6 lg:px-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-12 mt-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What film should I watch?
          </h1>
          <p className="text-xl text-gray-600">
            Customize your preferences below to get personalized movie
            recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Genres
            </h2>
            <GenreSelection />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Decades
            </h2>
            <DecadeSelection />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Countries
            </h2>
            <CountrySelection />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Runtime
            </h2>
            <RuntimeSelection />
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 md:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Cast & Crew
            </h2>
            <CreatorSelection />
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={handleGetRecommendations}
            disabled={
              isLoading ||
              (selectedGenres.length === 0 &&
                selectedDecades.length === 0 &&
                selectedCountries.length === 0 &&
                maxRuntime === 240 &&
                !preferredActor &&
                !preferredDirector)
            }
            className={`inline-flex items-center px-8 py-3 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
              isLoading ||
              (selectedGenres.length === 0 &&
                selectedDecades.length === 0 &&
                selectedCountries.length === 0 &&
                maxRuntime === 240 &&
                !preferredActor &&
                !preferredDirector)
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Getting Recommendations...
              </>
            ) : (
              "Generate Recommendations"
            )}
          </button>
          {selectedGenres.length === 0 &&
            selectedDecades.length === 0 &&
            selectedCountries.length === 0 &&
            maxRuntime === 240 &&
            !preferredActor &&
            !preferredDirector && (
              <p className="mt-4 text-sm text-gray-500">
                Please make at least one selection to continue
              </p>
            )}
          {isLoading && (
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Loading movies... {loadingProgress}%
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
