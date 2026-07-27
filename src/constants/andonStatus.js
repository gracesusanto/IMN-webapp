export const ANDON_STATUS_CONFIG = {
  running: {
    label: "NORMAL",
    description: "Mesin sedang berjalan normal",
    background: "#4CAF50",
    foreground: "#FFFFFF",
  },
  downtime: {
    label: "PROBLEM TOOLS",
    description: "Terjadi masalah pada tooling",
    background: "#D50000",
    foreground: "#FFFFFF",
  },
  other: {
    label: "PROBLEM MACHINE",
    description: "Terjadi masalah pada mesin",
    background: "#D97706",
    foreground: "#111111",
  },
  setup: {
    label: "SETTING / GANTI MODEL",
    description: "Mesin sedang setting, trial, atau pergantian model",
    background: "#D4BE36",
    foreground: "#111111",
  },
  quality: {
    label: "CEK QC FIRST SAMPLE",
    description: "Menunggu atau menjalani pemeriksaan QC",
    background: "#3C9BC7",
    foreground: "#111111",
  },
  blocked: {
    label: "NO MANPOWER",
    description: "Tidak tersedia operator untuk menjalankan mesin",
    background: "#315A96",
    foreground: "#FFFFFF",
  },
  no_plan: {
    label: "NO SCHEDULE",
    description: "Mesin tidak memiliki jadwal produksi aktif",
    background: "#F5F5F5",
    foreground: "#111111",
  },
  no_data: {
    label: "PROBLEM QUALITY / NO DATA",
    description: "Masalah kualitas atau status mesin belum tersedia",
    background: "#D1D5DB",
    foreground: "#111111",
  },
};

export const ANDON_STATUS_ORDER = [
  "running",
  "downtime",
  "other",
  "setup",
  "quality",
  "blocked",
  "no_plan",
  "no_data",
];

const FALLBACK_STATUS = ANDON_STATUS_CONFIG.no_data;

export function getStatusTheme(statusGroup) {
  return ANDON_STATUS_CONFIG[statusGroup] || FALLBACK_STATUS;
}
