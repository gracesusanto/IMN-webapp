import { elapsedAtTick } from "./time";
import styles from "./MachineCard.module.css";

const STATUS_COLOR = {
  running:  "#16a34a",
  downtime: "#c62828",
  other:    "#7e22ce",
  blocked:  "#1d4ed8",
  quality:  "#0891b2",
  setup:    "#d97706",
  no_plan:  "#475569",
  no_data:  "#6b7280",
};

function getStatusColor(statusGroup) {
  return STATUS_COLOR[statusGroup] || "#64748b";
}

function getStatusBackground(statusGroup) {
  const backgrounds = {
    running:  "#16a34a",
    downtime: "#c62828",
    other:    "#7e22ce",
    blocked:  "#1d4ed8",
    quality:  "#0891b2",
    setup:    "#f59e0b",
    no_plan:  "#475569",
    no_data:  "#6b7280",
  };
  return backgrounds[statusGroup] || "#475569";
}

function formatCompactDuration(totalSeconds = 0) {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const days = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  const seconds = secs % 60;

  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  if (days > 0) return `${days}d ${hh}:${mm}:${ss}`;
  return `${hh}:${mm}:${ss}`;
}

function getNameSizeClass(name) {
  const n = name.length;
  if (n > 24) return styles.machineNameXSmall;
  if (n > 18) return styles.machineNameSmall;
  if (n > 13) return styles.machineNameMedium;
  return styles.machineNameLarge;
}

export default function MachineCard({ machine, receivedAtMs, nowMs, onClick }) {
  const elapsed = elapsedAtTick(machine, receivedAtMs, nowMs);
  const machineName = (machine.machine_name || machine.name || "Unknown").replace(/-/g, " ");

  const partText = machine.part_display || machine.part_name || "";

  const operators = machine.operators || [];
  const operatorNames = operators.map((op) => op.operator_name).filter(Boolean);
  const operatorText =
    operatorNames.length === 0
      ? ""
      : operatorNames.length === 1
        ? operatorNames[0]
        : `${operatorNames[0]} +${operatorNames.length - 1}`;

  const isNoSchedule = machine.status_group === "no_plan";
  const showTimer = !isNoSchedule && machine.duration_seconds != null;

  return (
    <article
      className={styles.card}
      style={{
        "--status-color": getStatusColor(machine.status_group),
        background: getStatusBackground(machine.status_group),
        color: machine.status_group === "setup" ? "#111827" : "#ffffff",
      }}
      onClick={() => onClick(machine)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onClick(machine); }}
      aria-label={`${machineName}, ${machine.status_label}`}
    >
      <div
        className={`${styles.machineName} ${getNameSizeClass(machineName)}`}
        title={machineName}
      >
        {machineName}
      </div>

      <div className={styles.status}>
        {machine.status_label || "NO SCHEDULE"}
      </div>

      {showTimer && (
        <div className={styles.timer}>
          {formatCompactDuration(elapsed)}
        </div>
      )}

      <div className={styles.metaRow}>
        <div
          className={styles.partValue}
          title={partText || "No active part"}
        >
          {partText || (isNoSchedule ? "—" : "No part")}
        </div>
        <div
          className={styles.operatorValue}
          title={operatorNames.join(", ") || "No active operator"}
        >
          {operatorText || (isNoSchedule ? "—" : "No operator")}
        </div>
      </div>
    </article>
  );
}
