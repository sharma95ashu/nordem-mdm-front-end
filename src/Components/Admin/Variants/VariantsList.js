/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-undef */
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
  Select,
  Space,
  theme,
  Divider,
  Popconfirm,
  Grid
} from "antd";

import {
  DeleteOutlined,
  DownCircleOutlined,
  FilterOutlined,
  UpCircleOutlined
} from "@ant-design/icons";
import { enqueueSnackbar } from "notistack";
import { PermissionAction, snackBarErrorConf, snackBarSuccessConf } from "Helpers/ats.constants";
import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { PlusOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { useUserContext } from "Hooks/UserContext";
import { Content } from "antd/es/layout/layout";
import { actionsPermissionValidator, firstlettCapital } from "Helpers/ats.helper";
import { tabletWidth } from "Helpers/ats.constants";

const VariantsList = () => {
  const queryClient = useQueryClient();
  const { Search } = Input;
  const { Title } = Typography;
  const [current, setCurrent] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [storeInputValue, setstoreInputValue] = useState("");
  const [loader, setLoader] = useState(false);
  const [submitSearchInpt, setSubmitSearchInput] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const { apiService } = useServices();

  const { setBreadCrumb, setWindowWidth, windowWidth } = useUserContext();
  const navigate = useNavigate();
  const searchEnable = useRef();
  const [parentAttributes, setParentAttributes] = useState([]);
  const [attributesValue, setAttributesValue] = useState(null);
  const [dataList, setDateList] = useState([]);
  const [tableText, setTableText] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [delAllVisible, setDelAllVisible] = useState(false);

  const {
    token: {
      colorBgLayout,
      borderRadiusLG,
      paddingContentHorizontal,
      colorBorder,
      sizeSM,
      colorError,
      colorPrimary,
      colorPrimaryBg,
      colorPrimaryBorder
    }
  } = theme.useToken();

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  // check window inner width
  const checkInnerWidth = () => {
    try {
      return !screens.lg && (screens.md || screens.sm || screens.xs);
    } catch (error) {}
  };

  const StyleSheet = {
    searchBarStyle: {
      marginBottom: 5
    },
    formItemStyle: {
      marginBottom: 0
    },
    paginationStyle: {
      marginTop: 25
    },
    contentSubStyle: {
      background: colorPrimaryBg,
      padding: paddingContentHorizontal,
      borderRadius: borderRadiusLG,
      marginBottom: 10,
      border: "1px solid",
      borderColor: colorPrimaryBorder,
      marginTop: 5
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
    filterIconStyle: {
      marginRight: 6,
      marginTop: 2,
      color: colorPrimary
    },
    searchLabelStyle: {
      height: "200px"
    }
  };
  /**
   * Variant Header row data
   */
  const columns = [
    {
      title: "Attribute Value",
      dataIndex: "attr_value",
      key: "attr_value",
      width: checkInnerWidth() ? "200px" : "auto",
      sorter: (a, b) => a.attr_value.localeCompare(b.attr_value)
    },
    {
      title: "Attribute Name",
      dataIndex: "attr_id",
      key: "attr_id",
      width: "190px",
      sorter: (a, b) => a?.attribute?.attr_name.localeCompare(b?.attribute?.attr_name),
      render: (value, record) => (
        <Typography.Text className="textCapitalize">{record?.attribute?.attr_name}</Typography.Text>
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
      width: "120px",
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
      width: "170px",
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

  const fetchTableData = async (reset = false) => {
    try {
      // Define the base URL for the API endpoint
      let baseUrl = `/attributeValues/all/${searchEnable.current ? 0 : current - 1}/${pageSize}`;

      // Flag to check if any filter value is empty
      let isAnyValueEmpty = false;

      // Check if status is provided, update isAnyValueEmpty accordingly
      if (!reset && attributesValue !== "") {
        isAnyValueEmpty = true;
      }

      // Create filterData object with status as a key-value pair
      const filterData = {
        ...{ attr_id: attributesValue }
      };

      // Convert filterData to JSON string
      const convertData = JSON.stringify(filterData);

      // Construct parameters for the API request
      const params = {
        ...(searchTerm && { searchTerm: searchTerm.trim() }),
        ...(isAnyValueEmpty && {
          filterTerm: convertData
        })
      };

      // Construct the complete API URL with parameters
      const apiUrl = `${baseUrl}?${new URLSearchParams(params).toString()}`;

      // Make an API call to get the table data
      const data = await apiService.getRequest(apiUrl);

      // Check if the API call is successful
      if (data.success) {
        let tableData = [];
        searchEnable.current = false;
        // if (attributesValue) {
        tableData = data?.data?.data.map((item, index) => ({ ...item, key: index }));
        setDateList(tableData || []);
        setTotal(data?.data?.total_count);
        // }

        // Return the fetched data
        return tableData;
      }
    } catch (error) {
      // Handle errors by displaying a Snackbar notification
    }
  };

  // Destructure data, mutate function, loading status, and refetching status from useMutation hook
  const { data, mutate: refetch, isLoading } = useMutation("fetchVariantData", fetchTableData);

  // Function to delete attribute value
  const { mutate: deleteMutate } = useMutation(
    // Mutation function to handle the API call for creating a new variants
    (data) => apiService.deleteVariant(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (res, payload) => {
        if (data.length == payload?.load?.attributeValueIds?.length) {
          setCurrent(1);
        }

        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(res.message, snackBarSuccessConf);
        setSelectedRowKeys([]);
        setDelAllVisible(false);

        // Invalidate the "getAllRoles" query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchVariantData");
        refetch();
      },
      onError: (error) => {
        setSelectedRowKeys([]);
        // enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // UseQuery hook for fetching data of a All Attributes from the API
  useQuery(
    "getAllAttributes",

    // Function to fetch data of a single Category using apiService.getRequest
    () => apiService.getRequest(`/attributes/all/0/1000?`),
    {
      // Configuration options
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        // Set form values based on the fetched data
        setParentAttributes([]);
        data?.data?.data.map((item) =>
          setParentAttributes((prev) => [...prev, { value: item?.attr_id, label: item?.attr_name }])
        );
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const filterDeleteIds = (deleteArr) => {
    try {
      const filteredKeys = data
        .filter((obj) => deleteArr.includes(obj.key))
        .map((obj) => obj.attr_val_id);
      return filteredKeys;
    } catch (error) {}
  };

  // Function to handle deletion of variants
  const handleDelete = (data) => {
    try {
      // Create a request body with variantsIds array
      const body = {
        attributeValueIds: Array.isArray(data) ? filterDeleteIds(data) : [data.attr_val_id]
      };
      // Define the request object with the API endpoint and request body
      let obj = { load: body };
      // Perform the API call for variants deletion
      deleteMutate(obj);
    } catch (error) {}
  };

  // Function to handle Edit of variants
  const handleEdit = (data) => {
    navigate(`/${Paths.variantsEdit}/${data.attr_val_id}`);
  };

  /**
   * Set Breadcrumb for global update
   */
  useEffect(() => {
    setBreadCrumb({
      title: "Attribute Values",
      icon: "variants",
      path: Paths.variantsList
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
    //if (attributesValue) {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? refetch()
      : navigate("/", { state: { from: null }, replace: true });
    // }
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

  // Run useEffect to get the updated data when a user changes attribute
  useEffect(() => {
    setTableText(false);
    refetch();
  }, [attributesValue]);

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

  //  Handle Reset Filter
  const handleReset = () => {
    setTotal(0);
    setAttributesValue(null);
    // Reset filter true
    setCurrent(1);
    setDateList([]);
    setTableText(true);
    setSearchTerm("");
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
      <Title level={5}>All Attribute Values</Title>
      <Spin spinning={loader} fullscreen />
      <Row gutter={[0, 6]}>
        <Col className="gutter-row" span={24}>
          <Flex gap="middle" justify="end">
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
                <Flex style={StyleSheet.flexFullStyle} gap="middle" justify="flex-end">
                  <NavLink to={`/${Paths.variantsAdd}`}>
                    <Button size="large" type="primary" block className="wrapButton">
                      <PlusOutlined />
                      Add New
                    </Button>
                  </NavLink>
                </Flex>
              )}
            </Flex>
          </Flex>
        </Col>
        <Col className="gutter-row" span={24}>
          <Content style={StyleSheet.contentSubStyle}>
            <Row>
              <Col flex="auto">
                <Search
                  addonBefore={
                    <Select
                      allowClear
                      showSearch
                      className="treeselectCustomCss"
                      size="large"
                      value={attributesValue || "All Attribute"}
                      onChange={(value) => {
                        setAttributesValue(value);
                        document.activeElement.blur();
                        setCurrent(1);
                        setPageSize(10);
                      }}
                      onClear={() => {
                        handleReset();
                        setCurrent(1);
                        setPageSize(10);
                        document.activeElement.blur();
                      }}
                      placeholder="Select Attributes"
                      // filterOption={(input, option) => (option?.label ?? "").includes(input)}
                      filterOption={(input, option) =>
                        (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                      }
                      options={parentAttributes}
                    />
                  }
                  size="large"
                  placeholder="Search attribute values within selected attribute..."
                  enterButton="Search"
                  value={searchTerm}
                  onSearch={handleSearchSubmit}
                  onChange={handleSearch}
                  onKeyPress={handleKeyPress}
                  allowClear
                  style={StyleSheet.searchBarStyle}
                  className="custom-input-hover"
                />
              </Col>
            </Row>
            <Row className="noteStyle">
              Note: Use search attributes to get all attribute values related to the selected
              attribute.
            </Row>
          </Content>
        </Col>
      </Row>
      <Table
        columns={columns}
        rowSelection={rowSelection}
        dataSource={dataList}
        pagination={false}
        bordered={true}
        loading={isLoading}
        locale={tableText ? { emptyText: "Please Select Attribute" } : { emptyText: "No Data" }}
        scroll={{
          x: checkInnerWidth() ? "970px" : "auto"
        }}
      />

      <div style={StyleSheet.paginationStyle}>
        <Pagination
          total={total}
          showTotal={(total) => `Total ${total} items`}
          defaultPageSize={pageSize}
          defaultCurrent={1}
          current={current}
          pageSize={pageSize}
          showQuickJumper
          onChange={(newPage, newPageSize) => {
            setSelectedRowKeys([]);
            setCurrent(newPage);
            setPageSize(newPageSize);
            setSelectedRowKeys([]);
            // if (isSearch) {
            //   searchFn(newPage, newPageSize, null);
            // } else {
            //   fetchRecords(newPage, newPageSize, isSearch);
            // }
          }}
          // onShowSizeChange={onShowSizeChange}
          showSizeChanger={true}
        />
      </div>
    </>
  ) : (
    <></>
  );
};
export default VariantsList;
