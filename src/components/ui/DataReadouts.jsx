import { useState } from 'react';

export default function DataReadouts({ astroData }) {
  const [expanded, setExpanded] = useState(false);
  const { moonPhaseName, moonIllumination, moonDistanceKm } = astroData;

  return (
    <div
      className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm rounded-lg text-white text-sm cursor-pointer select-none"
      onClick={() => setExpanded(e => !e)}
    >
      <div className="px-4 py-2">
        <div className="font-medium">{moonPhaseName}</div>
        <div className="text-white/60 text-xs">{moonIllumination.toFixed(1)}% illuminated</div>
      </div>

      {expanded && (
        <div className="border-t border-white/10 px-4 py-2 space-y-1 text-xs text-white/70">
          <div className="flex justify-between gap-6">
            <span>Earth–Moon</span>
            <span className="font-mono">{Math.round(moonDistanceKm).toLocaleString()} km</span>
          </div>
          <div className="flex justify-between gap-6">
            <span>Phase angle</span>
            <span className="font-mono">{astroData.moonPhaseAngle.toFixed(1)}&deg;</span>
          </div>
        </div>
      )}
    </div>
  );
}
