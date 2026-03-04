export default function CameraPresets({ cameraMode, onSetMode }) {
  const presets = [
    { key: 'free', label: 'Free' },
    { key: 'topDown', label: 'Top-down' },
    { key: 'earthSurface', label: 'Earth view' },
  ];

  return (
    <div className="absolute top-4 left-4 sm:left-1/2 sm:-translate-x-1/2 flex gap-1 bg-black/70 backdrop-blur-sm rounded-lg px-2 py-1.5 text-white text-xs" style={{ top: 'calc(env(safe-area-inset-top, 0px) + 1rem)' }}>
      {presets.map(({ key, label }) => (
        <button
          key={key}
          onClick={() => onSetMode(key)}
          className={`px-3 py-2 sm:py-1 rounded transition-colors ${
            cameraMode === key ? 'bg-white/25' : 'hover:bg-white/10'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
