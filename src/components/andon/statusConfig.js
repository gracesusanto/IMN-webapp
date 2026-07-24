export const STATUS_THEME = {
  running: {
    background: "#16A34A",
    foreground: "#FFFFFF",
    border: "#15803D",
  },
  downtime: {
    background: "#C62828",
    foreground: "#FFFFFF",
    border: "#991B1B",
  },
  other: {
    background: "#7E22CE",
    foreground: "#FFFFFF",
    border: "#6B21A8",
  },
  blocked: {
    background: "#1D4ED8",
    foreground: "#FFFFFF",
    border: "#1E40AF",
  },
  quality: {
    background: "#0891B2",
    foreground: "#FFFFFF",
    border: "#0E7490",
  },
  setup: {
    background: "#F59E0B",
    foreground: "#111827",
    border: "#D97706",
  },
  no_plan: {
    background: "#475569",
    foreground: "#FFFFFF",
    border: "#334155",
  },
  no_data: {
    background: "#6B7280",
    foreground: "#FFFFFF",
    border: "#4B5563",
  },
};

// Per-code overrides within the same group (e.g. distinct reds for problem codes).
export const STATUS_CODE_THEME = {
  MP: { background: "#B71C1C", foreground: "#FFFFFF", border: "#7F0000" }, // darkest red
  TP: { background: "#C62828", foreground: "#FFFFFF", border: "#8B1A1A" }, // mid red
  NM: { background: "#E53935", foreground: "#FFFFFF", border: "#B71C1C" }, // lighter red
};

export const getStatusTheme = (group, code) =>
  (code && STATUS_CODE_THEME[code]) || STATUS_THEME[group] || STATUS_THEME.no_data;
