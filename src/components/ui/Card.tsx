import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Movie } from "@/types/movie";
import { StarIcon } from "@heroicons/react/20/solid";
import Image from "next/image";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = "" }: CardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white rounded-xl shadow-lg overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
};

interface MovieCardProps {
  movie: Movie;
  onClick: () => void;
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  return (
    <div
      className="group relative bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer 
        hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out"
      onClick={onClick}
    >
      <div className="aspect-[2/3] relative">
        {movie.poster_path ? (
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            width={500}
            height={750}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">No poster available</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
          {movie.title}
        </h3>
        <div className="flex items-center text-sm text-gray-500">
          <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
          <span>{movie.vote_average.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
