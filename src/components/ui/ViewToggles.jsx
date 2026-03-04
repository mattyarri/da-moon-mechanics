export default function ViewToggles({ overlays, onToggle, accurateScale, onToggleScale }) {
  const toggles = [
    { key: 'orbitTrail', label: 'Orbit trail' },
    { key: 'orbitalPlane', label: 'Moon plane' },
    { key: 'eclipticPlane', label: 'Ecliptic' },
    { key: 'axisLine', label: 'Earth axis' },
  ];

  return (
    <div className="absolute top-14 sm:top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs space-y-1.5">
      {toggles.map(({ key, label }) => (
        <label key={key} className="flex items-center gap-2 cursor-pointer hover:text-white/90">
          <input
            type="checkbox"
            checked={overlays[key]}
            onChange={() => onToggle(key)}
            className="accent-blue-500"
          />
          {label}
        </label>
      ))}
      <div className="border-t border-white/10 pt-1.5 mt-1.5">
        <button
          onClick={onToggleScale}
          className={`w-full text-left px-1 py-0.5 rounded transition-colors ${
            accurateScale ? 'text-yellow-300' : 'text-white/70 hover:text-white'
          }`}
        >
          {accurateScale ? 'Accurate scale' : 'Exaggerated scale'}
        </button>
      </div>
    </div>
  );
}
