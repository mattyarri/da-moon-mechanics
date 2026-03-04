import NotableEvents from './NotableEvents';

const SPEED_PRESETS = [
  { value: 1, label: '1x' },
  { value: 3600, label: '1 hr/s' },
  { value: 86400, label: '1 day/s' },
  { value: 2592000, label: '1 mo/s' },
];

const DAY_MS = 86400000;

export default function TimeControls({ simTime, isPlaying, speed, onTogglePlay, onSetSpeed, onSetDate, events }) {
  const step = (days) => onSetDate(new Date(simTime.getTime() + days * DAY_MS));

  return (
    <div className="absolute bottom-4 left-2 right-2 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 flex flex-wrap items-center justify-center gap-2 sm:gap-3 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm">
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
        >
          {isPlaying ? '\u23F8' : '\u25B6'}
        </button>

        <div className="flex gap-1">
          {SPEED_PRESETS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onSetSpeed(value)}
              className={`px-2 py-1.5 sm:py-1 rounded text-xs transition-colors ${
                speed === value ? 'bg-white/30' : 'hover:bg-white/10'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button onClick={() => step(-30)} className="px-2 py-1.5 sm:px-1 sm:py-0.5 rounded text-xs hover:bg-white/10">&laquo;</button>
        <button onClick={() => step(-1)} className="px-2 py-1.5 sm:px-1 sm:py-0.5 rounded text-xs hover:bg-white/10">&lsaquo;</button>
        <span className="font-mono text-xs px-1">
          {simTime.toISOString().slice(0, 10)}
        </span>
        <button onClick={() => step(1)} className="px-2 py-1.5 sm:px-1 sm:py-0.5 rounded text-xs hover:bg-white/10">&rsaquo;</button>
        <button onClick={() => step(30)} className="px-2 py-1.5 sm:px-1 sm:py-0.5 rounded text-xs hover:bg-white/10">&raquo;</button>
      </div>

      <div className="sm:border-l sm:border-white/20 sm:pl-2">
        <NotableEvents events={events} onSelectDate={onSetDate} />
      </div>
    </div>
  );
}
