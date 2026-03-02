interface Props {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
}

const BtnClass =
  'flex items-center justify-center w-10 h-10 rounded-xl text-lg font-semibold ' +
  'bg-white/10 dark:bg-white/10 hover:bg-white/20 dark:hover:bg-white/20 ' +
  'border border-white/20 dark:border-white/20 ' +
  'text-slate-800 dark:text-white ' +
  'backdrop-blur-md transition-colors duration-150 select-none';

export function ZoomControls({ onZoomIn, onZoomOut, onFit }: Props) {
  return (
    <div className='absolute bottom-6 right-6 flex flex-col gap-1.5 z-20'>
      <button
        onClick={onZoomIn}
        className={BtnClass}
        title='Zoom in'
        aria-label='Zoom in'
      >
        +
      </button>
      <button
        onClick={onFit}
        className={BtnClass}
        title='Fit to screen'
        aria-label='Fit to screen'
      >
        <svg viewBox='0 0 20 20' className='w-4 h-4 fill-current'>
          <path d='M3 3h5V1H1v7h2V3zm9-2v2h5v5h2V1h-7zm5 14h-5v2h7v-7h-2v5zM3 12H1v7h7v-2H3v-5z' />
        </svg>
      </button>
      <button
        onClick={onZoomOut}
        className={BtnClass}
        title='Zoom out'
        aria-label='Zoom out'
      >
        −
      </button>
    </div>
  );
}
