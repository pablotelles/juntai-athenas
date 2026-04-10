"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

interface MobileStepBarProps {
  steps: { label: string }[];
  currentStep: number; // 1-based
}

/**
 * Compact step progress bar for mobile.
 * Renders a segmented track (one filled segment per completed/active step)
 * plus the current step label below — replaces the verbose WizardProgress on small screens.
 */
export function MobileStepBar({ steps, currentStep }: MobileStepBarProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {/* Segmented track */}
      <div className="flex items-center gap-1">
        {steps.map((_, index) => {
          const stepNum = index + 1;
          const isDone = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;

          return (
            <div
              key={index}
              className={cn(
                "flex-1 h-1 rounded-full transition-colors duration-300",
                isDone && "bg-primary",
                isCurrent && "bg-primary",
                !isDone && !isCurrent && "bg-border",
              )}
            />
          );
        })}
      </div>

      {/* Current step label */}
      <p className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {steps[currentStep - 1]?.label}
        </span>
        {currentStep < steps.length && (
          <span> · Próximo: {steps[currentStep]?.label}</span>
        )}
      </p>
    </div>
  );
}
