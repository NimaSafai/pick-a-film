import { useEffect, useState } from "react";
import { useStore } from "@/store/useStore";
import { tmdbApi } from "@/services/tmdb";
import { Genre } from "@/store/useStore";

export const GenreSelection = () => {
  const { selectedGenres, setSelectedGenres } = useStore();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const data = await tmdbApi.getGenres();
        setGenres(data);
      } catch (error) {
        console.error("Error fetching genres:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGenres();
  }, []);

  const toggleGenre = (genre: Genre) => {
    setSelectedGenres(
      selectedGenres.some((g) => g.id === genre.id)
        ? selectedGenres.filter((g) => g.id !== genre.id)
        : [...selectedGenres, genre]
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => toggleGenre(genre)}
            className={`p-4 rounded-lg text-center transition-colors ${
              selectedGenres.some((g) => g.id === genre.id)
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>
      {selectedGenres.length === 0 && (
        <p className="text-center text-gray-500">
          Please select at least one genre to continue
        </p>
      )}
    </div>
  );
};
