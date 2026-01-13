import React from 'react';
import { LineChart } from '@mui/x-charts/LineChart';
import { Box, Typography, Paper, useTheme, Container, Divider, Card, CardContent, alpha } from '@mui/material';
import Grid from '@mui/material/Grid2';

const MonthlyLineChart = ({ monthlyData }) => {
  const theme = useTheme();
  if (!monthlyData) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
        <Card
          elevation={2}
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 2,
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ textAlign: 'center', py: { xs: 4, md: 6 } }}>
            <Typography
              variant="h4"
              color="primary"
              sx={{
                fontWeight: 400,
                mb: 2,
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Loading Analytics...
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
              Preparing your monthly performance data
            </Typography>
          </Box>
        </Card>
      </Container>
    );
  }

  const data = monthlyData.data || monthlyData;
  if (!data.monthlyRaceByMonth && !data.monthlyRiderByMonth && !data.monthlyTeamByMonth) {
    return (
      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
        <Card
          elevation={2}
          sx={{
            p: { xs: 2, md: 4 },
            borderRadius: 2,
            backgroundColor: '#ffffff',
            border: '1px solid #e0e0e0'
          }}
        >
          <Box sx={{ textAlign: 'center', py: { xs: 4, md: 6 } }}>
            <Typography variant="h4" color="error" sx={{ fontWeight: 400, mb: 2, fontSize: { xs: '1.5rem', md: '2rem' } }}>
              No Data Available
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '1rem' } }}>
              Monthly performance data is currently unavailable
            </Typography>
          </Box>
        </Card>
      </Container>
    );
  }

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ];

  const raceData = fullMonths.map((month) => data.monthlyRaceByMonth?.[month] || 0);
  const riderData = fullMonths.map((month) => data.monthlyRiderByMonth?.[month] || 0);
  const teamData = fullMonths.map((month) => data.monthlyTeamByMonth?.[month] || 0);

  const totalRaces = raceData.reduce((sum, val) => sum + val, 0);
  const totalRiders = riderData.reduce((sum, val) => sum + val, 0);
  const totalTeams = teamData.reduce((sum, val) => sum + val, 0);

  const avgRaces = Math.round(totalRaces / 12);
  const avgRiders = Math.round(totalRiders / 12);
  const avgTeams = Math.round(totalTeams / 12);

  const peakRaceMonth = months[raceData.indexOf(Math.max(...raceData))];
  const peakRiderMonth = months[riderData.indexOf(Math.max(...riderData))];

  const getChartConfig = () => ({
    series: [
      {
        data: raceData,
        label: 'Races',
        color: theme.palette.primary.main,
        curve: 'catmullRom',
        strokeWidth: 3
      },
      {
        data: riderData,
        label: 'Riders',
        color: theme.palette.secondary.main,
        curve: 'catmullRom',
        strokeWidth: 3
      },
      {
        data: teamData,
        label: 'Teams',
        color: theme.palette.success.main,
        curve: 'catmullRom',
        strokeWidth: 3
      }
    ],
    xAxis: [
      {
        data: months,
        scaleType: 'point',
        tickLabelStyle: {
          fontSize: 12,
          fill: theme.palette.text.secondary,
          fontWeight: 500
        }
      }
    ],
    yAxis: [
      {
        tickLabelStyle: {
          fontSize: 12,
          fill: theme.palette.text.secondary,
          fontWeight: 500
        }
      }
    ],
    grid: {
      horizontal: true,
      vertical: false
    },
    margin: {
      left: 60,
      right: 40,
      top: 60,
      bottom: 60
    }
  });

  const summaryCards = [
    {
      title: 'Total Races',
      value: totalRaces,
      average: avgRaces,
      peak: peakRaceMonth,
      color: theme.palette.primary.main
    },
    {
      title: 'Total Riders',
      value: totalRiders,
      average: avgRiders,
      peak: peakRiderMonth,
      color: theme.palette.secondary.main
    },
    {
      title: 'Total Teams',
      value: totalTeams,
      average: avgTeams,
      peak: months[teamData.indexOf(Math.max(...teamData))],
      color: theme.palette.success.main
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ mb: { xs: 3, md: 4 }, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 600,
            color: theme.palette.text.primary,
            mb: 1
          }}
        >
          Current Year Overview
        </Typography>

      </Box>
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        {summaryCards.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card
              elevation={2}
              sx={{
                height: '100%',
                borderRadius: 2,
                backgroundColor: '#ffffff',
                border: '1px solid #e0e0e0',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  borderColor: card.color
                }
              }}
            >
              <CardContent sx={{ p: { xs: 2, md: 3 } }}>
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 600,
                    letterSpacing: 1,
                    color: 'text.secondary',
                    fontSize: { xs: '0.6875rem', md: '0.75rem' }
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 700,
                    my: 1,
                    color: card.color
                  }}
                >
                  {card.value.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6875rem', md: '0.75rem' } }}>
                      Avg/Month
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: 'text.primary', fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                    >
                      {card.average.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6875rem', md: '0.75rem' } }}>
                      Peak Month
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: 'text.primary', fontSize: { xs: '0.75rem', md: '0.875rem' } }}
                    >
                      {card.peak}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card
        elevation={2}
        sx={{
          borderRadius: 2,
          backgroundColor: '#ffffff',
          border: '1px solid #e0e0e0'
        }}
      >
        <CardContent sx={{ p: { xs: 1, sm: 2, md: 4 } }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 2, md: 4 } }}>
            <Typography
              variant="h4"
              component="h3"
              sx={{
                fontWeight: 600,
                color: theme.palette.text.primary,
                mb: 1
              }}
            >
              Monthly Trends Analysis
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.875rem', md: '0.9rem' } }}>
              Track performance patterns across the year
            </Typography>
          </Box>

          <Box
            sx={{
              width: '100%',
              height: { xs: 300, sm: 400, md: 500, lg: 600 },
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              overflow: 'hidden'
            }}
          >
            <LineChart
              {...getChartConfig()}
              width={undefined}
              height={undefined}
              sx={{
                width: '100%',
                height: '100%',
                '& .MuiChartsAxis-tick': {
                  fontSize: { xs: '10px', sm: '11px', md: '12px' }
                },
                '& .MuiLineElement-root': {
                  strokeWidth: 3
                },
                '& .MuiMarkElement-root': {
                  strokeWidth: 2,
                  r: { xs: 3, md: 4 }
                }
              }}
            />
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default MonthlyLineChart;
