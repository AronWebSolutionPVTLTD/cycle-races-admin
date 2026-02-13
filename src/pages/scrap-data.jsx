import React, { useState } from "react";
import {
    Box,
    Typography,
    Autocomplete,
    TextField,
    Button,
    Paper,
    Stack,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    useTheme
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { ArrowRightOutlined } from "@ant-design/icons";
import apiRequest from "../api/api-utils";
import CustomSnackbar from "./custom-snackbar";

const ScrapData = () => {
    const theme = useTheme();
    const currentYear = new Date().getFullYear();
    const maxYear = currentYear + 1;

    const yearOptions = Array.from(
        { length: maxYear - 1960 + 1 },
        (_, i) => String(maxYear - i)
    );
    

    const [fromYear, setFromYear] = useState(null);
    const [toYear, setToYear] = useState(null);
    const [scrapDialogOpen, setScrapDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success"
    });

    const showSnackbar = (message, severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleScrapClick = () => {
        if (!fromYear || !toYear) {
            showSnackbar("Please select both years", "error");
            return;
        }

        if (fromYear > toYear) {
            showSnackbar("From year cannot be greater than To year", "error");
            return;
        }

        setScrapDialogOpen(true);
    };

    const handleScrapConfirm = async () => {
        alert("Scrap data from " + fromYear + " to " + toYear);
        setScrapDialogOpen(false);
        // try {
        //     setLoading(true);

        //     await apiRequest("POST", "/admin/scrapRaceData", {
        //         fromYear,
        //         toYear
        //     });

        //     showSnackbar(
        //         `Data successfully scrapped from ${fromYear} to ${toYear}`,
        //         "success"
        //     );

        //     setScrapDialogOpen(false);
        //     setFromYear(null);
        //     setToYear(null);
        // } catch (error) {
        //     showSnackbar(error.message || "Failed to scrap data", "error");
        //     setScrapDialogOpen(false);
        // } finally {
        //     setLoading(false);
        // }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box sx={{ width: "100%", px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
            <Paper
                elevation={2}
                sx={{
                    p: { xs: 3, sm: 4, md: 5 },
                    maxWidth: 1000,
                    mx: "auto",
                    borderRadius: 2
                }}
            >
                <Typography variant="h5" sx={{ mb: 4, fontWeight: 600 }}>
                    Scrap Data
                </Typography>

                <Grid container spacing={3} alignItems="flex-start">
                    <Grid size={{ xs: 12, md: 5 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{ mb: 1.5, color: "text.secondary", fontWeight: 500 }}
                        >
                            FROM YEAR
                        </Typography>

                        <Autocomplete
                            options={yearOptions}
                            value={fromYear}
                            onChange={(e, value) => setFromYear(value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select from year"
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>

                    <Grid size={{ xs: 12, md: 2 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%",
                                pt: { xs: 0, md: 4.5 }
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{
                                    color: theme.palette.primary.main,
                                    fontWeight: 700
                                }}
                            >
                                TO
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, md: 5 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{ mb: 1.5, color: "text.secondary", fontWeight: 500 }}
                        >
                            TO YEAR
                        </Typography>

                        <Autocomplete
                            options={yearOptions}
                            value={toYear}
                            onChange={(e, value) => setToYear(value)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    placeholder="Select to year"
                                    fullWidth
                                />
                            )}
                        />
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4, borderStyle: "dashed" }} />

                <Stack direction="row" justifyContent="center">
                    <Button
                        variant="contained"
                        size="large"
                        endIcon={<ArrowRightOutlined />}
                        onClick={handleScrapClick}
                        disabled={!fromYear || !toYear || loading}
                        sx={{
                            minWidth: 220,
                            py: 1.5,
                            borderRadius: 2,
                            fontWeight: 600
                        }}
                    >
                        {loading ? "Processing..." : "Scrap Data"}
                    </Button>
                </Stack>
            </Paper>

            <Dialog
                open={scrapDialogOpen}
                onClose={() => setScrapDialogOpen(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    Confirm Scrap
                </DialogTitle>

                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Are you sure you want to scrap data from{" "}
                        <strong>{fromYear}</strong> to{" "}
                        <strong>{toYear}</strong>?
                    </DialogContentText>

                    <Typography variant="body2" color="warning.main">
                        ⚠️ This action can take a few time to complete.
                    </Typography>
                </DialogContent>

                <DialogActions>
                    <Button onClick={() => setScrapDialogOpen(false)}>
                        Cancel
                    </Button>

                    <Button
                        onClick={handleScrapConfirm}
                        variant="contained"
                        disabled={loading}
                    >
                        Confirm Scrap
                    </Button>
                </DialogActions>
            </Dialog>

            <CustomSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={handleCloseSnackbar}
            />
        </Box>
    );
};

export default ScrapData;
