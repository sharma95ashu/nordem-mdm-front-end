import * as React from "react";
import { FormDataControlContext } from "Helpers/contexts";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { Flex, Typography } from "antd";
import mainLogo from "Static/img/dashboard_image.svg";
/**
 *
 * @returns Dashboard component
 */
const Home = () => {
  const { setBreadCrumb } = useUserContext();
  React.useEffect(() => {
    setBreadCrumb({
      title: "Home",
      icon: "home",
      path: Paths.users
    });
  }, []);

  const boxStyle = {
    width: "100%"
  };
  return (
    <FormDataControlContext.Provider
      value={
        {
          // formData,
          // setFormData,
          // isLoading,
          // mutateTwoSideOrder: mutateTwoSideOrder.isLoading
        }
      }>
      <Flex gap="middle" align="start" vertical>
        <Flex style={boxStyle} justify={"center"} align={"center"} vertical={true} gap={"large"}>
          <img src={mainLogo} />
          <Typography.Title level={5}>Welcome to RCM Master Data Management</Typography.Title>
        </Flex>
      </Flex>
    </FormDataControlContext.Provider>
  );
};
export default Home;
