import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Stack,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  FormControlLabel,
  Switch,
  MenuItem,
  Snackbar,
  Divider,
  IconButton
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import MuiAlert from '@mui/material/Alert';
import apiRequest from '../../api/api-utils';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';

const AlertMessage = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const defaultCountryCodes = [
  { code: 'be', label: 'Belgium' },
  { code: 'fr', label: 'France' },
  { code: 'it', label: 'Italy' },
  { code: 'es', label: 'Spain' },
  { code: 'nl', label: 'Netherlands' },
  { code: 'gb', label: 'Great Britain' },
  { code: 'de', label: 'Germany' },
  { code: 'us', label: 'United States' }
];

const RaceForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = mode === 'edit';

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [stageErrors, setStageErrors] = useState([]);
  const [countryCodes, setCountryCodes] = useState(defaultCountryCodes);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const currentYear = new Date().getFullYear();

  const [formData, setFormData] = useState({
    race: '',
    date: null,
    year: currentYear,
    country_code: '',
    class: '1.HC',
    is_stage_race: false
  });
  const [stages, setStages] = useState([
    {
      stage_id: '',
      stage_number: '',
      title: '',
      sub_title: '',
      distance: ''
    }
  ]);
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  const showMessage = (message, severity = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoadingCountries(true);
        const res = await axios.get('https://restcountries.com/v3.1/all?fields=cca2,name');

        const formatted = res.data.map((country) => ({
          code: country.cca2.toLowerCase(),
          label: country.name.common
        }));
        formatted.sort((a, b) => a.label.localeCompare(b.label));
        setCountryCodes(formatted);
      } catch (err) {
        console.error('Failed to fetch countries:', err);
      } finally {
        setLoadingCountries(false);
      }
    };

    fetchCountries();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      const fetchRace = async () => {
        try {
          setLoading(true);
          const response = await apiRequest('GET', `/races/${id}`);
          if (response.data) {
            let dateObj = null;
            if (response.data.date) {
              const [day, month] = response.data.date.split('.');
              dateObj = new Date(currentYear, parseInt(month) - 1, parseInt(day));
            }
            const formattedCountryCode = response.data.country_code ? response.data.country_code.toLowerCase() : '';
            setFormData({
              ...response.data,
              date: dateObj,
              country_code: formattedCountryCode
            });
            if (response.data.is_stage_race) {
              try {
                const stagesResponse = await apiRequest('GET', `/stages/race/${id}`);
                if (stagesResponse.data && stagesResponse.data.length > 0) {
                  setStages(stagesResponse.data);
                }
              } catch (stageErr) {
                console.error('Failed to load stages:', stageErr);
              }
            }
          }
        } catch (err) {
          const errorMsg = err?.message || 'Failed to load race data';
          setError(errorMsg);
          showMessage(errorMsg, 'error');
        } finally {
          setLoading(false);
        }
      };

      fetchRace();
    }
  }, [isEditMode, id, currentYear]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value
      }));
      if (formErrors[name]) {
        setFormErrors((prev) => ({
          ...prev,
          [name]: null
        }));
      }
    },
    [formErrors]
  );

  const handleDateChange = useCallback(
    (date) => {
      setFormData((prev) => ({
        ...prev,
        date: date
      }));
      if (formErrors.date) {
        setFormErrors((prev) => ({
          ...prev,
          date: null
        }));
      }
    },
    [formErrors]
  );

  const handleSwitchChange = useCallback((e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked
    }));
    if (name === 'is_stage_race' && !checked) {
      setStages([
        {
          stage_id: '',
          stage_number: '',
          title: '',
          sub_title: '',
          distance: ''
        }
      ]);
    }
  }, []);

  const handleYearChange = useCallback(
    (e) => {
      const { value } = e.target;
      if (value === '' || (parseInt(value) >= 1800 && parseInt(value) <= currentYear + 10)) {
        setFormData((prev) => ({
          ...prev,
          year: value === '' ? '' : parseInt(value)
        }));
        if (formErrors.year) {
          setFormErrors((prev) => ({
            ...prev,
            year: null
          }));
        }
      }
    },
    [currentYear, formErrors]
  );

  const handleStageChange = useCallback(
    (index, field, value) => {
      setStages((prevStages) => prevStages.map((stage, i) => (i === index ? { ...stage, [field]: value } : stage)));
      if (stageErrors[index]?.[field]) {
        setStageErrors((prev) => {
          const newErrors = [...prev];
          if (newErrors[index]) {
            newErrors[index] = { ...newErrors[index], [field]: null };
          }
          return newErrors;
        });
      }
    },
    [stageErrors]
  );

  const addStage = useCallback(() => {
    setStages((prev) => [
      ...prev,
      {
        stage_id: '',
        stage_number: '',
        title: '',
        sub_title: '',
        distance: ''
      }
    ]);
  }, []);

  const removeStage = useCallback((indexToRemove) => {
    setStages((prev) => {
      const filteredStages = prev.filter((_, index) => index !== indexToRemove);
      return filteredStages;
    });

    setStageErrors((prev) => {
      const newErrors = [...prev];
      newErrors.splice(indexToRemove, 1);
      return newErrors;
    });
  }, []);

  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.race.trim()) errors.race = 'Race name is required';
    if (!formData.date) errors.date = 'Date is required';
    if (!formData.year) {
      errors.year = 'Year is required';
    } else if (isNaN(parseInt(formData.year)) || parseInt(formData.year) < 1800 || parseInt(formData.year) > currentYear + 10) {
      errors.year = `Year must be between 1800 and ${currentYear + 10}`;
    }
    if (!formData.country_code) errors.country_code = 'Country is required';
    if (!formData.class) errors.class = 'Classification is required';

    setFormErrors(errors);
    let stagesValid = true;
    if (formData.is_stage_race) {
      const newStageErrors = stages.map((stage) => {
        const stageError = {};
        if (!stage.stage_number.toString().trim()) stageError.stage_number = 'Stage number is required';
        else if (isNaN(parseInt(stage.stage_number))) stageError.stage_number = 'Stage number must be numeric';

        if (!stage.stage_id.toString().trim()) stageError.stage_id = 'Stage Id is required';
        if (!stage.title.trim()) stageError.title = 'Stage title is required';
        if (!stage.distance.toString().trim()) stageError.distance = 'Distance is required';
        return Object.keys(stageError).length > 0 ? stageError : null;
      });

      setStageErrors(newStageErrors);
      stagesValid = newStageErrors.every((error) => error === null);
    }

    return Object.keys(errors).length === 0 && stagesValid;
  }, [formData, stages, currentYear]);

  const formatDateForApi = (dateObj) => {
    if (!dateObj) return null;

    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');

    return `${day}.${month}`;
  };

  const formatStagesForApi = (stagesData) => {
    return stagesData.map((stage) => ({
      ...stage,
      stage_number: parseInt(stage.stage_number),
      distance: parseFloat(stage.distance)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);

      const dataToSubmit = {
        ...formData,
        date: formatDateForApi(formData.date),
        year: parseInt(formData.year)
      };

      let raceId;

      if (isEditMode) {
        await apiRequest('PUT', `/races/${id}`, dataToSubmit);
        raceId = id;
        showMessage('Race updated successfully');
      } else {
        const response = await apiRequest('POST', '/races', dataToSubmit);
        raceId = response.data._id || response.data.id;
        showMessage('Race created successfully');
      }

      if (formData.is_stage_race && raceId) {
        const formattedStages = formatStagesForApi(stages);
        for (const stage of formattedStages) {
          const stageData = {
            ...stage,
            race_id: raceId,
            race_name: formData.race
          };

          if (stage._id || stage.id) {
            await apiRequest('PUT', `/stages/${stage._id || stage.id}`, stageData);
          } else {
            await apiRequest('POST', '/stages', stageData);
          }
        }

        showMessage('Race and stages saved successfully');
      }
      setTimeout(() => {
        navigate('/races-list');
      }, 1500);
    } catch (err) {
      const errorMessage = err?.message || 'Something went wrong. Please try again.';
      setError(errorMessage);
      showMessage(errorMessage, 'error');

      if (err.errors) {
        const backendErrors = {};
        Object.entries(err.errors).forEach(([field, message]) => {
          backendErrors[field] = message;
        });
        setFormErrors(backendErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/races-list');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 }, mb: 4 }}>
      <Typography variant="h5" component="h2" sx={{ mb: 3 }}>
        {isEditMode ? 'Edit Race' : 'Add New Race'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          <TextField
            fullWidth
            required
            label="Race Name"
            name="race"
            value={formData.race}
            onChange={handleChange}
            error={!!formErrors.race}
            helperText={formErrors.race || ''}
            disabled={submitting}
            inputProps={{ maxLength: 100 }}
          />

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box sx={{ width: '100%' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Race Date"
                  value={formData.date}
                  onChange={handleDateChange}
                  disabled={submitting}
                  views={['day', 'month']}
                  format="dd.MM"
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!formErrors.date,
                      helperText: formErrors.date || 'Format: DD.MM'
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>

            <TextField
              fullWidth
              required
              label="Year"
              name="year"
              type="number"
              value={formData.year}
              onChange={handleYearChange}
              error={!!formErrors.year}
              helperText={formErrors.year || ''}
              disabled={submitting}
              inputProps={{
                min: 1800,
                max: currentYear + 10,
                step: 1
              }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <TextField
              fullWidth
              required
              select
              label="Country"
              name="country_code"
              value={formData.country_code}
              onChange={handleChange}
              error={!!formErrors.country_code}
              helperText={formErrors.country_code || ''}
              disabled={submitting || loadingCountries}
              InputProps={{
                endAdornment: loadingCountries && <CircularProgress size={20} />
              }}
            >
              {countryCodes.map((country) => (
                <MenuItem key={country.code} value={country.code}>
                  {country.label} ({country.code.toUpperCase()})
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              required
              label="Class"
              name="class"
              value={formData.class}
              onChange={handleChange}
              error={!!formErrors.class}
              helperText={formErrors.class || ''}
              disabled={submitting}
              inputProps={{ maxLength: 100 }}
            />
          </Stack>

          <FormControlLabel
            control={<Switch name="is_stage_race" checked={formData.is_stage_race} onChange={handleSwitchChange} disabled={submitting} />}
            label="Stage Race"
          />

          {formData.is_stage_race && (
            <>
              <Divider sx={{ my: 2 }}>
                <Typography variant="subtitle1">Stages</Typography>
              </Divider>

              {stages.map((stage, index) => (
                <Box key={index} sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="h6">Stage {index + 1}</Typography>
                    {stages.length > 1 && (
                      <IconButton color="error" onClick={() => removeStage(index)} disabled={submitting}>
                        <DeleteOutlined />
                      </IconButton>
                    )}
                  </Stack>

                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      required
                      label="Stage Number"
                      type="number"
                      value={stage.stage_number}
                      onChange={(e) => handleStageChange(index, 'stage_number', e.target.value)}
                      error={!!stageErrors[index]?.stage_number}
                      helperText={stageErrors[index]?.stage_number || ''}
                      disabled={submitting}
                      inputProps={{ min: 1, step: 1 }}
                    />
                    <TextField
                      fullWidth
                      required
                      label="Stage Id"
                      value={stage.stage_id}
                      onChange={(e) => handleStageChange(index, 'stage_id', e.target.value)}
                      error={!!stageErrors[index]?.stage_id}
                      helperText={stageErrors[index]?.stage_id || ''}
                      disabled={submitting}
                    />
                    <TextField
                      fullWidth
                      required
                      label="Stage Title"
                      value={stage.title}
                      onChange={(e) => handleStageChange(index, 'title', e.target.value)}
                      error={!!stageErrors[index]?.title}
                      helperText={stageErrors[index]?.title || ''}
                      disabled={submitting}
                    />

                    <TextField
                      fullWidth
                      label="Subtitle (Optional)"
                      value={stage.sub_title}
                      onChange={(e) => handleStageChange(index, 'sub_title', e.target.value)}
                      disabled={submitting}
                    />

                    <TextField
                      fullWidth
                      required
                      label="Distance (km)"
                      type="number"
                      value={stage.distance}
                      onChange={(e) => handleStageChange(index, 'distance', e.target.value)}
                      error={!!stageErrors[index]?.distance}
                      helperText={stageErrors[index]?.distance || ''}
                      disabled={submitting}
                      inputProps={{ min: 0, step: 0.1 }}
                    />
                  </Stack>
                </Box>
              ))}

              <Button
                startIcon={<PlusOutlined />}
                onClick={addStage}
                disabled={submitting}
                variant="outlined"
                sx={{ alignSelf: 'flex-start' }}
              >
                Add Stage
              </Button>
            </>
          )}
        </Stack>

        <Box
          sx={{
            mt: 4,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'flex-end',
            gap: 2
          }}
        >
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={submitting}
            fullWidth={{ xs: true, sm: false }}
            sx={{ order: { xs: 2, sm: 1 } }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : null}
            fullWidth={{ xs: true, sm: false }}
            sx={{ order: { xs: 1, sm: 2 } }}
          >
            {submitting ? 'Saving...' : isEditMode ? 'Update Race' : 'Create Race'}
          </Button>
        </Box>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <AlertMessage onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </AlertMessage>
      </Snackbar>
    </Paper>
  );
};

export default RaceForm;
