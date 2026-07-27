// Mirrors WORKING_SHIFT_JSON from services/web/app/service/utils.py
const WORKING_SHIFT = {
  Weekday:  { start: { 1: 7,  2: 15, 3: 23 }, duration: { 1: 8, 2: 8, 3: 8 } },
  Saturday: { start: { 1: 7,  2: 12, 3: 17 }, duration: { 1: 5, 2: 5, 3: 5 } },
  Sunday:   { start: { 1: 7,  2: 15, 3: 23 }, duration: { 1: 8, 2: 8, 3: 8 } },
};

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

function getDayType(date) {
  const dow = date.getDay(); // 0=Sun,6=Sat
  if (dow === 6) return "Saturday";
  if (dow === 0) return "Sunday";
  return "Weekday";
}

function buildShiftWindows(date) {
  const dayType = getDayType(date);
  const cfg = WORKING_SHIFT[dayType];
  return [1, 2, 3].map((shift) => {
    const startH = cfg.start[shift];
    const durH = cfg.duration[shift];
    const start = new Date(date);
    start.setHours(startH, 0, 0, 0);
    const end = new Date(start.getTime() + durH * 3600 * 1000);
    return { shift, start, end };
  });
}

// Build windows for the day before, the given day, and the day after
// to handle shift 3 crossing midnight.
function allWindowsAround(localDate) {
  const windows = [];
  for (let offset = -1; offset <= 1; offset++) {
    const d = new Date(localDate);
    d.setDate(d.getDate() + offset);
    d.setHours(0, 0, 0, 0);
    buildShiftWindows(d).forEach((w) => windows.push(w));
  }
  windows.sort((a, b) => a.start - b.start);
  return windows;
}

function midpoint(a, b) {
  return new Date((a.getTime() + b.getTime()) / 2);
}

function buildFlexibleWindows(localDate) {
  const official = allWindowsAround(localDate);
  return official.map((w, i) => {
    const prev = official[i - 1] ?? null;
    const next = official[i + 1] ?? null;

    let flexStart = w.start;
    let flexEnd = w.end;

    if (prev && prev.end < w.start) {
      flexStart = midpoint(prev.end, w.start);
    }
    if (next && w.end < next.start) {
      flexEnd = midpoint(w.end, next.start);
    }

    return { ...w, flexStart, flexEnd };
  });
}

/**
 * Given a JS Date that is already in Jakarta wall-clock time,
 * return { shift: number, dayName: string } where dayName is
 * the Indonesian day name (Senin, Selasa, …).
 *
 * isoString should be the raw ISO string from the API (UTC-based);
 * we convert it to a Jakarta Date internally.
 */
export function resolveShiftFromISOString(isoString) {
  if (!isoString) return null;
  const utcDate = new Date(isoString);
  if (Number.isNaN(utcDate.getTime())) return null;

  // Convert UTC → Jakarta (UTC+7) as a "fake-local" Date
  const jakartaMs = utcDate.getTime() + 7 * 3600 * 1000;
  const jakartaDate = new Date(jakartaMs);

  const windows = buildFlexibleWindows(jakartaDate);

  let matched = windows.find(
    (w) => w.flexStart <= jakartaDate && jakartaDate < w.flexEnd
  );

  if (!matched) {
    // Defensive fallback: pick closest window
    matched = windows.reduce((best, w) => {
      const dist = Math.min(
        Math.abs(jakartaDate - w.start),
        Math.abs(jakartaDate - w.end)
      );
      const bestDist = Math.min(
        Math.abs(jakartaDate - best.start),
        Math.abs(jakartaDate - best.end)
      );
      return dist < bestDist ? w : best;
    });
  }

  // For the day name, use the official shift start date (which is what the
  // business date corresponds to — shift 3 crossing midnight still belongs
  // to the day the shift started on).
  const startDay = matched.start.getDay(); // 0=Sun … 6=Sat
  return {
    shift: matched.shift,
    dayName: HARI[startDay],
  };
}
