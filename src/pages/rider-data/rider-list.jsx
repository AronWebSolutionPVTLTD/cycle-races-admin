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

import { DeleteOutlined, EditOutlined, EyeOutlined, UserAddOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../table/custom-table';
import CustomSnackbar from '../custom-snackbar';
import apiRequest from '../../api/api-utils';

const RidersPage = () => {
  const navigate = useNavigate();
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRider, setSelectedRider] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const columns = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 170,
      format: (value) => value || 'N/A'
    },
    {
      id: 'nationality',
      label: 'Nationality',
      minWidth: 100,
      format: (value) => value || 'N/A'
    },
    {
      id: 'date_of_birth',
      label: 'Date of Birth',
      minWidth: 120,
      format: (value) =>
        value
          ? new Date(value).toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric'
            })
          : 'N/A'
    },
    {
      id: 'height',
      label: 'Height (cm)',
      align: 'right',
      minWidth: 100,
      format: (value) => (value !== undefined && value !== null ? value : 'N/A')
    },
    {
      id: 'weight',
      label: 'Weight (kg)',
      align: 'right',
      minWidth: 100,
      format: (value) => (value !== undefined && value !== null ? value : 'N/A')
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
                handleViewRider(row);
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
                handleEditRider(row);
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
      fetchRiders();
    }
  };

  const fetchRiders = async () => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = {
        page: page + 1,
        limit: rowsPerPage,
        ...(searchQuery ? { search: searchQuery } : {})
      };

      const data = await apiRequest('GET', '/riders', {}, queryParams);

      setRiders(data.data);
      setTotalCount(data.totalResults);

      if (data.data.length === 0 && searchQuery) {
        showSnackbar('No riders found matching your search criteria', 'info');
      }
    } catch (error) {
      setError(error.message || 'Failed to fetch riders');
      showSnackbar(error.message || 'Failed to fetch riders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchRiders();
  };

  useEffect(() => {
    fetchRiders();
  }, [page, rowsPerPage]);

  // Separate search effect to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchRiders();
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

  const handleRowClick = (rider) => {
    navigate(`/riders/${rider._id}`);
  };

  const handleAddRider = () => {
    navigate('/riders/create');
  };

  const handleViewRider = (rider) => {
    navigate(`/riders/${rider._id}`);
  };

  const handleEditRider = (rider) => {
    navigate(`/riders/${rider._id}/edit`);
  };

  const handleDeleteClick = (rider) => {
    setSelectedRider(rider);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedRider(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRider) return;

    try {
      await apiRequest('DELETE', `/riders/${selectedRider._id}`);
      showSnackbar(`Rider "${selectedRider.name}" deleted successfully`, 'success');
      fetchRiders();
    } catch (err) {
      console.error('Error deleting rider:', err);
      showSnackbar(err.message || 'Failed to delete rider', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedRider(null);
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
          Riders
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Tooltip title="Refresh Data">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ReloadOutlined />}
              onClick={handleRefresh}
              sx={{ flex: { xs: '1', sm: '0 0 auto' } }}
            >
              Refresh
            </Button>
          </Tooltip>
          <Button
            variant="contained"
            color="primary"
            startIcon={<UserAddOutlined />}
            onClick={handleAddRider}
            sx={{ flex: { xs: '1', sm: '0 0 auto' } }}
          >
            Add Rider
          </Button>
        </Stack>
      </Box>

      <Box sx={{ mb: 3 }}>
        <TextField
          label="Search riders"
          variant="outlined"
          fullWidth
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleSearch}
          placeholder="Search riders..."
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
        data={riders}
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
          <DialogContentText>Are you sure you want to delete rider: {selectedRider?.name}? This action cannot be undone.</DialogContentText>
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

export default RidersPage;
