import { createContext } from 'react';

export const DataContext = createContext({
    cols: [],
    rows: [],
    setRows: () => {},
    preRows: [],
    setPreRows: () => {},
    badRows: [],
    setBadRows: () => {},
    editedRows: [],
    setEditedRows: () => {},
    deletedRows: [],
    setDeletedRows: () => {},
    currRow: null,
    setCurrRow: () => {},
})