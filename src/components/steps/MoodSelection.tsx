import { useStore } from "@/store/useStore";

const MOODS = [
  { id: "light", name: "Light & Fun" },
  { id: "serious", name: "Serious & Dramatic" },
  { id: "inspiring", name: "Inspiring & Uplifting" },
  { id: "dark", name: "Dark & Intense" },
  { id: "romantic", name: "Romantic" },
  { id: "thrilling", name: "Thrilling & Exciting" },
  { id: "funny", name: "Funny & Humorous" },
  { id: "thoughtful", name: "Thoughtful & Deep" },
] as const;

export const MoodSelection = () => {
  const { selectedMoods, setSelectedMoods } = useStore();

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-500 text-center">
        Select one or more moods to filter your recommendations, or skip this
        step to see all moods
      </div>
      <div className="grid gap-4">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => {
              if (selectedMoods.some((m) => m.id === mood.id)) {
                setSelectedMoods(selectedMoods.filter((m) => m.id !== mood.id));
              } else {
                setSelectedMoods([...selectedMoods, mood]);
              }
            }}
            className={`p-4 rounded-lg text-left transition-colors ${
              selectedMoods.some((m) => m.id === mood.id)
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {mood.name}
          </button>
        ))}
      </div>
    </div>
  );
};
