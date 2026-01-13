import React from 'react';
import { Snackbar, Alert, IconButton } from '@mui/material';
import { CloseOutlined } from '@ant-design/icons';

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
