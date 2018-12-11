import React from 'react';

export const UserContext = React.createContext({
  user: {
    name: '',
    email: '',
    isAuthenticated: false,
    hasAdminRights: false,
  },
  signInUser: () => {},
  logoutUser: () => {},
});
