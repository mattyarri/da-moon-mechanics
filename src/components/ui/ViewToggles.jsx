export default function ViewToggles({ overlays, onToggle }) {
  const toggles = [
    { key: 'orbitalPlane', label: 'Moon orbit' },
    { key: 'eclipticPlane', label: 'Ecliptic' },
    { key: 'axisLine', label: 'Earth axis' },
  ];

  return (
    <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-xs space-y-1.5">
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
    </div>
  );
}
