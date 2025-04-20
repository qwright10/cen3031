'use client';

import React from 'react';

interface TrueFalseProps {
  readonly id: string;
}

export function TrueFalse({ id }: TrueFalseProps) {
  const checkboxRef = React.useRef<HTMLInputElement>(null);

  const check = (v: boolean) => () => {
    if (!checkboxRef.current) return;
    checkboxRef.current.checked = v;
  };

  return (
    <div className="by-cyan-950 w-fit rounded-lg">
      <input
        type="checkbox"
        className="peer hidden"
        defaultChecked
        name={id}
        ref={checkboxRef} />

      <button
        type="button"
        className="px-2 py-1 peer-checked:bg-cyan-600 peer-checked:shadow peer-checked:shadow-cyan-800  peer-checked:rounded-lg"
        onClick={check(true)}>
        True
      </button>
      <button
        type="button"
        className="px-2 py-1  bg-cyan-600 peer-checked:bg-transparent shadow peer-checked:shadow-none shadow-cyan-800 rounded-lg"
        onClick={check(false)}>
        False
      </button>
    </div>
  );
}
