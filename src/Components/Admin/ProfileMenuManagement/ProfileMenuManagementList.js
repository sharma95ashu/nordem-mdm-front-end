import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Col,
  Row,
  theme,
  Flex,
  Space,
  Tag,
  Tooltip,
  Image,
  Switch,
  Spin
} from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { FALL_BACK, PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { actionsPermissionValidator, capitalizeFirstWord } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";
import { useUserContext } from "Hooks/UserContext";
import { enqueueSnackbar } from "notistack";
import { getFullImageUrl } from "Helpers/functions";

const MenuMangementList = () => {
  const [profileModules, setProfileModules] = useState([]);
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();

  const {
    token: {
      borderRadiusLG,
      paddingContentHorizontal,
      colorBorder,
      sizeSM,
      colorPrimaryBg,
      colorPrimaryBorder,
      colorPrimary
    }
  } = theme.useToken();

  const StyleSheet = {
    searchBarStyle: {
      marginBottom: 16,
      maxWidth: "538px"
    },
    paginationStyle: {
      marginTop: 25
    },
    contentSubStyle: {
      background: colorPrimaryBg,
      padding: paddingContentHorizontal,
      borderRadius: borderRadiusLG,
      marginTop: 20,
      marginBottom: 20,
      border: "1px solid",
      borderColor: colorPrimaryBorder
    },
    verDividerStyle: {
      borderColor: colorBorder,
      height: 20
    },
    flexFullStyle: {
      width: "100%"
    },
    iconFilterStyle: {
      fontSize: sizeSM
    },
    buttonAlignStyle: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    },
    formItemStyle: {
      marginBottom: 0
    },
    filterIconStyle: {
      marginRight: 6,
      marginTop: 2,
      color: colorPrimary
    }
  };

  const { mutate: fetchProfileModules, isLoading } = useMutation(
    "fetchAllMenusData",
    () => apiService.getAllEcomProfileMenu(),
    {
      onSuccess: (res) => {
        if (res?.success && res?.data) {
          let tableData = res?.data.map((item, index) => ({ ...item, key: index }));
          setProfileModules(tableData);
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  const columns = [
    {
      title: "Module Name",
      dataIndex: "module_name",
      width: "250px",
      key: "module_name",
      sorter: (a, b) => a.module_name.localeCompare(b.module_name),
      render: (value, record) => (
        <Flex gap="small" align="center">
          {console.log("record.icon", record.icon)}
          {record.icon && /^\/upload\/.*\.svg$/.test(record.icon) ? (
            <Image
              preview={false}
              src={getFullImageUrl(record.icon)}
              style={{ width: 28, height: 28 }}
              fallback={FALL_BACK}
            />
          ) : (
            <></>
          )}
          <Typography.Text className="textCapitalize">{value || "-"}</Typography.Text>
          {record.is_new && <Tag color="warning">New</Tag>}
        </Flex>
      )
    },
    {
      title: "Module Type",
      width: "200px",
      dataIndex: "module_type",
      key: "module_type",
      sorter: (a, b) => a.module_type.localeCompare(b.module_type),
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value || "-"}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Sub Module",
      width: "140px",
      dataIndex: "children",
      key: "children",
      sorter: (a, b) => parseInt(a?.children?.length || 0) - parseInt(b?.children?.length || 0),
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value?.length || 0}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Display Order",
      dataIndex: "display_order",
      width: "140px",
      key: "display_order",
      sorter: (a, b) => a.display_order - b.display_order
    },
    {
      title: "Supported Users",
      dataIndex: "supported_user",
      key: "supported_user",
      width: "260px",
      render: (value) => (
        <Flex gap="small" align="center" style={{ flexWrap: "wrap" }}>
          {value?.map((item) => {
            return (
              <Tag key={item} className="textCapitalize">
                {item}
              </Tag>
            );
          })}
        </Flex>
      )
    },
    {
      title: "Supported Platforms",
      dataIndex: "supported_platform",
      key: "supported_platform",
      width: "160px",
      render: (value) => (
        <Flex gap="small" align="center" style={{ flexWrap: "wrap" }}>
          {value?.map((item) => {
            return (
              <Tag key={item} className="textCapitalize">
                {item}
              </Tag>
            );
          })}
        </Flex>
      )
    },
    {
      title: "Status",
      dataIndex: "module_status",
      key: "module_status",
      width: "140px",
      fixed: "right",
      align: "center",
      render: (value, record) => (
        <Flex gap="small" align="center">
          <Tag color={value === "active" ? "success" : value === "inactive" ? "error" : ""}>
            {capitalizeFirstWord(value)}
          </Tag>
          <Switch
            onChange={(checked) =>
              toggleMenuStatus({
                id: record.module_id,
                module_status: checked ? "active" : "inactive",
                module_name: record.module_name
              })
            }
            size="small"
            checkedChildren="on"
            unCheckedChildren="off"
            defaultChecked={value === "active"}
          />
        </Flex>
      )
    },
    {
      title: "Action",
      dataIndex: "action",
      width: "140px",
      key: "action",
      fixed: "right",
      align: "center",
      render: (_, record) => (
        <Flex gap="small" justify="center" align="center">
          <>
            {record.parent_id === null ? (
              <Tooltip title="Parent menu can't be edited">
                <Button type="default" disabled icon={<EditOutlined />}>
                  Edit
                </Button>
              </Tooltip>
            ) : (
              <Button
                type="default"
                disabled={
                  !actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT)
                }
                onClick={() => navigate(`/${Paths.manageProfileMenuListEdit}/${record.module_id}`)}
                icon={<EditOutlined />}>
                Edit
              </Button>
            )}
          </>
        </Flex>
      )
    }
  ];

  const toggleMenuStatus = (request) => {
    const formData = new FormData();
    formData.append("module_status", request.module_status);
    formData.append("module_name", request.module_name);
    toggleMenuStatusMutation({
      id: request.id,
      formData
    });
  };

  // Toggle menu status
  const { mutate: toggleMenuStatusMutation, isLoading: toggleMenuStatusLoading } = useMutation(
    (request) => apiService.updateEcomProfileMenu(request.id, request.formData),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          enqueueSnackbar(data.message, snackBarSuccessConf); // Display a success Snackbar notification
          fetchProfileModules();
        }
      },
      onError: (error) => {
        fetchProfileModules();
        console.log(error);
      }
    }
  );

  useEffect(() => {
    setBreadCrumb({
      title: "Profile Menu Management",
      icon: "menuManagement",
      path: Paths.manageProfileMenuList
    });
    fetchProfileModules();
  }, []);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={toggleMenuStatusLoading || isLoading}>
      <Row gutter={[24, 12]}>
        <Col className="gutter-row" span={24}>
          <Flex gap="middle" justify="space-between" align="center">
            <Typography.Title level={5} className="removeMargin">
              Menu List
            </Typography.Title>
            <Flex justify="space-between" gap="middle">
              {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                <Flex style={StyleSheet.flexFullStyle} gap="middle" justify="flex-end">
                  <NavLink to={`/${Paths.manageProfileMenuListAdd}`}>
                    <Button size="large" type="primary" className="wrapButton">
                      <PlusOutlined />
                      Add New
                    </Button>
                  </NavLink>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Col>
        <Col></Col>
      </Row>

      <Table
        columns={columns}
        dataSource={profileModules}
        bordered={true}
        scroll={{
          x: "1070px"
        }}
        pagination={true}
      />
    </Spin>
  ) : (
    <></>
  );
};

export default MenuMangementList;
