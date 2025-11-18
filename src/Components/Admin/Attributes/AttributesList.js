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
  Drawer,
  AutoComplete,
  Form,
  Breadcrumb,
  Col,
  Row,
  Flex,
  Select,
  Space,
  theme,
  Divider,
  Popconfirm
} from "antd";

import {
  DeleteOutlined,
  DownloadOutlined,
  FilterOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { enqueueSnackbar } from "notistack";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQueryClient } from "react-query";
import { tabletWidth } from "Helpers/ats.constants";
import BreadcrumbBox from "Components/Shared/BreadcrumbBox";
import { Checkbox, Switch, Upload } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import { message } from "antd";
import { Typography } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { useUserContext } from "Hooks/UserContext";
import {
  actionsPermissionValidator,
  capitalizeFirstLetterAndRemoveUnderScore,
  extractPlainText
} from "Helpers/ats.helper";
import * as XLSX from "xlsx";

const AttributesList = () => {
  const { Search } = Input;
  const [current, setCurrent] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");

  const [total, setTotal] = useState(0);
  const [storeInputValue, setstoreInputValue] = useState("");
  const [loader, setLoader] = useState(false);
  const [checkFilter, setCheckFilter] = useState(false);
  const [isSearch, setIsSearch] = useState(null);
  const [submitSearchInpt, setSubmitSearchInput] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const { apiService } = useServices();
  const [sorting, setSorting] = useState([]);
  const queryClient = useQueryClient();
  const { setBreadCrumb, setWindowWidth, windowWidth } = useUserContext();
  const navigate = useNavigate();
  const searchEnable = useRef();
  const { Title } = Typography;
  const { TextArea } = Input;
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

  const {
    token: { colorBorder, colorError }
  } = theme.useToken();

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

  const columns = [
    {
      title: "Attribute Name",
      dataIndex: "attr_name",
      key: "attr_name",
      width: checkInnerWidth() ? "120px" : "auto",
      sorter: (a, b) => a.attr_name.localeCompare(b.attr_name)
    },
    {
      title: "Display Order",
      dataIndex: "display_order",
      width: checkInnerWidth() ? "120px" : "150px",
      key: "display_order",
      sorter: (a, b) => a.display_order - b.display_order
    },
    {
      title: "Is Single",
      dataIndex: "is_single",
      width: "120px",
      key: "is_single",
      sorter: (a, b) => a.is_single - b.is_single,
      render: (value) => <>{value ? <Tag color="success">Yes</Tag> : <Tag color="error">No</Tag>}</>
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

  /**
   * Function to fetch attribute list
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
      let baseUrl = `/attributes/all/${searchEnable.current ? 0 : current - 1}/${pageSize}`;

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
  const { data, mutate: refetch, isLoading } = useMutation("fetchAttributesData", fetchTableData);

  // Function to delete attribute
  const { mutate: deleteMutate } = useMutation(
    // Mutation function to handle the API call for creating a new brands
    (data) => apiService.deleteAttributes(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (res, payload) => {
        if (data.length == payload?.load?.attrIds?.length) {
          setCurrent(1);
        }

        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(res.message, snackBarSuccessConf);
        setSelectedRowKeys([]);
        setDelAllVisible(false);

        // Invalidate the "getAllRoles" query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchAttributesData");
        refetch();
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
        .map((obj) => obj.attr_id);
      return filteredKeys;
    } catch (error) { }
  };

  // Function to handle deletion of brands
  const handleDelete = (data) => {
    try {
      // Create a request body with brandIds array
      const body = {
        attrIds: Array.isArray(data) ? filterDeleteIds(data) : [data.attr_id]
      };

      // Define the request object with the API endpoint and request body
      let obj = { load: body };
      // Perform the API call for brands deletion
      deleteMutate(obj);
    } catch (error) { }
  };

  // Function to handle Edit of brands
  const handleEdit = (data) => {
    navigate(`/${Paths.attributesEdit}/${data.attr_id}`);
  };

  /**
   * UseEffect function to set breadcrumb
   */
  useEffect(() => {
    setBreadCrumb({
      title: "Attributes",
      icon: "attributes",
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
    } catch (error) { }
  };
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange
  };

  // this method used to download excel file
  const downloadSheet = () => {
    try {
      const capitalizedData = data.map((obj) => {
        const newObj = {};
        for (let key in obj) {
          if (["attr_name", "display_order", "is_single", "status"].includes(key)) {
            if (key == "attr_name") {
              newObj["Attribute Name"] = obj[key];
            } else if (key == "is_single") {
              newObj["Is single"] = obj[key] ? 1 : 0;
            } else if (key == "display_order") {
              newObj["Display order"] = obj[key];
            } else if (key == "status") {
              newObj["Status"] = obj[key];
            } else {
              //
            }
          }
        }
        return newObj;
      });
      const ws = XLSX.utils.json_to_sheet(capitalizedData);
      // Freeze the first row
      ws["!freeze"] = {
        xSplit: 0,
        ySplit: 1,
        topLeftCell: "A2",
        activePane: "bottomRight",
        state: "frozen"
      };

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, ws, "Attribute List");
      XLSX.writeFile(workbook, "attribute-sheet.xlsx");
    } catch (error) { }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Title level={5}>All Attributes</Title>
      <Spin spinning={loader} fullscreen />
      <>
        <Row gutter={[12, 30]}>
          <Col className="gutter-row" span={24}>
            <Flex justify="space-between" gap="middle">
              <Search
                className="search_bar_box"
                style={StyleSheet.searchBarStyle}
                size="large"
                placeholder="Search Here..."
                value={searchTerm}
                onSearch={handleSearchSubmit}
                onChange={handleSearch}
                onKeyPress={handleKeyPress}
                allowClear
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
                <Button
                  type="primary"
                  size="large"
                  onClick={downloadSheet}
                  icon={<DownloadOutlined />}>
                  Download
                </Button>
                {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                  <NavLink to={`/${Paths.attributesAdd}`}>
                    <Button size="large" type="primary" block className="wrapButton">
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
        loading={isLoading}
        bordered={true}
        scroll={{
          x: checkInnerWidth() ? "800px" : "auto"
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
};
export default AttributesList;
