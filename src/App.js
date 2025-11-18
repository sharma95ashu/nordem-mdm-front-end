import { useState, useMemo, useEffect } from "react";
import "./App.scss";

import { ConfigProvider, theme } from "antd";
import { ColorModeContext } from "Helpers/contexts";
import { UserContextProvider } from "Hooks/UserContext";
import AppLayout from "Components/Shared/AppLayout";
import { QueryClient, QueryClientProvider } from "react-query";
import { ServicesProvider } from "Hooks/ServicesContext";
import { SnackbarProvider } from "notistack";
import { getDesignTokens } from "Helpers/ats.helper";

import { ThemeProvider } from "./ThemeProvider";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      cacheTime: 0,
      retry: false,
      refetchOnWindowFocus: false
    }
  }
});

function App() {
  /* Theme mod configuration */
  const [mode, setMode] = useState(() => {
    const storedMode = localStorage.getItem("mode");
    return storedMode ? JSON.parse(storedMode) : true;
  });

  // Save mode value to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("mode", JSON.stringify(mode));
  }, [mode]);

  const colorMode = useMemo(
    () => ({
      // The dark mode switch would invoke this method
      toggleColorMode: () => {
        setMode((prevMode) => !prevMode);
      }
    }),
    []
  );

  // By static function

  // Update the theme only if the mode changes
  // const theme = useMemo(() => createTheme(getDesignTokens(mode)), [mode]);
  return (
    <>
      <ConfigProvider theme={getDesignTokens(mode, theme)}>
        <ThemeProvider theme={getDesignTokens(mode, theme)}>
          <QueryClientProvider client={queryClient}>
            <ColorModeContext.Provider value={{ colorMode, mode }}>
              {/* <ThemeProvider theme={theme}> */}
              <SnackbarProvider autoHideDuration={2500} maxSnack={1}>
                <UserContextProvider>
                  <ServicesProvider>
                    {/* <CssBaseline /> */}
                    <div className={"appContainer " + mode ? "light" : "dark"}>
                      <AppLayout />
                    </div>
                  </ServicesProvider>
                </UserContextProvider>
              </SnackbarProvider>
              {/* </ThemeProvider> */}
            </ColorModeContext.Provider>
          </QueryClientProvider>
        </ThemeProvider>
      </ConfigProvider>
    </>
  );
}

export default App;
