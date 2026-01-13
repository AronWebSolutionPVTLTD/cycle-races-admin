import PropTypes from 'prop-types';
import { useState } from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import Paper from '@mui/material/Paper';
import EditOutlined from '@ant-design/icons/EditOutlined';
import UserOutlined from '@ant-design/icons/UserOutlined';
import apiRequest from '../../../../../api/api-utils';
import CustomSnackbar from '../../../../../pages/custom-snackbar';

export default function ProfileTab({ adminInfo, onUpdateProfile }) {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: adminInfo?.name || '',
    email: adminInfo?.email || ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  const handleOpenEditDialog = () => {
    setFormData({
      name: adminInfo?.name || '',
      email: adminInfo?.email || ''
    });
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
  };

  const handleOpenViewDialog = () => {
    setViewDialogOpen(true);
  };

  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields',
        severity: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await apiRequest('POST', '/admin/editprofile', {
        name: formData.name,
        email: formData.email
      });

      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });

      if (onUpdateProfile) {
        onUpdateProfile({
          ...adminInfo,
          name: formData.name,
          email: formData.email
        });
      }

      handleCloseEditDialog();
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update profile',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <List component="nav" sx={{ p: 0, '& .MuiListItemIcon-root': { minWidth: 32 } }}>
        <ListItemButton onClick={handleOpenEditDialog}>
          <ListItemIcon>
            <EditOutlined />
          </ListItemIcon>
          <ListItemText primary="Edit Profile" />
        </ListItemButton>
        <ListItemButton onClick={handleOpenViewDialog}>
          <ListItemIcon>
            <UserOutlined />
          </ListItemIcon>
          <ListItemText primary="View Profile" />
        </ListItemButton>
 </List>

      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              margin="normal"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateProfile} 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={16} /> : null}
          >
            Update
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={viewDialogOpen} onClose={handleCloseViewDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ pb: 2 }}>Profile Information</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Stack spacing={3} alignItems="center" sx={{ mb: 3 }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                  fontWeight: 600
                }}
              >
                {adminInfo?.name?.charAt(0)?.toUpperCase() || 'U'}
              </Avatar>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight={600}>
                  {adminInfo?.name || 'User'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {adminInfo?.email || 'No email'}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 2 }} />

            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>
                    Full Name
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500 }}>
                    {adminInfo?.name || 'Not provided'}
                  </Typography>
                </Box>

                <Divider />

                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 600 }}>
                    Email Address
                  </Typography>
                  <Typography variant="body1" sx={{ mt: 0.5, fontWeight: 500 }}>
                    {adminInfo?.email || 'Not provided'}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={handleCloseViewDialog} variant="outlined">
            Close
          </Button>
          <Button 
            onClick={() => {
              handleCloseViewDialog();
              handleOpenEditDialog();
            }} 
            variant="contained"
          >
            Edit Profile
          </Button>
        </DialogActions>
      </Dialog>

      <CustomSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleCloseSnackbar}
      />
    </>
  );
}

ProfileTab.propTypes = {
  adminInfo: PropTypes.object,
  onUpdateProfile: PropTypes.func
};
