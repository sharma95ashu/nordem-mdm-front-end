import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  Pagination,
  Input,
  Tag,
  Button,
  Col,
  Row,
  Typography,
  Popconfirm,
  Divider,
  theme,
  Flex,
  Spin
} from "antd";

import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { NavLink, useNavigate } from "react-router-dom";
import { actionsPermissionValidator, formatString, getAntDateTimeFormat } from "Helpers/ats.helper";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import { tabletWidth } from "Helpers/ats.constants";

export default function OffersList() {
  const { Search } = Input;
  const { setBreadCrumb, setWindowWidth, windowWidth } = useUserContext();
  const [current, setCurrent] = useState(1);
  const [loader, setLoader] = useState(false);
  const searchEnable = useRef();
  const [pageSize, setpageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [submitSearchInpt, setSubmitSearchInput] = useState(false);
  const [storeInputValue, setstoreInputValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const {
    token: { colorBorder, colorError }
  } = theme.useToken();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [delAllVisible, setDelAllVisible] = useState(false);

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

  // Function to handle Edit Offer
  const handleEdit = (data) => {
    navigate(`/${Paths.offersEdit}/${data.offer_id}`);
  };

  const filterDeleteIds = (deleteArr) => {
    const filteredKeys = data
      .filter((obj) => deleteArr.includes(obj.key))
      .map((obj) => obj.offer_id);
    return filteredKeys;
  };

  // Function to handle deletion of multiple users
  const handleDelete = (data) => {
    try {
      setLoader(true);
      if (data) {
        const body = {
          offerIds: Array.isArray(data) ? filterDeleteIds(data) : [data]
        };

        deleteOffer(body);
      }
    } catch (error) {}
  };

  // UseMutation hook for deleting offer
  const { mutate: deleteOffer } = useMutation(
    "deleteOffer", // Unique mutation key for tracking in the query client
    // Mutation function to handle the API call for deleting user data
    (data) => apiService.deleteSingleOffer(data),
    {
      // Configuration options for the mutation
      onSuccess: (res, payload) => {
        setLoader(false);

        if (data.length == payload?.load?.walletMapIds?.length) {
          setCurrent(1);
        }

        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(res.message, snackBarSuccessConf);
        setSearchTerm("");
        setSelectedRowKeys([]);
        setDelAllVisible(false);
        // Call the refetch function to fetch updated data after deletion
        fetchAllOffersList();
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
        // enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );
  // Column list for table
  const columns = [
    {
      title: "Offer Name",
      dataIndex: "offer_name",
      width: checkInnerWidth() ? "200px" : "auto",
      sorter: (a, b) => a.offer_name.localeCompare(b.offer_name),
      key: "offer_name"
    },
    {
      title: "Offer Type",
      dataIndex: "offer_type",
      width: checkInnerWidth() ? "250px" : "auto",
      sorter: (a, b) => a.offer_type.localeCompare(b.offer_type),
      key: "offer_name",
      render: (value, record) => (
        <Typography.Text className="textCapitalize">{formatString(value)}</Typography.Text>
      )
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      width: "150px",
      key: "start_date",
      sorter: (a, b) => a.start_date.localeCompare(b.start_date),
      render: (value) => getAntDateTimeFormat(value)
    },
    {
      title: "End Date",
      dataIndex: "expiry_date",
      width: "150px",
      key: "expiry_date",
      sorter: (a, b) => a.expiry_date.localeCompare(b.expiry_date),
      render: (value) => getAntDateTimeFormat(value)
    },
    {
      title: "Reduce PV",
      dataIndex: "reduce_pv",
      width: "120px",
      key: "reduce_pv",
      render: (value, record) => (
        <Typography.Text className="textCapitalize">{value ? "Yes" : "No"}</Typography.Text>
      )
    },

    {
      title: "Status",
      dataIndex: "offer_status",
      width: "120px",
      key: "offer_status",
      sorter: (a, b) => a.offer_status.localeCompare(b.offer_status),
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
              <Divider
                style={StyleSheet.verDividerStyle}
                type="vertical"
                className="removeMargin"
              />
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
                handleDelete(record?.offer_id);
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

  const fetchTableData = async (storeFilterData) => {
    try {
      setLoader(true);
      // Ensure storeFilterData is defined, set to an empty object if not provided
      storeFilterData = storeFilterData || {};

      // Extract sort and status from storeFilterData
      const { sort, status } = storeFilterData;

      // Define the base URL for the API endpoint
      let baseUrl = `/offers/all/${searchEnable.current ? 0 : current - 1}/${pageSize}`;

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
        setTotal(data?.data?.total_count);
        setLoader(false);
        //inserting key foo antd table delete functionality
        let tableData = data?.data?.data.map((item, index) => ({ ...item, key: index }));
        // Return the fetched data
        return tableData;
      }
    } catch (error) {
      // Handle errors by displaying a Snackbar notification
    }
  };

  // Destructure data, mutate function, loading status, and refetching status from useMutation hook
  const { data, mutate: fetchAllOffersList } = useMutation("fetchAllOffersList", fetchTableData);

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    setBreadCrumb({
      title: "Offers",
      icon: "tags",
      path: Paths.users
    });
    fetchAllOffersList();
  }, []);

  // search bar button when click search button then call api
  const handleSearchSubmit = () => {
    if (searchTerm !== null && searchTerm !== "" && searchTerm !== storeInputValue) {
      searchEnable.current = true;
      actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
        ? fetchAllOffersList()
        : navigate("/", { state: { from: null }, replace: true });
      setSubmitSearchInput(true);
      setstoreInputValue(searchTerm.trim());
    }
  };

  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? fetchAllOffersList()
      : navigate("/", { state: { from: null }, replace: true });
  }, [current, pageSize]);

  // Search table data clear input then call api
  useEffect(() => {
    if (searchTerm === "" && submitSearchInpt) {
      actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
        ? fetchAllOffersList()
        : navigate("/", { state: { from: null }, replace: true });

      setSubmitSearchInput(false);
      setstoreInputValue("");
    }
  }, [searchTerm, submitSearchInpt]);
  // handle table search row data
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
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
    loader ? (
      <Spin loader={loader} fullscreen />
    ) : (
      <>
        <Typography.Title level={5}>All Offers</Typography.Title>
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
                    <NavLink to={`/${Paths.offersAdd}`}>
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
            x: checkInnerWidth() ? "1200px" : "auto"
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
              setpageSize(newPageSize);
              setSelectedRowKeys([]);
            }}
            showSizeChanger={true}
            showQuickJumper
          />
        </div>
      </>
    )
  ) : (
    <></>
  );
}
