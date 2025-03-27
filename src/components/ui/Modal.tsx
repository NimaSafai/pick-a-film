import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Movie } from "@/store/useStore";
import Image from "next/image";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  movie: Movie | null;
}

export function Modal({ isOpen, onClose, movie }: ModalProps) {
  if (!movie) return null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="w-full md:w-1/3">
                        {movie.poster_path ? (
                          <Image
                            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                            alt={movie.title}
                            width={500}
                            height={750}
                            className="w-full rounded-lg shadow-lg"
                          />
                        ) : (
                          <div className="w-full aspect-[2/3] bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400">
                              No poster available
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="w-full md:w-2/3">
                        <Dialog.Title
                          as="h3"
                          className="text-2xl font-semibold leading-6 text-gray-900 mb-4"
                        >
                          {movie.title}
                        </Dialog.Title>
                        <div className="mt-2 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Overview
                            </h4>
                            <p className="mt-1 text-sm text-gray-700">
                              {movie.overview}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Release Date
                            </h4>
                            <p className="mt-1 text-sm text-gray-700">
                              {new Date(movie.release_date).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Rating
                            </h4>
                            <p className="mt-1 text-sm text-gray-700">
                              {movie.vote_average.toFixed(1)} / 10
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">
                              Genres
                            </h4>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {movie.genres.map((genre) => (
                                <span
                                  key={genre.id}
                                  className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10"
                                >
                                  {genre.name}
                                </span>
                              ))}
                            </div>
                          </div>
                          {movie.credits && (
                            <>
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                  Cast
                                </h4>
                                <div className="mt-1">
                                  <p className="text-sm text-gray-700">
                                    {movie.credits.cast
                                      .slice(0, 5)
                                      .map((cast) => cast.name)
                                      .join(", ")}
                                    {movie.credits.cast.length > 5 && "..."}
                                  </p>
                                </div>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-500">
                                  Director
                                </h4>
                                <div className="mt-1">
                                  <p className="text-sm text-gray-700">
                                    {movie.credits.crew
                                      .filter((crew) => crew.job === "Director")
                                      .map((director) => director.name)
                                      .join(", ")}
                                  </p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
