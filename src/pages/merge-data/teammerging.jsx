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

const TeamMerging = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  // State for old team
  const [oldTeamOptions, setOldTeamOptions] = useState([]);
  const [oldTeamSearchTerm, setOldTeamSearchTerm] = useState('');
  const [oldTeamLoading, setOldTeamLoading] = useState(false);
  const [selectedOldTeam, setSelectedOldTeam] = useState(null);

  // State for new team
  const [newTeamOptions, setNewTeamOptions] = useState([]);
  const [newTeamSearchTerm, setNewTeamSearchTerm] = useState('');
  const [newTeamLoading, setNewTeamLoading] = useState(false);
  const [selectedNewTeam, setSelectedNewTeam] = useState(null);

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

  // Fetch teams for old team dropdown
  const fetchOldTeams = useCallback(async () => {
    if (!oldTeamSearchTerm || oldTeamSearchTerm.length < 2) {
      setOldTeamOptions([]);
      return;
    }

    setOldTeamLoading(true);
    try {
      const data = await apiRequest(
        'GET',
        '/teams',
        {},
        {
          page: 1,
          limit: 50,
          search: oldTeamSearchTerm
        }
      );

      setOldTeamOptions(data.data || []);
    } catch (error) {
      showSnackbar(error.message || 'Failed to fetch teams', 'error');
      setOldTeamOptions([]);
    } finally {
      setOldTeamLoading(false);
    }
  }, [oldTeamSearchTerm]);

  // Fetch teams for new team dropdown
  const fetchNewTeams = useCallback(async () => {
    if (!newTeamSearchTerm || newTeamSearchTerm.length < 2) {
      setNewTeamOptions([]);
      return;
    }

    setNewTeamLoading(true);
    try {
      const data = await apiRequest(
        'GET',
        '/teams',
        {},
        {
          page: 1,
          limit: 50,
          search: newTeamSearchTerm
        }
      );

      setNewTeamOptions(data.data || []);
    } catch (error) {
      showSnackbar(error.message || 'Failed to fetch teams', 'error');
      setNewTeamOptions([]);
    } finally {
      setNewTeamLoading(false);
    }
  }, [newTeamSearchTerm]);

  // Debounced search for old team
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOldTeams();
    }, 500);

    return () => clearTimeout(timer);
  }, [oldTeamSearchTerm, fetchOldTeams]);

  // Debounced search for new team
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchNewTeams();
    }, 500);

    return () => clearTimeout(timer);
  }, [newTeamSearchTerm, fetchNewTeams]);

  // Handle old team selection
  const handleOldTeamSelect = (event, value) => {
    setSelectedOldTeam(value);
    if (value) {
      setOldTeamSearchTerm(formatTeamName(value));
    } else {
      setOldTeamSearchTerm('');
    }
  };

  // Handle new team selection
  const handleNewTeamSelect = (event, value) => {
    setSelectedNewTeam(value);
    if (value) {
      setNewTeamSearchTerm(formatTeamName(value));
    } else {
      setNewTeamSearchTerm('');
    }
  };

  // Handle old team input change
  const handleOldTeamInputChange = (event, value, reason) => {
    if (reason === 'clear' || reason === 'reset') {
      setSelectedOldTeam(null);
      setOldTeamSearchTerm('');
    } else if (reason === 'input') {
      setOldTeamSearchTerm(value);
    }
  };

  // Handle new team input change
  const handleNewTeamInputChange = (event, value, reason) => {
    if (reason === 'clear' || reason === 'reset') {
      setSelectedNewTeam(null);
      setNewTeamSearchTerm('');
    } else if (reason === 'input') {
      setNewTeamSearchTerm(value);
    }
  };

  // Clear old team selection
  const handleClearOldTeam = () => {
    setSelectedOldTeam(null);
    setOldTeamSearchTerm('');
  };

  // Clear new team selection
  const handleClearNewTeam = () => {
    setSelectedNewTeam(null);
    setNewTeamSearchTerm('');
  };

  // Format team name for display
  const formatTeamName = (team) => {
    if (!team) return '';
    return team.teamName || team.name || 'Unnamed Team';
  };

  // Handle merge button click - opens confirmation dialog
  const handleMerge = () => {
    if (!selectedOldTeam) {
      showSnackbar('Please select an old team', 'error');
      return;
    }

    if (!selectedNewTeam) {
      showSnackbar('Please select a new team', 'error');
      return;
    }

    if (selectedOldTeam._id === selectedNewTeam._id) {
      showSnackbar('Old team and new team cannot be the same', 'error');
      return;
    }

    // Open confirmation dialog
    setMergeDialogOpen(true);
  };

  // Handle merge confirmation - actually calls the API
  const handleMergeConfirm = async () => {
    if (!selectedOldTeam || !selectedNewTeam) return;

    try {
      const oldTeamName = formatTeamName(selectedOldTeam);
      const newTeamName = formatTeamName(selectedNewTeam);

      await apiRequest('POST', '/admin/MeargTeamNamewithOldTeam', {
        oldTeamName: oldTeamName,
        newTeamName: newTeamName
      });

      showSnackbar(
        `Team "${oldTeamName}" has been successfully merged into "${newTeamName}"`,
        'success'
      );

      // Close dialog
      setMergeDialogOpen(false);

      // Reset selections after successful merge
      setSelectedOldTeam(null);
      setSelectedNewTeam(null);
      setOldTeamSearchTerm('');
      setNewTeamSearchTerm('');

      // Navigate to team list after 2 seconds
      setTimeout(() => {
        navigate('/teams');
      }, 2000);
    } catch (error) {
      showSnackbar(error.message || 'Failed to merge teams', 'error');
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
          {/* Old Team Section */}
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
              OLD TEAM NAME
            </Typography>
            
            <Autocomplete
              id="old-team-search"
              options={oldTeamOptions}
              getOptionLabel={(option) => formatTeamName(option)}
              loading={oldTeamLoading}
              value={selectedOldTeam}
              onChange={handleOldTeamSelect}
              onInputChange={handleOldTeamInputChange}
              inputValue={oldTeamSearchTerm}
              disableClearable
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  fullWidth
                  placeholder="Search old team..."
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
                          {oldTeamLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {selectedOldTeam && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClearOldTeam();
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
                      {formatTeamName(option)}
                    </Typography>
                    {option.flag && (
                      <Typography variant="caption" color="text.secondary">
                        Country: {option.flag}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              noOptionsText={
                oldTeamSearchTerm.length < 2
                  ? 'Type at least 2 characters to search'
                  : 'No teams found'
              }
            />

            {/* Selected Old Team Display */}
            {selectedOldTeam && (
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
                    {formatTeamName(selectedOldTeam)}
                  </Typography>
                  {selectedOldTeam.flag && (
                    <Typography 
                      variant="caption" 
                      sx={{ color: theme.palette.success.main }}
                    >
                      Country: {selectedOldTeam.flag}
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

          {/* New Team Section */}
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
              NEW TEAM NAME
            </Typography>
            
            <Autocomplete
              id="new-team-search"
              options={newTeamOptions}
              getOptionLabel={(option) => formatTeamName(option)}
              loading={newTeamLoading}
              value={selectedNewTeam}
              onChange={handleNewTeamSelect}
              onInputChange={handleNewTeamInputChange}
              inputValue={newTeamSearchTerm}
              disableClearable
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  fullWidth
                  placeholder="Search new team..."
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
                          {newTeamLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {selectedNewTeam && (
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClearNewTeam();
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
                      {formatTeamName(option)}
                    </Typography>
                    {option.flag && (
                      <Typography variant="caption" color="text.secondary">
                        Country: {option.flag}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}
              noOptionsText={
                newTeamSearchTerm.length < 2
                  ? 'Type at least 2 characters to search'
                  : 'No teams found'
              }
            />

            {/* Selected New Team Display */}
            {selectedNewTeam && (
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
                    {formatTeamName(selectedNewTeam)}
                  </Typography>
                  {selectedNewTeam.flag && (
                    <Typography 
                      variant="caption" 
                      sx={{ color: theme.palette.success.main }}
                    >
                      Country: {selectedNewTeam.flag}
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
            disabled={!selectedOldTeam || !selectedNewTeam}
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
            Merge Teams
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
          Confirm Team Merge
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <DialogContentText sx={{ mb: 3, fontSize: '0.95rem' }}>
            Are you sure you want to merge the following teams? This action cannot be undone.
          </DialogContentText>
          
          {/* Old Team Card */}
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
              Old Team Name
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.error.main,
                fontWeight: 500,
                opacity: 0.85
              }}
            >
              {selectedOldTeam ? formatTeamName(selectedOldTeam) : ''}
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

          {/* New Team Card */}
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
              New Team Name
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.success.main,
                fontWeight: 500,
                opacity: 0.85
              }}
            >
              {selectedNewTeam ? formatTeamName(selectedNewTeam) : ''}
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
              ⚠️ All data from the old team will be merged into the new team. This action cannot be undone.
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

export default TeamMerging;
