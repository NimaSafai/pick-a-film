import { useEffect } from "react";
import { useStore } from "../store/useStore";
import { fetchMovies } from "../utils/api";
import MovieCard from "./MovieCard";
import Pagination from "./Pagination";

const MovieList = () => {
  const {
    selectedGenres,
    selectedDecades,
    selectedCountries,
    preferredActor,
    preferredDirector,
    maxRuntime,
    isLoading,
    error,
    currentPage,
    totalPages,
    setRecommendations,
    setIsLoading,
    setError,
    setCurrentPage,
    setTotalPages,
    getPaginatedRecommendations,
  } = useStore();

  useEffect(() => {
    const loadMovies = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const { movies, totalPages: newTotalPages } = await fetchMovies(
          selectedGenres,
          selectedDecades,
          selectedCountries,
          preferredActor,
          preferredDirector,
          maxRuntime,
          currentPage
        );
        setRecommendations(movies);
        setTotalPages(newTotalPages);
      } catch (err) {
        setError("Failed to fetch movies. Please try again later.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMovies();
  }, [
    selectedGenres,
    selectedDecades,
    selectedCountries,
    preferredActor,
    preferredDirector,
    maxRuntime,
    currentPage,
  ]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading movies...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }

  const paginatedMovies = getPaginatedRecommendations();

  if (paginatedMovies.length === 0) {
    return (
      <div className="text-center py-8">
        No movies found matching your criteria. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {paginatedMovies.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default MovieList;
