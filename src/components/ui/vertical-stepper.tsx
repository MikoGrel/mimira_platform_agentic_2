import { cn } from "$/lib/utils";
import { Check } from "lucide-react";
import { ReactNode } from "react";

interface Step {
  id: string;
  title: ReactNode;
  completed: boolean;
  current?: boolean;
}

interface VerticalStepperProps {
  steps: Step[];
  className?: string;
}

export function VerticalStepper({ steps, className }: VerticalStepperProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1;
        const isCompleted = step.completed;
        const isCurrent = step.current;
        const isUpcoming = !isCompleted && !isCurrent;

        return (
          <div key={step.id} className="relative flex items-start">
            {/* Connector line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-3.5 top-8 h-6 w-0.5",
                  isCompleted ? "bg-primary" : "bg-muted"
                )}
              />
            )}

            {/* Step indicator */}
            <div
              className={cn(
                "relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2",
                isCompleted &&
                  "border-primary bg-primary text-primary-foreground",
                isCurrent && "border-primary bg-background text-primary",
                isUpcoming && "border-muted bg-background text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>

            {/* Step content */}
            <div className="ml-4 flex-1">
              <h3
                className={cn(
                  "text-sm font-medium leading-6",
                  isCompleted && "text-foreground",
                  isCurrent && "text-primary",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {step.title}
              </h3>
            </div>
          </div>
        );
      })}
    </div>
  );
}
