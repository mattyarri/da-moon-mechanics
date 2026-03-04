const SPEED_PRESETS = [1, 10, 100, 1000];

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
        {SPEED_PRESETS.map(s => (
          <button
            key={s}
            onClick={() => onSetSpeed(s)}
            className={`px-2 py-1 rounded text-xs transition-colors ${
              speed === s ? 'bg-white/30' : 'hover:bg-white/10'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>

      <div className="border-l border-white/20 pl-3 font-mono text-xs">
        {simTime.toISOString().slice(0, 16).replace('T', ' ')} UTC
      </div>
    </div>
  );
}
