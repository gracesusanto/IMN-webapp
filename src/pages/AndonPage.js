import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import MachineCard from "../components/andon/MachineCard";
import MachineDetailDrawer from "../components/andon/MachineDetailDrawer";
import { API_CONFIG } from "../constants/config";
import styles from "./AndonPage.module.css";

const SUMMARY_ORDER = [
  ["running",  "RUNNING"],
  ["downtime", "DOWNTIME"],
  ["other",    "OTHER STOP"],
  ["setup",    "SETUP"],
  ["no_plan",  "NO PLAN"],
];

const DURATION_OPTIONS = [
  { label: "Any duration", value: "ANY" },
  { label: "> 8 hours",    value: "8_HOURS" },
  { label: "> 1 day",      value: "1_DAY" },
  { label: "> 3 days",     value: "3_DAYS" },
  { label: "> 7 days",     value: "7_DAYS" },
  { label: "> 30 days",    value: "30_DAYS" },
];

const DURATION_SECONDS = {
  ANY:       0,
  "8_HOURS": 8 * 3600,
  "1_DAY":   24 * 3600,
  "3_DAYS":  3 * 24 * 3600,
  "7_DAYS":  7 * 24 * 3600,
  "30_DAYS": 30 * 24 * 3600,
};

export default function AndonPage() {
  const [board, setBoard] = useState(null);
  const [receivedAtMs, setReceivedAtMs] = useState(Date.now());
  const [nowMs, setNowMs] = useState(Date.now());
  const [selectedMachineId, setSelectedMachineId] = useState(null);
  const [statusFilters, setStatusFilters] = useState([]);
  const [plantFilter, setPlantFilter] = useState("ALL");
  const [lineFilters, setLineFilters] = useState([]);
  const [durationFilter, setDurationFilter] = useState("ANY");
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(true);
  const [error, setError] = useState(null);
  const requestInFlight = useRef(false);

  const fetchBoard = useCallback(async () => {
    if (requestInFlight.current) return;
    requestInFlight.current = true;
    try {
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/andon/board`, { timeout: 15000 });
      setBoard(response.data);
      setReceivedAtMs(Date.now());
      setConnected(true);
      setError(null);
    } catch (requestError) {
      console.error("Failed to refresh Andon board", requestError);
      setConnected(false);
      setError("Live refresh failed. Showing the last successful machine state.");
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBoard();
    const refreshInterval = window.setInterval(fetchBoard, 10000);
    return () => window.clearInterval(refreshInterval);
  }, [fetchBoard]);

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchBoard();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [fetchBoard]);

  const allMachines = useMemo(
    () => (board?.plants || []).flatMap((plant) => (plant.lines || []).flatMap((line) => line.machines || [])),
    [board]
  );

  const selectedMachine = useMemo(
    () => allMachines.find((m) => m.machine_id === selectedMachineId) || null,
    [allMachines, selectedMachineId]
  );

  const lineNames = useMemo(() => {
    const seen = new Set();
    const names = [];
    (board?.plants || []).forEach((plant) => {
      if (plantFilter !== "ALL" && plant.name !== plantFilter) return;
      (plant.lines || []).forEach((line) => {
        if (!seen.has(line.name)) { seen.add(line.name); names.push(line.name); }
      });
    });
    return names;
  }, [board, plantFilter]);

  useEffect(() => {
    setLineFilters((current) => current.filter((line) => lineNames.includes(line)));
  }, [lineNames]);

  const hasActiveFilters = useMemo(
    () => plantFilter !== "ALL" || lineFilters.length > 0 || statusFilters.length > 0 || durationFilter !== "ANY",
    [plantFilter, lineFilters, statusFilters, durationFilter]
  );

  const clearFilters = () => {
    setPlantFilter("ALL");
    setLineFilters([]);
    setStatusFilters([]);
    setDurationFilter("ANY");
  };

  const durationMinSeconds = DURATION_SECONDS[durationFilter] ?? 0;

  const visiblePlants = useMemo(() => {
    return (board?.plants || [])
      .filter((plant) => plantFilter === "ALL" || plant.name === plantFilter)
      .map((plant) => ({
        ...plant,
        lines: (plant.lines || [])
          .filter((line) => lineFilters.length === 0 || lineFilters.includes(line.name))
          .map((line) => ({
            ...line,
            machines: (line.machines || []).filter((machine) => {
              if (statusFilters.length > 0 && !statusFilters.includes(machine.status_group)) return false;
              if (durationMinSeconds > 0) {
                if (machine.duration_seconds == null || machine.duration_seconds < durationMinSeconds) return false;
              }
              return true;
            }),
          }))
          .filter((line) => line.machines.length > 0),
      }))
      .filter((plant) => plant.lines.length > 0);
  }, [board, lineFilters, plantFilter, statusFilters, durationMinSeconds]);

  const enterFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (fullscreenError) {
      console.error("Unable to change fullscreen mode", fullscreenError);
    }
  };

  if (loading && !board) {
    return (
      <Box minHeight="60vh" display="grid" sx={{ placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className={styles.page}>
      {/* Row 1 — title + actions */}
      <div className={styles.titleRow}>
        <div className={styles.titleArea}>
          <Typography variant="h4" fontWeight={900}>LIVE PRODUCTION ANDON</Typography>
          <Typography className={styles.connectionText}>
            Last updated{" "}
            {board?.generated_at
              ? new Date(board.generated_at).toLocaleTimeString("en-GB", { hour12: false })
              : "—"}
            {connected ? " · Connected" : " · Disconnected"}
          </Typography>
        </div>
        <div className={styles.actions}>
          <Button variant="contained" startIcon={<RefreshRoundedIcon />} onClick={fetchBoard} size="small">
            Refresh
          </Button>
          <Button
            variant="outlined"
            startIcon={<FullscreenRoundedIcon />}
            onClick={enterFullscreen}
            size="small"
            sx={{ color: "white", borderColor: "rgba(255,255,255,0.6)" }}
          >
            Fullscreen
          </Button>
        </div>
      </div>

      {!connected && <div className={styles.disconnected}>{error}</div>}

      {/* Row 2 — filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.plantControl}>
          <span className={styles.filterLabel}>Plant</span>
          <ToggleButtonGroup
            value={plantFilter}
            exclusive
            size="small"
            onChange={(_, val) => { if (val) setPlantFilter(val); }}
            sx={{
              "& .MuiToggleButton-root": {
                color: "#cbd5e1",
                borderColor: "rgba(255,255,255,0.25)",
                px: 1.5,
                py: 0.5,
                fontWeight: 700,
                fontSize: "0.8rem",
              },
              "& .Mui-selected": {
                background: "rgba(255,255,255,0.18) !important",
                color: "white !important",
              },
            }}
          >
            <ToggleButton value="ALL">ALL</ToggleButton>
            <ToggleButton value="P1">P1</ToggleButton>
            <ToggleButton value="P2">P2</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <FormControl size="small" className={styles.filterSelect}>
          <InputLabel
            shrink
            sx={{ color: "#94a3b8", "&.Mui-focused": { color: "#94a3b8" } }}
          >
            Lines
          </InputLabel>
          <Select
            multiple
            displayEmpty
            label="Lines"
            value={lineFilters}
            input={<OutlinedInput label="Lines" />}
            onChange={(event) => {
              const v = event.target.value;
              setLineFilters(typeof v === "string" ? v.split(",") : v);
            }}
            renderValue={(selected) => selected.length === 0 ? "All lines" : selected.join(", ")}
            MenuProps={{ PaperProps: { sx: { maxHeight: 420 } } }}
            sx={{
              color: "white",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.25)" },
              "& .MuiSvgIcon-root": { color: "white" },
            }}
          >
            {lineNames.map((line) => (
              <MenuItem key={line} value={line}>
                <Checkbox checked={lineFilters.includes(line)} size="small" />
                <ListItemText primary={line} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" className={styles.durationSelect}>
          <InputLabel sx={{ color: "#94a3b8", "&.Mui-focused": { color: "#94a3b8" } }}>
            Duration
          </InputLabel>
          <Select
            label="Duration"
            value={durationFilter}
            onChange={(event) => setDurationFilter(event.target.value)}
            sx={{
              color: "white",
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.25)" },
              "& .MuiSvgIcon-root": { color: "white" },
            }}
          >
            {DURATION_OPTIONS.map(({ label, value }) => (
              <MenuItem key={value} value={value}>{label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {hasActiveFilters && (
          <Button
            variant="text"
            onClick={clearFilters}
            size="small"
            className={styles.clearButton}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* Row 3 — status chips (multi-select; TOTAL clears all) */}
      <div className={styles.summaryRow}>
        <Chip
          clickable
          onClick={() => setStatusFilters([])}
          label={`TOTAL ${board?.summary?.total ?? 0}`}
          color={statusFilters.length === 0 ? "primary" : "default"}
          variant={statusFilters.length === 0 ? "filled" : "outlined"}
          sx={{ color: statusFilters.length === 0 ? undefined : "white", borderColor: "rgba(255,255,255,0.45)", fontWeight: 800 }}
        />
        {SUMMARY_ORDER.map(([key, label]) => {
          const active = statusFilters.includes(key);
          return (
            <Chip
              key={key}
              clickable
              onClick={() =>
                setStatusFilters((prev) =>
                  active ? prev.filter((k) => k !== key) : [...prev, key]
                )
              }
              label={`${label} ${board?.summary?.[key] ?? 0}`}
              color={active ? "primary" : "default"}
              variant={active ? "filled" : "outlined"}
              sx={{ color: active ? undefined : "white", borderColor: "rgba(255,255,255,0.45)", fontWeight: 800 }}
            />
          );
        })}
      </div>

      {visiblePlants.length === 0 ? (
        <div className={styles.empty}>No machines match the selected filters.</div>
      ) : (
        visiblePlants.map((plant) => (
          <section className={styles.plant} key={plant.name}>
            <Typography variant="h5" fontWeight={900}>{plant.display_name || plant.name}</Typography>
            {plant.lines.map((line) => (
              <section className={styles.line} key={`${plant.name}-${line.name}`}>
                <Typography variant="h6" fontWeight={800} mb={1}>{line.name}</Typography>
                <div className={styles.grid}>
                  {line.machines.map((machine) => (
                    <MachineCard
                      key={machine.machine_id}
                      machine={machine}
                      receivedAtMs={receivedAtMs}
                      nowMs={nowMs}
                      onClick={(selected) => setSelectedMachineId(selected.machine_id)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </section>
        ))
      )}

      <MachineDetailDrawer
        machine={selectedMachine}
        receivedAtMs={receivedAtMs}
        nowMs={nowMs}
        onClose={() => setSelectedMachineId(null)}
      />
    </div>
  );
}
