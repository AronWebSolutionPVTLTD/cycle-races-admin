import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { EditOutlined, DeleteOutlined, PlusOutlined, ReloadOutlined, EyeOutlined, SearchOutlined } from '@ant-design/icons';

import CustomTable from '../table/custom-table';
import CustomSnackbar from '../custom-snackbar';
import apiRequest from '../../api/api-utils';
import DeleteConfirmationDialog from '../delete-confirmation-dialog';

const StageManagement = () => {
  const navigate = useNavigate();
  const [stages, setStages] = useState([]);
  const [races, setRaces] = useState([]);
  const [racesLoading, setRacesLoading] = useState(false);
  const [racesPage, setRacesPage] = useState(1);
  const [racesLimit] = useState(50);
  const [totalRaces, setTotalRaces] = useState(0);
  const [allRacesLoaded, setAllRacesLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedRaceId, setSelectedRaceId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';

      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error';
    }
  };

  const fetchRaces = useCallback(
    async (loadMore = false) => {
      if (allRacesLoaded && !loadMore) return;

      setRacesLoading(true);
      try {
        const params = {
          page: loadMore ? racesPage + 1 : racesPage,
          limit: racesLimit
        };

        const response = await apiRequest('GET', '/races', {}, params);

        if (response.data) {
          if (loadMore) {
            setRaces((prev) => [...prev, ...response.data]);
            setRacesPage((prev) => prev + 1);
          } else {
            setRaces(response.data);
          }
          if (response.totalRaces) {
            setTotalRaces(response.totalRaces);
            setAllRacesLoaded(races.length + response.data.length >= response.totalRaces);
          }
        }
      } catch (err) {
        console.error('Error fetching races:', err);
      } finally {
        setRacesLoading(false);
      }
    },
    [racesPage, racesLimit, races.length, allRacesLoaded]
  );

  const handleRaceDropdownScroll = (event) => {
    const { scrollTop, clientHeight, scrollHeight } = event.target;
    if (scrollHeight - scrollTop - clientHeight < 50 && !racesLoading && !allRacesLoaded) {
      fetchRaces(true);
    }
  };

  const fetchStages = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '/stages';
      const params = {
        page: page + 1,
        limit: rowsPerPage
      };

      if (debouncedSearchQuery) {
        params.search = debouncedSearchQuery;
      }

      if (selectedRaceId !== 'all') {
        endpoint = `/stages/race/${selectedRaceId}`;
      }

      const response = await apiRequest('GET', endpoint, {}, params);
      if (response && response.status === false) {
        setStages([]);
        setTotalCount(0);
        setError({ message: response.message || 'No stages found' });
        setNotification({
          open: true,
          message: response.message || 'No stages found',
          severity: 'info'
        });
      } else if (response && response.data) {
        setStages(response.data);
        setError(null);

        if (response.totalstages) {
          setTotalCount(response.totalstages);
        } else if (response.data.length > 0 && response.data[0].totalstages) {
          setTotalCount(response.data[0].totalstages);
        } else {
          setTotalCount(response.data.length);
        }
      } else {
        setStages([]);
        setTotalCount(0);
        setError({ message: 'Invalid response from server' });
      }
    } catch (err) {
      console.error('API Error:', err);
      setStages([]);
      setTotalCount(0);
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred while fetching stages';

      setError({ message: errorMessage });
      setNotification({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedRaceId, debouncedSearchQuery]);

  useEffect(() => {
    fetchRaces();
  }, [fetchRaces]);

  useEffect(() => {
    fetchStages();
  }, [fetchStages]);

  const handleDeleteClick = (stage) => {
    setSelectedStage(stage);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedStage(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStage) return;

    try {
      const response = await apiRequest('DELETE', `/stages/${selectedStage._id}`);
      if (response && response.status === false) {
        setNotification({
          open: true,
          message: response.message || 'Failed to delete stage',
          severity: 'error'
        });
      } else {
        setNotification({
          open: true,
          message: 'Stage deleted successfully',
          severity: 'success'
        });
        fetchStages();
      }
    } catch (err) {
      setNotification({
        open: true,
        message: err.message || 'An error occurred while deleting stage',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedStage(null);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRaceChange = (event) => {
    setSelectedRaceId(event.target.value);
    setPage(0);
    setError(null);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleRowClick = (row) => {
    navigate(`/stage/${row._id}`);
  };

  const handleViewStage = (row) => {
    navigate(`/stage/${row._id}`);
  };

  const handleEditStage = (row) => {
    navigate(`/stage/${row._id}/edit`);
  };

  const formatRaceName = (race) => {
    if (!race) return 'N/A';
    if (typeof race === 'object') {
      return `${race.race} ${race.year || ''}`.trim();
    }
    return race;
  };

  const columns = [
    { id: 'stage_number', label: 'Stage #', minWidth: 70 },
    { id: 'stage_id', label: 'Stage ID', minWidth: 100 },
    { id: 'title', label: 'Title', minWidth: 150 },
    {
      id: 'sub_title',
      label: 'Route',
      minWidth: 200,
      format: (value) => value || 'N/A'
    },
    {
      id: 'race_id',
      label: 'Race',
      minWidth: 150,
      format: (value) => formatRaceName(value)
    },
    {
      id: 'distance',
      label: 'Distance (km)',
      minWidth: 100,
      format: (value) => (value ? `${value} km` : 'N/A')
    },
    {
      id: 'created_at',
      label: 'Created Date',
      minWidth: 120,
      format: (value) => formatDate(value)
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 150,
      align: 'center',
      format: (value, row) => (
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleViewStage(row);
              }}
            >
              <EyeOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleEditStage(row);
              }}
            >
              <EditOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              color="error"
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row);
              }}
            >
              <DeleteOutlined />
            </IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  const closeNotification = () => {
    setNotification({ ...notification, open: false });
  };

  return (
    <Box p={3}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        mb={3}
        spacing={2}
      >
        <Typography variant="h5" fontWeight="600">
          Stage Management
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width={{ xs: '100%', sm: 'auto' }}>
          <Button variant="outlined" startIcon={<ReloadOutlined />} onClick={() => fetchStages()} fullWidth={false}>
            Refresh
          </Button>
          <Button variant="contained" startIcon={<PlusOutlined />} onClick={() => navigate('/stage/create')} fullWidth={false}>
            Add Stage
          </Button>
        </Stack>
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3} alignItems="flex-start" width="100%">
        <FormControl variant="outlined" size="small" sx={{ minWidth: { xs: '100%', md: 250 } }}>
          <InputLabel id="race-select-label">Filter by Race</InputLabel>
          <Select
            labelId="race-select-label"
            value={selectedRaceId}
            onChange={handleRaceChange}
            label="Filter by Race"
            MenuProps={{
              PaperProps: {
                style: { maxHeight: 300 },
                onScroll: handleRaceDropdownScroll
              }
            }}
          >
            <MenuItem value="all">All Races</MenuItem>
            {races.map((race) => (
              <MenuItem key={race._id} value={race._id}>
                {formatRaceName(race)}
              </MenuItem>
            ))}
            {racesLoading && (
              <Box display="flex" justifyContent="center" py={1}>
                <CircularProgress size={24} />
              </Box>
            )}
          </Select>
        </FormControl>

        <TextField
          placeholder="Search stages..."
          variant="outlined"
          size="small"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            )
          }}
          sx={{ flexGrow: 1 }}
        />
      </Stack>

      <CustomTable
        columns={columns}
        data={stages}
        loading={loading}
        error={error}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onRowClick={handleRowClick}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={selectedStage?.title || selectedStage?.stage_id}
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

export default StageManagement;
