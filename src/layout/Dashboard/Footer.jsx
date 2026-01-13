import Stack from '@mui/material/Stack';
import logoIconDark from 'assets/images/icons/site-logo.svg';

export default function Footer() {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', p: '24px 16px 0px', mt: 'auto' }}>
      <img src={logoIconDark} alt="Mantis" sx={{ width: '100%' }} />
    </Stack>
  );
}
