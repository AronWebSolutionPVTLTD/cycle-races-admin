import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Avatar,
  Tooltip,
  Stack
} from '@mui/material';
import {
  SearchOutlined,
  PlusOutlined,
  ReloadOutlined,
  CalendarOutlined,
  GlobalOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import CustomTable from '../table/custom-table';
import CustomSnackbar from '../custom-snackbar';
import apiRequest from '../../api/api-utils';
import DeleteConfirmationDialog from '../delete-confirmation-dialog';

const TeamList = () => {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter states
  const [anchorElYear, setAnchorElYear] = useState(null);
  const [anchorElCountry, setAnchorElCountry] = useState(null);
  const [years, setYears] = useState([]);
  const [countries, setCountries] = useState([]);

  // Active filters
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Show snackbar function
  const showSnackbar = useCallback((message, severity = 'info') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  }, []);

  // Close snackbar function
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = '/teams';
      let params = {
        page: page + 1,
        limit: rowsPerPage,
        ...(searchTerm ? { search: searchTerm } : {})
      };

      // Apply filters if selected
      if (selectedYear) {
        endpoint = `/teams/year/${selectedYear}`;
      } else if (selectedCountry) {
        endpoint = `/teams/flag/${selectedCountry}`;
      }

      const response = await apiRequest('GET', endpoint, {}, params);
      const teamsData = response.data || [];
      setTeams(teamsData);
      setTotalCount(response.totalteam || 0);
      setError(null);

      // Extract unique years and countries for filters
      // Only do this when loading all teams (no filters active)
      if (!selectedYear && !selectedCountry) {
        const uniqueYears = [...new Set(teamsData.map((team) => team.year))].sort((a, b) => b - a);
        const uniqueCountries = [...new Set(teamsData.map((team) => team.flag))].filter(Boolean).sort();

        setYears(uniqueYears);
        setCountries(uniqueCountries);
      }

      // Show message when search returns no results
      if (searchTerm && teamsData.length === 0) {
        showSnackbar('No teams found matching your search criteria', 'info');
      }
    } catch (err) {
      setError({ message: err.message || 'Failed to fetch teams' });
      showSnackbar(err.message || 'Failed to fetch teams', 'error');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, selectedYear, selectedCountry, searchTerm, showSnackbar]);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Handle search input change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== undefined) {
        setPage(0); // Reset to first page when searching
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRowClick = (team) => {
    navigate(`/team/${team._id}`);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      fetchTeams();
    }
  };

  const handleRefresh = () => {
    setSelectedYear(null);
    setSelectedCountry(null);
    setSearchTerm('');
    fetchTeams();
  };

  // Filter menu handlers
  const handleFilterMenu = (filterType) => (event) => {
    if (filterType === 'year') {
      setAnchorElYear(event.currentTarget);
    } else if (filterType === 'country') {
      setAnchorElCountry(event.currentTarget);
    }
  };

  const handleCloseMenu = (filterType) => () => {
    if (filterType === 'year') {
      setAnchorElYear(null);
    } else if (filterType === 'country') {
      setAnchorElCountry(null);
    }
  };

  const selectFilter = (filterType, value) => {
    if (filterType === 'year') {
      setSelectedCountry(null);
      setSelectedYear(value);
      setAnchorElYear(null);
      showSnackbar(`Filtered by year: ${value}`, 'info');
    } else if (filterType === 'country') {
      setSelectedYear(null);
      setSelectedCountry(value);
      setAnchorElCountry(null);
      showSnackbar(`Filtered by country: ${value.toUpperCase()}`, 'info');
    }
    setPage(0);
  };

  // Clear filters
  const clearFilters = () => {
    setSelectedYear(null);
    setSelectedCountry(null);
    setPage(0);
    showSnackbar('Filters cleared', 'info');
  };

  // Team actions
  const handleViewTeam = (team) => {
    navigate(`/team/${team._id}`);
  };

  const handleEditTeam = (team) => {
    navigate(`/team/${team._id}/edit`);
  };

  const handleDeleteClick = (team) => {
    setSelectedTeam(team);
    setDeleteDialogOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setSelectedTeam(null);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedTeam) return;

    try {
      await apiRequest('DELETE', `/teams/${selectedTeam._id}`);
      showSnackbar(`Team "${selectedTeam.teamName}" deleted successfully`, 'success');
      fetchTeams();
    } catch (err) {
      console.error('Error deleting team:', err);
      showSnackbar(err.message || 'Failed to delete team', 'error');
    } finally {
      setDeleteDialogOpen(false);
      setSelectedTeam(null);
    }
  };

  const columns = [
    { id: 'teamName', label: 'Team Name', minWidth: 150 },
    {
      id: 'flag',
      label: 'Country',
      minWidth: 120,
      format: (value) =>
        value ? (
          <Chip
            avatar={<Avatar alt={value} src={`/flags/${value}.png`} />}
            label={value.toUpperCase()}
            size="small"
            color="primary"
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              selectFilter('country', value);
            }}
          />
        ) : (
          'N/A'
        )
    },
    {
      id: 'year',
      label: 'Year',
      minWidth: 80,
      format: (value) => (
        <Chip
          label={value}
          size="small"
          color="secondary"
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            selectFilter('year', value);
          }}
        />
      )
    },
    {
      id: 'riders',
      label: 'Riders',
      minWidth: 100,
      format: (riders) => (riders ? riders.length : 0)
    },
    {
      id: 'created_at',
      label: 'Created',
      minWidth: 120,
      format: (value) => (value ? new Date(value).toLocaleDateString() : 'N/A')
    },
    {
      id: 'updated_at',
      label: 'Updated',
      minWidth: 120,
      format: (value) => (value ? new Date(value).toLocaleDateString() : 'N/A')
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
                handleViewTeam(row);
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
                handleEditTeam(row);
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

  return (
    <Box sx={{ width: '100%', px: { xs: 2, sm: 3 }, py: 3 }}>
      {/* Header Section with Title, Filters and Actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'start', md: 'center' },
          mb: 3,
          gap: 2
        }}
      >
        {/* Title with Active Filters */}
        <Box>
          <Typography variant="h5" component="h1" sx={{ mb: 1 }}>
            Teams
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {selectedYear && (
              <Chip
                label={`Year: ${selectedYear}`}
                color="secondary"
                onDelete={clearFilters}
                deleteIcon={<CloseCircleOutlined />}
                size="small"
              />
            )}
            {selectedCountry && (
              <Chip
                avatar={<Avatar alt={selectedCountry} src={`/flags/${selectedCountry}.png`} />}
                label={`Country: ${selectedCountry.toUpperCase()}`}
                color="primary"
                onDelete={clearFilters}
                deleteIcon={<CloseCircleOutlined />}
                size="small"
              />
            )}
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
            width: { xs: '100%', sm: 'auto' }
          }}
        >
          {/* Filters and Actions */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ width: { xs: '100%', sm: 'auto' } }}>
            {/* Year Filter */}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<CalendarOutlined />}
              onClick={handleFilterMenu('year')}
              disabled={!years.length}
              sx={{ width: '120px' }}
              size="small"
            >
              Year
            </Button>
            <Menu anchorEl={anchorElYear} open={Boolean(anchorElYear)} onClose={handleCloseMenu('year')} sx={{ maxHeight: '300px' }}>
              {years.map((year) => (
                <MenuItem key={year} onClick={() => selectFilter('year', year)}>
                  {year}
                </MenuItem>
              ))}
            </Menu>

            {/* Country Filter */}
            <Button
              variant="outlined"
              color="primary"
              startIcon={<GlobalOutlined />}
              onClick={handleFilterMenu('country')}
              disabled={!countries.length}
              sx={{ width: '120px' }}
              size="small"
            >
              Country
            </Button>
            <Menu
              anchorEl={anchorElCountry}
              open={Boolean(anchorElCountry)}
              onClose={handleCloseMenu('country')}
              sx={{ maxHeight: '300px' }}
            >
              {countries.map((country) => (
                <MenuItem key={country} onClick={() => selectFilter('country', country)}>
                  {country.toUpperCase()}
                </MenuItem>
              ))}
            </Menu>

            {/* Refresh Button */}
            <Tooltip title="Refresh Data">
              <Button
                variant="outlined"
                color="primary"
                startIcon={<ReloadOutlined />}
                onClick={handleRefresh}
                // sx={{ flex: { xs: '1', sm: '0 0 auto' } }}
                sx={{ width: '120px' }}
              >
                Refresh
              </Button>
            </Tooltip>

            {/* Add Team Button */}
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlusOutlined />}
              onClick={() => navigate('/team/create')}
              sx={{ width: '120px' }}
            >
              Add Team
            </Button>
          </Stack>
        </Box>
      </Box>
      {/* Search Field */}
      <Box sx={{ mb: 3 }}>
        <TextField
          size="small"
          placeholder="Search teams..."
          value={searchTerm}
          onChange={handleSearchChange}
          onKeyDown={handleSearchKeyDown}
          fullWidth
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

      {/* Data Table */}
      <CustomTable
        columns={columns}
        data={teams}
        loading={loading}
        error={error}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onRowClick={handleRowClick}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title={selectedTeam?.teamName}
        itemType="team"
      />

      {/* Custom Snackbar */}
      <CustomSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={handleCloseSnackbar} />
    </Box>
  );
};

export default TeamList;
