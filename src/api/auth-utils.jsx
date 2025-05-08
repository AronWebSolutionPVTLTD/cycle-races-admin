export const getToken = () => {
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  const adminInfo = localStorage.getItem('adminInfo');

  return {
    token,
    adminInfo: adminInfo ? JSON.parse(adminInfo) : null
  };
};

export const setToken = (token, adminInfo = null) => {
  localStorage.setItem('token', token);
  sessionStorage.setItem('token', token);

  if (adminInfo) {
    localStorage.setItem('adminInfo', JSON.stringify(adminInfo));
  }
};

export const removeToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
  localStorage.removeItem('adminInfo');
};
