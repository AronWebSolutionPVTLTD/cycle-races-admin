import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import Grid from '@mui/material/Grid2';

const MonthlyLineChart = ({ monthlyData }) => {
  const theme = useTheme();

  // If no data, show loading or empty state
  if (!monthlyData) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" color="text.secondary" align="center">
          Loading monthly data...
        </Typography>
      </Paper>
    );
  }

  // Validate data structure
  if (!monthlyData.monthlyRaceByMonth && !monthlyData.monthlyriderByMonth && !monthlyData.monthlyTeamByMonth) {
    return (
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" color="text.secondary" align="center">
          No monthly data available
        </Typography>
      </Paper>
    );
  }

  // Extract months and prepare data
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Prepare data series with safe access
  const raceData = months.map((month) => monthlyData.monthlyRaceByMonth?.[month] || 0);
  const riderData = months.map((month) => monthlyData.monthlyriderByMonth?.[month] || 0);
  const teamData = months.map((month) => monthlyData.monthlyTeamByMonth?.[month] || 0);

  // Chart configuration
  const chartConfig = {
    width: 800,
    height: 400,
    series: [
      {
        data: raceData,
        label: 'Monthly Races',
        color: theme.palette.primary.main,
        curve: 'linear'
      },
      {
        data: riderData,
        label: 'Monthly Riders',
        color: theme.palette.secondary.main,
        curve: 'linear'
      },
      {
        data: teamData,
        label: 'Monthly Teams',
        color: theme.palette.success.main,
        curve: 'linear'
      }
    ],
    xAxis: [
      {
        data: months,
        scaleType: 'point',
        tickLabelStyle: {
          fontSize: 12,
          fill: theme.palette.text.secondary
        }
      }
    ],
    yAxis: [
      {
        tickLabelStyle: {
          fontSize: 12,
          fill: theme.palette.text.secondary
        }
      }
    ],
    grid: {
      horizontal: true,
      vertical: false
    },
    margin: { left: 80, right: 80, top: 40, bottom: 60 }
  };

  // Calculate totals for summary cards
  const totalRaces = raceData.reduce((sum, val) => sum + val, 0);
  const totalRiders = riderData.reduce((sum, val) => sum + val, 0);
  const totalTeams = teamData.reduce((sum, val) => sum + val, 0);

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              textAlign: 'center',
              borderLeft: `4px solid ${theme.palette.primary.main}`,
              borderRadius: 2
            }}
          >
            <Typography variant="h4" color="primary" fontWeight="bold">
              {totalRaces.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Races
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              textAlign: 'center',
              borderLeft: `4px solid ${theme.palette.secondary.main}`,
              borderRadius: 2
            }}
          >
            <Typography variant="h4" color="secondary" fontWeight="bold">
              {totalRiders.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Riders
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              textAlign: 'center',
              borderLeft: `4px solid ${theme.palette.success.main}`,
              borderRadius: 2
            }}
          >
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {totalTeams.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Teams
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Line Chart */}
      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography
          variant="h5"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 3,
            textAlign: 'center'
          }}
        >
          Monthly Performance Overview
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
            '& .MuiChartsAxis-tick': {
              fontSize: '12px'
            },
            '& .MuiChartsLegend-root': {
              fontSize: '14px'
            }
          }}
        >
          <LineChart
            {...chartConfig}
            slotProps={{
              legend: {
                direction: 'row',
                position: { vertical: 'top', horizontal: 'middle' },
                padding: 0,
                itemMarkWidth: 20,
                itemMarkHeight: 2,
                markGap: 5,
                itemGap: 15
              }
            }}
          />
        </Box>

        {/* Additional Info */}
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Data shows monthly statistics for races, riders, and teams throughout the year
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};

export default MonthlyLineChart;
