import React from 'react';
import clsx from 'clsx';

type SliderProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange?: (value: number) => void;
};

export function Slider({ label, value, onChange, ...props }: SliderProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(event.target.value);
    onChange?.(newValue);
  };

  return (
    <div className="mb-4">
      <div className="mb-2">
        <span className="text-secondary">{label}</span>
        <span className="ml-2 bg-surface p-1 px-2 rounded-full text-white">{value}</span>
      </div>
      <div className="relative">
        <input
          type="range"
          value={value}
          onChange={handleChange}
          {...props}
          className={clsx(
            'h-1 w-full rounded-full bg-surface',
            'appearance-none',
            'relative z-10',
            // Progress bar effect
            'from-primary to-primary bg-no-repeat [&]:bg-gradient-to-r',
            '[&]:bg-[length:var(--progress-width)]',
            // Thumb styles
            '[&::-webkit-slider-thumb]:appearance-none',
            '[&::-webkit-slider-thumb]:border-separate',
            '[&::-webkit-slider-thumb]:w-4',
            '[&::-webkit-slider-thumb]:h-4',
            '[&::-webkit-slider-thumb]:border-2',
            '[&::-webkit-slider-thumb]:bg-white',
            '[&::-webkit-slider-thumb]:border-primary',

            '[&::-webkit-slider-thumb]:rounded-full',
            '[&::-webkit-slider-thumb]:cursor-pointer',
            '[&::-webkit-slider-thumb]:relative',
            '[&::-webkit-slider-thumb]:z-20',
            '[&::-webkit-slider-thumb]:hover:border-primary',
            // Firefox styles
            '[&::-moz-range-thumb]:appearance-none',
            '[&::-moz-range-thumb]:w-4',
            '[&::-moz-range-thumb]:h-4',
            '[&::-moz-range-thumb]:border-2',
            '[&::-moz-range-thumb]:bg-white',
            '[&::-moz-range-thumb]:border-primary',
            '[&::-moz-range-thumb]:rounded-full',
            '[&::-moz-range-thumb]:cursor-pointer',
            '[&::-moz-range-thumb]:relative',
            '[&::-moz-range-thumb]:z-20',
            '[&::-moz-range-thumb]:hover:border-primary',
            // Track styles
            '[&::-webkit-slider-runnable-track]:bg-transparent',
            '[&::-moz-range-track]:bg-transparent'
          )}
          style={
            {
              '--progress-width': `${((value - (props.min || 0)) / ((props.max || 100) - (props.min || 0))) * 100}%`,
            } as React.CSSProperties
          }
        />
      </div>
    </div>
  );
}
