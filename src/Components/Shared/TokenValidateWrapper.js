import { isTokenValidate } from "Helpers/ats.helper";
import { ColorModeContext } from "Helpers/contexts";
import { useUserContext } from "Hooks/UserContext";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";

/**
 * A wrapper component that checks the validity of the authentication token
 * before rendering the wrapped component. If the token is invalid, the user is
 * redirected to a specified path (default is the "/"), and the user is logged out.
 *
 * @param {Object} props - The component props.
 * @param {React.ComponentType} props.Component - The component to render if the token is valid.
 * @param {string} [props.redirectPath="/"] - The path to redirect to if the token is invalid.
 * @returns {React.Element} - The wrapped component or nothing if the token is invalid.
 */
const TokenValidationWrapper = ({ Component, redirectPath = "/" }) => {
  const navigate = useNavigate();
  const auth = localStorage.getItem("Authorization"); // Get the auth token from localStorage
  const { setLoggedIn, setuserDetails } = useUserContext(); // User context to update logged-in status and user details
  const { colorMode, mode } = useContext(ColorModeContext); // Color mode context
  const { toggleColorMode } = colorMode; // Function to toggle the color mode

  /**
   * Function that checks the validity of the authentication token.
   * If the token is invalid and there are private routes for the current user role,
   * it triggers the logout process .
   *
   * @param {Object} auth - The authentication token from localStorage.
   * @param {Object} privateRoutes - A list of routes that require authentication for access.
   * @param {string} CurrentUserRole - The role of the current user.
   * @returns {void}
   */
  if (!isTokenValidate(auth)) {
    // If the token is invalid, logout the user and redirect
    navigate(redirectPath);
    localStorage.clear(); // Clear local storage (auth token and user data)
    setuserDetails({}); // Reset user details
    setLoggedIn(false); // Set the user as logged out
    !mode === true ? toggleColorMode() : "";
  }

  // Return the wrapped component if the token is valid
  return <Component />;
};

export default TokenValidationWrapper;
