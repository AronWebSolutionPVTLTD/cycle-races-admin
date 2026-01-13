import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Avatar,
  Snackbar,
  useMediaQuery,
  useTheme,
  Autocomplete
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import {
  EditOutlined,
  DeleteOutlined,
  ArrowLeftOutlined,
  UserAddOutlined,
  UserDeleteOutlined,
  ExclamationCircleOutlined,
  SearchOutlined
} from '@ant-design/icons';
import CustomTable from '../table/custom-table';
import apiRequest from '../../api/api-utils';
import DeleteConfirmationDialog from '../delete-confirmation-dialog';

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [addRiderDialogOpen, setAddRiderDialogOpen] = useState(false);
  const [removeRiderDialogOpen, setRemoveRiderDialogOpen] = useState(false);
  const [riderToRemove, setRiderToRemove] = useState(null);
  const [newRider, setNewRider] = useState({
    rider_id: '',
    riderName: '',
    riderCountry: '',
    riderAge: ''
  });
  const [availableRiders, setAvailableRiders] = useState([]);
  const [ridersLoading, setRidersLoading] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [riderSearchTerm, setRiderSearchTerm] = useState('');
  const [riderPage, setRiderPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiRequest('GET', `/teams/${id}`);
      setTeam(response.data);
      setError(null);
    } catch (err) {
      const errorMessage = err.message || 'Failed to fetch team details';
      setError({ message: errorMessage });
      showSnackbar(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showSnackbar]);

  const fetchRiders = useCallback(async () => {
    setRidersLoading(true);
    try {
      const data = await apiRequest(
        'GET',
        '/riders',
        {},
        {
          page: riderPage + 1,
          limit: rowsPerPage,
          search: riderSearchTerm || undefined
        }
      );
      const existingRiderIds = team?.riders?.map((rider) => rider.rider_id) || [];
      const filteredRiders = data.data.filter((rider) => !existingRiderIds.includes(rider._id));

      setAvailableRiders(filteredRiders);
    } catch (error) {
      showSnackbar(error.message || 'Failed to fetch riders', 'error');
    } finally {
      setRidersLoading(false);
    }
  }, [riderPage, rowsPerPage, riderSearchTerm, team, showSnackbar]);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  useEffect(() => {
    if (addRiderDialogOpen) {
      fetchRiders();
    }
  }, [addRiderDialogOpen, fetchRiders]);

  useEffect(() => {
    if (addRiderDialogOpen) {
      const delayDebounceFn = setTimeout(() => {
        fetchRiders();
      }, 500);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [riderSearchTerm, addRiderDialogOpen, fetchRiders]);

  const handleDelete = async () => {
    try {
      await apiRequest('DELETE', `/teams/${id}`);
      showSnackbar('Team deleted successfully', 'success');
      navigate('/teams');
    } catch (err) {
      const errorMessage = err.message || 'Failed to delete team';
      setError({ message: errorMessage });
      showSnackbar(errorMessage, 'error');
    }
    setDeleteDialogOpen(false);
  };

  const openRemoveRiderDialog = (rider) => {
    setRiderToRemove(rider);
    setRemoveRiderDialogOpen(true);
  };

  const handleRemoveRider = async () => {
    if (!riderToRemove) return;

    try {
      await apiRequest('DELETE', `/teams/${id}/${riderToRemove.rider_id}`);
      showSnackbar(`${riderToRemove.riderName || 'Rider'} removed successfully`, 'success');
      fetchTeam();
    } catch (err) {
      const errorMessage = err.message || 'Failed to remove rider';
      showSnackbar(errorMessage, 'error');
    } finally {
      setRemoveRiderDialogOpen(false);
      setRiderToRemove(null);
    }
  };

  const handleAddRider = async () => {
    if (!newRider.rider_id) {
      showSnackbar('Please select a rider', 'error');
      return;
    }

    try {
      await apiRequest('POST', `/teams/${id}/riders`, newRider);
      showSnackbar(`${newRider.riderName} added to team`, 'success');
      setAddRiderDialogOpen(false);
      setNewRider({ rider_id: '', riderName: '', riderCountry: '', riderAge: '' });
      setSelectedRider(null);
      fetchTeam();
    } catch (err) {
      const errorMessage = err.message || 'Failed to add rider';
      showSnackbar(errorMessage, 'error');
    }
  };

  const handleRiderInputChange = (e) => {
    const { name, value } = e.target;
    setNewRider((prev) => ({ ...prev, [name]: value }));
  };

  const handleRiderSelect = (event, value) => {
    if (value) {
      setSelectedRider(value);
      setNewRider({
        rider_id: value._id,
        riderName: value.name || '',
        riderCountry: value.nationality || '',
        riderAge: value.age || ''
      });
    } else {
      setSelectedRider(null);
      setNewRider({
        rider_id: '',
        riderName: '',
        riderCountry: '',
        riderAge: ''
      });
    }
  };

  const handleCloseRiderDialog = () => {
    setAddRiderDialogOpen(false);
    setSelectedRider(null);
    setRiderSearchTerm('');
    setNewRider({
      rider_id: '',
      riderName: '',
      riderCountry: '',
      riderAge: ''
    });
  };

  const columns = [
    {
      id: 'riderName',
      label: 'Name',
      minWidth: 150,
      format: (value) => value || 'N/A'
    },
    {
      id: 'riderCountry',
      label: 'Country',
      minWidth: 120,
      format: (value) =>
        value ? (
          <Chip
            size="small"
            avatar={<Avatar alt={value} src={`/flags/${value.toLowerCase()}.png`} />}
            label={value.toUpperCase()}
            variant="outlined"
          />
        ) : (
          'N/A'
        )
    },
    {
      id: 'riderAge',
      label: 'Age',
      minWidth: 80,
      format: (value) => value || 'N/A'
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 100,
      align: 'right',
      format: (_, row) => (
        <Button
          startIcon={<UserDeleteOutlined />}
          color="error"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            openRemoveRiderDialog(row);
          }}
        >
          Remove
        </Button>
      )
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && !team) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>
        <Button startIcon={<ArrowLeftOutlined />} onClick={() => navigate('/teams')}>
          Back to Teams
        </Button>
      </Box>
    );
  }

  if (!team) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info" sx={{ mb: 2 }}>
          Team not found
        </Alert>
        <Button startIcon={<ArrowLeftOutlined />} onClick={() => navigate('/teams')}>
          Back to Teams
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 2,
          mb: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 2 : 0 }}>
          <Button startIcon={<ArrowLeftOutlined />} sx={{ mr: 2 }} onClick={() => navigate('/teams')}>
            Back
          </Button>
          <Typography variant="h5" component="h1">
            {team.teamName || 'Team Details'}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, width: isMobile ? '100%' : 'auto' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditOutlined />}
            onClick={() => navigate(`/team/${id}/edit`)}
            fullWidth={isMobile}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlined />}
            onClick={() => setDeleteDialogOpen(true)}
            fullWidth={isMobile}
          >
            Delete
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 4 }} elevation={2}>
        <Typography variant="h6" component="h2" gutterBottom>
          Team Details
        </Typography>

        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Team Name
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {team.teamName || 'N/A'}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Country
            </Typography>
            {team.flag ? (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                <Avatar src={`/flags/${team.flag.toLowerCase()}.png`} alt={team.flag} sx={{ width: 24, height: 24, mr: 1 }} />
                <Typography variant="body1" fontWeight="medium">
                  {team.flag.toUpperCase()}
                </Typography>
              </Box>
            ) : (
              <Typography variant="body1" fontWeight="medium">
                N/A
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary">
              Year
            </Typography>
            <Typography variant="body1" fontWeight="medium">
              {team.year || 'N/A'}
            </Typography>
          </Grid>

          {team.description && (
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Description
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5 }}>
                {team.description}
              </Typography>
            </Grid>
          )}

          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Created
                </Typography>
                <Typography variant="body1">{team.created_at ? new Date(team.created_at).toLocaleString() : 'N/A'}</Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body1">{team.updated_at ? new Date(team.updated_at).toLocaleString() : 'N/A'}</Typography>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      <Box
        sx={{
          mb: 2,
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: 2
        }}
      >
        <Typography variant="h6" component="h2">
          Team Riders
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<UserAddOutlined />}
          onClick={() => setAddRiderDialogOpen(true)}
          fullWidth={isMobile}
        >
          Add Rider
        </Button>
      </Box>

      {team.riders && team.riders.length > 0 ? (
        <CustomTable columns={columns} data={team.riders} error={null} loading={false} noDataMessage="No riders found in this team" />
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
          <ExclamationCircleOutlined style={{ fontSize: '2rem', color: theme.palette.text.secondary }} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            No Riders Found
          </Typography>
          <Typography variant="body2" sx={{ mt: 1, mb: 2, color: 'text.secondary' }}>
            This team doesn't have any riders yet
          </Typography>
          <Button variant="outlined" color="primary" startIcon={<UserAddOutlined />} onClick={() => setAddRiderDialogOpen(true)}>
            Add First Rider
          </Button>
        </Paper>
      )}

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title={team?.teamName}
        itemType="team"
        dialogTitle="Delete Team"
      />

      <Dialog open={removeRiderDialogOpen} onClose={() => setRemoveRiderDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Remove Rider</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to remove {riderToRemove?.riderName || 'this rider'} from the team?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveRiderDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRemoveRider} color="error" variant="contained">
            Remove
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addRiderDialogOpen} onClose={handleCloseRiderDialog} fullWidth maxWidth="sm">
        <DialogTitle>Add Rider to Team</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <Autocomplete
                id="rider-search"
                options={availableRiders}
                getOptionLabel={(option) => option.name || ''}
                loading={ridersLoading}
                value={selectedRider}
                onChange={handleRiderSelect}
                onInputChange={(event, value) => setRiderSearchTerm(value)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search Riders"
                    required
                    variant="outlined"
                    fullWidth
                    placeholder="Start typing to search..."
                    InputProps={{
                      ...params.InputProps,
                      startAdornment: (
                        <>
                          <SearchOutlined style={{ color: 'rgba(0, 0, 0, 0.54)', marginRight: 8 }} />
                          {params.InputProps.startAdornment}
                        </>
                      ),
                      endAdornment: (
                        <>
                          {ridersLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }}
                  />
                )}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body1">{option.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {option.country && (
                          <Chip
                            size="small"
                            label={option.country.toUpperCase()}
                            avatar={<Avatar alt={option.country} src={`/flags/${option.country.toLowerCase()}.png`} />}
                            variant="outlined"
                            sx={{ mr: 1 }}
                          />
                        )}
                        {option.age && (
                          <Typography variant="caption" color="text.secondary">
                            Age: {option.age}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </li>
                )}
                noOptionsText="No riders found"
                loadingText="Loading riders..."
              />
            </Grid>

            {selectedRider && (
              <>
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }}>Rider Details</Divider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="riderName"
                    label="Rider Name"
                    fullWidth
                    variant="outlined"
                    value={newRider.riderName}
                    onChange={handleRiderInputChange}
                    InputProps={{
                      readOnly: true
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="riderCountry"
                    label="Rider Country"
                    fullWidth
                    variant="outlined"
                    value={newRider.riderCountry}
                    onChange={handleRiderInputChange}
                    InputProps={{
                      readOnly: true
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    name="rider_id"
                    label="Rider ID"
                    fullWidth
                    variant="outlined"
                    value={newRider.rider_id}
                    InputProps={{
                      readOnly: true
                    }}
                    helperText="This ID will be used to associate the rider with the team"
                  />
                </Grid>
              </>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseRiderDialog}>Cancel</Button>
          <Button onClick={handleAddRider} color="primary" variant="contained" disabled={!selectedRider || !newRider.rider_id}>
            Add Rider
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TeamDetail;
