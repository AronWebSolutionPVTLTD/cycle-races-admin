import Flag from 'react-world-flags';

// Enhanced flag rendering with error handling
export const renderFlag = (code) => {
  if (!code || typeof code !== 'string') {
    return <div style={{ width: '30px', height: '20px', marginRight: '10px', backgroundColor: '#f0f0f0' }} />;
  }

  try {
    return <Flag code={code.toUpperCase()} style={{ width: '25px', height: '25px', marginRight: '10px' }} />;
  } catch (err) {
    console.warn(`Error rendering flag for code: ${code}`, err);
    return <div style={{ width: '30px', height: '20px', marginRight: '10px', backgroundColor: '#f0f0f0' }} />;
  }
};
