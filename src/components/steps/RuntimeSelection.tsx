import { useState, useEffect } from "react";
import { useStore } from "@/store/useStore";

export const RuntimeSelection = () => {
  const { maxRuntime, setMaxRuntime } = useStore();
  const [localMax, setLocalMax] = useState(maxRuntime);

  useEffect(() => {
    setMaxRuntime(localMax);
  }, [localMax, setMaxRuntime]);

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-500 text-center">
        Select maximum movie runtime (optional)
      </div>

      <div className="px-2">
        <div className="flex justify-end mb-2">
          <span className="text-sm font-medium text-gray-700">
            {localMax} min
          </span>
        </div>

        <div className="relative">
          <input
            type="range"
            min="60"
            max="240"
            step="15"
            value={localMax}
            onChange={(e) => {
              const value = parseInt(e.target.value);
              setLocalMax(value);
            }}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={() => {
              setLocalMax(240);
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Reset to default
          </button>
        </div>
      </div>
    </div>
  );
};
