// Single source of truth for andon status colors.
// Used by MachineCard and MachineDetailDrawer.

export const STATUS_THEME = {
  running:  { background: "#00c853", foreground: "#ffffff" },
  downtime: { background: "#9f0b0b", foreground: "#ffffff" },
  other:    { background: "#7e22ce", foreground: "#ffffff" },
  blocked:  { background: "#19458a", foreground: "#ffffff" },
  quality:  { background: "#67a9c6", foreground: "#111111" },
  setup:    { background: "#c5a500", foreground: "#111111" },
  no_plan:  { background: "#f4f4f4", foreground: "#111111" },
  no_data:  { background: "#4b5563", foreground: "#ffffff" },
};

// Per-code overrides within the downtime group.
export const STATUS_CODE_THEME = {
  MP: { background: "#7f0000", foreground: "#ffffff" },
  TP: { background: "#9f0b0b", foreground: "#ffffff" },
  NM: { background: "#c62828", foreground: "#ffffff" },
};

const FALLBACK = { background: "#4b5563", foreground: "#ffffff" };

export const getStatusTheme = (group, code) =>
  (code && STATUS_CODE_THEME[code]) || STATUS_THEME[group] || FALLBACK;
