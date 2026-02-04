import { createContext } from 'react';

export const AppContext = createContext({
    mode: "",
    dialog: "",
    setDialog: () => {},
    busy: false,
    setBusy: () => {},
    errorPage: false,
    file: null,
    setFile: () => {},
})