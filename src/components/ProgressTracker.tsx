
import React from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Step {
  label: string;
  status: "pending" | "in-progress" | "completed" | "error";
}

interface ProgressTrackerProps {
  steps: Step[];
  currentStep: number;
  progress: number;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  steps,
  currentStep,
  progress,
}) => {
  return (
    <Card className="p-6 glass animate-fade-up">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Progress</h3>
        <Progress value={progress} className="w-full" />
        <div className="space-y-2">
          {steps.map((step, index) => (
            <div
              key={step.label}
              className={`flex items-center space-x-2 transition-opacity duration-200 ${
                index > currentStep ? "opacity-50" : "opacity-100"
              }`}
            >
              <div
                className={`w-2 h-2 rounded-full ${
                  step.status === "completed"
                    ? "bg-green-500"
                    : step.status === "in-progress"
                    ? "bg-blue-500"
                    : step.status === "error"
                    ? "bg-red-500"
                    : "bg-gray-300"
                }`}
              />
              <span className="text-sm">{step.label}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

