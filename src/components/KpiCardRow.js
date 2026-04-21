import React from 'react';
import { Box, Card, CardContent, Grid, Typography, Chip } from '@mui/material';

const KpiCard = ({ title, value, displayValue, unit = "", color = "primary", icon, trend }) => {
  const getColorValue = () => {
    if (color === 'success') return 'success.main';
    if (color === 'warning') return 'warning.main';
    if (color === 'error') return 'error.main';
    return 'primary.main';
  };

  const numValue = typeof value === 'string' ? parseFloat(value.replace('%', '')) : value;

  return (
    <Card sx={{ height: '100%', border: `2px solid`, borderColor: getColorValue() }}>
      <CardContent sx={{ textAlign: 'center', py: 2 }}>
        {icon && (
          <Box sx={{ fontSize: '2rem', mb: 1 }}>
            {icon}
          </Box>
        )}

        <Typography variant="h4" component="div" sx={{
          fontWeight: 'bold',
          color: getColorValue(),
          mb: 0.5
        }}>
          {displayValue || value}{unit}
        </Typography>

        <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
          {title}
        </Typography>

        {trend && (
          <Chip
            label={trend}
            color={trend.includes('↑') ? 'success' : trend.includes('↓') ? 'error' : 'default'}
            size="small"
          />
        )}
      </CardContent>
    </Card>
  );
};

const KpiCardRow = ({ kpis, type = "summary" }) => {
  // Define KPI configurations
  const getKpiConfigs = () => {
    if (type === "oee") {
      return [
        {
          key: 'oee',
          title: 'Overall Equipment Effectiveness',
          icon: '🎯',
          unit: '%',
          getColor: (val) => val >= 85 ? 'success' : val >= 70 ? 'warning' : 'error'
        },
        {
          key: 'otr',
          title: 'Availability (OTR)',
          icon: '⏱️',
          unit: '%',
          getColor: (val) => val >= 90 ? 'success' : val >= 75 ? 'warning' : 'error'
        },
        {
          key: 'per',
          title: 'Performance (PER)',
          icon: '⚡',
          unit: '%',
          getColor: (val) => val >= 95 ? 'success' : val >= 80 ? 'warning' : 'error'
        },
        {
          key: 'qr',
          title: 'Quality (QR)',
          icon: '✅',
          unit: '%',
          getColor: (val) => val >= 99 ? 'success' : val >= 95 ? 'warning' : 'error'
        },
        {
          key: 'total_output',
          title: 'Total Output',
          icon: '📊',
          unit: '',
          getColor: () => 'primary'
        },
        {
          key: 'reject',
          title: 'Total Reject',
          icon: '❌',
          unit: '',
          getColor: (val) => val === 0 ? 'success' : val < 10 ? 'warning' : 'error'
        }
      ];
    }

    // Default summary KPIs
    return [
      {
        key: 'plan_time',
        title: 'Plan Time',
        icon: '📅',
        unit: '',
        getColor: () => 'primary'
      },
      {
        key: 'utility_time',
        title: 'Utility Time',
        icon: '🔧',
        unit: '',
        getColor: () => 'success'
      },
      {
        key: 'total_output',
        title: 'Total Output',
        icon: '📈',
        unit: '',
        getColor: () => 'primary'
      },
      {
        key: 'otr',
        title: 'Availability (OTR)',
        icon: '⏱️',
        unit: '%',
        getColor: (val) => val >= 90 ? 'success' : val >= 75 ? 'warning' : 'error'
      },
      {
        key: 'per',
        title: 'Performance (PER)',
        icon: '⚡',
        unit: '%',
        getColor: (val) => val >= 95 ? 'success' : val >= 80 ? 'warning' : 'error'
      },
      {
        key: 'oee',
        title: 'Overall OEE',
        icon: '🎯',
        unit: '%',
        getColor: (val) => val >= 85 ? 'success' : val >= 70 ? 'warning' : 'error'
      }
    ];
  };

  const kpiConfigs = getKpiConfigs();

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        📊 Key Performance Indicators
      </Typography>

      <Grid container spacing={2}>
        {kpiConfigs.map((config) => {
          const value = kpis[config.key] || kpis[`${config.key}_num`] || 0;
          const displayValue = kpis[config.key] || "0";
          const numericValue = typeof value === 'string' ? parseFloat(value.replace('%', '')) : value;
          const color = config.getColor(numericValue);

          return (
            <Grid item xs={12} sm={6} md={4} lg={2} key={config.key}>
              <KpiCard
                title={config.title}
                value={numericValue}
                displayValue={displayValue}
                unit={config.unit}
                color={color}
                icon={config.icon}
              />
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default KpiCardRow;