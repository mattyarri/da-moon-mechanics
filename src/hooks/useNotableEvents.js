import { useMemo } from 'react';
import {
  NextLunarEclipse,
  SearchLunarEclipse,
  SearchGlobalSolarEclipse,
  NextGlobalSolarEclipse,
  Seasons,
  SearchMoonPhase,
  SearchLunarApsis,
  NextLunarApsis,
} from 'astronomy-engine';

function findLunarEclipses(startDate, endDate) {
  const events = [];
  let eclipse = SearchLunarEclipse(startDate);
  while (eclipse.peak.date < endDate) {
    events.push({
      type: `Lunar eclipse (${eclipse.kind})`,
      date: eclipse.peak.date,
    });
    eclipse = NextLunarEclipse(eclipse.peak.date);
  }
  return events;
}

function findSolarEclipses(startDate, endDate) {
  const events = [];
  let eclipse = SearchGlobalSolarEclipse(startDate);
  while (eclipse.peak.date < endDate) {
    events.push({
      type: `Solar eclipse (${eclipse.kind})`,
      date: eclipse.peak.date,
    });
    eclipse = NextGlobalSolarEclipse(eclipse.peak.date);
  }
  return events;
}

function findSeasons(startYear, endYear) {
  const events = [];
  for (let y = startYear; y <= endYear; y++) {
    const s = Seasons(y);
    events.push(
      { type: 'March equinox', date: s.mar_equinox.date },
      { type: 'June solstice', date: s.jun_solstice.date },
      { type: 'September equinox', date: s.sep_equinox.date },
      { type: 'December solstice', date: s.dec_solstice.date },
    );
  }
  return events;
}

function findSupermoons(startDate, endDate) {
  const events = [];
  // Find full moons and check if near perigee
  let fullMoon = SearchMoonPhase(180, startDate, 40);
  while (fullMoon.date < endDate) {
    // Find nearest lunar apsis (perigee or apogee)
    let apsis = SearchLunarApsis(new Date(fullMoon.date.getTime() - 15 * 86400000));
    // Walk forward to find the perigee nearest this full moon
    for (let i = 0; i < 4; i++) {
      if (apsis.kind === 0) { // perigee
        const diffDays = Math.abs(fullMoon.date - apsis.time.date) / 86400000;
        if (diffDays < 2) {
          events.push({
            type: 'Supermoon',
            date: fullMoon.date,
          });
          break;
        }
      }
      apsis = NextLunarApsis(apsis);
    }
    fullMoon = SearchMoonPhase(180, new Date(fullMoon.date.getTime() + 1 * 86400000), 40);
  }
  return events;
}

export default function useNotableEvents() {
  return useMemo(() => {
    const now = new Date();
    const startDate = new Date(now.getTime() - 2 * 365.25 * 86400000);
    const endDate = new Date(now.getTime() + 2 * 365.25 * 86400000);
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();

    const events = [
      ...findLunarEclipses(startDate, endDate),
      ...findSolarEclipses(startDate, endDate),
      ...findSeasons(startYear, endYear),
      ...findSupermoons(startDate, endDate),
    ];

    events.sort((a, b) => a.date - b.date);
    return events;
  }, []);
}
