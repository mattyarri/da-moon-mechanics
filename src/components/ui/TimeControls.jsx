const SPEED_PRESETS = [
  { value: 1, label: '1x' },
  { value: 3600, label: '1 hr/s' },
  { value: 86400, label: '1 day/s' },
  { value: 2592000, label: '1 mo/s' },
];

export default function TimeControls({ simTime, isPlaying, speed, onTogglePlay, onSetSpeed }) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/70 backdrop-blur-sm rounded-lg px-4 py-2 text-white text-sm">
      <button
        onClick={onTogglePlay}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-white/20 transition-colors"
      >
        {isPlaying ? '\u23F8' : '\u25B6'}
      </button>

      <div className="flex gap-1">
        {SPEED_PRESETS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => onSetSpeed(value)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              speed === value ? 'bg-white/30' : 'hover:bg-white/10'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="border-l border-white/20 pl-3 font-mono text-xs">
        {simTime.toISOString().slice(0, 16).replace('T', ' ')} UTC
      </div>
    </div>
  );
}
