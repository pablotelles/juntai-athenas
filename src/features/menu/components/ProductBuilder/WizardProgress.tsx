"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

interface WizardStep {
  label: string;
}

interface WizardProgressProps {
  steps: WizardStep[];
  currentStep: number; // 1-based
}

export function WizardProgress({ steps, currentStep }: WizardProgressProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-0">
      {steps.map((step, index) => {
        const stepNum = index + 1;
        const isDone = stepNum < currentStep;
        const isCurrent = stepNum === currentStep;

        return (
          <React.Fragment key={step.label}>
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div
                className={cn(
                  "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                  isDone && "bg-primary text-primary-foreground",
                  isCurrent &&
                    "bg-primary text-primary-foreground ring-4 ring-primary/20",
                  !isDone && !isCurrent && "bg-secondary text-muted-foreground",
                )}
              >
                {isDone ? "✓" : stepNum}
              </div>
              <span
                className={cn(
                  "text-xs sm:text-sm font-medium transition-colors",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  "hidden md:block flex-1 h-px mx-3 transition-colors",
                  isDone ? "bg-primary/40" : "bg-border",
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
