/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Pagination,
  Spin,
  Input,
  Button,
  Col,
  Row,
  Typography,
  Space,
  Popconfirm,
  Divider,
  theme,
  Flex
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

export default function DownloadList() {
  const { Search } = Input;
  const { setBreadCrumb, setWindowWidth, windowWidth } = useUserContext();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchEnable = useRef();
  const [current, setCurrent] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [storeInputValue, setstoreInputValue] = useState("");
  const [checkFilter, setCheckFilter] = useState(false);
  const [submitSearchInpt, setSubmitSearchInput] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [delAllVisible, setDelAllVisible] = useState(false);

  const {
    token: { colorBorder, colorError }
  } = theme.useToken();

  // check window inner width
  const checkInnerWidth = () => {
    try {
      return windowWidth < tabletWidth;
    } catch (error) {}

    // check window width and set inner width
    React.useEffect(() => {
      try {
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
      } catch (error) {}
    }, [windowWidth]);
  };

  /**
   * style
   */
  const StyleSheet = {
    searchBarStyle: {
      marginBottom: 16,
      maxWidth: 538
    },
    paginationStyle: {
      marginTop: 25
    },
    verDividerStyle: {
      borderColor: colorBorder,
      height: 20
    }
  };

  // Column list for table
  const columns = [
    {
      title: "Resource Name",
      width: checkInnerWidth() ? "100px" : "auto",
      dataIndex: "resource_name",
      key: "resource_name",
      sorter: (a, b) => a.resource_name.localeCompare(b.resource_name)
    },
    {
      title: "Category",
      dataIndex: "download_category_name",
      key: "download_category_name",
      render: (_, record) => {
        console.log(record);
        return record?.categoryData?.download_category_name || "N/A";
      }
    },
    {
      title: "Language",
      dataIndex: "language_name",
      key: "language_name"
    },
    {
      title: "Resource Type",
      dataIndex: "resource_type",
      key: "resource_type",
      render: (value, record) => (
        <Space>
          <Typography.Text>{value == "pos" ? "POS" : "E-COM"}</Typography.Text>
        </Space>
      )
    }
  ];

  if (
    actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) ||
    actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE)
  ) {
    columns.push({
      align: "center",
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
              onCancel={() => {
                "";
              }}
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

  // Function to fetch download data
  const fetchTableData = async (storeFilterData) => {
    try {
      // Ensure storeFilterData is defined, set to an empty object if not provided
      storeFilterData = storeFilterData || {};

      // Extract sort and status from storeFilterData
      const { sort, status } = storeFilterData;

      // Define the base URL for the API endpoint
      let baseUrl = `/downloads/get-all-downloads/${
        searchEnable.current ? 0 : current - 1
      }/${pageSize}`;

      // Flag to check if any filter value is empty
      let isAnyValueEmpty = false;

      // Check if status is provided, update isAnyValueEmpty accordingly
      if (status) {
        isAnyValueEmpty = true;
      }

      // Set the checkFilter state to indicate if any filter value is empty
      setCheckFilter(isAnyValueEmpty);

      // Create filterData object with status as a key-value pair
      const filterData = {
        ...{ status: status?.value }
      };

      // Convert filterData to JSON string
      const convertData = JSON.stringify(filterData);

      // If sort is provided, set the sorting state
      if (sort) {
        setSorting(sort);
      }

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

        setTotal(data?.data?.total_count);
        let tableData = data?.data?.data.map((item, index) => ({ ...item, key: index }));
        // Return the fetched data
        return tableData;
      }
    } catch (error) {
      // Handle errors by displaying a Snackbar notification
    }
  };

  // Function to delete download
  const { mutate: deleteMutate } = useMutation(
    // Mutation function to handle the API call for creating a new downloads
    (data) => apiService.deleteDownload(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (res, payload) => {
        if (data.length == payload?.load?.downloadDocIds?.length) {
          setCurrent(1);
        }

        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(res.message, snackBarSuccessConf);
        setSelectedRowKeys([]);
        setDelAllVisible(false);

        // Invalidate the query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchDownloadData");
        refetch();
      },
      onError: (error) => {
        setSelectedRowKeys([]);
      }
    }
  );

  // Destructure data, mutate function, loading status, and refetching status from useMutation hook
  const { data, mutate: refetch, isLoading } = useMutation("fetchDownloadData", fetchTableData);

  const filterDeleteIds = (deleteArr) => {
    try {
      const filteredKeys = data
        .filter((obj) => deleteArr.includes(obj.key))
        .map((obj) => obj.download_id);
      return filteredKeys;
    } catch (error) {}
  };

  // Function to handle deletion of downloads
  const handleDelete = (data) => {
    try {
      // Create a request body with downloadsIds array
      const body = {
        downloadDocIds: Array.isArray(data) ? filterDeleteIds(data) : [data.download_id]
      };

      // Define the request object with the API endpoint and request body
      let obj = { load: body };

      // Perform the API call for downloads deletion
      deleteMutate(obj);
    } catch (error) {}
  };

  // Function to handle Edit of downloads
  const handleEdit = (data) => {
    navigate(`/${Paths.downloadEdit}/${data.download_id}`);
  };

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
  }, [current, pageSize]);

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
    setCurrent(1);
    setPageSize(10);
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

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    setBreadCrumb({
      title: "Download Content",
      icon: "downloads",
      path: Paths.users
    });
  }, []);

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

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Typography.Title level={5}>Download Content</Typography.Title>
      <Spin spinning={isLoading} fullscreen />
      <>
        <Row gutter={[12, 30]}>
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
                  <NavLink to={`/${Paths.downloadAdd}`}>
                    <Button type="primary" block size="large" className="wrapButton">
                      <PlusOutlined />
                      Add New
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
        dataSource={data}
        pagination={false}
        bordered={true}
        scroll={{
          x: "auto"
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
            setCurrent(newPage);
            setPageSize(newPageSize);
            setSelectedRowKeys([]);
          }}
          showSizeChanger={true}
          showQuickJumper
        />
      </div>
    </>
  ) : (
    ""
  );
}
