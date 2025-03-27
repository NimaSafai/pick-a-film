"use client";

import { useStore, sortOptions, SortOption, Movie } from "@/store/useStore";
import { StepLayout } from "@/components/layout/StepLayout";
import { GenreSelection } from "@/components/steps/GenreSelection";
import { DecadeSelection } from "@/components/steps/DecadeSelection";
import { MoodSelection } from "@/components/steps/MoodSelection";
import { CreatorSelection } from "@/components/steps/CreatorSelection";
import { MovieCard } from "@/components/ui/Card";
import { Modal } from "@/components/ui/Modal";
import { tmdbApi } from "@/services/tmdb";
import { useState } from "react";

const STEPS = [
  {
    id: 1,
    title: "Select Genres",
    description: "Choose one or more genres that interest you",
    component: GenreSelection,
  },
  {
    id: 2,
    title: "Choose Decades",
    description: "Select the time periods you prefer",
    component: DecadeSelection,
  },
  {
    id: 3,
    title: "Pick Your Mood",
    description: "What kind of mood are you in? (optional)",
    component: MoodSelection,
  },
  {
    id: 4,
    title: "Select Creators",
    description: "Search for specific actors or directors (optional)",
    component: CreatorSelection,
  },
];

export default function Home() {
  const {
    currentStep,
    selectedGenres,
    selectedDecades,
    selectedMoods,
    preferredActor,
    preferredDirector,
    setRecommendations,
    setIsLoading,
    setError,
    isLoading,
    error,
    setCurrentStep,
    selectedSort,
    setSelectedSort,
    getSortedRecommendations,
    resetState,
  } = useStore();

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  const handleGetRecommendations = async () => {
    if (selectedGenres.length === 0 || selectedDecades.length === 0) {
      setError("Please select at least one genre and decade");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get movies for each decade and combine results
      const decadePromises = selectedDecades.map(async (decade) => {
        const { results } = await tmdbApi.getMoviesByCriteria({
          genres: selectedGenres.map((g) => g.id).join(","),
          "primary_release_date.gte": `${decade.start}-01-01`,
          "primary_release_date.lte": `${decade.end}-12-31`,
          "vote_average.gte": 7.0,
          page: 1,
        });
        return results;
      });

      const decadeResults = await Promise.all(decadePromises);
      const allMovies = decadeResults.flat();

      if (allMovies.length === 0) {
        setError(
          "No movies found matching your criteria. Try adjusting your selections."
        );
        return;
      }

      // Fetch full movie details including genres and credits
      const detailedMovies = await Promise.all(
        allMovies.map((movie) => tmdbApi.getMovieDetails(movie.id))
      );

      // Filter movies based on mood and creators
      let filteredMovies = detailedMovies;

      // Filter by mood if selected
      if (selectedMoods.length > 0) {
        filteredMovies = filteredMovies.filter((movie) => {
          const movieGenres = movie.genres.map((g) => g.name.toLowerCase());

          return selectedMoods.some((mood) => {
            switch (mood.id) {
              case "light":
                return movieGenres.some((g) =>
                  ["comedy", "family", "animation"].includes(g)
                );
              case "serious":
                return movieGenres.some((g) =>
                  ["drama", "thriller", "crime"].includes(g)
                );
              case "inspiring":
                return movieGenres.some((g) =>
                  ["drama", "biography", "sport"].includes(g)
                );
              case "dark":
                return movieGenres.some((g) =>
                  ["horror", "thriller", "crime"].includes(g)
                );
              case "romantic":
                return movieGenres.some((g) =>
                  ["romance", "romantic comedy"].includes(g)
                );
              case "thrilling":
                return movieGenres.some((g) =>
                  ["action", "thriller", "adventure"].includes(g)
                );
              case "funny":
                return movieGenres.some((g) =>
                  ["comedy", "romantic comedy"].includes(g)
                );
              case "thoughtful":
                return movieGenres.some((g) =>
                  ["drama", "documentary", "biography"].includes(g)
                );
              default:
                return true;
            }
          });
        });
      }

      // Filter by actor if selected
      if (preferredActor) {
        filteredMovies = filteredMovies.filter((movie) => {
          return movie.credits?.cast?.some(
            (cast) => cast.name.toLowerCase() === preferredActor.toLowerCase()
          );
        });
      }

      // Filter by director if selected
      if (preferredDirector) {
        filteredMovies = filteredMovies.filter((movie) => {
          return movie.credits?.crew?.some(
            (crew) =>
              crew.name.toLowerCase() === preferredDirector.toLowerCase() &&
              crew.job === "Director"
          );
        });
      }

      if (filteredMovies.length === 0) {
        setError(
          "No movies found matching your criteria. Try adjusting your selections."
        );
        return;
      }

      // Sort by vote average and take top 20
      const sortedMovies = filteredMovies
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 20);

      setRecommendations(sortedMovies);
      setCurrentStep(0);
    } catch (error) {
      setError("Failed to fetch recommendations. Please try again.");
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1]?.component;

  if (currentStep === 0) {
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
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                Start Again
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <label
                htmlFor="sort"
                className="text-sm font-medium text-gray-700"
              >
                Sort by:
              </label>
              <select
                id="sort"
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="block w-48 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                {sortOptions.map((option: SortOption) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 mb-8">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {getSortedRecommendations().map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={() => setSelectedMovie(movie)}
                />
              ))}
            </div>
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
    <StepLayout
      title={STEPS[currentStep - 1].title}
      description={STEPS[currentStep - 1].description}
      onNext={
        currentStep === STEPS.length ? handleGetRecommendations : undefined
      }
      isLastStep={currentStep === STEPS.length}
    >
      <CurrentStepComponent />
    </StepLayout>
  );
}
