// Static fallback — authoritative list lives in backend STATUS_CONFIG (utils.py).
// AndonPage fetches /api/meta/categories at runtime; this is only used if that
// request fails before the component mounts.
export const KATEGORI_FALLBACK = [
  { code: "U",   label: "Running",          group: "running" },
  { code: "MP",  label: "Machine Problem",  group: "downtime" },
  { code: "TP",  label: "Tooling Problem",  group: "downtime" },
  { code: "NM",  label: "No Material",      group: "downtime" },
  { code: "QC",  label: "Quality Check",    group: "downtime" },
  { code: "TS",  label: "Tooling Setting",  group: "setup" },
  { code: "TL",  label: "Trial",            group: "setup" },
  { code: "CM",  label: "Change Material",  group: "setup" },
  { code: "NP",  label: "No Schedule",      group: "no_plan" },
  { code: "BT",  label: "Breaktime",        group: "no_plan" },
  { code: "BR",  label: "Briefing",         group: "no_plan" },
  { code: "RP",  label: "Reporting",        group: "no_plan" },
  { code: "STO", label: "Stock Opname",     group: "no_plan" },
  { code: "X",   label: "Lain - Lain",      group: "no_plan" },
];
