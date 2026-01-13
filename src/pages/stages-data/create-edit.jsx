import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  TextField,
  Stack,
  CircularProgress,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, SaveOutlined, SearchOutlined } from '@ant-design/icons';
import apiRequest from '../../api/api-utils';
import CustomTable from '../table/custom-table';
import CustomSnackbar from '../custom-snackbar';

const initialFormState = {
  race_id: '',
  race_name: '',
  stage_number: '',
  stage_id: '',
  title: '',
  sub_title: '',
  distance: ''
};

const StageForm = ({ mode }) => {
  const { id } = useParams();
  const iseditMode = mode === 'edit';
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialFormState);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [errors, setErrors] = useState({});
  const [raceDialogOpen, setRaceDialogOpen] = useState(false);
  const [racesPage, setRacesPage] = useState(0);
  const [racesPerPage, setRacesPerPage] = useState(10);
  const [totalRaces, setTotalRaces] = useState(0);
  const [racesLoading, setRacesLoading] = useState(false);
  const [racesError, setRacesError] = useState(null);
  const raceColumns = [
    { id: 'race', label: 'Race Name', minWidth: 150 },
    { id: 'year', label: 'Year', minWidth: 80 },
    { id: 'country_code', label: 'Country', minWidth: 100 }
  ];
  const fetchRaces = async () => {
    setRacesLoading(true);
    setRacesError(null);

    try {
      const data = await apiRequest('GET', '/races', {}, { page: racesPage + 1, limit: racesPerPage });

      setRaces(data.data);
      setTotalRaces(data.totalRaces);
    } catch (error) {
      setRacesError(error.message || 'Failed to fetch races');
      setNotification({
        open: true,
        message: error.message || 'Failed to fetch races',
        severity: 'error'
      });
    } finally {
      setRacesLoading(false);
    }
  };

  useEffect(() => {
    if (raceDialogOpen) {
      fetchRaces();
    }
  }, [racesPage, racesPerPage, raceDialogOpen]);

  useEffect(() => {
    if (iseditMode && id) {
      fetchStageDetails();
    }
  }, [iseditMode, id]);

  const fetchStageDetails = async () => {
    setLoading(true);
    try {
      const response = await apiRequest('get', `/stages/${id}`);
      if (response.data) {
        const stageData = response.data;

        let raceId = stageData.race_id;
        let raceName = '';

        if (typeof stageData.race_id === 'object') {
          raceId = stageData.race_id._id;
          raceName = `${stageData.race_id.race} (${stageData.race_id.year})`;
        }

        setFormData({
          ...stageData,
          race_id: raceId,
          race_name: raceName
        });
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

  const handleRaceDialogOpen = () => {
    if (iseditMode) {
      return;
    }
    setRaceDialogOpen(true);
  };

  const handleRaceDialogClose = () => {
    setRaceDialogOpen(false);
  };

  const handleRacePageChange = (event, newPage) => {
    setRacesPage(newPage);
  };

  const handleRaceRowsPerPageChange = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRacesPerPage(newRowsPerPage);
    setRacesPage(0);
  };

  const handleRaceSelect = (race) => {
    setFormData({
      ...formData,
      race_id: race._id,
      race_name: `${race.race} (${race.year})`
    });

    if (errors.race_id) {
      setErrors({
        ...errors,
        race_id: undefined
      });
    }

    setRaceDialogOpen(false);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.race_id) newErrors.race_id = 'Race is required';
    if (!formData.stage_number) newErrors.stage_number = 'Stage number is required';
    if (!formData.stage_id) newErrors.stage_id = 'Stage ID is required';
    if (!formData.title) newErrors.title = 'Title is required';
    if (!formData.sub_title) newErrors.sub_title = 'Subtitle is required';
    if (!formData.distance) newErrors.distance = 'Distance is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setNotification({
        open: true,
        message: 'Please fill in all required fields',
        severity: 'error'
      });
      return;
    }

    setSubmitting(true);
    try {
      const apiMethod = !iseditMode ? 'post' : 'put';
      const apiEndpoint = !iseditMode ? '/stages' : `/stages/${id}`;
      const dataToSubmit = { ...formData };
      delete dataToSubmit.race_name;
      dataToSubmit.stage_number = Number(dataToSubmit.stage_number);
      dataToSubmit.distance = Number(dataToSubmit.distance);

      const response = await apiRequest(apiMethod, apiEndpoint, dataToSubmit);

      if (response.data) {
        setNotification({
          open: true,
          message: `Stage ${!iseditMode ? 'created' : 'updated'} successfully`,
          severity: 'success'
        });
        setTimeout(() => {
          navigate('/stages');
        }, 1500);
      } else {
        setNotification({
          open: true,
          message: response.message || `Failed to ${mode} stage`,
          severity: 'error'
        });
      }
    } catch (err) {
      setNotification({
        open: true,
        message: err.message || `An error occurred while ${!iseditMode ? 'creating' : 'updating'} stage`,
        severity: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'stage_number') {
      setFormData({
        ...formData,
        [name]: Number(value)
      });
    } else if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }

    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: undefined
      });
    }
  };

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  if (loading) {
    return (
      <Box p={3} display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Button startIcon={<ArrowLeftOutlined />} variant="outlined" onClick={() => navigate('/stages')} sx={{ mb: 2 }}>
        Back to Stages
      </Button>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" fontWeight="600" mb={3}>
          {!iseditMode ? 'Create New Stage' : 'Edit Stage'}
        </Typography>

        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <Stack direction="column" spacing={1}>
              <Typography variant="body1" fontWeight="500">
                Race*
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',

                  borderColor: errors.race_id ? 'error.main' : 'inherit',

                  backgroundColor: iseditMode ? 'rgba(0, 0, 0, 0.05)' : 'inherit'
                }}
              >
                <Typography variant="body1" color={formData.race_id ? 'textPrimary' : 'text.secondary'}>
                  {formData.race_name || 'No race selected'}
                </Typography>

                {!iseditMode && (
                  <Button variant="contained" size="small" onClick={handleRaceDialogOpen} startIcon={<SearchOutlined />}>
                    {formData.race_id ? 'Change' : 'Select Race'}
                  </Button>
                )}
              </Paper>
              {errors.race_id && (
                <Typography variant="caption" color="error">
                  {errors.race_id}
                </Typography>
              )}

              {iseditMode && (
                <Typography variant="caption" color="text.secondary">
                  Race cannot be changed in edit mode
                </Typography>
              )}
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="Stage Number"
                name="stage_number"
                value={formData.stage_number}
                onChange={handleChange}
                error={!!errors.stage_number}
                helperText={errors.stage_number}
                required
                inputProps={{ min: 1 }}
                sx={{ flex: { md: 1 } }}
              />

              <TextField
                fullWidth
                label="Stage ID"
                name="stage_id"
                value={formData.stage_id}
                onChange={handleChange}
                error={!!errors.stage_id}
                helperText={errors.stage_id}
                required
                placeholder="e.g., race/tour-de-france/1903/stage-2"
                sx={{ flex: { md: 2 } }}
              />
            </Stack>

            <TextField
              fullWidth
              label="Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={!!errors.title}
              helperText={errors.title}
              required
            />

            <TextField
              fullWidth
              label="Subtitle"
              name="sub_title"
              value={formData.sub_title}
              onChange={handleChange}
              error={!!errors.sub_title}
              helperText={errors.sub_title}
              required
            />

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                fullWidth
                type="number"
                label="Distance (km)"
                name="distance"
                value={formData.distance}
                onChange={handleChange}
                error={!!errors.distance}
                helperText={errors.distance}
                required
                InputProps={{
                  endAdornment: <InputAdornment position="end">km</InputAdornment>
                }}
              />
            </Stack>

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button variant="outlined" onClick={() => navigate('/stages')} disabled={submitting}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={submitting}>
                {submitting ? <CircularProgress size={24} /> : !iseditMode ? 'Create Stage' : 'Update Stage'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>

      <Dialog open={raceDialogOpen} onClose={handleRaceDialogClose} fullWidth maxWidth="md">
        <DialogTitle>Select Race</DialogTitle>
        <DialogContent dividers>
          <CustomTable
            columns={raceColumns}
            data={races}
            loading={racesLoading}
            error={racesError}
            page={racesPage}
            rowsPerPage={racesPerPage}
            totalCount={totalRaces}
            onPageChange={handleRacePageChange}
            onRowsPerPageChange={handleRaceRowsPerPageChange}
            onRowClick={handleRaceSelect}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRaceDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={closeNotification}
      />
    </Box>
  );
};

export default StageForm;
