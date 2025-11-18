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
  Modal,
  Avatar,
  Spin
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { pageSizeOptions, PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";

import { actionsPermissionValidator } from "Helpers/ats.helper";

import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQueryClient } from "react-query";
import { enqueueSnackbar } from "notistack";
import { useUserContext } from "Hooks/UserContext";
import { tabletWidth } from "Helpers/ats.constants";
import dayjs from "dayjs";
import { getFullImageUrl } from "Helpers/functions";

// Product Section List Component
const ProductSectionsList = () => {
  const { Search } = Input;
  const { setBreadCrumb, windowWidth } = useUserContext();
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [delAllVisible, setDelAllVisible] = useState(false);
  const [pagination, setPagination] = useState({
    pageSize: 5,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: pageSizeOptions,
    showTotal: (total, range) => `Total ${total} items`,
    onShowSizeChange: (current, size) => {
      setPagination((prevPagination) => ({ ...prevPagination, pageSize: size }));
    },
    onChange: (page, pageSize) => {
      setPagination((prevPagination) => ({ ...prevPagination, current: page, pageSize: pageSize }));
    }
  });
  const [submitSearchInput, setSubmitSearchInput] = useState(false);
  const [storeInputValue, setstoreInputValue] = useState("");
  const [showModal, setShowModal] = useState(false); // modal state for open and close
  const [modalTableData, setModalTableData] = useState([]); // single row data state
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

  // check window inner width
  const checkInnerWidth = () => {
    try {
      return windowWidth < tabletWidth;
    } catch (error) {}
  };

  // styles
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
    },
    viewBtnStyle: {
      color: colorPrimary,
      cursor: "pointer",
      display: "block"
    }
  };

  // Function to fetch prodcts section table  data
  const fetchTableData = async (reset = false) => {
    try {
      // Define the base URL for the API endpoint
      let baseUrl = `/product_section/all/${searchEnable.current ? 0 : current - 1}/${pageSize}`;

      // Construct parameters for the API request
      const params = {
        ...(searchTerm && { searchTerm: searchTerm.trim() })
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
      // Handle errors by displaying a Snackbar notification
    }
  };

  // Destructure data, mutate function, loading status, and refetching status from useMutation hook
  const {
    data,
    mutate: refetch,
    isLoading
  } = useMutation("fetchAllProductSectionData", fetchTableData);

  // Calling api when click pagination
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? refetch()
      : navigate("/", { state: { from: null }, replace: true });
  }, [current, pageSize]);

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

  // UseMutation hook for fetching products for modal via API
  const { mutate: fetchProductsForModal, isLoading: modalProductsLoading } = useMutation(
    (data) => apiService.getProductsForView(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data.success) {
          setModalTableData(data?.data);
          setShowModal(true);
        }
      },
      onError: (error) => {
        // Handle errors
      }
    }
  );

  // function to call api on view btn click
  const handleView = (id) => {
    fetchProductsForModal(id);
  };

  // table columns
  const columns = [
    {
      title: "Section Title",
      dataIndex: "section_title",
      width: "250px",
      key: "section_title",
      sorter: (a, b) => a.section_title.localeCompare(b.section_title),
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Start & End Date",
      dataIndex: "date",
      width: "250px",
      key: "date",
      sorter: (a, b) => a.start_date.localeCompare(b.start_date),
      render: (value, record) => (
        <Space>
          <Typography.Text>
            {`${dayjs(record.start_date).format("DD-MM-YYYY")} to ${dayjs(record.end_date).format(
              "DD-MM-YYYY"
            )}`}
          </Typography.Text>
        </Space>
      )
    },
    {
      title: "Category",
      dataIndex: "product_category",
      width: "150px",
      key: "product_category",
      sorter: (a, b) => a.product_category.localeCompare(b.product_category),
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value?.split("_")[1]}</Typography.Text>
        </Space>
      )
    },

    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: "100px",
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
      dataIndex: "action",
      width: "250px",
      key: "action",
      fixed: "right",
      align: "center",
      render: (text, record) => (
        <Flex gap="small" justify="center" align="center">
          <Typography.Text
            disabled={modalProductsLoading}
            style={StyleSheet.viewBtnStyle}
            onClick={() => {
              handleView(record.product_section_id);
            }}>
            View
          </Typography.Text>
          <Divider style={StyleSheet.verDividerStyle} type="vertical" />
          {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) && (
            <>
              <Button
                type="default"
                primary
                onClick={() =>
                  navigate(`/${Paths.productsSectionsEdit}/${record.product_section_id}`)
                }>
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

  // modal table columns
  const modalTablecolumns = [
    {
      title: "Product Name",
      dataIndex: "product_name",
      width: "250px",
      key: "product_name",
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
      render: (value, record) => (
        <Space>
          <Avatar
            src={
              // eslint-disable-next-line no-undef
              record?.file_path && getFullImageUrl(record?.file_path)
            }
          />
          <Typography.Text className="textCapitalize">{value}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Brand",
      dataIndex: "brand_name",
      width: "250px",
      key: "brand_name",
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Category",
      dataIndex: "category_name",
      width: "250px",
      key: "category_name",
      sorter: (a, b) => a.category_name.localeCompare(b.category_name),
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value}</Typography.Text>
        </Space>
      )
    },
    {
      title: "SAP Code",
      dataIndex: "sap_code",
      width: "250px",
      key: "sap_code",
      sorter: (a, b) => a.sap_code - b.sap_code,
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Price (MRP)",
      dataIndex: "product_mrp",
      width: "250px",
      key: "product_mrp",
      sorter: (a, b) => a.product_mrp - b.product_mrp,
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value}</Typography.Text>
        </Space>
      )
    }
  ];

  // Function to delete product section
  const { mutate: deleteMutate } = useMutation(
    // Mutation function to handle the API call for creating a new tags
    (data) => apiService.deleteProductSection(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (res, payload) => {
        if (res) {
          if (data.length == payload?.load?.productSectionIds?.length) {
            setCurrent(1);
          }

          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(res.message, snackBarSuccessConf);
          setSelectedRowKeys([]);
          setDelAllVisible(false);

          // Invalidate the "fetchAllProductSectionData" query in the query client to trigger a refetch
          queryClient.invalidateQueries("fetchAllProductSectionData");
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
        .map((obj) => obj.product_section_id);
      return filteredKeys;
    } catch (error) {}
  };

  // Function to handle deletion of menu
  const handleDelete = (data) => {
    try {
      // Create a request body with tagsIds array
      const body = {
        sectionIds: Array.isArray(data) ? filterDeleteIds(data) : [data.product_section_id]
      };

      // Define the request object with the API endpoint and request body
      let obj = { load: body };

      // Perform the API call for tags deletion
      deleteMutate(obj);
    } catch (error) {
      console.log(error);
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

  useEffect(() => {
    setBreadCrumb({
      title: "Products Section",
      icon: "productsSection",
      titlePath: Paths.productSectionsList,
      path: Paths.users
    });
  }, []);

  // function call when modal close
  const handleModalClose = () => {
    setShowModal(false);
    setModalTableData([]);
  };
  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Typography.Title level={5}>All Product Sections</Typography.Title>
      <Spin spinning={modalProductsLoading} fullscreen />
      <Row gutter={[0, 0]}>
        <Col className="gutter-row" span={24}>
          <Flex gap="middle" justify="space-between">
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
                <Flex style={StyleSheet.flexFullStyle} gap="middle" justify="flex-end">
                  <NavLink to={`/${Paths.productsSectionsAdd}`}>
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
      </Row>

      <Table
        columns={columns}
        rowSelection={rowSelection}
        dataSource={data}
        pagination={false}
        bordered={true}
        loading={isLoading}
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
            setSelectedRowKeys([]);
            setCurrent(newPage);
            setPageSize(newPageSize);
            setSelectedRowKeys([]);
          }}
          showSizeChanger
          showQuickJumper
        />
      </div>
      {showModal && (
        <Modal
          className="section-product-modal"
          title="Section Products"
          open={true}
          footer={false}
          onCancel={() => {
            handleModalClose();
          }}
          width={1100}>
          <Table
            columns={modalTablecolumns}
            dataSource={modalTableData}
            pagination={pagination}
            loading={isLoading}
            bordered={true}
            scroll={{
              x: checkInnerWidth() ? "700px" : "auto",
              y: 300
            }}
          />
        </Modal>
      )}
    </>
  ) : (
    <></>
  );
};

export default ProductSectionsList;
