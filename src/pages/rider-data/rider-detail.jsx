import React, { useState, useEffect } from 'react';
import { Container, Typography, Paper, Box, Button, Divider, Chip, Avatar, CircularProgress, Alert, Snackbar } from '@mui/material';
import { format } from 'date-fns';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  FlagOutlined,
  CalendarOutlined,
  ColumnHeightOutlined,
  DashboardOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import apiRequest from '../../api/api-utils';

// Flag emoji mapping for common countries
const getFlagEmoji = (countryCode) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt());
  return String.fromCodePoint(...codePoints);
};

const RiderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [rider, setRider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });

  // Show snackbar helper function
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Close snackbar handler
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  useEffect(() => {
    const fetchRiderDetails = async () => {
      try {
        setLoading(true);
        const response = await apiRequest('GET', `/riders/${id}`);
        if (response.data) {
          setRider(response.data);
        } else {
          const errorMsg = 'Rider not found';
          setError({ message: errorMsg });
          showSnackbar(errorMsg, 'error');
        }
      } catch (err) {
        setError(err);
        showSnackbar(err.message || 'Failed to load rider details', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchRiderDetails();
  }, [id]);

  const handleEdit = () => {
    navigate(`/riders/${id}/edit`);
  };

  const handleBack = () => {
    navigate('/riders');
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${rider.name}?`)) {
      try {
        await apiRequest('DELETE', `/riders/${id}`);
        showSnackbar(`Rider ${rider.name} deleted successfully`, 'success');
        // Add a slight delay before navigating to allow the user to see the success message
        setTimeout(() => {
          navigate('/riders');
        }, 1500);
      } catch (err) {
        setError(err);
        showSnackbar(err.message || 'Failed to delete rider', 'error');
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || 'Failed to load rider details'}
          </Alert>
          <Button startIcon={<ArrowLeftOutlined />} onClick={handleBack} variant="contained" sx={{ mt: 2 }}>
            Back to Riders
          </Button>

          {/* Snackbar for error state */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    );
  }

  if (!rider) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Rider not found
          </Alert>
          <Button startIcon={<ArrowLeftOutlined />} onClick={handleBack} variant="contained" sx={{ mt: 2 }}>
            Back to Riders
          </Button>

          {/* Snackbar for not found state */}
          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Box>
      </Container>
    );
  }

  // Get flag emoji if nationality is provided
  const flagEmoji = rider.nationality ? getFlagEmoji(rider.nationality) : '';

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button startIcon={<ArrowLeftOutlined />} onClick={handleBack} variant="outlined" sx={{ mr: 2 }}>
            Back
          </Button>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            Rider Profile
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, md: 5 },
            mb: 4,
            borderRadius: 2,
            background: 'linear-gradient(to right, #f5f7fa, #ffffff)'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: 4
            }}
          >
            {/* Rider Image and Quick Info */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: { xs: '100%', md: '33%' }
              }}
            >
              {rider.image_url ? (
                <Avatar
                  src={rider.image_url}
                  alt={rider.name}
                  sx={{
                    width: 220,
                    height: 220,
                    mb: 3,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
              ) : (
                <Avatar
                  alt={rider.name}
                  sx={{
                    width: 220,
                    height: 220,
                    mb: 3,
                    fontSize: '5rem',
                    bgcolor: 'primary.main',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                >
                  {rider.name.charAt(0)}
                </Avatar>
              )}

              <Chip
                icon={<FlagOutlined />}
                label={
                  <Typography variant="body2">
                    {flagEmoji} {rider.nationality?.toUpperCase()}
                  </Typography>
                }
                color="primary"
                sx={{
                  mb: 2,
                  px: 1,
                  fontWeight: 500
                }}
              />

              {rider.profileUrl && (
                <Button variant="outlined" size="small" href={rider.profileUrl} target="_blank" sx={{ mt: 1 }}>
                  View ProCyclingStats Profile
                </Button>
              )}
            </Box>

            {/* Rider Details */}
            <Box
              sx={{
                flex: 1,
                p: { xs: 1, md: 2 }
              }}
            >
              <Typography
                variant="h4"
                component="h2"
                sx={{
                  mb: 1,
                  fontWeight: 700,
                  color: 'text.primary'
                }}
              >
                {rider.name}
              </Typography>

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: 3
                }}
              >
                {/* Birth Place */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <EnvironmentOutlined style={{ marginRight: 8, color: 'rgba(0, 0, 0, 0.54)' }} />
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Birth Place
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ pl: 4 }}>
                    {rider.birth_place || 'Not available'}
                  </Typography>
                </Box>

                {/* Date of Birth */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <CalendarOutlined style={{ marginRight: 8, color: 'rgba(0, 0, 0, 0.54)' }} />
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Date of Birth
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ pl: 4 }}>
                    {rider.date_of_birth ? format(new Date(rider.date_of_birth), 'MMMM dd, yyyy') : 'Not available'}
                  </Typography>
                </Box>

                {/* Height */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <ColumnHeightOutlined style={{ marginRight: 8, color: 'rgba(0, 0, 0, 0.54)' }} />
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Height
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ pl: 4 }}>
                    {rider.height ? `${rider.height} cm` : 'Not available'}
                  </Typography>
                </Box>

                {/* Weight */}
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DashboardOutlined style={{ marginRight: 8, color: 'rgba(0, 0, 0, 0.54)' }} />
                    <Typography variant="subtitle1" color="text.secondary" sx={{ fontWeight: 500 }}>
                      Weight
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ pl: 4 }}>
                    {rider.weight ? `${rider.weight} kg` : 'Not available'}
                  </Typography>
                </Box>
              </Box>

              {/* Added Info */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="caption" color="text.secondary">
                  Added on: {rider.createdAt ? format(new Date(rider.createdAt), 'MMMM dd, yyyy') : 'Not available'}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              borderTop: '1px solid',
              borderColor: 'divider'
            }}
          >
            <Button variant="contained" color="primary" startIcon={<EditOutlined />} onClick={handleEdit}>
              Edit
            </Button>
            <Button variant="outlined" color="error" startIcon={<DeleteOutlined />} onClick={handleDelete}>
              Delete
            </Button>
          </Box>
        </Paper>
      </Box>

      {/* Snackbar for main success/error messages */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default RiderDetailsPage;
