import PropTypes from 'prop-types';
import Grid from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import Logo from 'components/logo';
import AuthCard from './AuthCard';
import AuthBackground from './AuthBackground';

export default function AuthWrapper({ children }) {
  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AuthBackground />
      <Grid container direction="column" justifyContent="flex-end" sx={{ minHeight: '100vh' }}>
        <Grid sx={{ px: 3, mt: 3 }} size={12}>
          <Logo to="/" />
        </Grid>
        <Grid size={12}>
          <Grid
            container
            justifyContent="center"
            alignItems="center"
            sx={{ minHeight: { xs: 'calc(100vh - 210px)', sm: 'calc(100vh - 134px)', md: 'calc(100vh - 132px)' } }}
          >
            <Grid>
              <AuthCard>{children}</AuthCard>
            </Grid>
          </Grid>
        </Grid>
       
      </Grid>
    </Box>
  );
}

AuthWrapper.propTypes = { children: PropTypes.node };
