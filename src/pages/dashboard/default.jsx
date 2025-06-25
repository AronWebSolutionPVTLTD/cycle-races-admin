import React, { useState, useEffect } from 'react';

// material-ui
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid2';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';

// project imports
import MainCard from 'components/MainCard';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';

// assets
import GiftOutlined from '@ant-design/icons/GiftOutlined';
import MessageOutlined from '@ant-design/icons/MessageOutlined';
import SettingOutlined from '@ant-design/icons/SettingOutlined';
import RiseOutlined from '@ant-design/icons/RiseOutlined';
import FallOutlined from '@ant-design/icons/FallOutlined';
import MoreOutlined from '@ant-design/icons/MoreOutlined';
import apiRequest from '../../api/api-utils';
import MonthlyLineChart from '../../sections/dashboard/default/MonthlyLineChart';
import { ModernRecentRiders } from '../../sections/dashboard/default/RecentRiders';

export default function DashboardDefault() {
  const [dashboardData, setDashboardData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [recentRiders, setRecentRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [dashboardResponse, monthlyResponse, ridersResponse] = await Promise.all([
          apiRequest('GET', '/admin/dashboard'),
          apiRequest('GET', '/admin/monthsrace'),
          apiRequest('GET', '/admin/recentrider')
        ]);

        setDashboardData(dashboardResponse.data);
        setMonthlyData(monthlyResponse.data);
        setRecentRiders(ridersResponse.data);
      } catch (err) {
        console.error('Dashboard fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const calculatePercentage = (current, previous = 0) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '60vh',
          bgcolor: 'background.default'
        }}
      >
        <CircularProgress size={48} thickness={4} />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        sx={{
          m: 3,
          borderRadius: 3,
          '& .MuiAlert-message': { fontSize: '1rem' }
        }}
      >
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: 'background.default', minHeight: '100vh' }}>
      <Grid container spacing={3}>
        {/* Header */}
        <Grid size={12}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back! Here's what's happening with your cycling platform.
              </Typography>
            </Box>
            {/* <Button
              variant="contained"
              sx={{
                borderRadius: 3,
                textTransform: 'none',
                fontWeight: 600,
                px: 3
              }}
            >
              View Reports
            </Button> */}
          </Stack>
        </Grid>

        {/* Statistics Cards */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" fontWeight={700}>
                {dashboardData?.totalrace?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                Total Races
              </Typography>
              {/* <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 2 }}>
                <RiseOutlined style={{ fontSize: 16 }} />
                <Typography variant="caption">+12% from last month</Typography>
              </Stack> */}
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.1)'
              }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" fontWeight={700}>
                {dashboardData?.totalrider?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                Total Riders
              </Typography>
              {/* <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 2 }}>
                <RiseOutlined style={{ fontSize: 16 }} />
                <Typography variant="caption">+8% from last month</Typography>
              </Stack> */}
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.1)'
              }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" fontWeight={700}>
                {dashboardData?.totalteam?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                Total Teams
              </Typography>
              {/* <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 2 }}>
                  <RiseOutlined style={{ fontSize: 16 }} />
                  <Typography variant="caption">+15% from last month</Typography>
                </Stack> */}
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.1)'
              }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 4,
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Typography variant="h3" fontWeight={700}>
                {dashboardData?.totalstages?.toLocaleString() || '0'}
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9, mt: 0.5 }}>
                Total Stages
              </Typography>
              {/* <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 2 }}>
                <RiseOutlined style={{ fontSize: 16 }} />
                <Typography variant="caption">+22% from last month</Typography>
              </Stack> */}
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: -20,
                right: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.1)'
              }}
            />
          </Card>
        </Grid>

        {/* Charts Section */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>{monthlyData && <MonthlyLineChart monthlyData={monthlyData} />}</Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card sx={{ borderRadius: 4, p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Quick Insights
            </Typography>
            <Stack spacing={3}>
              <Box sx={{ p: 2, bgcolor: 'primary.50', borderRadius: 3 }}>
                <Typography variant="h4" color="primary.main" fontWeight={700}>
                  {Math.round(((dashboardData?.totalrider || 0) / (dashboardData?.totalteam || 1)) * 100) / 100}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average riders per team
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'success.50', borderRadius: 3 }}>
                <Typography variant="h4" color="success.main" fontWeight={700}>
                  {Math.round(((dashboardData?.totalstages || 0) / (dashboardData?.totalrace || 1)) * 100) / 100}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average stages per race
                </Typography>
              </Box>

              <Box sx={{ p: 2, bgcolor: 'warning.50', borderRadius: 3 }}>
                <Typography variant="h4" color="warning.main" fontWeight={700}>
                  1:{Math.round((dashboardData?.totalrider || 0) / (dashboardData?.totalrace || 1))}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Race to rider ratio
                </Typography>
              </Box>
            </Stack>
          </Card>

         
        </Grid>

        {/* Recent Riders Section */}
        <Grid size={12}>
          <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
            <ModernRecentRiders riders={recentRiders} />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
