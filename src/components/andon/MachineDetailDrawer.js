import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import { Box, Drawer, IconButton, Typography } from "@mui/material";

import { getStatusTheme } from "./statusConfig";
import { elapsedAtTick, formatElapsed } from "./time";

const formatActivityStart = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
};

const formatActivityTooling = (activity) => {
  const primary = activity.part_name || activity.tooling_code || "No tooling";
  const details = [
    activity.part_no,
    activity.tooling_code,
    activity.process ? `Process ${activity.process}` : null,
  ].filter(Boolean);
  return { primary, secondary: details.join(" · ") };
};

export default function MachineDetailDrawer({ machine, receivedAtMs, nowMs, onClose }) {
  const open = Boolean(machine);
  const theme = getStatusTheme(machine?.status_group, machine?.status_code);
  const elapsed = machine ? elapsedAtTick(machine, receivedAtMs, nowMs) : 0;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: { xs: 360, sm: 560 }, maxWidth: "100vw" }}>
        {machine && (
          <>
            <Box sx={{ p: 2.5, background: theme.background, color: theme.foreground }}>
              <Box display="flex" alignItems="flex-start" gap={1}>
                <Box flex={1}>
                  <Typography variant="h5" fontWeight={900}>
                    {machine.machine_name}
                    {machine.tonnage ? ` (${machine.tonnage} T)` : ""}
                  </Typography>
                  <Typography variant="h6" fontWeight={800}>
                    {machine.status_label} — {machine.status_code}
                  </Typography>
                </Box>
                <IconButton onClick={onClose} sx={{ color: "inherit" }}>
                  <CloseRoundedIcon />
                </IconButton>
              </Box>

              {machine.show_timer && (
                <Typography
                  sx={{
                    mt: 1,
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: "1.8rem",
                    fontWeight: 900,
                  }}
                >
                  {formatElapsed(elapsed)}
                </Typography>
              )}
            </Box>

            <Box p={2.5}>
              <Typography variant="overline" fontWeight={800} sx={{ display: "block", mb: 1.5 }}>
                Open Source Activities
              </Typography>

              {(machine.open_activities || []).length === 0 ? (
                <Typography color="text.secondary">No open source activities.</Typography>
              ) : (
                <Box sx={{ display: "grid", gap: 1.25 }}>
                  {machine.open_activities.map((activity) => {
                    const tooling = formatActivityTooling(activity);
                    return (
                      <Box
                        key={activity.activity_id}
                        sx={{
                          border: "1px solid",
                          borderColor: activity.is_stale ? "warning.main" : "divider",
                          borderRadius: 2,
                          p: 1.5,
                          opacity: activity.is_stale ? 0.75 : 1,
                        }}
                      >
                        <Box
                          sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr", sm: "1fr 1.6fr" },
                            gap: 1,
                          }}
                        >
                          <Box>
                            <Typography variant="caption" color="text.secondary">Operator</Typography>
                            <Typography fontWeight={700}>{activity.operator_name || "Unknown operator"}</Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary">Tooling</Typography>
                            <Typography fontWeight={700}>{tooling.primary}</Typography>
                            {tooling.secondary && (
                              <Typography variant="body2" color="text.secondary">{tooling.secondary}</Typography>
                            )}
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary">Category</Typography>
                            <Typography fontWeight={700}>
                              {activity.category_code} — {activity.category_label}
                              {activity.is_stale && " · STALE"}
                            </Typography>
                          </Box>

                          <Box>
                            <Typography variant="caption" color="text.secondary">Start</Typography>
                            <Typography fontWeight={700}>{formatActivityStart(activity.started_at)}</Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}
