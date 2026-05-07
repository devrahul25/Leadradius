"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, leftIcon, rightSlot, ...props }, ref) => {
    return (
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            "h-10 w-full rounded-lg bg-bg-surface/60 border border-border px-3 text-sm text-text-primary",
            "placeholder:text-text-muted",
            "focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500/60",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "transition-colors duration-150",
            leftIcon && "pl-9",
            rightSlot && "pr-10",
            className
          )}
          {...props}
        />
        {rightSlot && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted">
            {rightSlot}
          </span>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export interface LabelProps {
  children: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  className?: string;
}

export function Label({ children, htmlFor, hint, className }: LabelProps) {
  return (
    <label htmlFor={htmlFor} className={cn("flex items-center justify-between mb-1.5", className)}>
      <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
        {children}
      </span>
      {hint && <span className="text-xs text-text-muted">{hint}</span>}
    </label>
  );
}
