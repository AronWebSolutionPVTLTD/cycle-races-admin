// material-ui
import { useTheme } from '@mui/material/styles';

/**
 * if you want to use image instead of <svg> uncomment following.
 *
 * import logoDark from 'assets/images/logo-dark.svg';
 * import logo from 'assets/images/logo.svg';
 *
 */
import logoIconDark from 'assets/images/icons/site-logo.svg';
// ==============================|| LOGO SVG ||============================== //

export default function LogoMain() {
  const theme = useTheme();
  return (
    <>
      <img src={logoIconDark} alt="Mantis" width="100" />
   </>
  );
}
