'use client';

import React from 'react';

function convert(ms: number): string {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms - 3600000 * hours) / 60000);
  const seconds = Math.floor((ms - 3600000 * hours - 60000 * minutes) / 1000);

  return (
    (hours ? `${String(hours)} hour${hours === 1 ? '' : 's'}, ` : '') +
    (minutes ? `${String(minutes)} minute${minutes === 1 ? '' : 's'}, ` : '') +
    `${String(seconds)} second${seconds === 1 ? '' : 's'}`);
}

export function Timer() {
  const [elapsed, setElapsed] = React.useState(0);
  const [startDate] = React.useState(Date.now());

  React.useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsed(Date.now() - startDate);
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  return (
    <p>Time: {convert(elapsed)}</p>
  );
}
