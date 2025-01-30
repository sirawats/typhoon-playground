import clsx from 'clsx';
import { Slider } from '../atoms/Slider';

type ParameterFieldProps = {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  type?: 'slider' | 'toggle';
  onChange?: (value: number) => void;
};

export function ParameterField({
  label,
  value,
  type = 'slider',
  ...props
}: ParameterFieldProps) {
  if (type === 'toggle') {
    return (
      <div className="mb-4 flex items-center justify-between">
        <span className="text-secondary">{label}</span>
        <div
          className={clsx(
            'h-6 w-6 rounded',
            value ? 'bg-purple-600' : 'bg-gray-600'
          )}
        />
      </div>
    );
  }

  return <Slider label={label} value={value} {...props} />;
}
