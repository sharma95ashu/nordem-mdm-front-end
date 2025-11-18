import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { privateRoutes, publicRoutes } from "Router/Routes";
import Loader from "Components/Shared/Loader";
import TokenValidationWrapper from "./TokenValidateWrapper";

// import { useUserContext } from "Hooks/UserContext";

/**
 * Body of loggedIn User
 * @returns Body of the application
 */
const Body = () => {
  // const { userDetails } = useUserContext();
  const CurrentUserRole = "ADMIN";

  return (
    <div className="App" style={{ padding: "0 10px 0 10px" }}>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Authenticated routes */}
          {privateRoutes[CurrentUserRole].map(({ path, ComponentIn }, key) => {
            return (
              <Route
                key={key}
                path={path}
                element={<TokenValidationWrapper Component={ComponentIn} />}
              />
            );
          })}
          {/* Public routes for all users */}
          {publicRoutes.map(({ path, ComponentIn }, key) => {
            return <Route key={key} path={path} element={<ComponentIn />} />;
          })}
        </Routes>
      </Suspense>
    </div>
  );
};

export default Body;
