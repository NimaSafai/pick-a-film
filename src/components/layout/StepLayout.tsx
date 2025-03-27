import { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/store/useStore";

interface StepLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  onNext?: () => void;
  onBack?: () => void;
  isLastStep?: boolean;
}

export const StepLayout = ({
  children,
  title,
  description,
  onNext,
  onBack,
  isLastStep = false,
}: StepLayoutProps) => {
  const { currentStep, setCurrentStep, isLoading } = useStore();

  const handleNext = () => {
    if (onNext) {
      onNext();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
          <p className="text-lg text-gray-600">{description}</p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            {children}
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between">
          {currentStep > 1 && (
            <button
              onClick={handleBack}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Back
            </button>
          )}
          <div className="ml-auto">
            <button
              onClick={handleNext}
              disabled={isLoading}
              className={`bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 font-medium ${
                isLoading ? "cursor-wait" : "cursor-pointer"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Getting Recommendations...
                </span>
              ) : isLastStep ? (
                "Get Recommendations"
              ) : (
                "Next"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
