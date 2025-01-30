import { create } from 'zustand';

type ParametersState = {
  model: string;
  outputLength: number;
  temperature: number;
  topP: number;
  topK: number;
  repetitionPenalty: number;
  setParameter: (
    key: keyof Omit<ParametersState, 'setParameter'>,
    value: string |number
  ) => void;
};

export const useParameters = create<ParametersState>((set) => ({
  model: 'typhoon-v1.5-instruct',
  outputLength: 512,
  temperature: 0.7,
  topP: 0.7,
  topK: 50,
  repetitionPenalty: 1,
  setParameter: (key, value) => set({ [key]: value }),
}));
