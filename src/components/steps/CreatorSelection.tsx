import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";
import { tmdbApi } from "@/services/tmdb";
import { useDebounce } from "@/hooks/useDebounce";

export const CreatorSelection = () => {
  const {
    preferredActor,
    preferredDirector,
    setPreferredActor,
    setPreferredDirector,
  } = useStore();
  const [actorQuery, setActorQuery] = useState("");
  const [directorQuery, setDirectorQuery] = useState("");
  const [actorResults, setActorResults] = useState<
    { id: number; name: string }[]
  >([]);
  const [directorResults, setDirectorResults] = useState<
    { id: number; name: string }[]
  >([]);
  const [isLoadingActors, setIsLoadingActors] = useState(false);
  const [isLoadingDirectors, setIsLoadingDirectors] = useState(false);

  const debouncedActorQuery = useDebounce(actorQuery, 500);
  const debouncedDirectorQuery = useDebounce(directorQuery, 500);

  useEffect(() => {
    const searchActors = async () => {
      if (debouncedActorQuery.length < 2) {
        setActorResults([]);
        return;
      }
      setIsLoadingActors(true);
      try {
        const results = await tmdbApi.searchPerson(debouncedActorQuery);
        setActorResults(results);
      } catch (error) {
        console.error("Error searching actors:", error);
      } finally {
        setIsLoadingActors(false);
      }
    };

    searchActors();
  }, [debouncedActorQuery]);

  useEffect(() => {
    const searchDirectors = async () => {
      if (debouncedDirectorQuery.length < 2) {
        setDirectorResults([]);
        return;
      }
      setIsLoadingDirectors(true);
      try {
        const results = await tmdbApi.searchPerson(debouncedDirectorQuery);
        setDirectorResults(results);
      } catch (error) {
        console.error("Error searching directors:", error);
      } finally {
        setIsLoadingDirectors(false);
      }
    };

    searchDirectors();
  }, [debouncedDirectorQuery]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="actor"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Actor (optional)
          </label>
          <div className="relative">
            <input
              type="text"
              id="actor"
              value={actorQuery}
              onChange={(e) => setActorQuery(e.target.value)}
              placeholder="Search for an actor..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {isLoadingActors && (
              <div className="absolute right-3 top-2">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {actorResults.length > 0 && (
            <ul className="mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg">
              {actorResults.map((actor) => (
                <li
                  key={actor.id}
                  onClick={() => {
                    setPreferredActor(actor.name);
                    setActorQuery("");
                    setActorResults([]);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {actor.name}
                </li>
              ))}
            </ul>
          )}
          {preferredActor && (
            <div className="mt-2 flex items-center gap-2">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                {preferredActor}
              </span>
              <button
                onClick={() => setPreferredActor("")}
                className="text-indigo-600 hover:text-indigo-800"
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="director"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Director (optional)
          </label>
          <div className="relative">
            <input
              type="text"
              id="director"
              value={directorQuery}
              onChange={(e) => setDirectorQuery(e.target.value)}
              placeholder="Search for a director..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {isLoadingDirectors && (
              <div className="absolute right-3 top-2">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
          {directorResults.length > 0 && (
            <ul className="mt-1 max-h-60 overflow-auto bg-white border border-gray-300 rounded-lg shadow-lg">
              {directorResults.map((director) => (
                <li
                  key={director.id}
                  onClick={() => {
                    setPreferredDirector(director.name);
                    setDirectorQuery("");
                    setDirectorResults([]);
                  }}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                >
                  {director.name}
                </li>
              ))}
            </ul>
          )}
          {preferredDirector && (
            <div className="mt-2 flex items-center gap-2">
              <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm">
                {preferredDirector}
              </span>
              <button
                onClick={() => setPreferredDirector("")}
                className="text-indigo-600 hover:text-indigo-800"
              >
                ×
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
