import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, TextField, Button, Typography, Paper, Snackbar, Alert, Divider, Checkbox } from '@mui/material';
import { PlusOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons';
import apiRequest from '../../api/api-utils';
import CustomTable from '../table/custom-table';

const TeamForm = ({ mode = 'create' }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = mode === 'edit';
  const currentYear = new Date().getFullYear();

  const [team, setTeam] = useState({
    teamName: '',
    flag: '',
    year: currentYear,
    riders: []
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  console.log(isEditMode, 'mode');
  const [loading, setLoading] = useState(false);
  const [availableRiders, setAvailableRiders] = useState([]);
  const [selectedRiderIds, setSelectedRiderIds] = useState([]);
  const [tableLoading, setTableLoading] = useState(false);
  const [availableRidersPage, setAvailableRidersPage] = useState(0);
  const [availableRidersRowsPerPage, setAvailableRidersRowsPerPage] = useState(10);
  const [totalAvailableRiders, setTotalAvailableRiders] = useState(0);
  const [teamRidersPage, setTeamRidersPage] = useState(0);
  const [teamRidersRowsPerPage, setTeamRidersRowsPerPage] = useState(10);
  const teamRiderColumns = [
    { id: 'riderName', label: 'Rider Name', minWidth: 170 },
    { id: 'riderCountry', label: 'Country', minWidth: 120 },
    { id: 'riderAge', label: 'Age', minWidth: 80, align: 'center' },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 100,
      align: 'center',
      format: (_, row) => (
        <Button
          size="small"
          color="error"
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            handleRemoveRider(row.rider_id);
          }}
          startIcon={<DeleteOutlined />}
        >
          Remove
        </Button>
      )
    }
  ];

  const availableRiderColumns = [
    {
      id: 'select',
      label: 'Select',
      minWidth: 70,
      align: 'center',
      format: (_, row) => (
        <Checkbox
          checked={selectedRiderIds.includes(row._id)}
          onChange={(e) => handleRiderCheckboxChange(e, row._id)}
          onClick={(e) => e.stopPropagation()}
        />
      )
    },
    { id: 'name', label: 'Rider Name', minWidth: 170 },
    { id: 'nationality', label: 'Country', minWidth: 120 },
    {
      id: 'age',
      label: 'Age',
      minWidth: 80,
      align: 'center',
      format: (_, row) => calculateAge(row.dateOfBirth)
    }
  ];

  const fetchAvailableRiders = async () => {
    setTableLoading(true);
    try {
      const response = await apiRequest(
        'GET',
        '/riders',
        {},
        {
          page: availableRidersPage + 1, 
          limit: availableRidersRowsPerPage
        }
      );

      if (response.data) {
        setAvailableRiders(response.data || []);
        setTotalAvailableRiders(response.totalResults || response.data.length);
      } else {
        showSnackbar('Failed to fetch riders', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to fetch riders', 'error');
    } finally {
      setTableLoading(false);
    }
  };

  useEffect(() => {
    if (!isEditMode) {
      fetchAvailableRiders();
    }

    if (isEditMode) {
      const fetchTeam = async () => {
        setLoading(true);
        try {
          const response = await apiRequest('GET', `/teams/${id}`);
          if (response.data) {
            const teamData = response.data;
            setTeam({
              teamName: teamData.teamName || '',
              flag: teamData.flag || '',
              year: teamData.year || currentYear,
              riders: Array.isArray(teamData.riders)
                ? teamData.riders.map((rider) => ({
                    ...rider,
                    rider_id: rider.rider_id || rider._id
                  }))
                : []
            });
          } else {
            showSnackbar('Failed to fetch team data', 'error');
          }
        } catch (error) {
          showSnackbar(error.message || 'Error fetching team data', 'error');
        } finally {
          setLoading(false);
        }
      };

      fetchTeam();
    }
  }, [id, isEditMode, currentYear, availableRidersPage, availableRidersRowsPerPage]);

  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTeam((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRiderCheckboxChange = (e, riderId) => {
    if (e.target.checked) {
      setSelectedRiderIds((prev) => [...prev, riderId]);
    } else {
      setSelectedRiderIds((prev) => prev.filter((id) => id !== riderId));
    }
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const handleAddRider = () => {
    if (selectedRiderIds.length === 0) {
      showSnackbar('Please select at least one rider', 'warning');
      return;
    }

    const newRiders = selectedRiderIds
      .filter((riderId) => !team.riders.some((r) => r.rider_id === riderId)) 
      .map((riderId) => {
        const rider = availableRiders.find((r) => r._id === riderId);
        if (!rider) return null;

        return {
          rider_id: rider._id,
          riderName: rider.name,
          riderCountry: rider.country || rider.nationality,
          riderAge: calculateAge(rider.dateOfBirth)
        };
      })
      .filter(Boolean); 

    if (newRiders.length === 0) {
      showSnackbar('Selected riders are already added to the team', 'warning');
      return;
    }

    setTeam((prev) => ({
      ...prev,
      riders: [...prev.riders, ...newRiders]
    }));

    setSelectedRiderIds([]);
    showSnackbar(`Added ${newRiders.length} rider(s) to team`, 'success');
  };

  const handleRemoveRider = (riderId) => {
    setTeam((prev) => ({
      ...prev,
      riders: prev.riders.filter((r) => r.rider_id !== riderId)
    }));
    showSnackbar(`Rider remove from the team.`, 'success');
  };

  const handleAvailableRidersPageChange = (event, newPage) => {
    setAvailableRidersPage(newPage);
  };

  const handleAvailableRidersRowsPerPageChange = (event) => {
    setAvailableRidersRowsPerPage(parseInt(event.target.value, 10));
    setAvailableRidersPage(0);
  };

  const handleTeamRidersPageChange = (event, newPage) => {
    setTeamRidersPage(newPage);
  };

  const handleTeamRidersRowsPerPageChange = (event) => {
    setTeamRidersRowsPerPage(parseInt(event.target.value, 10));
    setTeamRidersPage(0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (team.riders.length === 0) {
      showSnackbar('Please add at least one rider to the team', 'warning');
      return;
    }

    setLoading(true);

    try {
      let data = team;
      let response;
      if (isEditMode) {
        response = await apiRequest('PUT', `/teams/${id}`, data);
      } else {
        response = await apiRequest('POST', '/teams', data);
      }

      if (response.data) {
        showSnackbar(isEditMode ? 'Team updated successfully' : 'Team created successfully', 'success');

        setTimeout(() => navigate('/teams'), 1500);
      } else {
        showSnackbar(response.message || 'Operation failed', 'error');
      }
    } catch (error) {
      showSnackbar(error.message || 'An error occurred', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getPaginatedTeamRiders = () => {
    const start = teamRidersPage * teamRidersRowsPerPage;
    const end = start + teamRidersRowsPerPage;
    return team.riders.slice(start, end);
  };

  return (
    <Paper elevation={3} sx={{ width: '100%', mx: 'auto', my: 3, p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 500, mb: 3 }}>
        {isEditMode ? 'Edit Team' : 'Add New Team'}
      </Typography>

      <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              fullWidth
              label="Team Name"
              name="teamName"
              value={team.teamName}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ flex: 2, minWidth: '250px' }}
            />

            <TextField
              fullWidth
              label="Flag"
              name="flag"
              value={team.flag}
              onChange={handleChange}
              required
              variant="outlined"
              helperText="Enter country code (e.g., 'it' for Italy)"
              sx={{ flex: 1, minWidth: '150px' }}
            />

            <TextField
              fullWidth
              label="Year"
              name="year"
              type="number"
              value={team.year}
              onChange={handleChange}
              required
              variant="outlined"
              sx={{ flex: 1, minWidth: '150px' }}
              inputProps={{ min: 1900, max: currentYear + 1 }}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              Team Riders
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Current Team Riders
              </Typography>
              {team.riders.length === 0 ? (
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ textAlign: 'center', py: 2, border: '1px dashed #ccc', borderRadius: 1 }}
                >
                  No riders added to this team yet
                </Typography>
              ) : (
                <CustomTable
                  columns={teamRiderColumns}
                  data={getPaginatedTeamRiders()}
                  loading={false}
                  totalCount={team.riders.length}
                  page={teamRidersPage}
                  rowsPerPage={teamRidersRowsPerPage}
                  onPageChange={handleTeamRidersPageChange}
                  onRowsPerPageChange={handleTeamRidersRowsPerPageChange}
                />
              )}
            </Box>

            {!isEditMode && (
              <Box sx={{ mt: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="subtitle1">Available Riders</Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddRider}
                    startIcon={<PlusOutlined />}
                    disabled={selectedRiderIds.length === 0}
                  >
                    Add Selected Riders
                  </Button>
                </Box>
                <CustomTable
                  columns={availableRiderColumns}
                  data={availableRiders}
                  loading={tableLoading}
                  totalCount={totalAvailableRiders}
                  page={availableRidersPage}
                  rowsPerPage={availableRidersRowsPerPage}
                  onPageChange={handleAvailableRidersPageChange}
                  onRowsPerPageChange={handleAvailableRidersRowsPerPageChange}
                />
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
            <Button variant="outlined" onClick={() => navigate('/teams')} sx={{ px: 3 }}>
              Cancel
            </Button>

            <Button type="submit" variant="contained" color="primary" disabled={loading} startIcon={<SaveOutlined />} sx={{ px: 3 }}>
              {isEditMode ? 'Update Team' : 'Create Team'}
            </Button>
          </Box>
        </Box>
      </form>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleClose} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default TeamForm;
