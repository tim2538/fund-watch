import * as React from "react";
import { cn } from "@/lib/utils";

type IconType = React.ComponentType<{ className?: string }>;

export interface ButtonGroupOption<T extends string> {
  value: T;
  label: string;
  icon: IconType;
}

/** Segmented, single-select button group with a leading icon per option. */
export function ButtonGroup<T extends string>({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: ButtonGroupOption<T>[];
}) {
  return (
    <div>
      <div className="mb-1.5 text-xs font-medium text-muted-foreground">
        {label}
      </div>
      <div className="flex rounded-md border p-0.5">
        {options.map((o) => {
          const Icon = o.icon;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onValueChange(o.value)}
              className={cn(
                "flex min-w-0 flex-1 basis-0 items-center justify-center gap-1.5 whitespace-nowrap rounded px-2 py-1 text-xs font-medium transition-colors",
                value === o.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
