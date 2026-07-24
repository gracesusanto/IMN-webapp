export function formatElapsed(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const days = Math.floor(safe / 86400);
  const remainder = safe % 86400;
  const hours = Math.floor(remainder / 3600);
  const minutes = Math.floor((remainder % 3600) / 60);
  const seconds = remainder % 60;

  const pad = (value) => String(value).padStart(2, "0");
  return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function elapsedAtTick(machine, receivedAtMs, nowMs) {
  const baseline = Number(machine?.duration_seconds) || 0;
  const localDelta = Math.max(0, Math.floor((nowMs - receivedAtMs) / 1000));
  return baseline + localDelta;
}

export function compactOperatorName(fullName) {
  if (!fullName) return "Unknown";
  return String(fullName).trim().split(/\s+/)[0];
}

export function formatOperators(machine) {
  const operators = machine?.operators || [];

  if (machine?.operator_display_mode === "last_transition") {
    if (!operators.length) return "No active operator";
    return `Last: ${compactOperatorName(operators[0].operator_name)}`;
  }

  if (!operators.length) return "No active operator";
  if (operators.length === 1) return operators[0].operator_name;

  const visible = operators
    .slice(0, 2)
    .map((operator) => compactOperatorName(operator.operator_name));
  const remainder = operators.length - visible.length;
  return remainder > 0 ? `${visible.join(", ")} +${remainder}` : visible.join(", ");
}
