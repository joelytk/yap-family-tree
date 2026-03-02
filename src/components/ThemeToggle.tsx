type Theme = 'dark' | 'light';

interface Props {
  theme: Theme;
  onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: Props) {
  const isDark = theme === 'dark';
  return (
    <button
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={[
        'absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-2 rounded-xl',
        'border backdrop-blur-md text-sm font-medium transition-colors duration-200 select-none',
        isDark
          ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
          : 'bg-black/5 border-black/10 text-slate-800 hover:bg-black/10'
      ].join(' ')}
    >
      {isDark ? (
        <>
          <SunIcon />
          <span className='hidden sm:inline'>Light</span>
        </>
      ) : (
        <>
          <MoonIcon />
          <span className='hidden sm:inline'>Dark</span>
        </>
      )}
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox='0 0 24 24' className='w-4 h-4 fill-current' aria-hidden>
      <path d='M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0v-1a1 1 0 0 1 1-1zm0-16a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1zm9 8a1 1 0 0 1-1 1h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1zM4 12a1 1 0 0 1-1 1H2a1 1 0 1 1 0-2h1a1 1 0 0 1 1 1zm14.95 4.95a1 1 0 0 1-1.414 1.414l-.707-.707a1 1 0 0 1 1.414-1.414l.707.707zm-12.728.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 1.414l-.707.707zm12.728-12.728a1 1 0 0 1 0 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707a1 1 0 0 1 1.414 0zM6.636 6.636a1 1 0 0 1-1.414 0l-.707-.707a1 1 0 0 1 1.414-1.414l.707.707a1 1 0 0 1 0 1.414z' />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox='0 0 24 24' className='w-4 h-4 fill-current' aria-hidden>
      <path d='M21 12.79A9 9 0 1 1 11.21 3a7 7 0 1 0 9.79 9.79z' />
    </svg>
  );
}
