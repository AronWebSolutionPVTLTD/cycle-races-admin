import { useTheme } from '@mui/material/styles';
import logoIconDark from 'assets/images/icons/site-logo.svg';

export default function LogoMain() {
  const theme = useTheme();
  return (
    <>
      <img src={logoIconDark} alt="Mantis" width="100" />
   </>
  );
}
