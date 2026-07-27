// Single source of truth for andon status colors.
// Used by MachineCard and MachineDetailDrawer.

// Colors match the physical factory legend board.
export const STATUS_THEME = {
  running:  { background: "#4CAF50", foreground: "#ffffff" }, // NORMAL
  downtime: { background: "#C95F69", foreground: "#ffffff" }, // PROBLEM TOOLS
  other:    { background: "#D18A36", foreground: "#111111" }, // PROBLEM MACHINE
  blocked:  { background: "#315A96", foreground: "#ffffff" }, // NO MANPOWER
  quality:  { background: "#3C9BC7", foreground: "#111111" }, // CEK QC FIRST SAMPLE
  setup:    { background: "#D4BE36", foreground: "#111111" }, // SETTING / GANTI MODEL
  no_plan:  { background: "#F5F5F5", foreground: "#111111" }, // NO SCHEDULE
  no_data:  { background: "#D1D5DB", foreground: "#111111" }, // unknown
};

// Per-code overrides are intentionally removed — the group color is sufficient
// and per-code shading would diverge from the physical legend.
export const STATUS_CODE_THEME = {};

const FALLBACK = { background: "#4b5563", foreground: "#ffffff" };

export const getStatusTheme = (group, code) =>
  (code && STATUS_CODE_THEME[code]) || STATUS_THEME[group] || FALLBACK;
