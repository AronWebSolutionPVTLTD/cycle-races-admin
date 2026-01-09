// material-ui
import { useTheme } from '@mui/material/styles';

/**
 * if you want to use image instead of <svg> uncomment following.
 * import logoIcon from 'assets/images/logo-icon.svg';
 * import { ThemeMode } from 'config';
 *
 */
// import { ThemeMode } from 'config';
import logoIconDark from 'assets/images/icons/icon.svg';
// ==============================|| LOGO ICON SVG ||============================== //

export default function LogoIcon() {
  const theme = useTheme();

  return (
   <>
      <img src={logoIconDark} alt="Mantis" style={{ width: '100%' }} />
    </>
  );
}
