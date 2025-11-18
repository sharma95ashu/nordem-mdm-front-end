/* eslint-disable no-undef */
import React, { useEffect, useRef, useState } from "react";
import {
  Table,
  Pagination,
  Button,
  Col,
  Row,
  theme,
  Flex,
  Space,
  Tag,
  Divider,
  Popconfirm,
  Input,
  Spin,
  Image
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";

import { actionsPermissionValidator } from "Helpers/ats.helper";

import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";
import { enqueueSnackbar } from "notistack";
import { useUserContext } from "Hooks/UserContext";
import dayjs from "dayjs";
import placeholderImg from "Static/img/user.jpg";
import { getFullImageUrl } from "Helpers/functions";
//AB Mess List Component
const ABMessagesList = () => {
  const { Search } = Input;
  const { setBreadCrumb } = useUserContext();
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [delAllVisible, setDelAllVisible] = useState(false);

  const [submitSearchInput, setSubmitSearchInput] = useState(false);
  const [storeInputValue, setstoreInputValue] = useState("");
  const searchEnable = useRef();
  const { apiService } = useServices();
  const navigate = useNavigate();

  const {
    token: {
      borderRadiusLG,
      paddingContentHorizontal,
      colorBorder,
      colorError,
      sizeSM,
      colorPrimaryBg,
      colorPrimaryBorder,
      colorPrimary
    }
  } = theme.useToken();

  // styles
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
    },
    viewBtnStyle: {
      color: colorPrimary,
      cursor: "pointer",
      display: "block"
    }
  };

  // Function to fetch ab messages table  data
  const fetchTableData = async (reset = false) => {
    try {
      // Define the base URL for the API endpoint
      let baseUrl = `/ab_message/all/${searchEnable.current ? 0 : current - 1}/${pageSize}`;

      // Construct parameters for the API request
      const params = {
        ...(searchTerm && { searchTerm: searchTerm.trim() })
      };

      // Construct the complete API URL with parameters
      const apiUrl = `${baseUrl}?${new URLSearchParams(params).toString()}`;

      // Make an API call to get the table data
      const data = await apiService.getRequest(apiUrl);

      // Check if the API call is successful
      if (data.success) {
        searchEnable.current = false;
        setTotal(data?.data?.total_count);
        let tableData = data?.data?.data.map((item, index) => ({ ...item, key: index }));

        // Return the fetched data
        return tableData; //
      }
    } catch (error) {
      // Handle errors by displaying a Snackbar notification
    }
  };

  // Destructure data, mutate function, loading status, and refetching status from useMutation hook
  const { data, mutate: refetch, isLoading } = useMutation("fetchAlABMessageData", fetchTableData);

  // Calling api when click pagination
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? refetch()
      : navigate("/", { state: { from: null }, replace: true });
  }, [current, pageSize]);

  // Search table data clear input then call api
  useEffect(() => {
    if (searchTerm === "" && submitSearchInput) {
      actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
        ? refetch()
        : navigate("/", { state: { from: null }, replace: true });
      setSubmitSearchInput(false);
      setstoreInputValue("");
    }
  }, [searchTerm, submitSearchInput]);

  // handle table search row data
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // search bar button when click search button then call api
  const handleSearchSubmit = () => {
    if (searchTerm !== null && searchTerm !== "" && searchTerm !== storeInputValue) {
      searchEnable.current = true;
      actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
        ? refetch()
        : navigate("/", { state: { from: null }, replace: true });
      setSubmitSearchInput(true);
      setstoreInputValue(searchTerm.trim());
    }
  };

  // table columns
  const columns = [
    {
      title: "Message Title",
      dataIndex: "message_title",
      width: "250px",
      key: "message_title",
      sorter: (a, b) => a.message_title.localeCompare(b.message_title),
      render: (value, record) => (
        <Space>
          <Image
            height={50}
            width={50}
            src={
              record?.image?.file_path ? getFullImageUrl(record?.image?.file_path) : placeholderImg
            }
          />
          <Typography.Text className="textCapitalize">{value}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Start & End Date",
      dataIndex: "date",
      width: "250px",
      key: "date",
      sorter: (a, b) => a.start_date.localeCompare(b.start_date),
      render: (value, record) => (
        <Space>
          <Typography.Text>
            {`${dayjs(record.start_date).format("DD-MM-YYYY")} to ${dayjs(record.end_date).format(
              "DD-MM-YYYY"
            )}`}
          </Typography.Text>
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
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "100px",
      sorter: (a, b) => a.status.localeCompare(b.status),
      render: (value) => (
        <>
          {value === "active" ? (
            <Tag color="success">Active</Tag>
          ) : (
            <Tag color="error">Inactive</Tag>
          )}
        </>
      )
    },
    {
      title: "Action",
      dataIndex: "action",
      width: "200px",
      key: "action",
      fixed: "right",
      align: "center",
      render: (text, record) => (
        <Flex gap="small" justify="center" align="center">
          {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) && (
            <>
              <Button
                type="default"
                primary
                onClick={() => navigate(`/${Paths.abMessageListEdit}/${record.ab_message_id}`)}>
                Edit
              </Button>
            </>
          )}

          {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) &&
            actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE) && (
              <Divider style={StyleSheet.verDividerStyle} type="vertical" />
            )}

          {actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE) && (
            <Popconfirm
              title="Delete"
              icon={
                <DeleteOutlined
                  style={{
                    color: colorError
                  }}
                />
              }
              okButtonProps={{ danger: true }}
              description="Are you sure to delete this ?"
              onConfirm={() => {
                handleDelete(record);
              }}
              // onCancel={() => {}}
              okText="Yes"
              placement="left"
              cancelText="No">
              <Button type="default" danger>
                Delete
              </Button>
            </Popconfirm>
          )}
        </Flex>
      )
    }
  ];

  // api  to delete AB Message
  const { mutate: deleteMutate } = useMutation(
    (data) => apiService.deleteSingleABmessage(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (res) => {
        if (res) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(res.message, snackBarSuccessConf);
          setSelectedRowKeys([]);
          setDelAllVisible(false);
          refetch();
        }
      },
      onError: (error) => {
        setSelectedRowKeys([]);
      }
    }
  );

  const filterDeleteIds = (deleteArr) => {
    try {
      const filteredKeys = data
        .filter((obj) => deleteArr.includes(obj.key))
        .map((obj) => obj.ab_message_id);
      return filteredKeys;
    } catch (error) {}
  };

  // Function to handle deletion of ab message
  const handleDelete = (data) => {
    try {
      // Create a request body with tagsIds array
      const body = {
        messageIds: Array.isArray(data) ? filterDeleteIds(data) : [data.ab_message_id]
      };

      // Define the request object with the API endpoint and request body
      let obj = { load: body };

      // Perform the API call for ab message deletion
      deleteMutate(obj);
    } catch (error) {
      console.log(error);
    }
  };

  const onSelectChange = (newSelectedRowKeys) => {
    if (newSelectedRowKeys.length >= 1) {
      setDelAllVisible(true);
    } else {
      setDelAllVisible(false);
    }

    try {
      setSelectedRowKeys(newSelectedRowKeys);
    } catch (error) {}
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "AB Message",
      icon: "abMessage",
      path: Paths.users
    });
  }, []);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Typography.Title level={5}>All AB Messages</Typography.Title>
      <Spin spinning={false} fullscreen />
      <Row gutter={[0, 0]}>
        <Col className="gutter-row" span={24}>
          <Flex gap="middle" justify="space-between">
            <Search
              className="search_bar_box"
              size="large"
              placeholder="Search Here..."
              value={searchTerm}
              onSearch={handleSearchSubmit}
              onChange={handleSearch}
              allowClear
              style={StyleSheet.searchBarStyle}
            />
            <Flex justify="space-between" gap="middle">
              {actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE) &&
                delAllVisible && (
                  <Popconfirm
                    title="Delete"
                    icon={
                      <DeleteOutlined
                        style={{
                          color: colorError
                        }}
                      />
                    }
                    okButtonProps={{ danger: true }}
                    description="Are you sure to delete ?"
                    onConfirm={() => {
                      handleDelete(selectedRowKeys);
                    }}
                    onCancel={() => {
                      //
                    }}
                    okText="Yes"
                    placement="left"
                    cancelText="No">
                    <Button
                      type="default"
                      danger
                      size="large"
                      disabled={selectedRowKeys?.length > 0 ? false : true}>
                      Delete
                    </Button>
                  </Popconfirm>
                )}

              {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                <Flex style={StyleSheet.flexFullStyle} gap="middle" justify="flex-end">
                  <NavLink to={`/${Paths.abMessageListAdd}`}>
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
      </Row>

      <Table
        columns={columns}
        rowSelection={rowSelection}
        dataSource={data}
        pagination={false}
        bordered={true}
        loading={isLoading}
        scroll={{
          x: "1070px"
        }}
      />

      <div style={StyleSheet.paginationStyle}>
        <Pagination
          total={total}
          showTotal={(total) => `Total ${total} items`}
          defaultPageSize={pageSize}
          defaultCurrent={1}
          current={current}
          onChange={(newPage, newPageSize) => {
            setSelectedRowKeys([]);
            setCurrent(newPage);
            setPageSize(newPageSize);
            setSelectedRowKeys([]);
          }}
          showSizeChanger
          showQuickJumper
        />
      </div>
    </>
  ) : (
    <></>
  );
};

export default ABMessagesList;
