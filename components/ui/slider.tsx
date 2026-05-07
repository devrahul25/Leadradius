"use client";

import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  min?: number;
  max?: number;
  step?: number;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(
  ({ className, min = 0, max = 100, step = 1, value, ...props }, ref) => {
    const v = Number(value ?? 0);
    const pct = ((v - min) / (max - min)) * 100;
    return (
      <div className="w-full">
        <input
          ref={ref}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          className={cn(
            "w-full appearance-none bg-transparent cursor-pointer",
            "[&::-webkit-slider-runnable-track]:h-2 [&::-webkit-slider-runnable-track]:rounded-full",
            "[&::-webkit-slider-runnable-track]:bg-bg-elevated",
            "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
            "[&::-webkit-slider-thumb]:-mt-1 [&::-webkit-slider-thumb]:rounded-full",
            "[&::-webkit-slider-thumb]:bg-brand-500 [&::-webkit-slider-thumb]:shadow-glow",
            "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white",
            className
          )}
          style={{
            background: `linear-gradient(to right, rgba(139,92,246,1) 0%, rgba(139,92,246,1) ${pct}%, transparent ${pct}%, transparent 100%)`,
            backgroundSize: "100% 8px",
            backgroundPosition: "0 50%",
            backgroundRepeat: "no-repeat",
          }}
          {...props}
        />
      </div>
    );
  }
);
Slider.displayName = "Slider";
