import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Paper, Button, CircularProgress, Snackbar, Alert, Divider, Chip } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, EditOutlined, DeleteOutlined, FlagOutlined, CalendarOutlined, AppstoreOutlined } from '@ant-design/icons';
import apiRequest from '../../api/api-utils';

const RaceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [race, setRace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    const fetchRace = async () => {
      try {
        const response = await apiRequest('GET', `/races/${id}`);
        if (response.data) {
          setRace(response.data);
        } else {
          setError({ message: 'Rider not found' });
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRace();
  }, [id]);

  const handleDelete = async () => {
if (window.confirm('Are you sure you want to delete this race?')) {
      try {
        const response = await fetch(`/api/races/${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete race');
        }

        setSnackbar({
          open: true,
          message: 'Race deleted successfully',
          severity: 'success'
        });

        // Navigate back to races list after successful deletion
        setTimeout(() => navigate('/races'), 1500);
      } catch (err) {
        setSnackbar({
          open: true,
          message: err.message,
          severity: 'error'
        });
      }
    }
  };

  const handleEditClick = () => {
    navigate(`/race/${race._id}/edit`);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6" color="error">
            Error loading race details. Please try again.
          </Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/races-list')} startIcon={<ArrowLeftOutlined />}>
            Back to Races
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!race) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="h6">Race not found</Typography>
          <Button variant="contained" sx={{ mt: 2 }} onClick={() => navigate('/races-list')} startIcon={<ArrowLeftOutlined />}>
            Back to Races
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button
        startIcon={<ArrowLeftOutlined />}
        variant="contained"
        onClick={() => navigate('/races-list')}
        sx={{ mb: 3, bgcolor: '#1976d2', '&:hover': { bgcolor: '#1565c0' } }}
      >
        Back to Races
      </Button>

      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            mb: 3,
            flexDirection: { xs: 'column', sm: 'row' }
          }}
        >
          <Typography variant="h4" component="h1" sx={{ mb: { xs: 2, sm: 0 } }}>
            {race.race}
          </Typography>

          <Box sx={{ display: 'flex' }}>
            <Button variant="outlined" color="primary" sx={{ mr: 1 }} onClick={handleEditClick} startIcon={<EditOutlined />}>
              Edit
            </Button>
            <Button variant="outlined" color="error" onClick={handleDelete} startIcon={<DeleteOutlined />}>
              Delete
            </Button>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Replacing Grid with Box layout */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 3 }}>
          {/* Left column */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarOutlined sx={{ mr: 1 }} color="primary" />
              <Typography variant="subtitle1">
                <strong>Date:</strong> {race.date} ({race.year})
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <FlagOutlined style={{ marginRight: 8, color: '#1976d2' }} />
              <Typography variant="subtitle1">
                <strong>Country:</strong> {race.country_code.toUpperCase()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <AppstoreOutlined sx={{ mr: 1 }} color="primary" />
              <Typography variant="subtitle1">
                <strong>Class:</strong> {race.class}
              </Typography>
            </Box>
          </Box>

          {/* Right column */}
          <Box sx={{ flex: 1 }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                <strong>Type:</strong> {race.is_stage_race ? 'Stage Race' : 'One-day Race'}
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">
                <strong>Created:</strong> {new Date(race.created_at).toLocaleString()}
              </Typography>
            </Box>

            <Box>
              <Typography variant="subtitle1">
                <strong>Last Updated:</strong> {new Date(race.updated_at).toLocaleString()}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Chip label={`ID: ${race._id}`} variant="outlined" size="small" />
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RaceDetailPage;
