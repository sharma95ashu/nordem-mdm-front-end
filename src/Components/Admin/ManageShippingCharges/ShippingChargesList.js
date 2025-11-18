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
  Tag,
  Space,
  theme,
  Divider,
  Popconfirm,
  Flex
} from "antd";

import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";
import { Typography } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { useUserContext } from "Hooks/UserContext";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { tabletWidth } from "Helpers/ats.constants";

const ShippingChargesList = () => {
  const navigate = useNavigate();

  const { Search } = Input;
  const { Title } = Typography;
  const { setBreadCrumb, setWindowWidth, windowWidth } = useUserContext();
  const searchEnable = useRef();
  const [current, setCurrent] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [storeInputValue, setstoreInputValue] = useState("");
  const [loader, setLoader] = useState(false);
  const [checkFilter, setCheckFilter] = useState(false);
  const [submitSearchInpt, setSubmitSearchInput] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const { apiService } = useServices();
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

  /**
   * Column constant show in table
   */
  const columns = [
    {
      title: "Dispatch By",
      dataIndex: "dispatch_by",
      sorter: (a, b) => a.dispatch_by.localeCompare(b.dispatch_by),
      width: checkInnerWidth() ? "150px" : "auto",
      key: "dispatch_by",
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value}</Typography.Text>
        </Space>
      )
    },
    // {
    //   title: "Order User group",
    //   dataIndex: "order_user_group",
    //   render: (value, record) => (
    //     <>
    //       <Flex gap={5}>
    //         {value?.map((item, index) => (
    //           <Tag key={index} color="default">
    //             {item}
    //           </Tag>
    //         ))}
    //       </Flex>
    //     </>
    //   )
    // },
    // {
    //   title: "Payment Methods",
    //   dataIndex: "payment_method",
    //   sorter: (a, b) => a.payment_method.localeCompare(b.payment_method),
    //   key: "payment_method",
    //   render: (value, record) => (
    //     <Space>
    //       <Typography.Text className="textCapitalize">{value}</Typography.Text>
    //     </Space>
    //   )
    // },
    {
      title: "Min. Order Amount",
      dataIndex: "minimum_order",
      sorter: (a, b) => a.minimum_order - b.minimum_order,
      key: "minimum_order",
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{"₹ " + value}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Max. Order Amount",
      dataIndex: "maximum_order",
      sorter: (a, b) => a.maximum_order - b.maximum_order,
      key: "maximum_order",
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{"₹ " + value}</Typography.Text>
        </Space>
      )
    },
    {
      title: `Payment Method`,
      dataIndex: "payment_method",
      key: "payment_method",
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value?.join(", ")}</Typography.Text>
          {/* <Typography.Text className="textCapitalize">{value}</Typography.Text> */}
        </Space>
      )
    },
    {
      title: `User Group`,
      dataIndex: "order_user_group",
      key: "order_user_group",
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value?.join(", ")}</Typography.Text>
        </Space>
      )
    },
    // {
    //   title: "Shippping Charges",
    //   dataIndex: "shipping_charges",
    //   sorter: (a, b) => a.shipping_charges - b.shipping_charges,
    //   key: "shipping_charges",
    //   render: (value, record) => (
    //     <Space>
    //       <Typography.Text className="textCapitalize">{"₹ " + value}</Typography.Text>
    //     </Space>
    //   )
    // },
    {
      title: "Status",
      dataIndex: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
      key: "status",
      width: "120px",
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

  // Function to delete brands
  const { mutate: deleteMutate } = useMutation(
    // Mutation function to handle the API call for creating a new brands
    (data) => apiService.deleteShippingCharges(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (res, payload) => {
        if (res) {
          if (data.length == payload?.load?.shippingChargeIds?.length) {
            setCurrent(1);
          }
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
        .map((obj) => obj.shipping_charges_id);
      return filteredKeys;
    } catch (error) {}
  };

  // Function to handle deletion of brands
  const handleDelete = (data) => {
    try {
      // Create a request body with brandIds array
      const body = {
        shippingChargeIds: Array.isArray(data) ? filterDeleteIds(data) : [data.shipping_charges_id]
      };

      // Define the request object with the API endpoint and request body
      let obj = { load: body };

      // Perform the API call for brands deletion
      deleteMutate(obj);
    } catch (error) {}
  };

  // Function to handle Edit of brands
  const handleEdit = (data) => {
    navigate(`/${Paths.shippingChargesEdit}/${data.shipping_charges_id}`);
  };

  /**
   * Function to fetch brand list
   * @param {*} storeFilterData
   * @returns
   */
  const fetchTableData = async (storeFilterData) => {
    try {
      // Ensure storeFilterData is defined, set to an empty object if not provided
      storeFilterData = storeFilterData || {};

      // Extract sort and status from storeFilterData
      const { sort, status } = storeFilterData;

      // Define the base URL for the API endpoint
      let baseUrl = `/shippingcharges/all/${searchEnable.current ? 0 : current - 1}/${pageSize}`;

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

  // Destructure data, mutate function, loading status, and refetching status from useMutation hook
  const { data, mutate: refetch, isLoading } = useMutation("fetchBrandData", fetchTableData);

  /**
   * UseEffect function to set breadcrumb
   */
  useEffect(() => {
    setBreadCrumb({
      title: "All Shipping Charges",
      icon: "shippingPrice",
      path: Paths.users
    });
  }, []);

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
      <Title level={5}>All Shipping Charges</Title>
      <Spin spinning={loader} fullscreen />
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
                <NavLink to={`/${Paths.shippingChargesAdd}`}>
                  <Button size="large" type="primary" className="wrapButton">
                    <PlusOutlined />
                    Add New
                  </Button>
                </NavLink>
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
        loading={isLoading}
        bordered={true}
        scroll={{
          x: checkInnerWidth() ? "1100px" : "auto"
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
          }}
          showSizeChanger={true}
          showQuickJumper
        />
      </div>
    </>
  ) : (
    ""
  );
};
export default ShippingChargesList;
