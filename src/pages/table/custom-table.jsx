import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  CircularProgress,
  Alert
} from '@mui/material';

const CustomTable = ({
  columns,
  data = [],
  loading = false,
  error = null,
  totalCount = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  onRowClick
}) => {
  const [localPage, setLocalPage] = useState(0);
  const [localRowsPerPage, setLocalRowsPerPage] = useState(10);

  const handleChangePage = (event, newPage) => {
    if (onPageChange) {
      onPageChange(event, newPage);
    } else {
      setLocalPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    if (onRowsPerPageChange) {
      onRowsPerPageChange(event);
    } else {
      setLocalRowsPerPage(newRowsPerPage);
      setLocalPage(0);
    }
  };
  const currentPage = onPageChange ? page : localPage;
  const currentRowsPerPage = onRowsPerPageChange ? rowsPerPage : localRowsPerPage;
  const paginatedData = onPageChange
    ? data
    : data.slice(currentPage * currentRowsPerPage, currentPage * currentRowsPerPage + currentRowsPerPage);
  const total = onPageChange ? totalCount : data.length;

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message || 'An error occurred while fetching data'}
        </Alert>
      )}

      <TableContainer sx={{ maxHeight: 440, overflow: 'auto' }}>
        <Table stickyHeader aria-label="data table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{
                    minWidth: column.minWidth || 100,
                    position: 'sticky',
                    top: 0,
                    background: '#fff',
                    zIndex: 1,
                    fontWeight: 'bold'
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                  <CircularProgress size={40} />
                </TableCell>
              </TableRow>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((row, index) => (
                <TableRow
                  hover
                  key={row._id || index}
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell key={column.id} align={column.align || 'left'}>
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1">No data available</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        component="div"
        count={total}
        rowsPerPage={currentRowsPerPage}
        page={currentPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default CustomTable;
