import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  InputAdornment,
  Stack
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import apiRequest from '../../api/api-utils';
import { DeleteOutlined, EditOutlined, EyeOutlined, UserAddOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import CustomTable from '../table/custom-table';
import CustomSnackbar from '../custom-snackbar';

const RaceList = () => {
  const navigate = useNavigate();
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRace, setSelectedRace] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const columns = [
    {
      id: 'race',
      label: 'Race',
      minWidth: 170,
      format: (value) => value || 'N/A'
    },
    {
      id: 'class',
      label: 'Class',
      minWidth: 100,
      format: (value) => value || 'N/A'
    },
    {
      id: 'date',
      label: 'Date',
      minWidth: 100,
      format: (value) => {
        if (!value) return 'N/A';

        const [day, month] = value.split('.').map(Number);
        const dateObj = new Date();
        dateObj.setMonth(month - 1);
        dateObj.setDate(day);

        return dateObj.toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit'
        });
      }
    },
    {
      id: 'year',
      label: 'Year',
      minWidth: 100,
      format: (value) => value || 'N/A'
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 150,
      align: 'center',
      format: (_, row) => (
        <Box>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleViewRace(row);
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
                handleEditRace(row);
              }}
            >
              <EditOutlined />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              style={{ color: 'red' }}
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteClick(row);
              }}
            >
              <DeleteOutlined />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ];

  // Show snackbar helper function
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  // Handle search input change with debounce
  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  // Handle search submission
  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      fetchRaces();
    }
  };

  const fetchRaces = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = {
        page: page + 1,
        limit: rowsPerPage,
        ...(searchQuery ? { search: searchQuery } : {})
      };

      const data = await apiRequest('GET', '/races', {}, queryParams);

      setRaces(data.data);
      setTotalCount(data.totalRaces);
    } catch (error) {
      setError(error.message || 'Failed to fetch races');
      showSnackbar(error.message || 'Failed to fetch races', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaces();
  }, [page, rowsPerPage]);

  // Separate search effect to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchRaces();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (race) => {
    navigate(`/race/${race._id}`);
  };

  const handleAddRace = () => {
    navigate('/race/create');
  };

  const handleViewRace = (race) => {
    navigate(`/race/${race._id}`);
  };

  const handleEditRace = (race) => {
    navigate(`/race/${race._id}/edit`);
  };

  const handleDeleteClick = (race) => {
    setSelectedRace(race);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedRace(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRace) return;

    try {
      await apiRequest('DELETE', `/races/${selectedRace._id}`);
      showSnackbar(`Race "${selectedRace.race}" deleted successfully`, 'success');
      fetchRaces();
    } catch (err) {
      console.error('Error deleting race:', err);
      showSnackbar(err.message || 'Failed to delete race', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedRace(null);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'start', sm: 'center' },
          mb: 3,
          gap: 2
        }}
      >
        <Typography variant="h4" component="h1">
          Races
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width={{ xs: '100%', sm: 'auto' }}>
          <Button
            variant="outlined"
            startIcon={<ReloadOutlined />}
            onClick={() => {
              setSearchQuery('');
              fetchRaces();
            }}
            fullWidth={false}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<UserAddOutlined />}
            onClick={handleAddRace}
            fullWidth={false}
            sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}
          >
            Add Race
          </Button>
        </Stack>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Search races"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearch}
          placeholder="Search races..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined />
              </InputAdornment>
            )
          }}
          sx={{ maxWidth: { xs: '100%', sm: '100%', md: '400px' } }}
        />
      </Box>

      <CustomTable
        columns={columns}
        data={races}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        onRowClick={handleRowClick}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteCancel} fullWidth maxWidth="xs">
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure you want to delete race: {selectedRace?.race}? This action cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Using custom snackbar component */}
      <CustomSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={handleCloseSnackbar} />
    </Box>
  );
};

export default RaceList;
