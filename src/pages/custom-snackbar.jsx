import React from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';

/**
 * Reusable Snackbar component for application notifications
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether the snackbar is visible
 * @param {string} props.message - Message to display
 * @param {string} props.severity - Severity level ('success', 'error', 'warning', 'info')
 * @param {number} props.duration - Auto-hide duration in milliseconds
 * @param {Function} props.onClose - Handler for closing the snackbar
 * @param {Object} props.position - Position of the snackbar {vertical, horizontal}
 */
const CustomSnackbar = ({
  open,
  message,
  severity = 'success',
  duration = 5000,
  onClose,
  position = { vertical: 'top', horizontal: 'right' }
}) => {
  return (
    <Snackbar open={open} autoHideDuration={duration} onClose={onClose} anchorOrigin={position}>
      <Alert
        severity={severity}
        variant="filled"
        sx={{ width: '100%' }}
        action={
          <IconButton size="small" color="inherit" onClick={onClose}>
            <CloseOutlined style={{ fontSize: '16px' }} />
          </IconButton>
        }
      >
        {message}
      </Alert>
    </Snackbar>
  );
};

export default CustomSnackbar;
