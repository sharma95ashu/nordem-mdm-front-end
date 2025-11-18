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
  Modal,
  Carousel,
  Tooltip,
  message
} from "antd";

import {
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  PlusOutlined,
  UploadOutlined
} from "@ant-design/icons";
import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQueryClient } from "react-query";
import { Typography } from "antd";
import { NavLink, useNavigate } from "react-router-dom";
import { Paths } from "Router/Paths";
import { useUserContext } from "Hooks/UserContext";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import userImg from "Static/img/user.jpg";
import { tabletWidth } from "Helpers/ats.constants";
import { getFullImageUrl } from "Helpers/functions";

const BannerList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const [previewModal, setPreviewModal] = useState(false);
  const [carouselPreviewImges, setcarouselPreviewImages] = useState([]);

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

  const CopyToClipboardFallback = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // Prevent the text area from being visible and affecting layout
    textArea.style.position = "fixed";
    textArea.style.top = "-9999px";
    textArea.style.left = "-9999px";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy", true, text);
      const msg = successful ? "successful" : "unsuccessful";
      Notify("success", "Copied successfully");
    } catch (err) {
      Notify("error", "Unable to copy link");
    }

    // document.body.removeChild(textArea);
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
      // message.error("Clipboard API not supported");
      CopyToClipboardFallback(text);
    }
  };

  /**
   * Column constant show in table
   */
  const columns = [
    {
      title: "Section Name",
      dataIndex: "section_name",
      sorter: (a, b) => a.section_name.localeCompare(b.section_name),
      key: "section_name",
      width: checkInnerWidth() ? "200px" : "auto",
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Section Code",
      dataIndex: "banner_slug",
      sorter: (a, b) => a.banner_slug.localeCompare(b.banner_slug),
      key: "banner_slug",
      render: (value, record) => (
        <Flex justify="space-between">
          {value}
          <Tooltip title="Copy Section Code">
            <Button size="small" onClick={() => copyToClipboard(value)} type="link">
              <CopyOutlined />
            </Button>
          </Tooltip>
        </Flex>
      )
    },

    {
      title: "Type",
      dataIndex: "banner_type",
      sorter: (a, b) => a.banner_type.localeCompare(b.banner_type),
      key: "banner_type",
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      sorter: (a, b) => a.status.localeCompare(b.status),
      width: "120px",
      key: "status",
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
      key: "action",
      width: "170px",
      fixed: "right",
      render: (text, record) => (
        <Flex gap="small" justify="center" align="center">
          {actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) && (
            <>
              <Button type="default" primary onClick={() => handleEdit(record)}>
                Edit
              </Button>
              <Divider style={StyleSheet.verDividerStyle} type="vertical" />
            </>
          )}
          {record.banner_details?.length > 0 && (
            <Button type="primary " onClick={() => handlePreview(record)}>
              Preview
            </Button>
          )}
        </Flex>
      )
    }
  ];

  // Function to delete banners
  const { mutate: deleteMutate } = useMutation(
    // Mutation function to handle the API call for creating a new banner
    (data) => apiService.deleteBanners(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (res, payload) => {
        if (data.length == payload?.load?.bannerIds?.length) {
          setCurrent(1);
        }

        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(res.message, snackBarSuccessConf);
        setSelectedRowKeys([]);
        setDelAllVisible(false);

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
        .map((obj) => obj.banner_list_id);
      return filteredKeys;
    } catch (error) {}
  };

  // Function to handle deletion of banner
  const handleDelete = (data) => {
    try {
      // Create a request body with brandIds array
      const body = {
        bannerIds: Array.isArray(data) ? filterDeleteIds(data) : [data.banner_list_id]
      };

      // Define the request object with the API endpoint and request body
      let obj = { load: body };

      // Perform the API call for banner deletion
      deleteMutate(obj);
    } catch (error) {}
  };

  // Function to handle Edit of banner
  const handleEdit = (data) => {
    navigate(`/${Paths.bannerEdit}/${data.banner_list_id}`);
  };

  const handlePreview = (record) => {
    setcarouselPreviewImages(record.banner_details);

    setPreviewModal(true);
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
      let baseUrl = `/banner_list/all/${searchEnable.current ? 0 : current - 1}/${pageSize}`;

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
      title: "Banner Management",
      icon: "category",
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
    // refetch()
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

  const imgStyle = {
    height: "300px",
    objectFit: "cover",
    marginBottom: "10px",
    width: "100%"
  };
  const contentStyle = {
    position: "relative",
    color: "#fff",
    textAlign: "center",
    background: "#ffff"
  };

  const handlePreviewModalClose = () => {
    setPreviewModal(false);
    setcarouselPreviewImages([]);
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Title level={5}>All Banners List</Title>
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
                <NavLink to={`/${Paths.bannerAdd}`}>
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
        // rowSelection={rowSelection}
        dataSource={data}
        pagination={false}
        loading={isLoading}
        bordered={true}
        scroll={{
          x: checkInnerWidth() ? "600px" : "auto"
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
          showSizeChanger={true}
          showQuickJumper
        />
      </div>

      <Modal
        title="Preview"
        centered
        open={previewModal}
        closable={true}
        onCancel={() => handlePreviewModalClose()}
        width={700}
        footer={[]}>
        <>
          <Row gutter={[24, 0]}>
            <Col className="gutter-row" span={24}>
              <Carousel arrows={true} className="banner-carousel table_banner_carousel">
                {carouselPreviewImges?.map((item, index) => {
                  return (
                    <>
                      {item?.banner_type == "url" || item?.banner_type == "page" ? (
                        <div style={contentStyle} key={index}>
                          <NavLink to={item?.banner_redirection_link} target="_blank">
                            <img
                              src={getFullImageUrl(item?.filePath)}
                              alt="category"
                              style={imgStyle}
                            />
                          </NavLink>
                        </div>
                      ) : (
                        <div style={contentStyle} key={index}>
                          <img
                            src={getFullImageUrl(item?.filePath)}
                            alt="category"
                            style={imgStyle}
                          />
                        </div>
                      )}
                    </>
                  );
                })}
              </Carousel>
            </Col>
          </Row>
        </>
      </Modal>
    </>
  ) : (
    ""
  );
};
export default BannerList;
