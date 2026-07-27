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

const DOWNTIME_CATEGORY_OPTIONS = [
  { code: "MP",  label: "Machine Problem" },
  { code: "TP",  label: "Tooling Problem" },
  { code: "NM",  label: "No Material" },
  { code: "QC",  label: "Quality Check" },
  { code: "TS",  label: "Tooling Setting" },
  { code: "TL",  label: "Trial" },
  { code: "CM",  label: "Change Material" },
];

const DURATION_OPTIONS = [
  { label: "Any duration",  value: "ANY" },
  { label: "> 8 hours",     value: "GT_8H" },
  { label: "> 1 day",       value: "GT_1D" },
  { label: "> 3 days",      value: "GT_3D" },
  { label: "> 7 days",      value: "GT_7D" },
  { label: "> 30 days",     value: "GT_30D" },
  { label: "< 1 hour",      value: "LT_1H" },
  { label: "< 8 hours",     value: "LT_8H" },
  { label: "< 1 day",       value: "LT_1D" },
  { label: "< 3 days",      value: "LT_3D" },
];

// Each entry: [operator, seconds]
const DURATION_FILTER_MAP = {
  ANY:    null,
  GT_8H:  ["gt", 8 * 3600],
  GT_1D:  ["gt", 24 * 3600],
  GT_3D:  ["gt", 3 * 24 * 3600],
  GT_7D:  ["gt", 7 * 24 * 3600],
  GT_30D: ["gt", 30 * 24 * 3600],
  LT_1H:  ["lt", 3600],
  LT_8H:  ["lt", 8 * 3600],
  LT_1D:  ["lt", 24 * 3600],
  LT_3D:  ["lt", 3 * 24 * 3600],
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
  const [categoryFilters, setCategoryFilters] = useState([]);
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
    () => plantFilter !== "ALL" || lineFilters.length > 0 || statusFilters.length > 0 || durationFilter !== "ANY" || categoryFilters.length > 0,
    [plantFilter, lineFilters, statusFilters, durationFilter, categoryFilters]
  );

  const clearFilters = () => {
    setPlantFilter("ALL");
    setLineFilters([]);
    setStatusFilters([]);
    setDurationFilter("ANY");
    setCategoryFilters([]);
  };

  const durationRule = DURATION_FILTER_MAP[durationFilter] ?? null;

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
              if (durationRule) {
                const [op, threshold] = durationRule;
                const d = machine.duration_seconds ?? null;
                if (d === null) return false;
                if (op === "gt" && d <= threshold) return false;
                if (op === "lt" && d >= threshold) return false;
              }
              if (categoryFilters.length > 0 && !categoryFilters.includes(machine.status_code)) return false;
              return true;
            }),
          }))
          .filter((line) => line.machines.length > 0),
      }))
      .filter((plant) => plant.lines.length > 0);
  }, [board, lineFilters, plantFilter, statusFilters, durationRule, categoryFilters]);

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
      {/* Sticky plant selector */}
      <div className={styles.plantStickyBar}>
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
            <ToggleButton value="P1">PLANT 1</ToggleButton>
            <ToggleButton value="P2">PLANT 2</ToggleButton>
          </ToggleButtonGroup>
        </div>

        <Typography className={styles.activePlantTitle}>
          {plantFilter === "ALL"
            ? "ALL PLANTS"
            : `SYSTEM ANDON · PRODUCTION MONITORING ${plantFilter.replace("P", "PLANT ")}`}
        </Typography>
      </div>

      {/* Non-sticky header area */}
      <div className={styles.headerArea}>
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

        {/* Row 2 — secondary filters (Lines, Duration, Clear) */}
        <div className={styles.filterBar}>
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

          <FormControl size="small" className={styles.categorySelect}>
            <InputLabel
              shrink
              sx={{ color: "#94a3b8", "&.Mui-focused": { color: "#94a3b8" } }}
            >
              Downtime Category
            </InputLabel>
            <Select
              multiple
              displayEmpty
              label="Downtime Category"
              value={categoryFilters}
              input={<OutlinedInput label="Downtime Category" />}
              onChange={(event) => {
                const v = event.target.value;
                setCategoryFilters(typeof v === "string" ? v.split(",") : v);
              }}
              renderValue={(selected) =>
                selected.length === 0
                  ? "All categories"
                  : selected
                      .map((code) => DOWNTIME_CATEGORY_OPTIONS.find((o) => o.code === code)?.label ?? code)
                      .join(", ")
              }
              MenuProps={{ PaperProps: { sx: { maxHeight: 420 } } }}
              sx={{
                color: "white",
                "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(255,255,255,0.25)" },
                "& .MuiSvgIcon-root": { color: "white" },
              }}
            >
              {DOWNTIME_CATEGORY_OPTIONS.map(({ code, label }) => (
                <MenuItem key={code} value={code}>
                  <Checkbox checked={categoryFilters.includes(code)} size="small" />
                  <ListItemText primary={`${code} — ${label}`} />
                </MenuItem>
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
      </div>

      {visiblePlants.length === 0 ? (
        <div className={styles.empty}>No machines match the selected filters.</div>
      ) : (
        visiblePlants.map((plant) => (
          <section className={styles.plant} key={plant.name}>
            <div className={styles.plantNameStickyHeader}>
              <Typography className={styles.plantNameLabel}>
                {plant.display_name || plant.name}
              </Typography>
            </div>
            {plant.lines.map((line) => (
              <section className={styles.line} key={`${plant.name}-${line.name}`}>
                <div className={styles.lineStickyHeader}>
                  <Typography className={styles.lineName}>{line.name}</Typography>
                  <Typography className={styles.lineMachineCount}>
                    {line.machines.length} machines
                  </Typography>
                </div>
                <div className={styles.grid}>
                  {line.machines.map((machine) => (
                    <MachineCard
                      key={machine.machine_key || machine.machine_id}
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
