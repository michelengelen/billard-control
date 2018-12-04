import React from 'react';

export const UserContext = React.createContext({
  name: '',
  email: '',
  isAuthenticated: false,
  hasAdminRights: false,
  signInUser: () => {},
});
