import { useStore } from "@/store/useStore";

export const DecadeSelection = () => {
  const { selectedDecades, setSelectedDecades } = useStore();

  const decades = [
    { id: 1, label: "2020s", start: 2020, end: 2029 },
    { id: 2, label: "2010s", start: 2010, end: 2019 },
    { id: 3, label: "2000s", start: 2000, end: 2009 },
    { id: 4, label: "1990s", start: 1990, end: 1999 },
    { id: 5, label: "1980s", start: 1980, end: 1989 },
    { id: 6, label: "1970s", start: 1970, end: 1979 },
    { id: 7, label: "1960s", start: 1960, end: 1969 },
    { id: 8, label: "1950s", start: 1950, end: 1959 },
    { id: 9, label: "1940s", start: 1940, end: 1949 },
    { id: 10, label: "1930s", start: 1930, end: 1939 },
    { id: 11, label: "1920s", start: 1920, end: 1929 },
    { id: 12, label: "1910s", start: 1910, end: 1919 },
  ];

  const toggleDecade = (decade: (typeof decades)[0]) => {
    setSelectedDecades(
      selectedDecades.some((d) => d.id === decade.id)
        ? selectedDecades.filter((d) => d.id !== decade.id)
        : [...selectedDecades, decade]
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {decades.map((decade) => (
          <button
            key={decade.id}
            onClick={() => toggleDecade(decade)}
            className={`p-4 rounded-lg text-center transition-colors ${
              selectedDecades.some((d) => d.id === decade.id)
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
