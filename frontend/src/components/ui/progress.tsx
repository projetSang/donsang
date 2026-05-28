import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  HTMLProgressElement,
  React.ComponentPropsWithoutRef<"progress">
>(({ className, value, max = 100, ...props }, ref) => (
  <progress
    ref={ref}
    value={value ?? 0}
    max={max}
    className={cn(
      "h-4 w-full overflow-hidden rounded-full appearance-none [&::-webkit-progress-bar]:bg-secondary [&::-webkit-progress-value]:bg-primary [&::-moz-progress-bar]:bg-primary",
      className
    )}
    {...props}
  />
));
Progress.displayName = "Progress";

export { Progress };
