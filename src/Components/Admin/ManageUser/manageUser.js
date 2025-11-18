/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Pagination,
  Spin,
  Input,
  Tag,
  Button,
  Col,
  Row,
  Flex,
  Typography,
  Space,
  Divider,
  Popconfirm,
  theme
} from "antd";

import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { enqueueSnackbar } from "notistack";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQueryClient } from "react-query";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { NavLink, useNavigate } from "react-router-dom";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { tabletWidth } from "Helpers/ats.constants";

const CategoryAll = () => {
  const { Search } = Input;
  const [current, setCurrent] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [storeInputValue, setstoreInputValue] = useState("");
  const [loader, setLoader] = useState(false);

  const [submitSearchInpt, setSubmitSearchInput] = useState(false);
  const [psize, setpsize] = useState(10);
  const { apiService } = useServices();

  const queryClient = useQueryClient();
  const searchEnable = useRef();
  const { setBreadCrumb, setWindowWidth, windowWidth } = useUserContext();
  const [pageSize, setPageSize] = useState(5);
  const {
    token: { colorError }
  } = theme.useToken();
  const navigate = useNavigate();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [delAllVisible, setDelAllVisible] = useState(false);

  // check window inner width
  const checkInnerWidth = () => {
    try {
      return windowWidth < tabletWidth;
    } catch (error) { }

    // check window width and set inner width
    React.useEffect(() => {
      try {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      } catch (error) { }
    }, [windowWidth]);
  };

  const columns = [
    {
      title: "User Name",
      dataIndex: "user_name",
      key: "user_name",
      width: checkInnerWidth() ? "200px" : "auto",
      sorter: (a, b) => a.user_name.localeCompare(b.user_name)
    },
    {
      title: "E-Mail",
      dataIndex: "user_email",
      width: checkInnerWidth() ? "250px" : "auto",
      key: "user_email",
      sorter: (a, b) => a.user_email.localeCompare(b.user_email)
    },
    {
      title: "Phone No.",
      dataIndex: "user_phone_number",
      key: "user_phone_number",
      width: "150px",
      sorter: (a, b) => a.user_phone_number - b.user_phone_number
    },
    {
      title: "Role",
      dataIndex: "role_name",
      key: "role_name",
      width: checkInnerWidth() ? "150px" : "250px",
      sorter: (a, b) => a.role_name.localeCompare(b.role_name)
    },

    {
      title: "Status",
      dataIndex: "user_status",
      width: "120px",
      sorter: (a, b) => a.user_status.localeCompare(b.user_status),
      key: "user_status",
      render: (value) => (
        <>
          {value === "active" ? (
            <Tag color="success">Active</Tag>
          ) : (
            <Tag color="error">Inactive</Tag>
          )}
        </>
      )
    }
  ];

  if (
    actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) ||
    actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE)
  ) {
    columns.push({
      align: 'center',
      title: "Action",
      dataIndex: "action",
      width: "190px",
      key: "action",
      fixed: "right",
      render: (text, record) => (
        <Flex gap="small" justify="center" align="center">
          {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) && (
            <>
              <Button type="default" primary onClick={() => handleEdit(record)}>
                Edit
              </Button>
            </>
          )}

          {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) && actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE) && (
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
              onCancel={() => { "" }}
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
    });
  }

  // Function to handle Edit of tags
  const handleEdit = (data) => {
    navigate(`/${Paths.editUser}/${data.user_id}`);
  };
  const fetchTableData = async (storeFilterData) => {
    try {
      setLoader(true);
      // Ensure storeFilterData is defined, set to an empty object if not provided
      storeFilterData = storeFilterData || {};

      // Extract sort and status from storeFilterData
      const { sort, status } = storeFilterData;

      // Define the base URL for the API endpoint
      let baseUrl = `/users/get-all-users/${searchEnable.current ? 0 : current - 1}/${psize}`;

      // Flag to check if any filter value is empty
      let isAnyValueEmpty = false;

      // Check if status is provided, update isAnyValueEmpty accordingly
      if (status) {
        isAnyValueEmpty = true;
      }

      // Create filterData object with status as a key-value pair
      const filterData = {
        ...{ status: status?.value }
      };

      // Convert filterData to JSON string
      const convertData = JSON.stringify(filterData);

      // Construct parameters for the API request
      const params = {
        ...(searchTerm && { searchTerm: searchTerm.trim() }),
        ...(isAnyValueEmpty && {
          filterTerm: convertData
        }),
        ...(sort &&
          sort.length > 0 && {
          sortOrder: sort[0].desc ? "desc" : "asc"
        })
      };

      // Construct the complete API URL with parameters
      const apiUrl = `${baseUrl}?${new URLSearchParams(params).toString()}`;

      // Make an API call to get the table data
      const data = await apiService.getRequest(apiUrl);

      // Check if the API call is successful
      if (data.success) {
        searchEnable.current = false;
        setLoader(false);

        setTotal(data?.totalCount);

        let tableData = data?.data.map((item, index) => ({ ...item, key: index }));
        // Return the fetched data
        return tableData;
      }
    } catch (error) {
      // Handle errors by displaying a Snackbar notification
    }
  };

  useEffect(() => {
    setBreadCrumb({
      title: "Manage User",
      icon: "user",
      path: Paths.users
    });
  }, []);
  // Destructure data, mutate function, loading status, and refetching status from useMutation hook
  const { data, mutate: refetch } = useMutation("fetchUserData", fetchTableData);

  const filterDeleteIds = (deleteArr) => {
    try {
      const filteredKeys = data
        .filter((obj) => deleteArr.includes(obj.key))
        .map((obj) => obj.user_id);
      return filteredKeys;
    } catch (error) { }
  };

  // Function to handle deletion of multiple users
  const handleDelete = (data) => {
    try {
      // Check if there is data to process
      if (data) {
        // Create a request body with userId
        const body = {
          userIds: Array.isArray(data) ? filterDeleteIds(data) : [data.user_id]
          // userIds: [data]
        };
        // Perform the API call for user deletion
        deleteUser(body);
      }
    } catch (error) { }
  };

  // UseMutation hook for deleting user data via API
  const { mutate: deleteUser, isLoading: deleteLoading } = useMutation(
    "deleteUserData", // Unique mutation key for tracking in the query client
    // Mutation function to handle the API call for deleting user data
    (data) => apiService.deleteSingleUser(data),
    {
      // Configuration options for the mutation
      onSuccess: (res, payload) => {
        if (data.length == payload?.load?.userIds?.length) {
          setCurrent(1);
        }

        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(res.message, snackBarSuccessConf);
        setSelectedRowKeys([]);
        setDelAllVisible(false);

        // Invalidate the "fetchRoleData" query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchUserData");

        // Call the refetch function to fetch updated data after deletion
        refetch();
      },
      onError: (error) => {
        setSelectedRowKeys([]);
        // Handle errors by displaying an error Snackbar notification
        // enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // Handle key press event to detect "Enter" key and call handleSearchSubmit
  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      handleSearchSubmit();
    }
  };
  // Calling api when click pagination
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? refetch()
      : navigate("/", { state: { from: null }, replace: true });
  }, [current, psize]);

  // Search table data clear input then call api
  useEffect(() => {
    if (searchTerm === "" && submitSearchInpt) {
      actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
        ? refetch()
        : navigate("/", { state: { from: null }, replace: true });
      setSubmitSearchInput(false);
      setstoreInputValue("");
    }
  }, [searchTerm, submitSearchInpt]);

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

  const onSelectChange = (newSelectedRowKeys) => {
    if (newSelectedRowKeys.length >= 1) {
      setDelAllVisible(true);
    } else {
      setDelAllVisible(false);
    }

    try {
      setSelectedRowKeys(newSelectedRowKeys);
    } catch (error) { }
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Typography.Title level={5}>Manage Users</Typography.Title>
      <Spin spinning={loader} fullscreen />
      <>
        <Row gutter={12}>
          <Col className="gutter-row" span={24}>
            <Flex justify="space-between" gap="middle">
              <Search
                className="search_bar_box"
                size="large"
                placeholder="Search Here..."
                value={searchTerm}
                onSearch={handleSearchSubmit}
                onChange={handleSearch}
                onKeyPress={handleKeyPress}
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
                        size="large"
                        danger
                        disabled={selectedRowKeys?.length > 0 ? false : true}>
                        Delete
                      </Button>
                    </Popconfirm>
                  )}
                {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                  <NavLink to={"/" + Paths.addUser}>
                    <Button size="large" block type="primary">
                      <PlusOutlined /> Add New
                    </Button>
                  </NavLink>
                )}
              </Flex>
            </Flex>
          </Col>
        </Row>
      </>

      <Table
        columns={columns}
        rowSelection={rowSelection}
        bordered={true}
        dataSource={data}
        pagination={false}
        scroll={{
          x: checkInnerWidth() ? "1200px" : "auto"
        }}
      />

      <div style={StyleSheet.paginationStyle}>
        <Pagination
          total={total}
          showTotal={(total) => `Total ${total} items`}
          defaultPageSize={psize}
          defaultCurrent={1}
          current={current}
          onChange={(newPage, newPageSize) => {
            setSelectedRowKeys([]);
            setCurrent(newPage);
            setpsize(newPageSize);
            setSelectedRowKeys([]);
          }}
          showSizeChanger={true}
          showQuickJumper
        />
      </div>
    </>
  ) : (
    <></>
  );
};
export default CategoryAll;

const StyleSheet = {
  searchBarStyle: {
    marginBottom: 16,
    maxWidth: 538
  },
  paginationStyle: {
    marginTop: 25
  },
  drawerStyle: {
    width: "100%",
    marginBottom: "10px"
  }
};
