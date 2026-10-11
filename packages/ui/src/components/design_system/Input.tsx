import React, { useState, useEffect } from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  isInvalid?: boolean;
}

export function Input({
  isInvalid = false,
  className = '',
  disabled,
  ...props
}: InputProps) {
  const baseClasses =
    'bg-zinc-950 border text-zinc-200 rounded px-2 py-1 text-xs outline-none transition-colors';

  const stateClasses = isInvalid
    ? 'border-red-800 bg-red-950/20 text-red-300 focus:border-red-600 focus:ring-1 focus:ring-red-600'
    : 'border-zinc-800 hover:border-zinc-700 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600';

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed bg-zinc-900 border-zinc-800 text-zinc-500'
    : '';

  return (
    <input
      disabled={disabled}
      className={`${baseClasses} ${stateClasses} ${disabledClasses} ${className}`}
      {...props}
    />
  );
}

export interface NumberInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number;
  onCommit: (val: number) => void;
  min?: number;
  max?: number;
}

export function NumberInput({
  value,
  onCommit,
  min,
  max,
  className = '',
  disabled,
  ...props
}: NumberInputProps) {
  const [localVal, setLocalVal] = useState<string>(String(value));
  const [isInvalid, setIsInvalid] = useState<boolean>(false);

  useEffect(() => {
    setLocalVal(String(value));
    setIsInvalid(false);
  }, [value]);

  const commitValue = () => {
    const parsed = parseInt(localVal, 10);
    if (
      isNaN(parsed) ||
      (min !== undefined && parsed < min) ||
      (max !== undefined && parsed > max)
    ) {
      setIsInvalid(true);
      // Revert to current valid prop value
      setLocalVal(String(value));
      setTimeout(() => setIsInvalid(false), 800);
    } else {
      setIsInvalid(false);
      onCommit(parsed);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      commitValue();
    } else if (e.key === 'Escape') {
      setLocalVal(String(value));
      setIsInvalid(false);
    }
  };

  return (
    <Input
      type="number"
      value={localVal}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={commitValue}
      onKeyDown={handleKeyDown}
      isInvalid={isInvalid}
      disabled={disabled}
      className={`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${className}`}
      {...props}
    />
  );
}
