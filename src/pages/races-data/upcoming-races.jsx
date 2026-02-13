import React, { useState, useEffect } from 'react';
import {
    Typography,
    Box,
    Button,
    TextField,
    InputAdornment,
} from '@mui/material';
import apiRequest from '../../api/api-utils';
import { SearchOutlined, } from '@ant-design/icons';
import CustomTable from '../table/custom-table';
import CustomSnackbar from '../custom-snackbar';

const UpcomingRaces = () => {
    const [races, setRaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRaces, setSelectedRaces] = useState([]);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const columns = [
        {
            id: 'select',
            label: '',
            minWidth: 50,
            format: (_, row) => (
                <input
                    type="checkbox"
                    checked={selectedRaces.includes(row._id)}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => {
                        setSelectedRaces((prev) =>
                            prev.includes(row._id) ? [] : [row._id]
                        );
                    }}

                />
            )
        },
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

    ];

    const showSnackbar = (message, severity) => {
        setSnackbar({
            open: true,
            message,
            severity
        });
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setPage(0);
    };

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

            const data = await apiRequest('GET', '/admin/getUpcomingRaces', {}, queryParams);
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

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery !== undefined) {
                fetchRaces();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const handleChangePage = (_, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleSetFeatured = async () => {
        try {
            if (selectedRaces.length === 0) return;
            const raceId = selectedRaces[0];
            await apiRequest("POST", "/admin/setFeaturedRace", {
                race_id: raceId
            });

            showSnackbar("Upcoming race set successfully", "success");
            setSelectedRaces([]);

        } catch (err) {
            showSnackbar(err.message || "Failed to set upcoming race", "error");
        }
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
            </Box>

            <Box
                sx={{
                    mb: 3,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 2,
                    alignItems: "center",
                    flexWrap: "wrap"
                }}
            >
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
                {selectedRaces.length > 0 && (
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSetFeatured}
                    >
                        Add Upcoming Race
                    </Button>
                )}
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
            />
            <CustomSnackbar open={snackbar.open} message={snackbar.message} severity={snackbar.severity} onClose={handleCloseSnackbar} />
        </Box>
    );
};

export default UpcomingRaces;
