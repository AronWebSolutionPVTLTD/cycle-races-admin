import { useTheme } from '@mui/material/styles';
import logoIconDark from 'assets/images/icons/icon.svg';

export default function LogoIcon() {
  const theme = useTheme();

  return (
   <>
      <img src={logoIconDark} alt="Mantis" style={{ width: '100%' }} />
    </>
  );
}
