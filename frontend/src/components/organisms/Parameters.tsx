import { useState } from 'react';
import { ParameterField } from '../molecules/ParameterField';
import { ModelSelect } from '../atoms/ModelSelect';
import { useParameters } from '../../store/parameters';
import { FaAngleDown, FaAngleUp } from 'react-icons/fa6';
import { FaTimes } from 'react-icons/fa';

interface ParametersProps {
  onClose?: () => void;
}

export function Parameters({ onClose }: ParametersProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const {
    outputLength,
    temperature,
    topP,
    topK,
    repetitionPenalty,
    setParameter,
  } = useParameters();

  return (
    <div className="flex h-full flex-col p-4">
      {/* Header with mobile close button */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2"
          aria-expanded={isExpanded}
          aria-label="Toggle parameters"
        >
          <h2 className="font-semibold text-white">Parameters</h2>
          <div className="rounded-full bg-surface p-1">
            {isExpanded ? (
              <FaAngleUp className="h-4 w-4 fill-current text-primary" />
            ) : (
              <FaAngleDown className="h-4 w-4 fill-current text-primary" />
            )}
          </div>
        </button>
        <button
          onClick={onClose}
          className="p-2 text-secondary transition-colors hover:text-white md:hidden"
          aria-label="Close parameters"
        >
          <FaTimes className="h-4 w-4" />
        </button>
      </div>

      {/* Parameters Fields */}
      <div className={`space-y-6 ${isExpanded ? 'block' : 'hidden'}`}>
        <ParameterField
          label="Output Length"
          value={outputLength}
          onChange={(value) => setParameter('outputLength', value)}
          min={1}
          max={2048}
          step={1}
        />

        <ParameterField
          label="Temperature"
          value={temperature}
          onChange={(value) => setParameter('temperature', value)}
          min={0}
          max={2}
          step={0.1}
        />

        <ParameterField
          label="Top-P"
          value={topP}
          onChange={(value) => setParameter('topP', value)}
          min={0}
          max={1}
          step={0.1}
        />

        <ParameterField
          label="Top-K"
          value={topK}
          onChange={(value) => setParameter('topK', value)}
          min={1}
          max={100}
          step={1}
        />

        <ParameterField
          label="Repetition Penalty"
          value={repetitionPenalty}
          onChange={(value) => setParameter('repetitionPenalty', value)}
          min={1}
          max={2}
          step={0.1}
        />
      </div>

      {/* Model Selection */}
      <div className="mt-auto pt-6">
        <span className="mb-2 block text-white">Model</span>
        <ModelSelect
          options={[
            'typhoon-instruct',
            'typhoon-v1.5-instruct',
            'typhoon-v1.5x-70b-instruct',
            'typhoon-v2-8b-instruct',
            'typhoon-v2-70b-instruct',
          ]}
        />
      </div>
    </div>
  );
}
