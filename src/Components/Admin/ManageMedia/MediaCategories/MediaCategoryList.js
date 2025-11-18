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
  TreeSelect
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { PermissionAction, snackBarErrorConf, snackBarSuccessConf } from "Helpers/ats.constants";

import { actionsPermissionValidator, firstlettCapital } from "Helpers/ats.helper";

import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQuery } from "react-query";
import { enqueueSnackbar } from "notistack";
import { useUserContext } from "Hooks/UserContext";
import { Content } from "antd/es/layout/layout";

const MediaCategoryList = () => {
  const { Search } = Input;
  const { setBreadCrumb } = useUserContext();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryValue, setCategoryValue] = useState(undefined);
  const [storeInputValue, setstoreInputValue] = useState("");
  const [parentCategory, setParentCategory] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const searchEnable = useRef();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [submitSearchInput, setSubmitSearchInput] = useState(false);

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

  const StyleSheet = {
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
    formItemStyle: {
      marginBottom: 0
    },
    filterIconStyle: {
      marginRight: 6,
      marginTop: 2,
      color: colorPrimary
    },
  };

  // Function to fetch menu data
  const fetchTableData = async (reset = false) => {
    try {
      // Define the base URL for the API endpoint
      let baseUrl = `/media_categories/get-all/${searchEnable.current ? 0 : current - 1
        }/${pageSize}`;

      // Flag to check if any filter value is empty
      let isAnyValueEmpty = false;

      // Check if category is provided, update isAnyValueEmpty accordingly
      if (categoryValue && !reset && categoryValue !== "") {
        isAnyValueEmpty = true;
      }

      // Create filterData object with category id as a key-value pair
      const filterData = {
        ...{ media_category_id: categoryValue }
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
        searchEnable.current = false;
        setTotal(data?.data?.total_count);
        let tableData = data?.data?.data.map((item, index) => ({ ...item, key: index }));

        // Return the fetched data
        return tableData; //
      }
    } catch (error) {
      console.log(error);
      // Handle errors by displaying a Snackbar notification
    }
  };

  // Destructure data, mutate function, loading status, and refetching status from useMutation hook
  const {
    data,
    mutate: refetch,
    isLoading
  } = useMutation("fetchAllMediaCategoryListData", fetchTableData);

  // Calling api when click pagination
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? refetch()
      : navigate("/", { state: { from: null }, replace: true });
  }, [current, pageSize]);

  const columns = [
    {
      title: "Media Category Name",
      dataIndex: "media_category_name",
      width: "250px",
      key: "media_category_name",
      sorter: (a, b) => a.media_category_name.localeCompare(b.media_category_name),
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value || "-"}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Media Sub Category",
      width: "140px",
      dataIndex: "children",
      key: "children",
      sorter: (a, b) => parseInt(a?.children?.length || 0) - parseInt(b?.children?.length || 0),
      render: (value, record) => (
        <Space>
          <Typography.Text>{value?.length || 0}</Typography.Text>
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
    },
    {
      title: "Action",
      align: "center",
      dataIndex: "action",
      width: "190px",
      key: "action",
      fixed: "right",
      render: (text, record) => (
        <Flex gap="small" justify="center" align="center">
          {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) && (
            <>
              <Button
                type="default"
                primary
                onClick={() => navigate(`/${Paths.mediaCategoryEdit}/${record.media_category_id}`)}>
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

  // Function to delete menu
  const { mutate: deleteMutate, isLoading: deleteLoading } = useMutation(
    // Mutation function to handle the API call for creating a new tags
    (data) => apiService.deleteMediaCategory(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (res, payload) => {
        if (res) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(res.message, snackBarSuccessConf);
          refetch(); // api call for table data
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // Function to handle deletion of menu
  const handleDelete = (data) => {
    try {
      // Create a request body with menuIds array
      const body = {
        categoryIds: [data.media_category_id]
      };

      // Define the request object with the API endpoint and request body
      let obj = { load: body };

      // Perform the API call for menu deletion
      deleteMutate(obj);
    } catch (error) {
      console.log(error);
    }
  };

  const apiUrl = `/media_categories/all`;

  // UseQuery hook for fetching data of a All Category from the API
  useQuery(
    "getAllCategory",

    // Function to fetch data of a single Category using apiService.getRequest
    () => apiService.getRequest(apiUrl),
    {
      // Configuration options
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        // Set form values based on the fetched data
        setParentCategory([]);

        data?.data?.data?.map((item) =>
          setParentCategory((prev) => [
            ...prev,
            {
              value: item.media_category_id,
              label: firstlettCapital(item.media_category_name),
              children: item?.children?.map((child) => ({
                value: child.media_category_id,
                label: firstlettCapital(child.media_category_name)
              }))
            }
          ])
        );
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  /**
   * function to filter by label in multi select dropdown
   * @param {} inputValue
   * @param {*} treeNode
   * @returns
   */
  const filterTreeNode = (inputValue, treeNode) => {
    // Check if the input value matches any part of the label of the treeNode
    return treeNode.label.toLowerCase().includes(inputValue.toLowerCase());
  };

  /**
   * Filter rest
   */

  const handleReset = () => {
    setCategoryValue(null);
    setCurrent(1);
    // Reset filter true
    refetch(true);
    setSearchTerm("")
  };

  useEffect(() => {
    setBreadCrumb({
      title: "Manage Media / Media Categories",
      icon: "menuManagement",
      path: Paths.users
    });
  }, []);

  // handle table search row data
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

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

  // Run useEffect to get the updated data when a user changes media category
  useEffect(() => {
    refetch()
  }, [categoryValue])

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Typography.Title level={5}>All Media Categories</Typography.Title>
      <Row gutter={[0, 6]}>
        <Col className="gutter-row" span={24}>
          <Flex gap="middle" justify="end" >

            <Flex justify="space-between" gap="middle">
              {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                <Flex style={StyleSheet.flexFullStyle} gap="middle" justify="flex-end">
                  <NavLink to={`/${Paths.mediaCategoryAdd}`}>
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

        <Col className="gutter-row" span={24}>
          <Content style={StyleSheet.contentSubStyle}>
            <Row>
              <Col flex="auto">
                <Search
                  addonBefore={
                    <TreeSelect
                      allowClear
                      showSearch
                      treeDefaultExpandAll
                      className="treeselectCustomCss"
                      value={categoryValue || "All Category"}
                      size="large"
                      treeData={parentCategory}
                      filterTreeNode={filterTreeNode}
                      onChange={(value) => {
                        setCategoryValue(value);
                        document.activeElement.blur();
                      }}
                      onClear={() => {
                        handleReset();
                        document.activeElement.blur();
                      }}
                      placeholder="Select Media Category"
                    />
                  }
                  size="large"
                  placeholder="Search media category names within selected media category..."
                  enterButton="Search"
                  value={searchTerm}
                  onSearch={handleSearchSubmit}
                  onChange={handleSearch}
                  allowClear
                  className="custom-input-hover"
                />
              </Col>
            </Row>
            <Row className="noteStyle">
              Note: Use search media category to get all media category names related to the selected media category.
            </Row>
          </Content>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        pagination={false}
        bordered={true}
        loading={isLoading || deleteLoading}
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
            setCurrent(newPage);
            setPageSize(newPageSize);
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

export default MediaCategoryList;
