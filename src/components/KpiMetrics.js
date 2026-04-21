import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip } from '@mui/material';

const KpiMetrics = ({ data, dashboardData }) => {
  // Use backend-provided KPIs if available, otherwise calculate from rows
  const kpis = dashboardData?.kpis || {};
  const rows = data || [];

  if (Object.keys(kpis).length === 0 && rows.length === 0) {
    return null;
  }

  // Calculate aggregated KPIs from all rows
  const getKpisFromBackend = () => {
    // Use backend-calculated KPIs (preferred approach)
    if (Object.keys(kpis).length > 0) {
      return {
        oee: parseInt(kpis.oee?.replace('%', '') || '0'),
        otr: parseInt(kpis.otr?.replace('%', '') || '0'),
        per: parseInt(kpis.per?.replace('%', '') || '0'),
        qr: parseInt(kpis.qr?.replace('%', '') || '0'),
        totalQty: kpis.output || 0,
        totalOutput: (kpis.output || 0) + (kpis.reject || 0) + (kpis.rework || 0),
        totalReject: kpis.reject || 0,
        totalRework: kpis.rework || 0,
        planTime: kpis.plan || '00:00',
        utilityTime: kpis.utility || '00:00',
        downtimeMinutes: kpis.downtime || '00:00'
      };
    }

    // Fallback: calculate from rows (less preferred, for backward compatibility)
    return calculateAggregatedKpis(rows);
  };

  const calculateAggregatedKpis = (rows) => {
    let totalQty = 0;
    let totalReject = 0;
    let totalRework = 0;
    let totalPlanMinutes = 0;
    let totalUtilityMinutes = 0;
    let totalTargetQty = 0;

    rows.forEach(row => {
      // Use numeric fields if available, otherwise parse display fields
      totalQty += row.output || parseFloat(row.Qty || 0);
      totalReject += row.reject || parseFloat(row.Reject || 0);
      totalRework += row.rework || parseFloat(row.Rework || 0);

      // Use numeric minutes if available, otherwise parse HH:MM format
      const planTime = row.plan_minutes || parseTimeToMinutes(row.Plan || row.plan);
      const utilityTime = row.utility_minutes || parseTimeToMinutes(row.Utility || row.rt);

      totalPlanMinutes += planTime;
      totalUtilityMinutes += utilityTime;
      totalTargetQty += row.target_qty || parseFloat(row["Target Qty"] || 0);
    });

    const totalOutput = totalQty + totalReject + totalRework;
    const otr = totalPlanMinutes > 0 ? (totalUtilityMinutes / totalPlanMinutes * 100) : 0;
    const per = totalUtilityMinutes > 0 && totalTargetQty > 0
      ? (totalOutput / (totalUtilityMinutes / 60.0 * (totalTargetQty / totalPlanMinutes * 60)) * 100)
      : 0;
    const qr = totalOutput > 0 ? (totalQty / totalOutput * 100) : 0;
    const oee = (otr * per * qr) / 10000;

    return {
      oee: Math.round(oee),
      otr: Math.round(otr),
      per: Math.round(per),
      qr: Math.round(qr),
      totalQty,
      totalOutput,
      totalReject,
      totalRework,
      planTime: formatMinutesToTime(totalPlanMinutes),
      utilityTime: formatMinutesToTime(totalUtilityMinutes),
      downtimeMinutes: formatMinutesToTime(Math.max(totalPlanMinutes - totalUtilityMinutes, 0))
    };
  };

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return 0;
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours || 0) * 60 + (minutes || 0);
  };

  const formatMinutesToTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const getKpiColor = (value, type) => {
    const numValue = parseInt(value);
    if (type === 'oee') {
      if (numValue >= 85) return 'success';
      if (numValue >= 70) return 'warning';
      return 'error';
    } else if (type === 'otr') {
      if (numValue >= 90) return 'success';
      if (numValue >= 75) return 'warning';
      return 'error';
    } else if (type === 'per') {
      if (numValue >= 95) return 'success';
      if (numValue >= 80) return 'warning';
      return 'error';
    } else if (type === 'qr') {
      if (numValue >= 99) return 'success';
      if (numValue >= 95) return 'warning';
      return 'error';
    }
    return 'default';
  };

  const calculatedKpis = getKpisFromBackend();

  const kpiItems = [
    { label: 'OEE', value: `${calculatedKpis.oee}%`, type: 'oee', description: 'Overall Equipment Effectiveness' },
    { label: 'OTR', value: `${calculatedKpis.otr}%`, type: 'otr', description: 'Operational Time Ratio' },
    { label: 'PER', value: `${calculatedKpis.per}%`, type: 'per', description: 'Performance Efficiency Ratio' },
    { label: 'QR', value: `${calculatedKpis.qr}%`, type: 'qr', description: 'Quality Ratio' },
  ];

  const summaryItems = [
    { label: 'Total Output', value: calculatedKpis.totalOutput.toLocaleString() },
    { label: 'Good Output', value: calculatedKpis.totalQty.toLocaleString() },
    { label: 'Reject', value: calculatedKpis.totalReject.toLocaleString() },
    { label: 'Rework', value: calculatedKpis.totalRework.toLocaleString() },
    { label: 'Plan Time', value: calculatedKpis.planTime },
    { label: 'Utility Time', value: calculatedKpis.utilityTime },
    { label: 'Downtime', value: calculatedKpis.downtimeMinutes },
  ];

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Dashboard KPIs
      </Typography>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {kpiItems.map((item) => (
          <Grid item xs={6} md={3} key={item.label}>
            <Card sx={{ minHeight: 100 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h4" component="div">
                  <Chip
                    label={item.value}
                    color={getKpiColor(item.value, item.type)}
                    size="large"
                    sx={{ fontSize: '1.2rem', fontWeight: 'bold' }}
                  />
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {item.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        {summaryItems.map((item) => (
          <Grid item xs={6} md={2} key={item.label}>
            <Card variant="outlined">
              <CardContent sx={{ textAlign: 'center', py: 1 }}>
                <Typography variant="body1" fontWeight="bold">
                  {item.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {item.label}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default KpiMetrics;