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
  Popconfirm
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";

import { actionsPermissionValidator } from "Helpers/ats.helper";

import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQueryClient } from "react-query";
import { enqueueSnackbar } from "notistack";
import { useUserContext } from "Hooks/UserContext";

const MenuMangementList = () => {
  // const { Search } = Input;
  const { setBreadCrumb } = useUserContext();
  // const [searchTerm, setSearchTerm] = useState("");
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  // const [menuValue, setMenuValue] = useState(undefined);
  // const [submitSearchInput, setSubmitSearchInput] = useState(false);
  // const [storeInputValue, setstoreInputValue] = useState("");
  // const [parentMenuList, setParentMenuList] = useState([]);
  // const [applyBtn, setApplyBtn] = useState(false);
  const searchEnable = useRef();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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

  // Function to fetch menu data
  const fetchTableData = async (reset = false) => {
    try {
      // Define the base URL for the API endpoint
      let baseUrl = `/menu_management/all/${searchEnable.current ? 0 : current - 1}/${pageSize}`;

      // Flag to check if any filter value is empty
      let isAnyValueEmpty = false;

      // Check if menu is provided, update isAnyValueEmpty accordingly
      // if (menuValue && !reset && menuValue !== "") {
      //   isAnyValueEmpty = true;
      // }

      // Create filterData object with category id as a key-value pair
      // const filterData = {
      //   ...{ menu_id: menuValue }
      // };

      // Convert filterData to JSON string
      // const convertData = JSON.stringify(filterData);

      // Construct parameters for the API request
      const params = {
        // ...(searchTerm && { searchTerm: searchTerm.trim() }),
        ...(isAnyValueEmpty && {
          filterTerm: null //convertData
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
  const { data, mutate: refetch, isLoading } = useMutation("fetchAllMenusData", fetchTableData);

  // Calling api when click pagination
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? refetch()
      : navigate("/", { state: { from: null }, replace: true });
  }, [current, pageSize]);

  // Search table data clear input then call api
  // useEffect(() => {
  //   if (searchTerm === "" && submitSearchInput) {
  //     actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
  //       ? refetch()
  //       : navigate("/", { state: { from: null }, replace: true });
  //     setSubmitSearchInput(false);
  //     setstoreInputValue("");
  //   }
  // }, [searchTerm, submitSearchInput]);

  // handle table search row data
  // const handleSearch = (event) => {
  //   setSearchTerm(event.target.value);
  // };

  // search bar button when click search button then call api
  // const handleSearchSubmit = () => {
  //   if (searchTerm !== null && searchTerm !== "" && searchTerm !== storeInputValue) {
  //     searchEnable.current = true;
  //     actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
  //       ? refetch()
  //       : navigate("/", { state: { from: null }, replace: true });
  //     setSubmitSearchInput(true);
  //     setstoreInputValue(searchTerm.trim());
  //   }
  // };

  const columns = [
    {
      title: "Menu Title",
      dataIndex: "menu_title",
      width: "250px",
      key: "menu_title",
      sorter: (a, b) => a.menu_title.localeCompare(b.menu_title),
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value || "-"}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Menu Type",
      width: "200px",
      dataIndex: "menu_type",
      key: "menu_type",
      // sorter: (a, b) => a.menu_type.localeCompare(b.menu_type),
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">
            {value ? (value == "category_mega_menu" ? "Category Mega Menu" : value) : "-"}
          </Typography.Text>
        </Space>
      )
    },
    {
      title: "Sub Menu",
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
              <Button
                type="default"
                primary
                disabled={record?.type == "mdm_categories"}
                onClick={() => navigate(`/${Paths.manageMenuListEdit}/${record.menu_id}`)}>
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
              <Button type="default" danger disabled={record?.type == "mdm_categories"}>
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
    (data) => apiService.deleteMenus(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (res, payload) => {
        if (res) {
          if (data.length == payload?.load?.categoryIds?.length) {
            setCurrent(1);
          }

          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(res.message, snackBarSuccessConf);
          // Invalidate the "getAllRoles" query in the query client to trigger a refetch
          queryClient.invalidateQueries("fetchAllMenusData");
          refetch();
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
        menuIds: [data.menu_id]
      };

      // Define the request object with the API endpoint and request body
      let obj = { load: body };

      // Perform the API call for menu deletion
      deleteMutate(obj);
    } catch (error) {
      console.log(error);
    }
  };

  // // UseMutation hook for fetching parent menu list data via API
  // useQuery("getParentMenuList", () => apiService.getParentMenuListData(), {
  //   // Configuration options for the mutation
  //   onSuccess: (data) => {
  //     if (data.data) {
  //       // modifying data foo treeSelect component
  //       const tempArr = data.data?.map((item) => ({
  //         value: item.menu_id,
  //         label: firstlettCapital(item.menu_title),
  //         children: item?.children?.map((child) => ({
  //           value: child.menu_id,
  //           label: firstlettCapital(child.menu_title),
  //           children: child?.children?.map((subchild) => ({
  //             value: subchild.menu_id,
  //             label: firstlettCapital(subchild.menu_title)
  //           }))
  //         }))
  //       }));
  //       setParentMenuList(tempArr);
  //     }
  //   },
  //   onError: (error) => {
  //     //
  //   }
  // });

  /**
   * Filter rest
   */

  // const handleReset = () => {
  //   setApplyBtn(true);
  //   setMenuValue(null);
  //   setCurrent(1);
  //   // Reset filter true
  //   refetch(true);
  // };

  // function to filter by label in multi select dropdown
  // const filterTreeNode = (inputValue, treeNode) => {
  //   // Check if the input value matches any part of the label of the treeNode
  //   setApplyBtn(true);

  //   return treeNode.label.toLowerCase().includes(inputValue.toLowerCase());
  // };

  //  Handle Apply Filter
  // const handleApplyFilter = () => {
  //   refetch();
  // };

  useEffect(() => {
    setBreadCrumb({
      title: "Menu Management",
      icon: "menuManagement",
      path: Paths.users
    });
  }, []);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Row gutter={[0, 0]}>
        <Col className="gutter-row" span={24} style={{ marginBottom: "20px" }}>
          <Flex gap="middle" justify="space-between">
            {/* <Search
              className="search_bar_box"
              size="large"
              placeholder="Search Here..."
              value={searchTerm}
              onSearch={handleSearchSubmit}
              onChange={handleSearch}
              allowClear
              style={StyleSheet.searchBarStyle}
            /> */}
            <Typography.Title level={5}>All Menus</Typography.Title>
            <Flex justify="space-between" gap="middle">
              {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                <Flex style={StyleSheet.flexFullStyle} gap="middle" justify="flex-end">
                  <NavLink to={`/${Paths.manageMenuListAdd}`}>
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
        {/* (
          <Col className="gutter-row" span={24}>
            <Content style={StyleSheet.contentSubStyle}>
              <Row gutter={[22, 10]}>
                <Col className="gutter-row" flex="auto">
                  <FormItem
                    label={
                      <>
                        <FilterOutlined style={StyleSheet.filterIconStyle} /> Filter
                      </>
                    }
                    style={StyleSheet.formItemStyle}>
                    <TreeSelect
                      allowClear
                      showSearch
                      treeDefaultExpandAll
                      className="width_full"
                      value={menuValue}
                      size="large"
                      treeData={parentMenuList}
                      filterTreeNode={filterTreeNode}
                      onChange={(value) => {
                        setMenuValue(value);
                        setApplyBtn(false);
                      }}
                      onClear={handleReset}
                      placeholder="Select menu"
                    />
                  </FormItem>
                </Col>
                <Col className="gutter-row" flex="250px">
                  <Row gutter={[10]}>
                    <Col className="gutter-row" span={12}>
                      <Button
                        block
                        type="default"
                        size="large"
                        onClick={handleApplyFilter}
                        disabled={menuValue === undefined || menuValue === "" || applyBtn}>
                        Apply
                      </Button>
                    </Col>
                    <Col className="gutter-row" span={12}>
                      <Button
                        block
                        type="text"
                        size="large"
                        onClick={handleReset}
                        disabled={menuValue === undefined || menuValue === "" || applyBtn}>
                        Reset
                      </Button>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Content>
          </Col>
        ) */}
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

export default MenuMangementList;
