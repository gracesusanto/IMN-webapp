import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { Box, Chip, Typography } from "@mui/material";

import { getStatusTheme } from "./statusConfig";
import {
  elapsedAtTick,
  formatElapsed,
  formatOperators,
} from "./time";
import styles from "./MachineCard.module.css";

const formatStart = (value) => {
  if (!value) return "Started —";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Started —";
  return `Started ${new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date).replace(",", " ·")}`;
};

const displayMachineName = (machine) =>
  (machine.machine_name || "").replace(/-/g, " ");

const nameFontSize = (name) => {
  const n = name.length;
  if (n <= 6)  return "2.4rem";
  if (n <= 10) return "1.9rem";
  if (n <= 14) return "1.4rem";
  return "1.1rem";
};

export default function MachineCard({ machine, receivedAtMs, nowMs, onClick }) {
  const theme = getStatusTheme(machine.status_group, machine.status_code);
  const elapsed = elapsedAtTick(machine, receivedAtMs, nowMs);
  const hasWarnings = (machine.warnings || []).length > 0;
  const displayName = displayMachineName(machine);

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onClick(machine)}
      aria-label={`${machine.machine_name}, ${machine.status_label}`}
      sx={{
        width: "100%",
        minHeight: 245,
        p: 2,
        borderRadius: 2,
        border: `3px solid ${theme.border}`,
        background: theme.background,
        color: theme.foreground,
        cursor: "pointer",
        textAlign: "left",
        display: "flex",
        flexDirection: "column",
        boxShadow: 2,
        transition: "transform 120ms ease, box-shadow 120ms ease",
        "&:hover, &:focus-visible": {
          transform: "translateY(-2px)",
          boxShadow: 6,
          outline: "3px solid rgba(255,255,255,0.75)",
          outlineOffset: 2,
        },
      }}
    >
      <div className={styles.machineHeader}>
        <div className={styles.machineIdentity}>
          <p className={styles.machineName} style={{ fontSize: nameFontSize(displayName) }}>{displayName}</p>
          {machine.tonnage ? <span className={styles.machineTonnage}>{machine.tonnage} T</span> : null}
        </div>

        <div className={styles.machineBadges}>
          {hasWarnings && (
            <WarningAmberRoundedIcon
              aria-label="Data warning"
              fontSize="small"
              sx={{ opacity: 0.9 }}
            />
          )}
          <Chip
            label={machine.status_code}
            size="small"
            sx={{
              fontWeight: 900,
              background: "rgba(255,255,255,0.92)",
              color: "#111827",
            }}
          />
        </div>
      </div>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          py: 1.5,
        }}
      >
        <Typography
          variant="h5"
          component="div"
          fontWeight={900}
          textAlign="center"
          sx={{ lineHeight: 1.1 }}
        >
          {machine.status_label}
        </Typography>
        {machine.show_timer && (
          <Typography
            component="div"
            fontWeight={900}
            sx={{
              mt: 1,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: "clamp(1.35rem, 2.5vw, 2rem)",
              letterSpacing: "0.04em",
            }}
          >
            {formatElapsed(elapsed)}
          </Typography>
        )}
      </Box>

      <Box sx={{ borderTop: "1px solid rgba(255,255,255,0.4)", pt: 1.25 }}>
        <Typography fontWeight={800} noWrap title={machine.part_name || ""}>
          {machine.part_display_mode === "last" && machine.part_name
            ? `Last: ${machine.part_name}`
            : machine.part_name || "No active part"}
        </Typography>
        <Typography noWrap title={formatOperators(machine)}>
          {formatOperators(machine)}
        </Typography>
        {machine.show_started_at && (
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            {formatStart(machine.started_at)}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
