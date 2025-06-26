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
import { CarOutlined, FlagOutlined, TeamOutlined, ThunderboltOutlined, UsergroupAddOutlined, UserOutlined } from '@ant-design/icons';

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
              <Typography variant="h2" fontWeight={700} color="text.primary">
                Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Welcome back! Here's what's happening with your cycling platform.
              </Typography>
            </Box>
          </Stack>
        </Grid>

        {/* Enhanced Statistics Cards */}
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              background: (theme) => `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: (theme) => `0 20px 40px ${theme.palette.primary.main}20`,
                '& .stat-icon': {
                  transform: 'scale(1.1) rotate(5deg)'
                },
                '& .stat-number': {
                  transform: 'scale(1.05)'
                }
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box
                  className="stat-icon"
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <ThunderboltOutlined   style={{ fontSize: 24, color: 'white' }} />
                </Box>
              </Box>

              <Typography
                variant="h3"
                fontWeight={800}
                className="stat-number"
                sx={{
                  mb: 0.5,
                  letterSpacing: '-0.02em',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {dashboardData?.totalrace?.toLocaleString() || '0'}
              </Typography>

              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Total Races
              </Typography>
            </Box>

            {/* Decorative Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                zIndex: 0
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -20,
                left: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.05)',
                zIndex: 0
              }}
            />

            {/* Glassmorphism overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                zIndex: 1
              }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              background: (theme) => `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: (theme) => `0 20px 40px ${theme.palette.secondary.main}20`,
                '& .stat-icon': {
                  transform: 'scale(1.1) rotate(5deg)'
                },
                '& .stat-number': {
                  transform: 'scale(1.05)'
                }
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box
                  className="stat-icon"
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <UserOutlined  style={{ fontSize: 24, color: 'white' }} />
                </Box>
              </Box>

              <Typography
                variant="h3"
                fontWeight={800}
                className="stat-number"
                sx={{
                  mb: 0.5,
                  letterSpacing: '-0.02em',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {dashboardData?.totalrider?.toLocaleString() || '0'}
              </Typography>

              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Total Riders
              </Typography>
            </Box>

            {/* Decorative Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                zIndex: 0
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -20,
                left: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.05)',
                zIndex: 0
              }}
            />

            {/* Glassmorphism overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                zIndex: 1
              }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              background: (theme) => `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: (theme) => `0 20px 40px ${theme.palette.info.main}20`,
                '& .stat-icon': {
                  transform: 'scale(1.1) rotate(5deg)'
                },
                '& .stat-number': {
                  transform: 'scale(1.05)'
                }
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box
                  className="stat-icon"
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <UsergroupAddOutlined   style={{ fontSize: 24, color: 'white' }} />
                </Box>
              </Box>

              <Typography
                variant="h3"
                fontWeight={800}
                className="stat-number"
                sx={{
                  mb: 0.5,
                  letterSpacing: '-0.02em',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {dashboardData?.totalteam?.toLocaleString() || '0'}
              </Typography>

              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Total Teams
              </Typography>
            </Box>

            {/* Decorative Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                zIndex: 0
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -20,
                left: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.05)',
                zIndex: 0
              }}
            />

            {/* Glassmorphism overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                zIndex: 1
              }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              background: (theme) => `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              cursor: 'pointer',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: (theme) => `0 20px 40px ${theme.palette.success.main}20`,
                '& .stat-icon': {
                  transform: 'scale(1.1) rotate(5deg)'
                },
                '& .stat-number': {
                  transform: 'scale(1.05)'
                }
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box
                  className="stat-icon"
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(10px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255,255,255,0.1)'
                  }}
                >
                  <FlagOutlined style={{ fontSize: 24, color: 'white' }} />
                </Box>
              </Box>

              <Typography
                variant="h3"
                fontWeight={800}
                className="stat-number"
                sx={{
                  mb: 0.5,
                  letterSpacing: '-0.02em',
                  transition: 'all 0.3s ease',
                  background: 'linear-gradient(45deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.8) 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {dashboardData?.totalstages?.toLocaleString() || '0'}
              </Typography>

              <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                Total Stages
              </Typography>

              {/* <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mt: 2 }}>
                <Box
                  sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#4ade80',
                    animation: 'pulse 2s infinite'
                  }}
                />
                <Typography variant="caption" sx={{ opacity: 0.8, fontWeight: 500 }}>
                  Live Data
                </Typography>
              </Stack> */}
            </Box>

            {/* Decorative Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -30,
                right: -30,
                width: 120,
                height: 120,
                borderRadius: '50%',
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
                zIndex: 0
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -20,
                left: -20,
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: 'rgba(255,255,255,0.05)',
                zIndex: 0
              }}
            />

            {/* Glassmorphism overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
                zIndex: 1
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
