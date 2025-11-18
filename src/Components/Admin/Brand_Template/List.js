/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */

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
  Avatar,
  theme,
  Divider,
  Popconfirm,
  Flex,
  Modal
} from "antd";

import { DeleteOutlined, DownloadOutlined, PlusOutlined, UploadOutlined } from "@ant-design/icons";
import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQueryClient } from "react-query";
import { Typography } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { useUserContext } from "Hooks/UserContext";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import { actionsPermissionValidator, replaceHyphensAndGetTitle } from "Helpers/ats.helper";
import { tabletWidth } from "Helpers/ats.constants";

const BrandsList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { Search } = Input;
  const { Title } = Typography;
  const { setBreadCrumb, setWindowWidth, windowWidth } = useUserContext();
  const searchEnable = useRef();
  const [storeInputValue, setstoreInputValue] = useState("");
  const [loader, setLoader] = useState(false);
  const [checkFilter, setCheckFilter] = useState(false);
  const [submitSearchInpt, setSubmitSearchInput] = useState(false);
  const { apiService } = useServices();
  const [sorting, setSorting] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [templateName, setTemplateName] = useState("");
  const [delAllVisible, setDelAllVisible] = useState(false);
  const [showBulkUploadModel, setshowBulkUploadModel] = useState(false);
  const [percentageCountLoading, setPercentageCountLoading] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({
    current: 1, // Current current
    pageSize: 5, // Default current size
    total: 0 // Total items (fetched dynamically)
  });

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

  // Table columns configuration
  const columns = [
    {
      title: "Template Name",
      dataIndex: "templateName", // Maps to the data source field
      key: "templateName",
      sorter: (a, b) => a.templateName.localeCompare(b.templateName),
      render: (name) => <Typography.Text type="secondary">{name}</Typography.Text>
    },
    {
      title: "Brands",
      dataIndex: "template_type", // Maps to the data source field
      key: "template_type",
      sorter: (a, b) => a.template_type.localeCompare(b.template_type),
      render: (template_type) => (
        <Typography.Text type="secondary">
          {replaceHyphensAndGetTitle(template_type)}
        </Typography.Text>
      )
    },
    {
      title: "Platform Type",
      dataIndex: "platform_type", // Maps to the data source field
      key: "platform_type",
      render: (_, record) => <>{record.platform_type}</>
    },
    {
      title: "Slug",
      dataIndex: "slug", // Maps to the data source field
      key: "slug",
      render: (_, record) => <Typography.Text type="secondary">{record.slug}</Typography.Text>
    },
    {
      title: "Status",
      dataIndex: "status", // Maps to the data source field
      key: "status",
      render: (status, record) => (
        <Tag color={status ? "success" : "error"}>{status ? "Active" : "Inactive"} </Tag>
      ),

      sorter: (a, b) => (a.status === b.status ? 0 : a.status ? -1 : 1)
    }
  ];

  if (actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT)) {
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
          {/* {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) &&
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
          )} */}
        </Flex>
      )
    });
  }

  // Function to delete brands
  const { mutate: deleteMutate } = useMutation(
    // Mutation function to handle the API call for creating a new brands
    (data) => apiService.deleteBrand(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (res, payload) => {
        if (data.length == payload?.load?.walletMapIds?.length) {
          setCurrent(1);
        }

        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(res.message, snackBarSuccessConf);
        setSelectedRowKeys([]);
        setDelAllVisible(false);

        // Invalidate the "getAllRoles" query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchBrandData");
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
        .map((obj) => obj.brand_id);
      return filteredKeys;
    } catch (error) {}
  };

  // Function to handle deletion of brands
  const handleDelete = (data) => {
    try {
      // Create a request body with brandIds array
      const body = {
        brandIds: Array.isArray(data) ? filterDeleteIds(data) : [data.brand_id]
      };

      // Define the request object with the API endpoint and request body
      let obj = { load: body };

      // Perform the API call for brands deletion
      deleteMutate(obj);
    } catch (error) {}
  };

  // Function to handle Edit of brands
  const handleEdit = (data) => {
    navigate(`/${Paths.brandTemplateEdit}/${data.brand_detail_id}`);
  };

  /**
   * Function to fetch brand list
   * @param {*} storeFilterData
   * @returns
   */
  const { mutate: getAllBasicDetails, isLoading: detailsLoading } = useMutation(
    (data) => apiService.getAllTemplateData(data.current, data.pageSize, data.searchTerm),
    {
      onSuccess: (data) => {
        if (data?.data?.data?.length > 0) {
          setDataSource(
            data?.data?.data?.map((val, key) => {
              return {
                key,
                templateName: val.template_name,
                template_type: val.template_type,
                platform_type: val.platform_type,
                slug: val.slug,
                status: val.active,
                brand_detail_id: val.brand_detail_id
              };
            })
          );
        }
        if (data?.data?.data?.length === 0) {
          setDataSource([]);
        }
        setPagination((prev) => ({
          ...prev,
          total: data?.data?.total_count || 0
        }));
      },
      onError: (error) => {
        console.log(error, "error");
      }
    }
  );

  // UseEffect function to run when the component mounts

  useEffect(() => {
    getAllBasicDetails({
      current: pagination.current,
      pageSize: pagination.pageSize,
      searchTerm: templateName || ""
    });

    setBreadCrumb({
      title: "Brand Template",
      icon: "brands",
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

  //Function to run when the value of template name changes
  const handleOnChange = (e) => {
    if (e.target.value === "") {
      getAllBasicDetails({
        current: pagination.current,
        pageSize: pagination.pageSize,
        searchTerm: ""
      });
    }
    setTemplateName(e.target.value);
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to first current
  };

  //Function to search by template name
  const handleSearch = (val) => {
    // API Call to fetch all details
    getAllBasicDetails({
      current: pagination.current,
      pageSize: pagination.pageSize,
      searchTerm: val
    });
  };

  // Handle pagination changes
  const handleTableChange = (paginationConfig) => {
    setPagination((prev) => ({
      ...prev,
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize
    }));

    // Fetch data for the new current or current size
    getAllBasicDetails({
      current: paginationConfig.current,
      pageSize: paginationConfig.pageSize,
      searchTerm: templateName
    });
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Title level={5}>All Brands Templates</Title>
      <Spin spinning={loader} fullscreen />
      <Row gutter={[12, 30]}>
        <Col className="gutter-row" span={24}>
          <Flex justify="space-between" gap="middle">
            <Search
              className="search_bar_box"
              size="large"
              placeholder="Search Here..."
              value={templateName}
              onSearch={handleSearch}
              onChange={handleOnChange}
              // onKeyPress={handleKeyPress}
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
                <NavLink to={`/${Paths.brandTemplateAdd}`}>
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
        className="marginTop16"
        onChange={handleTableChange}
        columns={columns}
        // rowSelection={rowSelection}
        dataSource={dataSource}
        loading={detailsLoading}
        bordered={true}
        scroll={{
          x: checkInnerWidth() ? "600px" : "auto"
        }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true, // Enable current size selection
          pageSizeOptions: ["5", "10", "20", "50"], // Page size options
          showQuickJumper: true, // Enable quick jump to current
          showTotal: (total, range) => `Showing ${range[0]}-${range[1]} of ${total} items` // Total items display
        }}
      />
    </>
  ) : (
    ""
  );
};
export default BrandsList;
