import React from 'react';

export interface NumberInputProps {
  label: string;
  value: number;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function NumberInput({
  label,
  value,
  unit,
  min,
  max,
  step = 1,
  onChange,
  disabled = false
}: NumberInputProps) {
  return (
    <div className="flex items-center justify-between gap-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-xs">
      <span className="text-zinc-400 font-medium select-none">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-14 bg-transparent text-right text-zinc-100 font-mono focus:outline-none disabled:opacity-50"
        />
        {unit && <span className="text-zinc-500 font-mono select-none">{unit}</span>}
      </div>
    </div>
  );
}
