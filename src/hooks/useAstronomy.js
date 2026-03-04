import { useMemo } from 'react';
import { getAstronomyData } from '../utils/astronomy';
import { EXAGGERATED_SCALE } from '../constants';

/**
 * Compute astronomy data for a given date.
 * Returns body positions (scene coords) and Moon phase info.
 */
export default function useAstronomy(date, scale = EXAGGERATED_SCALE) {
  return useMemo(() => getAstronomyData(date, scale), [date, scale]);
}
