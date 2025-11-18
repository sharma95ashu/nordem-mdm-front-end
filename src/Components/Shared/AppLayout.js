import React from "react";
import HeaderLayout from "Components/Shared/HeaderLayout";
import Body from "Components/Shared/Body";
import { useUserContext } from "Hooks/UserContext";

const AppLayout = () => {
  const { loggedIn } = useUserContext();
  return (
    <>
      {loggedIn ? (
        <HeaderLayout>
          <Body />
        </HeaderLayout>
      ) : (
        <Body />
      )}
    </>
  );
};
export default React.memo(AppLayout);
