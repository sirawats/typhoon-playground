import { FaAngleDown } from 'react-icons/fa6';
import { useParameters } from '../../store/parameters';

type ModelSelectProps = {
  value: string;
  options: string[];
  onChange?: (value: string) => void;
};

export function ModelSelect({
  options,
  onChange,
}: Omit<ModelSelectProps, 'value'>) {
  const { model, setParameter } = useParameters();
  return (
    <div className="relative">
      <select
        value={model}
        onChange={(e) => {
          setParameter('model', e.target.value);
          onChange?.(e.target.value);
        }}
        className="w-full appearance-none rounded-3xl bg-surface p-4 pr-10 text-secondary"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
        <FaAngleDown className="h-4 w-4 fill-current text-white" />
      </div>
    </div>
  );
}
