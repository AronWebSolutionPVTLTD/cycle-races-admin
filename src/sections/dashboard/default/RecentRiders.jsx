import { MoreOutlined } from '@ant-design/icons';
import { Avatar, Box, Card, Chip, IconButton, Stack, Typography } from '@mui/material';
import { renderFlag } from '../../../pages/flag';

export const ModernRecentRiders = ({ riders }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          Recent Riders
        </Typography>
     </Stack>

      <Stack spacing={2}>
        {riders.map((rider, index) => (
          <Card
            key={rider._id}
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: 2,
                transform: 'translateY(-2px)',
                borderColor: 'primary.main'
              }
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  width: 48,
                  height: 48,
                  fontSize: '0.875rem',
                  fontWeight: 600
                }}
              >
                {getInitials(rider.name)}
              </Avatar>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                  {renderFlag(rider?.nationality)}
                  <Typography variant="subtitle1" fontWeight={600} noWrap>
                    {rider.name}
                  </Typography>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                  {rider.birth_place && (
                    <Chip
                      label={rider.birth_place}
                      size="small"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.75rem', borderRadius: 2 }}
                    />
                  )}
                  {rider.height && (
                    <Chip
                      label={`${rider.height}cm`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.75rem', borderRadius: 2 }}
                    />
                  )}
                  {rider.weight && (
                    <Chip
                      label={`${rider.weight}kg`}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ height: 20, fontSize: '0.75rem', borderRadius: 2 }}
                    />
                  )}
                </Stack>
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'right' }}>
                {new Date(rider.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })}
              </Typography>
            </Stack>
          </Card>
        ))}
      </Stack>
    </Box>
  );
};
