import { useState, useEffect } from 'react';

const DISMISSED_KEY = 'damoon-info-dismissed';

export default function InfoPanel() {
  const [open, setOpen] = useState(false);

  // Show on first visit
  useEffect(() => {
    if (!localStorage.getItem(DISMISSED_KEY)) {
      setOpen(true);
    }
  }, []);

  const dismiss = () => {
    setOpen(false);
    localStorage.setItem(DISMISSED_KEY, '1');
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="absolute bottom-24 sm:bottom-6 right-4 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-black/70 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/90 transition-colors text-sm flex items-center justify-center"
        >
          ?
        </button>
      )}

      {open && (
        <div className="absolute inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 bg-black/50" onClick={dismiss} />
          <div className="relative bg-[#0d0d1a]/95 backdrop-blur-md border border-white/10 rounded-xl max-w-md w-full mx-4 p-6 text-white shadow-2xl">
            <button
              onClick={dismiss}
              className="absolute top-3 right-3 text-white/40 hover:text-white transition-colors text-lg leading-none"
            >
              &times;
            </button>

            <h2 className="text-lg font-semibold mb-1">da moon mechanics</h2>
            <p className="text-white/50 text-xs mb-4">An interactive, astronomically accurate model of the Sun-Earth-Moon system</p>

            <div className="space-y-3.5 text-sm text-white/80 max-h-[65vh] overflow-y-auto pr-1">
              <p>
                Explore the orbital mechanics behind lunar phases, eclipses, and the seasons. Every position is computed from real astronomical data using the same models used by observatories — what you see here matches the actual sky for any date.
              </p>

              <div>
                <h3 className="text-white/60 text-xs uppercase tracking-wider mb-1.5">Navigation</h3>
                <ul className="space-y-1 text-xs text-white/70">
                  <li><span className="text-white/40 font-mono mr-2">drag</span> Rotate the camera around the scene</li>
                  <li><span className="text-white/40 font-mono mr-2">scroll</span> Zoom in and out (zooms toward cursor)</li>
                  <li><span className="text-white/40 font-mono mr-2">{'\u25B6 \u23F8'}</span> Play or pause the time simulation</li>
                  <li><span className="text-white/40 font-mono mr-2">{'\u2039 \u203A'}</span> Step forward or back by one day</li>
                  <li><span className="text-white/40 font-mono mr-2">{'\u00AB \u00BB'}</span> Jump forward or back by one month</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white/60 text-xs uppercase tracking-wider mb-1.5">Interface guide</h3>
                <ul className="space-y-1.5 text-xs text-white/70">
                  <li><span className="text-white/90">Moon phase panel</span> (top-left) — shows the current phase and illumination. Click it to expand details: distance, orbital inclination, season, and next eclipse.</li>
                  <li><span className="text-white/90">Camera presets</span> (top-center) — switch between free orbit, ecliptic top-down, and Earth surface view. Top-down tracks Earth until you click to break free. Earth view places you at 40&#176;N looking at the Moon.</li>
                  <li><span className="text-white/90">Overlays</span> (top-right) — toggle visual helpers: the Moon's orbit trail, its tilted orbital plane, the ecliptic reference plane, and Earth's axis of rotation.</li>
                  <li><span className="text-white/90">Scale toggle</span> (top-right) — switch between exaggerated scale (everything visible at once) and accurate scale (true relative sizes and distances).</li>
                  <li><span className="text-white/90">Time controls</span> (bottom) — play/pause, speed presets from real-time to one month per second, date stepping, and notable events.</li>
                  <li><span className="text-white/90">Events menu</span> (bottom) — a curated list of eclipses, solstices, equinoxes, and supermoons. Click any event to jump to that date.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white/60 text-xs uppercase tracking-wider mb-1.5">Things to notice</h3>
                <ul className="space-y-1 text-xs text-white/70">
                  <li>The Moon's orbit is tilted ~5&#176; from the ecliptic — this is why eclipses don't happen every full or new moon</li>
                  <li>Earth's 23.4&#176; axial tilt causes the seasons. Jump to a solstice and watch which pole faces the Sun.</li>
                  <li>The Moon is tidally locked — the same face always points toward Earth</li>
                  <li>Switch to accurate scale to feel the true emptiness of space between Earth and Moon</li>
                </ul>
              </div>

              <div>
                <h3 className="text-white/60 text-xs uppercase tracking-wider mb-1.5">Sources</h3>
                <ul className="space-y-1 text-xs text-white/40">
                  <li><a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white/80 underline underline-offset-2">Astronomy Engine</a> — orbital positions, moon phases, and eclipse predictions. Based on VSOP87 (planets) and ELP/MPP02 (Moon) ephemeris models. Accurate to &#177;1 arcminute.</li>
                  <li><a href="https://www.solarsystemscope.com/textures/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-white/80 underline underline-offset-2">Solar System Scope</a> — Sun, Earth, and Moon texture maps, derived from NASA imagery.</li>
                </ul>
              </div>
            </div>

            <button
              onClick={dismiss}
              className="mt-5 w-full py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm transition-colors"
            >
              Start exploring
            </button>
          </div>
        </div>
      )}
    </>
  );
}
