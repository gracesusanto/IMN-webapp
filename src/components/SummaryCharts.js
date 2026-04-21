import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

// Simple placeholder charts - in production you'd use recharts, chartjs, or similar
const BarChart = ({ data, title, xKey, yKey, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No data available for {title}</Typography>
      </Paper>
    );
  }

  const maxValue = Math.max(...data.map(item => parseFloat(item[yKey]) || 0));

  return (
    <Paper sx={{ p: 2, height }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'end', height: '80%', gap: 1 }}>
        {data.slice(0, 10).map((item, index) => {
          const value = parseFloat(item[yKey]) || 0;
          const barHeight = maxValue > 0 ? (value / maxValue) * 200 : 0;
          const color = value >= 85 ? '#4caf50' : value >= 70 ? '#ff9800' : '#f44336';

          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                flex: 1,
                gap: 1
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
                {value}%
              </Typography>
              <Box
                sx={{
                  width: '100%',
                  maxWidth: 40,
                  height: `${barHeight}px`,
                  backgroundColor: color,
                  borderRadius: 1,
                  minHeight: 20,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  transform: 'rotate(-45deg)',
                  whiteSpace: 'nowrap',
                  fontSize: '10px'
                }}
              >
                {item[xKey]}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};

const PieChart = ({ data, title, height = 300 }) => {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 2, height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography color="text.secondary">No data available for {title}</Typography>
      </Paper>
    );
  }

  const colors = ['#f44336', '#ff9800', '#2196f3', '#4caf50', '#9c27b0', '#00bcd4', '#cddc39', '#795548'];
  const total = data.reduce((sum, item) => sum + (item.minutes || 0), 0);

  return (
    <Paper sx={{ p: 2, height }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', height: '80%', gap: 2 }}>
        {/* Simple bar representation instead of pie chart */}
        <Box sx={{ flex: 1 }}>
          {data.map((item, index) => {
            const percentage = total > 0 ? ((item.minutes || 0) / total * 100) : 0;
            const hours = Math.floor(item.minutes / 60);
            const minutes = item.minutes % 60;
            const timeDisplay = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

            return (
              <Box key={index} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {item.category}
                  </Typography>
                  <Typography variant="body2">
                    {timeDisplay} ({percentage.toFixed(1)}%)
                  </Typography>
                </Box>
                <Box
                  sx={{
                    height: 8,
                    backgroundColor: colors[index % colors.length],
                    borderRadius: 1,
                    width: `${Math.max(percentage, 5)}%`, // Minimum 5% width for visibility
                  }}
                />
              </Box>
            );
          })}
        </Box>
      </Box>
    </Paper>
  );
};

const SummaryCharts = ({ dashboardData, reportType = "mesin" }) => {
  const charts = dashboardData?.charts || {};

  // Process OEE data for chart
  const oeeMachineData = React.useMemo(() => {
    const rows = dashboardData?.rows || [];
    return rows.map(row => ({
      name: row.mc || row.operator || 'Unknown',
      oee: row.oee_num || parseFloat((row.oee || '0%').replace('%', ''))
    })).sort((a, b) => b.oee - a.oee);
  }, [dashboardData]);

  const downtimeData = charts.downtime_by_category || [];

  const chartTitle = reportType === "mesin" ? "OEE by Machine" : "OEE by Operator";

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        📈 Performance Charts
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <BarChart
            data={oeeMachineData}
            title={chartTitle}
            xKey="name"
            yKey="oee"
            height={350}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <PieChart
            data={downtimeData}
            title="Downtime by Category"
            height={350}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default SummaryCharts;