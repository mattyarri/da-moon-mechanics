import { useState } from 'react';

export default function NotableEvents({ events, onSelectDate }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="px-3 py-1 rounded text-xs hover:bg-white/10 transition-colors"
      >
        Events
      </button>
      {open && (
        <div className="absolute bottom-full mb-2 left-0 w-64 max-h-60 overflow-y-auto bg-black/90 backdrop-blur-sm rounded-lg border border-white/10 text-xs">
          {events.map((event, i) => (
            <button
              key={i}
              onClick={() => {
                onSelectDate(event.date);
                setOpen(false);
              }}
              className="w-full text-left px-3 py-1.5 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
            >
              <span className="text-white/50 font-mono mr-2">
                {event.date.toISOString().slice(0, 10)}
              </span>
              <span className="text-white/90">{event.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
