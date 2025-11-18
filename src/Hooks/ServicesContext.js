import React, { useMemo } from "react";
import { useQueryClient } from "react-query";

import { apiConfig } from "Services/config";
import { createServices } from "Services";
import { createContext, useContext } from "react";
import { useSnackbar } from "notistack";
import { MESSAGES } from "Helpers/ats.constants";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "./UserContext";

export const servicesContext = createContext(undefined);

export function useServices() {
  return useContext(servicesContext);
}

export function useApi() {
  return useServices().apiService;
}

function useApiMiddleware() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const { setLoggedIn } = useUserContext();
  return useMemo(
    () => ({
      onError: (error) => {
        if (error && error.status) {
          if (
            error.status === 404 ||
            error.status === 500 ||
            error.status === 422 ||
            error.status === 409 ||
            error.status === 403
          ) {
            let errors = error.errors?.length > 0 ? error.errors : null;
            if (errors) {
              enqueueSnackbar(errors[0].message || error.message || MESSAGES.API_ERROR, {
                variant: "error",
                anchorOrigin: { vertical: "top", horizontal: "right" }
              });
              // Check validation error
            } else if (error?.message) {
              enqueueSnackbar(error.message || MESSAGES.API_ERROR, {
                variant: "error",
                anchorOrigin: { vertical: "top", horizontal: "right" }
              });
            }
          } else if (error.status === 401) {
            localStorage.removeItem("Authorization");
            enqueueSnackbar(error.message, {
              variant: "error",
              anchorOrigin: { vertical: "top", horizontal: "right" }
            });
            setLoggedIn(false);
            navigate("/");
          }
        } else if (error) {
          enqueueSnackbar(MESSAGES.API_ERROR, {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" }
          });
        }
      }
    }),
    [queryClient]
  );
}

export const ServicesProvider = ({ children }) => {
  const middleware = useApiMiddleware();
  const services = useMemo(() => createServices(apiConfig, undefined, middleware), [middleware]);

  return <servicesContext.Provider value={services}>{children}</servicesContext.Provider>;
};
