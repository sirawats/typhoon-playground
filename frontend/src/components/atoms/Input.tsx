// src/components/atoms/Input.tsx
import { forwardRef } from 'react';
import clsx from 'clsx';

type InputProps = {
  className?: string;
} & React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={clsx(
          'w-full',
          'rounded-lg',
          'bg-surface',
          'px-4 py-2',
          'text-body2 text-white',
          'placeholder:text-gray-400',
          'border border-gray-700',
          'focus:outline-none focus:ring-1 focus:ring-purple-600',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';
