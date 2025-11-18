import React, { createContext, useContext } from 'react';

// Create a context for the theme
const ThemeContext = createContext();

// Custom hook to consume the theme
export const useTheme = () => useContext(ThemeContext);

// Provider component to wrap around the app
export const ThemeProvider = ({ theme, children }) => (

    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>

);