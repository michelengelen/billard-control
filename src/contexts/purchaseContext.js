import React from 'react';

export const PurchaseContext = React.createContext({
  membernumber: -1,
  memberId: '',
  memberData: {},
  journal: [],
  setMember: () => {},
  setPurchaseJournal: () => {},
});
