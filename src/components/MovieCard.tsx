import { Movie } from "../types";

interface MovieCardProps {
  movie: Movie;
}

const MovieCard = ({ movie }: MovieCardProps) => {
  const releaseYear = movie.release_date.split("-")[0];

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {movie.poster_path ? (
        <img
          src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
          alt={movie.title}
          className="w-full h-64 object-cover"
        />
      ) : (
        <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-500">No poster available</span>
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">
          {movie.title} ({releaseYear})
        </h3>
        <div className="flex items-center mb-2">
          <span className="text-yellow-500 mr-1">★</span>
          <span className="text-sm text-gray-600">
            {movie.vote_average.toFixed(1)} ({movie.vote_count} votes)
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-2">
          Runtime: {movie.runtime} minutes
        </p>
        <div className="flex flex-wrap gap-1">
          {movie.genres.map((genre) => (
            <span
              key={genre}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
            >
              {genre}
            </span>
          ))}
        </div>
        <p className="text-sm text-gray-700 mt-2 line-clamp-3">
          {movie.overview}
        </p>
      </div>
    </div>
  );
};

export default MovieCard;
