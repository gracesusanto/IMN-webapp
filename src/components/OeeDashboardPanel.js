import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
} from '@mui/material';

const PerformanceCard = ({ title, current, target, unit = '%', color = 'primary' }) => {
  const percentage = target > 0 ? (current / target) * 100 : 0;
  const displayValue = `${current}${unit}`;

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" color={`${color}.main`} gutterBottom>
          {title}
        </Typography>

        <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
          {displayValue}
        </Typography>

        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Target: {target}{unit}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(percentage, 100)}
            color={color}
            sx={{ mt: 0.5, height: 8, borderRadius: 4 }}
          />
        </Box>

        <Typography variant="caption" color={percentage >= 100 ? 'success.main' : 'text.secondary'}>
          {percentage.toFixed(1)}% of target
        </Typography>
      </CardContent>
    </Card>
  );
};

const MachineRankingTable = ({ data, title, type = 'top' }) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">No data available</Typography>
      </Paper>
    );
  }

  const sortedData = [...data].sort((a, b) => {
    const aOee = parseFloat((a.oee || '0%').replace('%', ''));
    const bOee = parseFloat((b.oee || '0%').replace('%', ''));
    return type === 'top' ? bOee - aOee : aOee - bOee;
  });

  const displayData = sortedData.slice(0, 5);

  const getOeeChip = (oee) => {
    const numValue = parseFloat((oee || '0%').replace('%', ''));
    if (numValue >= 85) return <Chip label={oee} color="success" size="small" />;
    if (numValue >= 70) return <Chip label={oee} color="warning" size="small" />;
    return <Chip label={oee} color="error" size="small" />;
  };

  const getRankIcon = (index, type) => {
    if (type === 'top') {
      if (index === 0) return '🥇';
      if (index === 1) return '🥈';
      if (index === 2) return '🥉';
      return '🏆';
    } else {
      if (index === 0) return '🚨';
      if (index === 1) return '⚠️';
      return '📊';
    }
  };

  return (
    <Paper>
      <Box sx={{ p: 2, pb: 0 }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Rank</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Machine/Operator</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>OEE</TableCell>
              <TableCell align="center" sx={{ fontWeight: 'bold' }}>Output</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {displayData.map((row, index) => (
              <TableRow key={index} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{getRankIcon(index, type)}</span>
                    <Typography variant="body2" fontWeight="bold">
                      #{index + 1}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {row.mc || row.operator || 'Unknown'}
                  </Typography>
                  {row.part_name && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {row.part_name}
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="center">
                  {getOeeChip(row.oee)}
                </TableCell>
                <TableCell align="center">
                  <Typography variant="body2">
                    {(row.output || 0).toLocaleString()}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

const OeeTargetGuide = () => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        📋 OEE Performance Standards
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'success.light' }}>
            <Typography variant="h6" color="success.main" fontWeight="bold">
              🟢 World Class
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="success.main">
              ≥85%
            </Typography>
            <Typography variant="body2" color="success.dark">
              Exceptional performance with minimal losses
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'warning.light' }}>
            <Typography variant="h6" color="warning.main" fontWeight="bold">
              🟡 Good
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="warning.main">
              70-84%
            </Typography>
            <Typography variant="body2" color="warning.dark">
              Acceptable with room for improvement
            </Typography>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, bgcolor: 'error.light' }}>
            <Typography variant="h6" color="error.main" fontWeight="bold">
              🔴 Needs Attention
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="error.main">
              &lt;70%
            </Typography>
            <Typography variant="body2" color="error.dark">
              Requires immediate action
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

const OeeDashboardPanel = ({ dashboardData, reportType = "mesin" }) => {
  const kpis = dashboardData?.kpis || {};
  const rows = dashboardData?.rows || [];

  // Calculate key OEE metrics
  const oeeValue = parseFloat((kpis.oee || '0%').replace('%', ''));
  const otrValue = parseFloat((kpis.otr || '0%').replace('%', ''));
  const perValue = parseFloat((kpis.per || '0%').replace('%', ''));
  const qrValue = parseFloat((kpis.qr || '0%').replace('%', ''));

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        🎯 OEE Performance Dashboard
      </Typography>

      {/* OEE Performance Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <PerformanceCard
            title="Overall OEE"
            current={oeeValue}
            target={85}
            color={oeeValue >= 85 ? 'success' : oeeValue >= 70 ? 'warning' : 'error'}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <PerformanceCard
            title="Availability (OTR)"
            current={otrValue}
            target={90}
            color={otrValue >= 90 ? 'success' : otrValue >= 75 ? 'warning' : 'error'}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <PerformanceCard
            title="Performance (PER)"
            current={perValue}
            target={95}
            color={perValue >= 95 ? 'success' : perValue >= 80 ? 'warning' : 'error'}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <PerformanceCard
            title="Quality (QR)"
            current={qrValue}
            target={99}
            color={qrValue >= 99 ? 'success' : qrValue >= 95 ? 'warning' : 'error'}
          />
        </Grid>
      </Grid>

      {/* Performance Rankings */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <MachineRankingTable
            data={rows}
            title={`🏆 Top Performing ${reportType === 'mesin' ? 'Machines' : 'Operators'}`}
            type="top"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <MachineRankingTable
            data={rows}
            title={`⚠️ ${reportType === 'mesin' ? 'Machines' : 'Operators'} Needing Attention`}
            type="bottom"
          />
        </Grid>
      </Grid>

      {/* OEE Standards Guide */}
      <Box sx={{ mb: 4 }}>
        <OeeTargetGuide />
      </Box>
    </Box>
  );
};

export default OeeDashboardPanel;