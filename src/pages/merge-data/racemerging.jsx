import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Autocomplete,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Stack,
  Divider,
  IconButton,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import { SearchOutlined, MergeCellsOutlined, CloseOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../api/api-utils';
import CustomSnackbar from '../custom-snackbar';

const RaceMerging = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State for old race
  const [oldRaceOptions, setOldRaceOptions] = useState([]);
  const [oldRaceSearchTerm, setOldRaceSearchTerm] = useState('');
  const [oldRaceLoading, setOldRaceLoading] = useState(false);
  const [selectedOldRace, setSelectedOldRace] = useState(null);

  // State for new race
  const [newRaceOptions, setNewRaceOptions] = useState([]);
  const [newRaceSearchTerm, setNewRaceSearchTerm] = useState('');
  const [newRaceLoading, setNewRaceLoading] = useState(false);
  const [selectedNewRace, setSelectedNewRace] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Merge confirmation dialog state
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);

  // Show snackbar helper function
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Fetch races for old race dropdown
  const fetchOldRaces = useCallback(async () => {
    if (!oldRaceSearchTerm || oldRaceSearchTerm.length < 2) {
      setOldRaceOptions([]);
      return;
    }

    setOldRaceLoading(true);
    try {
      const data = await apiRequest(
        'GET',
        '/races',
        {},
        {
          page: 1,
          limit: 50,
          search: oldRaceSearchTerm
        }
      );

      setOldRaceOptions(data.data || []);
    } catch (error) {
      showSnackbar(error.message || 'Failed to fetch races', 'error');
      setOldRaceOptions([]);
    } finally {
      setOldRaceLoading(false);
    }
  }, [oldRaceSearchTerm]);

  // Fetch races for new race dropdown
  const fetchNewRaces = useCallback(async () => {
    if (!newRaceSearchTerm || newRaceSearchTerm.length < 2) {
      setNewRaceOptions([]);
      return;
    }

    setNewRaceLoading(true);
    try {
      const data = await apiRequest(
        'GET',
        '/races',
        {},
        {
          page: 1,
          limit: 50,
          search: newRaceSearchTerm
        }
      );

      setNewRaceOptions(data.data || []);
    } catch (error) {
      showSnackbar(error.message || 'Failed to fetch races', 'error');
      setNewRaceOptions([]);
    } finally {
      setNewRaceLoading(false);
    }
  }, [newRaceSearchTerm]);

  // Debounced search for old race
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOldRaces();
    }, 500);

    return () => clearTimeout(timer);
  }, [oldRaceSearchTerm, fetchOldRaces]);

  // Debounced search for new race
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNewRaces();
    }, 500);

    return () => clearTimeout(timer);
  }, [newRaceSearchTerm, fetchNewRaces]);

  // Handle old race selection
  const handleOldRaceSelect = (event, value) => {
    setSelectedOldRace(value);
    if (value) {
      setOldRaceSearchTerm(formatRaceName(value));
    } else {
      setOldRaceSearchTerm('');
    }
  };

  // Handle new race selection
  const handleNewRaceSelect = (event, value) => {
    setSelectedNewRace(value);
    if (value) {
      setNewRaceSearchTerm(formatRaceName(value));
    } else {
      setNewRaceSearchTerm('');
    }
  };

  // Handle old race input change
  const handleOldRaceInputChange = (event, value, reason) => {
    if (reason === 'clear' || reason === 'reset') {
      setSelectedOldRace(null);
      setOldRaceSearchTerm('');
    } else if (reason === 'input') {
      setOldRaceSearchTerm(value);
    }
  };

  // Handle new race input change
  const handleNewRaceInputChange = (event, value, reason) => {
    if (reason === 'clear' || reason === 'reset') {
      setSelectedNewRace(null);
      setNewRaceSearchTerm('');
    } else if (reason === 'input') {
      setNewRaceSearchTerm(value);
    }
  };

  // Clear old race selection
  const handleClearOldRace = () => {
    setSelectedOldRace(null);
    setOldRaceSearchTerm('');
  };

  // Clear new race selection
  const handleClearNewRace = () => {
    setSelectedNewRace(null);
    setNewRaceSearchTerm('');
  };

  // Format race name for display
  const formatRaceName = (race) => {
    if (!race) return '';
    return race.race || race.name || 'Unnamed Race';
  };

  // Handle merge button click - opens confirmation dialog
  const handleMerge = () => {
    if (!selectedOldRace) {
      showSnackbar('Please select an old race', 'error');
      return;
    }

    if (!selectedNewRace) {
      showSnackbar('Please select a new race', 'error');
      return;
    }

    if (selectedOldRace._id === selectedNewRace._id) {
      showSnackbar('Old race and new race cannot be the same', 'error');
      return;
    }

    // Open confirmation dialog
    setMergeDialogOpen(true);
  };

  // Handle merge confirmation - actually calls the API
  const handleMergeConfirm = async () => {
    if (!selectedOldRace || !selectedNewRace) return;

    try {
      const oldRaceName = formatRaceName(selectedOldRace);
      const newRaceName = formatRaceName(selectedNewRace);

      await apiRequest('POST', '/admin/MeargRaceOldRaceWithNewRace', {
        oldRaceName: oldRaceName,
        newRaceName: newRaceName
      });

      showSnackbar(
        `Race "${oldRaceName}" has been successfully merged into "${newRaceName}"`,
        'success'
      );

      // Close dialog
      setMergeDialogOpen(false);

      // Reset selections after successful merge
      setSelectedOldRace(null);
      setSelectedNewRace(null);
      setOldRaceSearchTerm('');
      setNewRaceSearchTerm('');

      // Navigate to race list after 2 seconds
      setTimeout(() => {
        navigate('/races-list');
      }, 2000);
    } catch (error) {
      showSnackbar(error.message || 'Failed to merge races', 'error');
      setMergeDialogOpen(false);
    }
  };

  // Handle merge cancel - closes dialog without calling API
  const handleMergeCancel = () => {
    setMergeDialogOpen(false);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
   
      <Paper 
        elevation={2} 
        sx={{ 
          p: { xs: 3, sm: 4, md: 5 }, 
          maxWidth: 1200, 
          mx: 'auto',
          borderRadius: 2
        }}
      >
        {/* Side by Side Search Section */}
        <Grid container spacing={3} alignItems="flex-start">
          {/* Old Race Section */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1.5, 
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              OLD RACE NAME
            </Typography>
            
            <Autocomplete
              id="old-race-search"
              options={oldRaceOptions}
              getOptionLabel={(option) => formatRaceName(option)}
              loading={oldRaceLoading}
              value={selectedOldRace}
              onChange={handleOldRaceSelect}
              onInputChange={handleOldRaceInputChange}
              inputValue={oldRaceSearchTerm}
              disableClearable
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  fullWidth
                  placeholder="Search old race..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main
                        }
                      }
                    }
                  }}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {oldRaceLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {selectedOldRace && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClearOldRace();
                              }}
                              sx={{ mr: 0.5 }}
                            >
                              <CloseOutlined style={{ fontSize: '14px' }} />
                            </IconButton>
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option._id}>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {formatRaceName(option)}
                    </Typography>
                    {option.class && (
                      <Typography variant="caption" color="text.secondary">
                        Class: {option.class}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              noOptionsText={
                oldRaceSearchTerm.length < 2
                  ? 'Type at least 2 characters to search'
                  : 'No races found'
              }
            />

            {/* Selected Old Race Display */}
            {selectedOldRace && (
              <Box
                sx={{
                  mt: 2,
                  p: 2.5,
                  bgcolor: theme.palette.success.lighter,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.success.light}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="body1" 
                    fontWeight={600}
                    sx={{ color: theme.palette.success.dark, mb: 0.5 }}
                  >
                    {formatRaceName(selectedOldRace)}
                  </Typography>
                  {selectedOldRace.class && (
                    <Typography 
                      variant="caption" 
                      sx={{ color: theme.palette.success.main }}
                    >
                      Class: {selectedOldRace.class}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Grid>

          {/* VS Separator */}
          <Grid size={{ xs: 12, md: 2 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                pt: { xs: 0, md: 4.5 }
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: theme.palette.primary.main,
                  fontWeight: 700,
                  letterSpacing: 1
                }}
              >
                VS
              </Typography>
            </Box>
          </Grid>

          {/* New Race Section */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                mb: 1.5, 
                color: 'text.secondary',
                fontWeight: 500,
                fontSize: '0.875rem'
              }}
            >
              NEW RACE NAME
            </Typography>
            
            <Autocomplete
              id="new-race-search"
              options={newRaceOptions}
              getOptionLabel={(option) => formatRaceName(option)}
              loading={newRaceLoading}
              value={selectedNewRace}
              onChange={handleNewRaceSelect}
              onInputChange={handleNewRaceInputChange}
              inputValue={newRaceSearchTerm}
              disableClearable
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  fullWidth
                  placeholder="Search new race..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'background.paper',
                      '&:hover': {
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main
                        }
                      }
                    }
                  }}
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          {newRaceLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {selectedNewRace && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClearNewRace();
                              }}
                              sx={{ mr: 0.5 }}
                            >
                              <CloseOutlined style={{ fontSize: '14px' }} />
                            </IconButton>
                          )}
                          {params.InputProps.endAdornment}
                        </>
                      )
                    }
                  }}
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props} key={option._id}>
                  <Box>
                    <Typography variant="body1" fontWeight={500}>
                      {formatRaceName(option)}
                    </Typography>
                    {option.class && (
                      <Typography variant="caption" color="text.secondary">
                        Class: {option.class}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              noOptionsText={
                newRaceSearchTerm.length < 2
                  ? 'Type at least 2 characters to search'
                  : 'No races found'
              }
            />

            {/* Selected New Race Display */}
            {selectedNewRace && (
              <Box
                sx={{
                  mt: 2,
                  p: 2.5,
                  bgcolor: theme.palette.success.lighter,
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.success.light}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography 
                    variant="body1" 
                    fontWeight={600}
                    sx={{ color: theme.palette.success.dark, mb: 0.5 }}
                  >
                    {formatRaceName(selectedNewRace)}
                  </Typography>
                  {selectedNewRace.class && (
                    <Typography 
                      variant="caption" 
                      sx={{ color: theme.palette.success.main }}
                    >
                      Class: {selectedNewRace.class}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Grid>
        </Grid>

        {/* Dashed Divider */}
        <Divider 
          sx={{ 
            my: 4,
            borderStyle: 'dashed',
            borderColor: 'divider'
          }} 
        />

        {/* Merge Button */}
        <Stack direction="row" justifyContent="center">
          <Button
            variant="contained"
            color="primary"
            size="large"
            endIcon={<ArrowRightOutlined />}
            onClick={handleMerge}
            disabled={!selectedOldRace || !selectedNewRace}
            sx={{ 
              minWidth: 220,
              py: 1.5,
              px: 4,
              borderRadius: 2,
              fontSize: '1rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              boxShadow: theme.customShadows?.primaryButton || 'none',
              '&:hover': {
                boxShadow: theme.customShadows?.primaryButton || 'none',
                transform: 'translateY(-2px)',
                transition: 'all 0.2s ease-in-out'
              },
              '&:disabled': {
                opacity: 1,
                backgroundColor: theme.palette.action.disabledBackground || 'rgba(0, 0, 0, 0.12)',
                color: theme.palette.text.disabled || 'rgba(0, 0, 0, 0.5)',
                cursor: 'not-allowed',
                '& .MuiButton-endIcon': {
                  opacity: 0.5
                }
              }
            }}
          >
            Merge Races
          </Button>
        </Stack>
      </Paper>

      {/* Merge Confirmation Dialog */}
      <Dialog 
        open={mergeDialogOpen} 
        onClose={handleMergeCancel} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            pb: 1,
            borderBottom: `1px solid ${theme.palette.divider}`,
            fontWeight: 600,
            fontSize: '1.25rem'
          }}
        >
          Confirm Race Merge
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ mb: 3, fontSize: '0.95rem' }}>
            Are you sure you want to merge the following races? This action cannot be undone.
          </DialogContentText>
          
          {/* Old Race Card */}
          <Box
            sx={{
              mb: 2,
              p: 2.5,
              borderRadius: 2,
              bgcolor: theme.palette.error.lighter || 'rgba(211, 47, 47, 0.08)',
              border: `1.5px solid ${theme.palette.error.light || 'rgba(211, 47, 47, 0.3)'}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: `0 4px 12px ${theme.palette.error.light || 'rgba(211, 47, 47, 0.2)'}`
              }
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.error.main,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.7rem',
                mb: 1,
                display: 'block'
              }}
            >
              Old Race Name
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.error.main,
                fontWeight: 500,
                opacity: 0.85
              }}
            >
              {selectedOldRace ? formatRaceName(selectedOldRace) : ''}
            </Typography>
          </Box>

          {/* Arrow Icon */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: theme.palette.primary.lighter || 'rgba(25, 118, 210, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${theme.palette.primary.light || 'rgba(25, 118, 210, 0.3)'}`
              }}
            >
              <ArrowRightOutlined 
                style={{ 
                  fontSize: '20px', 
                  color: theme.palette.primary.main,
                  transform: 'rotate(90deg)'
                }} 
              />
            </Box>
          </Box>

          {/* New Race Card */}
          <Box
            sx={{
              mb: 2,
              p: 2.5,
              borderRadius: 2,
              bgcolor: theme.palette.success.lighter || 'rgba(46, 125, 50, 0.08)',
              border: `1.5px solid ${theme.palette.success.light || 'rgba(46, 125, 50, 0.3)'}`,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: `0 4px 12px ${theme.palette.success.light || 'rgba(46, 125, 50, 0.2)'}`
              }
            }}
          >
            <Typography 
              variant="caption" 
              sx={{ 
                color: theme.palette.success.main,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
                fontSize: '0.7rem',
                mb: 1,
                display: 'block'
              }}
            >
              New Race Name
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.success.main,
                fontWeight: 500,
                opacity: 0.85
              }}
            >
              {selectedNewRace ? formatRaceName(selectedNewRace) : ''}
            </Typography>
          </Box>

          {/* Warning Message */}
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 1.5,
              bgcolor: theme.palette.warning.lighter || 'rgba(237, 108, 2, 0.08)',
              border: `1px solid ${theme.palette.warning.light || 'rgba(237, 108, 2, 0.2)'}`
            }}
          >
            <Typography 
              variant="body2" 
              sx={{ 
                color: theme.palette.warning.dark || 'rgba(237, 108, 2, 0.9)',
                fontSize: '0.875rem',
                lineHeight: 1.6
              }}
            >
              ⚠️ All data from the old race will be merged into the new race. This action cannot be undone.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions 
          sx={{ 
            px: 3, 
            pb: 3,
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          <Button 
            onClick={handleMergeCancel}
            variant="outlined"
            sx={{
              minWidth: 100,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleMergeConfirm} 
            color="primary" 
            variant="contained"
            sx={{
              minWidth: 100,
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: theme.customShadows?.primaryButton || 'none',
              '&:hover': {
                boxShadow: theme.customShadows?.primaryButton || 'none'
              }
            }}
          >
            Merge
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </Box>
  );
};

export default RaceMerging;
