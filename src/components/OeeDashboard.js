import React from 'react';
import { Box, Card, CardContent, Typography, Grid, Chip, Divider } from '@mui/material';

const OeeDashboard = ({ data, dashboardData }) => {
  // Use backend-provided data or calculate from rows
  const kpis = dashboardData?.kpis || {};
  const charts = dashboardData?.charts || {};
  const rows = data || [];

  if (Object.keys(kpis).length === 0 && rows.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          No OEE data available
        </Typography>
      </Box>
    );
  }

  const getOeeColor = (value) => {
    const numValue = parseInt(String(value).replace('%', ''));
    if (numValue >= 85) return 'success';
    if (numValue >= 70) return 'warning';
    return 'error';
  };

  const getComponentColor = (value, type) => {
    const numValue = parseInt(String(value).replace('%', ''));
    if (type === 'otr') {
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

  // OEE Breakdown
  const oeeValue = kpis.oee || '0%';
  const otrValue = kpis.otr || '0%';
  const perValue = kpis.per || '0%';
  const qrValue = kpis.qr || '0%';

  // Calculate machine-level OEE if we have row data
  const machineOeeData = rows.reduce((acc, row) => {
    const mc = row.mc || row.MC;
    const oee = row.oee_num || parseFloat((row.oee || '0%').replace('%', ''));
    if (mc && !acc[mc]) {
      acc[mc] = { mc, oee_sum: 0, count: 0 };
    }
    if (mc) {
      acc[mc].oee_sum += oee;
      acc[mc].count += 1;
    }
    return acc;
  }, {});

  const machineOeeList = Object.values(machineOeeData)
    .map(({ mc, oee_sum, count }) => ({
      mc,
      oee: Math.round(oee_sum / count)
    }))
    .sort((a, b) => b.oee - a.oee);

  // Top performing and bottom performing machines
  const topMachines = machineOeeList.slice(0, 3);
  const bottomMachines = machineOeeList.slice(-3).reverse();

  // Downtime breakdown
  const downtimeData = charts.downtime_by_category || [];
  const totalDowntime = downtimeData.reduce((sum, item) => sum + (item.minutes || 0), 0);

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 'bold' }}>
        🎯 OEE Dashboard
      </Typography>

      {/* Main OEE Card */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h3" component="div" sx={{ fontWeight: 'bold', mb: 1 }}>
                {oeeValue}
              </Typography>
              <Typography variant="h5" sx={{ mb: 3 }}>
                Overall Equipment Effectiveness
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {otrValue}
                  </Typography>
                  <Typography variant="caption">
                    Availability (OTR)
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {perValue}
                  </Typography>
                  <Typography variant="caption">
                    Performance (PER)
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {qrValue}
                  </Typography>
                  <Typography variant="caption">
                    Quality (QR)
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📊 OEE Components Analysis
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Availability (OTR)</Typography>
                  <Chip
                    label={otrValue}
                    color={getComponentColor(otrValue, 'otr')}
                    size="small"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Ratio of actual operating time to planned production time
                </Typography>

                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Performance (PER)</Typography>
                  <Chip
                    label={perValue}
                    color={getComponentColor(perValue, 'per')}
                    size="small"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Ratio of actual production rate to target production rate
                </Typography>

                <Divider />

                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body1">Quality (QR)</Typography>
                  <Chip
                    label={qrValue}
                    color={getComponentColor(qrValue, 'qr')}
                    size="small"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Ratio of good output to total output
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Machine Performance */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'success.main' }}>
                🏆 Top Performing Machines
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {topMachines.length > 0 ? topMachines.map((machine, index) => (
                  <Box key={machine.mc} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: index === 0 ? 'success.light' : 'grey.50', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ minWidth: '24px', textAlign: 'center' }}>
                        {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {machine.mc}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${machine.oee}%`}
                      color={getOeeColor(machine.oee)}
                      size="small"
                    />
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary">
                    No machine data available
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ color: 'warning.main' }}>
                ⚠️ Needs Attention
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {bottomMachines.length > 0 ? bottomMachines.map((machine, index) => (
                  <Box key={machine.mc} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 1, bgcolor: machine.oee < 50 ? 'error.light' : 'warning.light', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="h6" sx={{ minWidth: '24px', textAlign: 'center' }}>
                        {machine.oee < 50 ? '🚨' : '⚠️'}
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {machine.mc}
                      </Typography>
                    </Box>
                    <Chip
                      label={`${machine.oee}%`}
                      color={getOeeColor(machine.oee)}
                      size="small"
                    />
                  </Box>
                )) : (
                  <Typography variant="body2" color="text.secondary">
                    No machine data available
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Downtime Analysis */}
      {downtimeData.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'error.main' }}>
                  ⏱️ Downtime Breakdown Analysis
                </Typography>
                <Grid container spacing={2}>
                  {downtimeData.map((item) => {
                    const percentage = totalDowntime > 0 ? ((item.minutes / totalDowntime) * 100).toFixed(1) : '0';
                    const hours = Math.floor(item.minutes / 60);
                    const minutes = item.minutes % 60;
                    const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

                    return (
                      <Grid item xs={12} sm={6} md={4} key={item.category}>
                        <Box sx={{
                          p: 2,
                          border: '1px solid',
                          borderColor: 'grey.300',
                          borderRadius: 2,
                          bgcolor: item.category === 'TP' ? 'error.light' :
                                  item.category === 'MP' ? 'warning.light' :
                                  'grey.50'
                        }}>
                          <Typography variant="h6" fontWeight="bold" gutterBottom>
                            {item.category}
                          </Typography>
                          <Typography variant="h5" color="primary" gutterBottom>
                            {timeDisplay}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {percentage}% of total downtime
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* OEE Target Information */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          📋 OEE Performance Standards
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1" fontWeight="bold" color="success.main">
              🟢 World Class: ≥85%
            </Typography>
            <Typography variant="caption">
              Exceptional performance, minimal losses
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1" fontWeight="bold" color="warning.main">
              🟡 Good: 70-84%
            </Typography>
            <Typography variant="caption">
              Acceptable with room for improvement
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1" fontWeight="bold" color="error.main">
              🔴 Needs Improvement: &lt;70%
            </Typography>
            <Typography variant="caption">
              Requires immediate attention
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default OeeDashboard;