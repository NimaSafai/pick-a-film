import { useStore } from "@/store/useStore";

const DECADES = [
  { start: 1950, end: 1959, label: "1950s" },
  { start: 1960, end: 1969, label: "1960s" },
  { start: 1970, end: 1979, label: "1970s" },
  { start: 1980, end: 1989, label: "1980s" },
  { start: 1990, end: 1999, label: "1990s" },
  { start: 2000, end: 2009, label: "2000s" },
  { start: 2010, end: 2019, label: "2010s" },
  { start: 2020, end: 2029, label: "2020s" },
];

export const DecadeSelection = () => {
  const { selectedDecades, setSelectedDecades } = useStore();

  const toggleDecade = (decade: (typeof DECADES)[0]) => {
    setSelectedDecades(
      selectedDecades.some((d) => d.start === decade.start)
        ? selectedDecades.filter((d) => d.start !== decade.start)
        : [...selectedDecades, decade]
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {DECADES.map((decade) => (
          <button
            key={decade.start}
            onClick={() => toggleDecade(decade)}
            className={`p-4 rounded-lg text-center transition-colors ${
              selectedDecades.some((d) => d.start === decade.start)
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {decade.label}
          </button>
        ))}
      </div>
      {selectedDecades.length === 0 && (
        <p className="text-center text-gray-500">
          Please select at least one decade to continue
        </p>
      )}
    </div>
  );
};
