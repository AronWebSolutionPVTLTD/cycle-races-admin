import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
} from '@mui/material';

/**
 * Reusable Delete Confirmation Dialog Component
 * @param {Object} props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {Function} props.onClose - Function to call when dialog is closed
 * @param {Function} props.onConfirm - Function to call when delete is confirmed
 * @param {string} props.title - Title of the item being deleted (optional)
 * @param {string} props.itemType - Type of item being deleted (e.g., "race", "rider", "stage", "team")
 * @param {string} props.dialogTitle - Custom dialog title (optional, defaults to "Confirm Deletion")
 * @param {string} props.message - Custom message (optional, will auto-generate if not provided)
 */
const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  itemType = 'item',
  dialogTitle = 'Confirm Deletion',
  message
}) => {
  // Generate default message if not provided
  const defaultMessage = title
    ? `Are you sure you want to delete ${itemType}: ${title}? This action cannot be undone.`
    : `Are you sure you want to delete this ${itemType}? This action cannot be undone.`;

  const displayMessage = message || defaultMessage;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{dialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText>{displayMessage}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteConfirmationDialog;

