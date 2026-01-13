import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Stack,
  TextField,
  Button,
  Paper,
  Typography,
  CircularProgress,
  InputAdornment,
  Alert,
  FormHelperText,
  Snackbar
} from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useNavigate, useParams } from 'react-router-dom';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import apiRequest from '../../api/api-utils';
import MuiAlert from '@mui/material/Alert';
import { UploadOutlined } from '@ant-design/icons';

const AlertMessage = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const RiderForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = mode === 'edit';

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const [formData, setFormData] = useState({
    name: '',
    normalized_name: '',
    nationality: '',
    birth_place: '',
    date_of_birth: null,
    height: '',
    weight: '',
    image_url: ''
  });

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
    if (isEditMode && id) {
      const fetchRider = async () => {
        try {
          setLoading(true);
          const response = await apiRequest('GET', `/riders/${id}`);
          if (response.data) {
            setFormData({
              ...response.data,
              date_of_birth: response.data.date_of_birth ? new Date(response.data.date_of_birth) : null
            });

            if (response.data.image_url) {
              setImagePreview(response.data.image_url);
            }
          }
        } catch (err) {
          const errorMsg = err?.message || 'Failed to load rider data';
          setError(errorMsg);
          showMessage(errorMsg, 'error');
        } finally {
          setLoading(false);
        }
      };

      fetchRider();
    }
  }, [isEditMode, id]);

  useEffect(() => {
    if (formData.name) {
      const normalized = formData.name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');

      setFormData((prev) => ({
        ...prev,
        normalized_name: normalized
      }));
    }
  }, [formData.name]);

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
        date_of_birth: date
      }));
      if (formErrors.date_of_birth) {
        setFormErrors((prev) => ({
          ...prev,
          date_of_birth: null
        }));
      }
    },
    [formErrors]
  );

  const handleNumericChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        if ((value === '.' || value === '0') && value.length === 1) {
          return;
        }
        handleChange(e);
      }
    },
    [handleChange]
  );

  const handleImageUpload = useCallback(
    async (file) => {
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          image_url: 'Image size should be less than 5MB'
        }));
        return;
      }
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setFormErrors((prev) => ({
          ...prev,
          image_url: 'Only JPG, PNG, GIF and WEBP images are allowed'
        }));
        return;
      }
      const reader = new FileReader();

      reader.onload = (e) => {
        const base64String = e.target.result;
        setImagePreview(base64String);
        setFormData((prev) => ({
          ...prev,
          image_url: base64String
        }));
      };

      reader.onerror = () => {
        setFormErrors((prev) => ({
          ...prev,
          image_url: 'Failed to read image file'
        }));
      };

      reader.readAsDataURL(file);
      if (formErrors.image_url) {
        setFormErrors((prev) => ({
          ...prev,
          image_url: null
        }));
      }
    },
    [formErrors]
  );

  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Name is required';
    if (!formData.nationality.trim()) errors.nationality = 'Nationality is required';
    if (!formData.birth_place.trim()) errors.birth_place = 'Birth place is required';
    if (!formData.date_of_birth) errors.date_of_birth = 'Date of birth is required';
    if (!formData.height) {
      errors.height = 'Height is required';
    } else if (isNaN(parseFloat(formData.height)) || parseFloat(formData.height) <= 0) {
      errors.height = 'Height must be a positive number';
    }
    if (!formData.weight) {
      errors.weight = 'Weight is required';
    } else if (isNaN(parseFloat(formData.weight)) || parseFloat(formData.weight) <= 0) {
      errors.weight = 'Weight must be a positive number';
    }
    if (!isEditMode && !formData.image_url) {
      errors.image_url = 'Rider image is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, isEditMode]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      setError(null);
      const dataToSubmit = {
        ...formData,
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight)
      };

      if (isEditMode) {
        await apiRequest('PUT', `/riders/${id}`, dataToSubmit);
        showMessage('Rider updated successfully');
      } else {
        await apiRequest('POST', '/riders', dataToSubmit);
        showMessage('Rider created successfully');
      }
      setTimeout(() => {
        navigate('/riders');
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
    navigate('/riders');
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      image_url: ''
    }));
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
        {isEditMode ? 'Edit Rider' : 'Add New Rider'}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <TextField
              fullWidth
              required
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name || ''}
              disabled={submitting}
              inputProps={{ maxLength: 100 }}
            />

            <TextField
              fullWidth
              label="Normalized Name"
              name="normalized_name"
              value={formData.normalized_name}
              onChange={handleChange}
              error={!!formErrors.normalized_name}
              helperText={formErrors.normalized_name || 'Auto-generated from name'}
              disabled={true}
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <TextField
              fullWidth
              required
              label="Nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              error={!!formErrors.nationality}
              helperText={formErrors.nationality || ''}
              disabled={submitting}
              inputProps={{ maxLength: 50 }}
            />

            <TextField
              fullWidth
              required
              label="Birth Place"
              name="birth_place"
              value={formData.birth_place}
              onChange={handleChange}
              error={!!formErrors.birth_place}
              helperText={formErrors.birth_place || ''}
              disabled={submitting}
              inputProps={{ maxLength: 100 }}
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3}>
            <Box sx={{ width: '100%' }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date of Birth"
                  value={formData.date_of_birth}
                  onChange={handleDateChange}
                  disabled={submitting}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      required: true,
                      error: !!formErrors.date_of_birth,
                      helperText: formErrors.date_of_birth || ''
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>

            <TextField
              fullWidth
              required
              label="Height"
              name="height"
              type="text"
              value={formData.height}
              onChange={handleNumericChange}
              error={!!formErrors.height}
              helperText={formErrors.height || ''}
              disabled={submitting}
              InputProps={{
                endAdornment: <InputAdornment position="end">cm</InputAdornment>
              }}
              inputProps={{ inputMode: 'decimal' }}
            />

            <TextField
              fullWidth
              required
              label="Weight"
              name="weight"
              type="text"
              value={formData.weight}
              onChange={handleNumericChange}
              error={!!formErrors.weight}
              helperText={formErrors.weight || ''}
              disabled={submitting}
              InputProps={{
                endAdornment: <InputAdornment position="end">kg</InputAdornment>
              }}
              inputProps={{ inputMode: 'decimal' }}
            />
          </Stack>

          <Box sx={{ width: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Rider Image{' '}
              {!isEditMode && (
                <Typography component="span" color="error">
                  *
                </Typography>
              )}
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadOutlined />}
                  disabled={submitting}
                  sx={{ width: { xs: '100%', sm: 'auto' } }}
                >
                  {imagePreview ? 'Change Image' : 'Upload Image'}
                  <input
                    type="file"
                    hidden
                    accept="image/jpeg,image/png,image/gif,image/webp"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageUpload(e.target.files[0]);
                      }
                    }}
                  />
                </Button>

                {imagePreview && (
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={handleRemoveImage}
                    disabled={submitting}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Remove Image
                  </Button>
                )}
              </Stack>

              {imagePreview && (
                <Box
                  sx={{
                    mt: 2,
                    maxWidth: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Rider preview"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    {formData.image_url !== imagePreview
                      ? 'Image will be updated on save'
                      : isEditMode
                        ? 'Current rider image'
                        : 'Image preview'}
                  </Typography>
                </Box>
              )}

              {formErrors.image_url && <FormHelperText error>{formErrors.image_url}</FormHelperText>}
            </Box>
          </Box>
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
            {submitting ? 'Saving...' : isEditMode ? 'Update Rider' : 'Create Rider'}
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

export default RiderForm;
