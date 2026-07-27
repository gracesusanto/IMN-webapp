import { getStatusTheme } from "../../constants/andonStatus";
import { elapsedAtTick } from "./time";
import styles from "./MachineCard.module.css";

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

  const tonnage = machine.tonnage;
  const showTonnage = tonnage != null && tonnage !== 0;

  const theme = getStatusTheme(machine.status_group, machine.status_code);

  return (
    <article
      className={styles.card}
      style={{
        backgroundColor: theme.background,
        color: theme.foreground,
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
        <div className={styles.metaRight}>
          {showTonnage && (
            <div className={styles.tonnageValue}>{tonnage} T</div>
          )}
          <div
            className={styles.operatorValue}
            title={operatorNames.join(", ") || "No active operator"}
          >
            {operatorText || (isNoSchedule ? "—" : "No operator")}
          </div>
        </div>
      </div>
    </article>
  );
}
