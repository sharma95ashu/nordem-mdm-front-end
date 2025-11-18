import React, { createContext, useEffect, useState, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import AuthAlertDialog from "Components/Shared/AuthAlertDialog";
import { isTokenValidate, extractTokenDetails } from "Helpers/ats.helper";
import { publicPaths, Paths } from "Router/Paths";

const UserContext = createContext();

// User context
const useUserContext = () => {
  return useContext(UserContext);
};

// Context provider wrapper
const UserContextProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [userDetails, setuserDetails] = useState(null);
  const [isAuthErr, setAuthErr] = useState(false);
  const [breadCrumb, setBreadCrumb] = useState({});
  const [permission, setPermission] = useState(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const navigate = useNavigate();
  const location = useLocation();
  let authorization;

  /**
   * handle role based redirection
   */
  const roleBasedRedirect = (auth) => {
    if (isTokenValidate(auth)) {
      // const { role } = extractTokenDetails(auth);
      const role = "ADMIN";

      switch (role) {
        case "ADMIN":
          if (
            location.pathname === "/admin" ||
            location.pathname === "/admin/" ||
            location.pathname === "/"
          )
            if (localStorage.getItem("crmUser") == "true") {
              navigate(Paths.Crm, { replace: true });
            } else {
              navigate(Paths.users, { replace: true });
            }
          break;
        case "INVESTOR":
          if (location.pathname === "/admin") navigate("/", { replace: true });
          break;
        case "DEALER":
          if (location.pathname === "/admin") navigate("/", { replace: true });
          break;
      }
    } else {
      // handled logged out user
      if (
        location.pathname != "/admin" &&
        location.pathname.startsWith("/admin") &&
        !isTokenValidate(authorization)
      ) {
        localStorage.removeItem("Authorization");
        authorization = null;
        navigate(Paths.admin);
      }
    }
  };

  /**
   * handle role based routing
   */
  useEffect(() => {
    const auth = localStorage.getItem("Authorization");

    // Get new token from URL
    roleBasedRedirect(auth);
  }, [location]);

  useEffect(() => {
    // Get existing token
    const auth = localStorage.getItem("Authorization");

    // Get new token from URL
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (auth && auth !== "null" && isTokenValidate(auth) && !urlParams.get("token")) {
      authorization = auth;
      setLoggedIn(true);
      setuserDetails(extractTokenDetails(auth));
      roleBasedRedirect(auth);
    } else {
      authorization = urlParams.get("token");

      /**
       * Check if token available and valid
       */
      const isPublicPath = publicPaths.includes(location.pathname.split("/")[1]);
      if (!isPublicPath) {
        if (!authorization) {
          setAuthErr(true);
          localStorage.removeItem("Authorization");
        } else {
          if (isTokenValidate(authorization)) {
            setAuthToken(authorization);
            localStorage.setItem("Authorization", authorization);
            setuserDetails(extractTokenDetails(authorization));
            setLoggedIn(true);
            window.location.href = "/";
            // roleBasedRedirect(authorization);
          } else {
            setAuthErr(true);
            localStorage.removeItem("Authorization");
            authorization = null;
          }
        }
      }
    }
  }, []);

  return (
    <UserContext.Provider
      value={{
        userDetails,
        authToken,
        loggedIn,
        windowWidth,
        setWindowWidth,
        setLoggedIn,
        setuserDetails,
        setAuthErr,
        setBreadCrumb,
        breadCrumb,
        permission,
        setPermission
      }}>
      {isAuthErr ? null : null}
      {children}
    </UserContext.Provider>
  );
};

export { useUserContext, UserContextProvider };
