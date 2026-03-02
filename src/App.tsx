import { FamilyTree } from '@/components/FamilyTree';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useTheme } from '@/hooks/useTheme';
import type { FamilyMember } from '@/types/family';
import { useEffect, useState } from 'react';

export default function App() {
  const { theme, toggle } = useTheme();
  const [data, setData] = useState<FamilyMember[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/assets/data.json')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json() as Promise<FamilyMember[]>;
      })
      .then(setData)
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : 'Failed to load data')
      );
  }, []);

  const isDark = theme === 'dark';

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden ${isDark ? 'bg-slate-950' : 'bg-slate-100'} transition-colors duration-300`}
    >
      {/* Header */}
      <div className='absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none select-none'>
        <h1
          className={`text-lg font-semibold tracking-wide ${isDark ? 'text-white/60' : 'text-slate-500'}`}
        >
          Yap Family Tree
        </h1>
      </div>

      {/* Theme toggle – top right */}
      <ThemeToggle theme={theme} onToggle={toggle} />

      {/* Main content */}
      {error ? (
        <div className='flex items-center justify-center w-full h-full'>
          <p className='text-red-400 font-medium'>Error: {error}</p>
        </div>
      ) : data.length === 0 ? (
        <div className='flex items-center justify-center w-full h-full'>
          <p
            className={`${isDark ? 'text-white/40' : 'text-slate-400'} text-sm`}
          >
            Loading family tree…
          </p>
        </div>
      ) : (
        <FamilyTree data={data} isDark={isDark} />
      )}
    </div>
  );
}
