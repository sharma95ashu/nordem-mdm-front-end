/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { useServices } from "Hooks/ServicesContext";
import { NavLink, useNavigate } from "react-router-dom";
import { tabletWidth } from "Helpers/ats.constants";

import {
  Table,
  Pagination,
  Input,
  Tag,
  Button,
  Col,
  Row,
  Typography,
  Space,
  Popconfirm,
  Divider,
  theme,
  Flex,
  Spin,
  Switch,
  message,
  Tooltip
} from "antd";

import { PlusOutlined, DeleteOutlined, CopyOutlined } from "@ant-design/icons";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { useMutation, useQueryClient } from "react-query";
import { getAntDateTimeFormat } from "Helpers/ats.helper";
import { enqueueSnackbar } from "notistack";

export default function CouponList() {
  const { Search } = Input;
  const { setBreadCrumb, setWindowWidth, windowWidth } = useUserContext();
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { apiService } = useServices();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchEnable = useRef();
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [storeInputValue, setstoreInputValue] = useState("");
  const [loader, setLoader] = useState(false);
  const [checkFilter, setCheckFilter] = useState(false);
  const [submitSearchInpt, setSubmitSearchInput] = useState(false);
  const [sorting, setSorting] = useState([]);

  const [delAllVisible, setDelAllVisible] = useState(false);

  const {
    token: { colorBorder, colorError, badgeColor, colorTextBase }
  } = theme.useToken();

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);


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
    },
    badgeStyle: {
      background: badgeColor,
      width: "100%",
      maxWidth: "80px",
      textAlign: "center"
    }
  };

  // Function to copy text to clipboard
  const copyToClipboard = (text) => {
    // Check if the clipboard API is supported
    if (navigator.clipboard && navigator.clipboard.writeText) {
      // Copy the text to the clipboard
      navigator.clipboard
        .writeText(text)
        .then(() => {
          // Display a success message
          message.success("Text copied to clipboard!");
        })
        .catch((err) => {
          // Display an error message if copying fails
          message.error("Failed to copy text to clipboard");
        });
    } else {
      // Fallback for older browsers
      message.error("Clipboard API not supported");
    }
  };

  // Column list for table
  const columns = [
    {
      title: "Coupon Code",
      dataIndex: "coupon_code",
      sorter: (a, b) => a.coupon_code.localeCompare(b.coupon_code),
      width: checkInnerWidth() ? '200px' : 'auto',
      key: "coupon_code",
      render: (value) => (
        <>
          <Flex justify="space-between">
            {value}
            <Tooltip title="Copy Coupon">
              <Button size="small" onClick={() => copyToClipboard(value)} type="link">
                <CopyOutlined />
              </Button>
            </Tooltip>
          </Flex>
        </>
      )
    },
    {
      title: "Discount Type",
      dataIndex: "discount_type",
      sorter: (a, b) => a.discount_type.localeCompare(b.discount_type),
      key: "discount_type"
    },
    {
      title: "Discount Value",
      dataIndex: "discount_value",
      sorter: (a, b) => a.discount_value - b.discount_value,
      key: "discount_value",
      render: (value, record) => {
        const val =
          record.discount_type === "fixed"
            ? "₹ " + value
            : record.discount_type === "percentage"
              ? value + "%"
              : "";
        return <>{val}</>;
      }
    },
    {
      title: "Applicable on",
      dataIndex: "applicable_on",
      sorter: (a, b) => a.applicable_on.localeCompare(b.applicable_on),
      key: "applicable_on",
      render: (value) => (
        <>
          <Tag className="textCapitalize" bordered={false} style={StyleSheet.badgeStyle}>
            {value}
          </Tag>
        </>
      )
    },
    {
      title: "Validity",
      dataIndex: "expiry_date",
      sorter: (a, b) => a.expiry_date.localeCompare(b.expiry_date),
      render: (value) => getAntDateTimeFormat(value),
      key: "expiry_date"
    },
    {
      title: "Status",
      dataIndex: "coupon_status",
      width: "120px",
      key: "coupon_status",
      sorter: (a, b) => a.coupon_status.localeCompare(b.coupon_status),
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

  // Function to fetch user data
  const fetchTableData = async (storeFilterData) => {
    try {
      // Ensure storeFilterData is defined, set to an empty object if not provided
      storeFilterData = storeFilterData || {};

      // Extract sort and status from storeFilterData
      const { sort, status } = storeFilterData;

      // Define the base URL for the API endpoint
      let baseUrl = `/coupons/all/${searchEnable.current ? 0 : current - 1}/${pageSize}`;

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

  // Function to delete coupon
  const { mutate: deleteMutate } = useMutation(
    // Mutation function to handle the API call for creating a new coupons
    (data) => apiService.deleteCoupon(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (res, payload) => {

        if (data.length == payload?.load?.couponIds?.length) {
          setCurrent(1)
        }

        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(res.message, snackBarSuccessConf);
        setSelectedRowKeys([]);
        setDelAllVisible(false);

        queryClient.invalidateQueries("fetchCouponData");
        refetch();
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
        // enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // Destructure data, mutate function, loading status, and refetching status from useMutation hook
  const { data, mutate: refetch, isLoading } = useMutation("fetchCouponData", fetchTableData);

  const filterDeleteIds = (deleteArr) => {
    try {
      const filteredKeys = data
        .filter((obj) => deleteArr.includes(obj.key))
        .map((obj) => obj.coupon_id);
      return filteredKeys;
    } catch (error) { }
  };

  // Function to handle deletion of coupons
  const handleDelete = (data) => {
    try {
      // Create a request body with couponIds array
      const body = {
        couponIds: Array.isArray(data) ? filterDeleteIds(data) : [data.coupon_id]
      };
      // Define the request object with the API endpoint and request body
      let obj = { load: body };
      // Perform the API call for coupons deletion
      deleteMutate(obj);
    } catch (error) { }
  };

  // Function to handle Edit of coupons
  const handleEdit = (data) => {
    navigate(`/${Paths.couponEdit}/${data.coupon_id}`);
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
      title: "Coupon",
      icon: "tags",
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
    } catch (error) { }
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Typography.Title level={5}>All Coupons</Typography.Title>
      <Spin spinning={loader} fullscreen />

      <>
        <Row gutter={[12, 30]}>
          <Col className="gutter-row" span={24}>
            <Flex justify="space-between" gap="middle">
              <Search
                className="search_bar_box"
                size="large"
                placeholder="Search Here..."
                onSearch={handleSearchSubmit}
                onChange={handleSearch}
                onKeyPress={handleKeyPress}
                allowClear
                style={StyleSheet.searchBarStyle}
              />
              <Flex justify="space-between" gap="middle">
                {actionsPermissionValidator(window.location.pathname, PermissionAction.DELETE) && delAllVisible && (
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
                  <NavLink to={`/${Paths.couponAdd}`}>
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
        loading={isLoading}
        scroll={{
          x: checkInnerWidth() ? '1200px' : 'auto'
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
    <></>
  );
}
