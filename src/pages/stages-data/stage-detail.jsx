import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Stack, Chip, Button, Divider, Skeleton, Card, CardContent } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  FlagOutlined,
  DashboardOutlined,
  InfoCircleOutlined,
  NumberOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import apiRequest from '../../api/api-utils';
import CustomSnackbar from '../custom-snackbar';
import DeleteConfirmationDialog from '../delete-confirmation-dialog';

const StageDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [stage, setStage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const fetchStageDetails = async () => {
      setLoading(true);
      try {
        const response = await apiRequest('get', `/stages/${id}`);
        if (response.data) {
          setStage(response.data);
        } else {
          setNotification({
            open: true,
            message: response.message || 'Failed to fetch stage details',
            severity: 'error'
          });
        }
      } catch (err) {
        setNotification({
          open: true,
          message: err.message || 'An error occurred while fetching stage details',
          severity: 'error'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStageDetails();
  }, [id]);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await apiRequest('DELETE', `/stages/${id}`);
      if (response) {
        setNotification({
          open: true,
          message: 'Stage deleted successfully',
          severity: 'success'
        });
        setTimeout(() => navigate('/stages'), 1500);
      } else {
        setNotification({
          open: true,
          message: response.message || 'Failed to delete stage',
          severity: 'error'
        });
      }
    } catch (err) {
      setNotification({
        open: true,
        message: err.message || 'An error occurred while deleting stage',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
    }
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const extractRouteInfo = (subTitle) => {
    if (!subTitle) return { start: 'N/A', finish: 'N/A' };

    const match = subTitle.match(/»(.+?)»(.+?)›(.+?)\(/);
    if (match && match.length >= 4) {
      return {
        start: match[2].trim(),
        finish: match[3].trim()
      };
    }
    return { start: 'N/A', finish: 'N/A' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    const date = new Date(dateString);
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    return date.toLocaleDateString('en-US', options);
  };

  if (loading) {
    return (
      <Box p={3}>
        <Paper sx={{ p: 3 }}>
          <Skeleton variant="text" height={50} width="50%" />
          <Skeleton variant="text" height={30} width="30%" sx={{ mt: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mt: 3 }} />
          <Stack direction="row" spacing={2} mt={3}>
            <Skeleton variant="rectangular" height={50} width={120} />
            <Skeleton variant="rectangular" height={50} width={120} />
          </Stack>
        </Paper>
      </Box>
    );
  }

  const routeInfo = stage ? extractRouteInfo(stage.sub_title) : { start: 'N/A', finish: 'N/A' };

  return (
    <Box p={3}>
      <Button
        startIcon={<ArrowLeftOutlined />}
        variant="contained"
        onClick={() => navigate('/stages')}
        sx={{ mb: 3, bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
      >
        Back to Stages
      </Button>

      {stage && (
        <>
          <Paper sx={{ p: 0, mb: 3, overflow: 'hidden', borderRadius: 2, boxShadow: 3 }}>
            <Box sx={{ bgcolor: '#1976d2', color: 'white', p: 3 }}>
              <Typography variant="h4" fontWeight="600">
                Stage {stage.stage_number || 'N/A'}: {stage.title || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" mt={1} sx={{ opacity: 0.9 }}>
                {stage.sub_title || 'N/A'}
              </Typography>
            </Box>

            <Box sx={{ p: 3 }}>
              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<EditOutlined />}
                  onClick={() => navigate(`/stage/${id}/edit`)}
                  sx={{ bgcolor: '#4caf50', '&:hover': { bgcolor: '#388e3c' } }}
                >
                  Edit Stage
                </Button>
                <Button variant="contained" color="error" startIcon={<DeleteOutlined />} onClick={handleDeleteClick}>
                  Delete Stage
                </Button>
              </Stack>
            </Box>
          </Paper>

          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3
            }}
          >
            <Card sx={{ flex: 1, boxShadow: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <InfoCircleOutlined style={{ fontSize: '20px', color: '#1976d2' }} />
                  <Typography variant="h6">Stage Details</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Stage ID
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {stage.stage_id || 'N/A'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Stage Number
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <NumberOutlined style={{ color: '#1976d2' }} />
                      <Typography variant="body1" fontWeight="500">
                        {stage.stage_number || 'N/A'}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Distance
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <DashboardOutlined style={{ color: '#1976d2' }} />
                      <Typography variant="body1" fontWeight="500">
                        {stage.distance ? `${stage.distance} km` : 'N/A'}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Start Location
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <EnvironmentOutlined style={{ color: '#4caf50' }} />
                      <Typography variant="body1" fontWeight="500">
                        {routeInfo.start}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Finish Location
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <FlagOutlined style={{ color: '#f44336' }} />
                      <Typography variant="body1" fontWeight="500">
                        {routeInfo.finish}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Created At
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarOutlined style={{ color: '#1976d2' }} />
                      <Typography variant="body1" fontWeight="500">
                        {formatDate(stage.created_at)}
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            <Card sx={{ flex: 1, boxShadow: 2 }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                  <TrophyOutlined style={{ fontSize: '20px', color: '#ff9800' }} />
                  <Typography variant="h6">Race Information</Typography>
                </Stack>
                <Divider sx={{ mb: 2 }} />

                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Race Name
                    </Typography>
                    <Typography variant="body1" fontWeight="500">
                      {stage.race_id?.race || 'N/A'}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Year
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarOutlined style={{ color: '#ff9800' }} />
                      <Typography variant="body1" fontWeight="500">
                        {stage.race_id?.year || 'N/A'}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Race Date
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <CalendarOutlined style={{ color: '#ff9800' }} />
                      <Typography variant="body1" fontWeight="500">
                        {stage.race_id?.date || 'N/A'}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Country
                    </Typography>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <FlagOutlined style={{ color: '#ff9800' }} />
                      <Typography variant="body1" fontWeight="500">
                        {stage.race_id?.country_code ? stage.race_id.country_code.toUpperCase() : 'N/A'}
                      </Typography>
                    </Stack>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Race Type
                    </Typography>
                    <Chip
                      label={
                        stage.race_id?.is_stage_race === true
                          ? 'Stage Race'
                          : stage.race_id?.is_stage_race === false
                            ? 'One-day Race'
                            : 'N/A'
                      }
                      size="small"
                      sx={{
                        bgcolor: stage.race_id?.is_stage_race === true ? '#2196F3' : '#FF9800',
                        color: 'white',
                        fontWeight: '500',
                        mt: 0.5
                      }}
                    />
                  </Box>

                  {stage.race_id?.class && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Class
                      </Typography>
                      <Typography variant="body1" fontWeight="500">
                        {stage.race_id.class || 'N/A'}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </>
      )}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={stage?.title || stage?.stage_id}
        itemType="stage"
      />

      <CustomSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={closeNotification}
      />
    </Box>
  );
};

export default StageDetail;
