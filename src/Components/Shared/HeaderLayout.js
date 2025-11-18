/* eslint-disable no-empty */
import { useUserContext } from "Hooks/UserContext";
import React, { useContext, useEffect, useState } from "react";

import { useLocation } from "react-router-dom";
import { NavLink, useNavigate } from "react-router-dom";
import { MenuFoldOutlined, MenuUnfoldOutlined, SearchOutlined } from "@ant-design/icons";
import { Layout, Menu, Button, Switch, Flex, Row, Col, theme, Modal, Grid } from "antd";
import { ColorModeContext } from "Helpers/contexts";
import { MenuList } from "Static/utils/menuList";

import myLogo from "Static/img/dual_logo.svg";
// import darkLogo from "Static/img/dark_logo.svg";
import collapse_Logo from "Static/img/collapse_logo.svg";
import BreadcrumbBox from "./BreadcrumbBox";
import { excludedBreadCrumb, excludedPaths, returnMenuIcon } from "Helpers/ats.constants";
import { useServices } from "Hooks/ServicesContext";
import { useQuery } from "react-query";
import { Paths } from "Router/Paths";
import { excludeBreadCrumbs, isDesktopScreen } from "Helpers/ats.helper";
import SearchMenuModal from "./Modals/SearchMenuModal";

const { SubMenu } = Menu;

// import { ColorModeContext } from "Helpers/contexts";
const { Header, Sider, Content } = Layout;

const HeaderLayout = ({ children }) => {
  const [userTypecheck, setUsertype] = React.useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isMenuPopupOpen, setIsMenuPopupOpen] = useState(false);
  const { colorMode, mode } = useContext(ColorModeContext);
  const { toggleColorMode } = colorMode;
  const {
    token: { colorBgContainer, colorBorder, paddingLG, paddingSM }
  } = theme.useToken();
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  React.useEffect(() => {
    const userType = localStorage.getItem("crmUser");
    setUsertype(userType == "true" ? true : false);
  }, [localStorage.getItem("crmUser")]);

  const location = useLocation();
  const { apiService } = useServices();
  const StyleSheet = {
    BreadcrumbRowStyle: {
      padding: "0px 0px 12px 0px"
    },
    boxStyle: {
      width: "100%",
      padding: paddingLG,
      textAlign: "left"
    },
    collapseBoxStyle: {
      width: "100%",
      padding: paddingLG,
      alignItems: "center"
    },
    contentSubStyle: {
      padding: "24px",
      minHeight: "calc(100vh - 130px)",
      background: colorBgContainer,
      border: `1px solid ${colorBorder}`,
      borderRadius: "10px"
    },
    contentSubNoStyle: {
      padding: "0",
      border: `0`,
      borderRadius: "0"
    },
    logoStyle: {
      maxWidth: "100%",
      height: "28px"
    },
    collapseLogoStyle: {
      alignItems: "center",
      width: "30px"
    },

    headerStyle: {
      position: "sticky",
      top: 0,
      zIndex: 1,
      width: "100%"
    },
    sideBarStyle: {
      overflow: "auto",
      height: "100vh",
      position: "fixed",
      left: 0,
      top: 0,
      bottom: 0,
      borderRight: `1px solid ${colorBorder}`,
      width: "300px",
      maxWidth: "300px",
      minWidth: "300px",
      zIndex: "66"
    },
    headerStyleMain: {
      position: "sticky",
      top: 0,
      zIndex: 99,
      width: "100%",
      borderBottom: `1px solid ${colorBorder}`
    },
    contentStyle: {
      paddingTop: paddingSM,
      paddingBottom: paddingSM,
      paddingLeft: paddingLG,
      paddingRight: paddingLG
    },
    contentNoStyle: {
      // paddingTop: paddingSM,
      // paddingBottom: paddingSM,
      // paddingLeft: paddingLG,
      // paddingRight: paddingLG,
      background: colorBgContainer
    },
    mainPaddingStyle: {
      paddingTop: paddingSM,
      paddingBottom: 0,
      paddingLeft: paddingLG,
      paddingRight: paddingLG
    }
  };
  const navigate = useNavigate();

  const { setLoggedIn, setuserDetails, userDetails, setPermission, permission } = useUserContext();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const returnParentPath = () => {
    try {
      const path = location.pathname;
      const parentPath = path.match(/^\/([^/]+)/);
      return parentPath ? parentPath[1] : null;
    } catch (error) {
      return null;
    }
  };

  /**
   * Function to show modal
   */
  const showModal = () => {
    setIsModalOpen(true);
  };

  /**
   * Function to handle logout
   */
  const handleLogout = () => {
    localStorage.clear();
    setuserDetails({});
    setLoggedIn(false);
    navigate("/");
    !mode === true ? toggleColorMode() : "";
    setIsModalOpen(false);
  };
  /**
   * Function to handle cancel pop up
   */
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  /**
   * fetch permission list
   */
  useQuery(
    "permissionlist",
    // Function to fetch role data using apiService.getRoleData
    () => apiService.getRolePermission(`${userDetails.user_role}`),
    {
      // Configuration options
      enabled: true, // Initial fetch is disabled
      onSuccess: (data) => {
        if (data?.data && data?.data?.modulePermissions) {
          setPermission(data.data.modulePermissions);
          localStorage.setItem("slugPermission", JSON.stringify(data.data.modulePermissions));
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        setPermission(null);
      }
    }
  );

  // State to track which submenu is open
  const [openKeys, setOpenKeys] = useState([]);

  const onOpenChange = (keys) => {
    try {
      if (keys.length === 0) {
        setOpenKeys([]);
        return;
      }

      const latestKey = keys[keys.length - 1];
      const isNestedMenu = latestKey.includes(",");

      if (isNestedMenu) {
        setOpenKeys(keys); // Keep all keys if the latest one is a nested menu
        return;
      }

      // Remove keys that are no longer open
      const latestOpenKey = [];
      if (openKeys?.length > 0 && keys.length > 0) {
        keys.forEach((elem) => {
          openKeys.forEach((elem1) => {
            if (elem !== elem1) {
              latestOpenKey.push(elem);
            }
          });
        });
      }

      if (latestOpenKey?.length > 0) {
        // Check if any element except the last has a comma
        const hasComma = hasCommaInAnyElementExceptLast(latestOpenKey);

        if (hasComma) {
          // Keep the last key open if any previous key has a comma
          setOpenKeys([latestOpenKey[latestOpenKey.length - 1]]);
        } else {
          setOpenKeys(latestOpenKey);
        }
      } else {
        // Default case: set open keys to the current ones
        setOpenKeys(keys);
      }
    } catch (error) {}
  };

  // Utility function to check for commas in any element except the last
  const hasCommaInAnyElementExceptLast = (keys) => {
    if (keys.length <= 1) return false;
    return keys.some((key) => key.includes(","));
  };

  useEffect(() => {
    // sidebar defualt close on tablet view
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };

    // Initial check
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // function to check path and exclude css
  const getStyleForPathname = (pathname) => {
    // Check if the pathname includes any of the excluded paths
    const isExcluded = excludedPaths.some((path) => pathname.includes(path));
    return isExcluded ? StyleSheet.contentSubNoStyle : StyleSheet.contentSubStyle;
  };
  const currentStyle = getStyleForPathname(location.pathname);

  return (
    <>
      <Layout>
        <Sider
          width="255"
          collapsedWidth="60"
          style={StyleSheet.sideBarStyle}
          trigger={null}
          collapsible
          collapsed={collapsed}>
          <div className="demo-logo-vertical" />

          <Flex
            style={collapsed ? StyleSheet.collapseBoxStyle : StyleSheet.boxStyle}
            justify={"space-between"}
            align={"center"}
            {...(!isDesktopScreen(screens) && { vertical: "true" })}
            gap={24}>
            <NavLink to={userTypecheck == true ? Paths.Crm : Paths.users}>
              <img
                style={collapsed ? StyleSheet.collapseLogoStyle : StyleSheet.logoStyle}
                src={collapsed ? collapse_Logo : !mode ? myLogo : myLogo}
                alt=""
              />
            </NavLink>
            <SearchOutlined
              className="header__menu__search"
              onClick={() => setIsMenuPopupOpen(!isMenuPopupOpen)}
            />
          </Flex>

          <Menu
            mode="inline"
            theme={!mode ? "dark" : "light"}
            defaultSelectedKeys={returnParentPath()}
            selectedKeys={returnParentPath()}
            openKeys={openKeys}
            onOpenChange={onOpenChange}>
            <Menu.Item
              key={userTypecheck == true ? Paths.Crm : Paths.users}
              icon={returnMenuIcon("dashboard")}>
              <NavLink to={userTypecheck == true ? Paths.Crm : Paths.users}>{"Dashboard"}</NavLink>
            </Menu.Item>
            {MenuList.filter((item) =>
              permission?.some(
                (mainitem) =>
                  (mainitem?.module_slug === item.module_slug ||
                    item.module_slug.includes(mainitem?.module_slug)) &&
                  mainitem?.permissions?.length > 0
              )
            ).map((item, index) =>
              item?.subMenu?.length > 0 ? (
                <SubMenu key={index} icon={returnMenuIcon(item.icon)} title={item.title}>
                  {item.subMenu
                    .filter((subItem) =>
                      permission?.some(
                        (mainitem) =>
                          (mainitem?.module_slug === subItem.module_slug ||
                            subItem.module_slug.includes(mainitem?.module_slug)) &&
                          mainitem?.permissions?.length > 0
                      )
                    )
                    ?.map((subItem, subIndex) =>
                      subItem?.subMenu?.length > 0 ? (
                        <>
                          <SubMenu
                            key={[index, index + subIndex + 1]}
                            icon={returnMenuIcon(subItem.icon)}
                            title={subItem.title}>
                            {subItem.subMenu
                              .filter((subItemm) =>
                                permission?.some(
                                  (mainitemm) =>
                                    subItemm.module_slug.includes(mainitemm?.module_slug) &&
                                    mainitemm?.permissions?.length > 0
                                )
                              )
                              ?.map((subItemm, subIndexx) => (
                                <Menu.Item key={subItemm.path}>
                                  <NavLink to={subItemm.path}>{subItemm.title}</NavLink>
                                </Menu.Item>
                              ))}
                          </SubMenu>
                        </>
                      ) : (
                        <Menu.Item key={subItem.path}>
                          <NavLink to={subItem.path}>{subItem.title}</NavLink>
                        </Menu.Item>
                      )
                    )}
                </SubMenu>
              ) : (
                <Menu.Item key={item.path} icon={returnMenuIcon(item.icon)}>
                  <NavLink to={item.path}>{item.title}</NavLink>
                </Menu.Item>
              )
            )}
          </Menu>
        </Sider>
        <Layout
          style={
            collapsed
              ? { minHeight: "100vh", marginLeft: 60 }
              : { minHeight: "100vh", marginLeft: 255 }
          }>
          <Header style={StyleSheet.headerStyleMain}>
            <Flex vertical justify={"center"} align="start" className="height_full">
              <Flex
                justify={"space-between"}
                align={"center"}
                gap={"middle"}
                className="width_full">
                <Button
                  type="text"
                  icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                  onClick={() => setCollapsed(!collapsed)}
                />
                <Flex gap="small" align="start" vertical>
                  <Flex justify={"flex-end"} align={"center"} gap={"middle"}>
                    <Switch
                      checkedChildren="Dark"
                      unCheckedChildren="Light"
                      checked={!mode}
                      onChange={toggleColorMode}
                    />
                    <Button
                      type="text"
                      danger
                      onClick={() => {
                        showModal();
                      }}>
                      Logout
                    </Button>
                    <Modal
                      title="Logout"
                      okText="Yes"
                      cancelText="No"
                      okButtonProps={{ danger: true }}
                      open={isModalOpen}
                      onOk={handleLogout}
                      onCancel={handleCancel}>
                      <p>Are you sure you want to logout?</p>
                    </Modal>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Header>
          <Content
            style={
              location.pathname.includes("product_add") ||
              location.pathname.includes("keysoul-template") ||
              location.pathname.includes("product_edit")
                ? StyleSheet.contentNoStyle
                : StyleSheet.contentStyle
            }>
            <div
              style={
                location.pathname.includes("product_add") ||
                location.pathname.includes("keysoul-template") ||
                location.pathname.includes("product_edit")
                  ? StyleSheet.mainPaddingStyle
                  : {}
              }>
              {/* excludeBreadCrumbs  */}
              {!excludeBreadCrumbs(location.pathname, excludedBreadCrumb) && (
                <Row gutter={16} style={StyleSheet.BreadcrumbRowStyle}>
                  <Col className="gutter-row" span={24}>
                    <BreadcrumbBox />
                  </Col>
                </Row>
              )}
            </div>

            <Content className="test" style={currentStyle}>
              {children}
            </Content>
          </Content>
        </Layout>
      </Layout>

      {/* Menu Search Modal */}
      <Modal
        open={isMenuPopupOpen}
        className="header__menu__popup"
        width={800}
        styles={{ mask: { backdropFilter: "blur(10px)" } }}
        destroyOnClose
        keyboard={true}
        onCancel={() => setIsMenuPopupOpen(false)}
        closeIcon={false}
        footer={false}>
        <SearchMenuModal
          isMenuPopupOpen={isMenuPopupOpen}
          setIsMenuPopupOpen={setIsMenuPopupOpen}
          contextPermission={permission}
        />
      </Modal>
    </>
  );
};

export default HeaderLayout;
