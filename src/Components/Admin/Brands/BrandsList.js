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
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { Paths } from "Router/Paths";
import { useUserContext } from "Hooks/UserContext";
import { PermissionAction, snackBarSuccessConf } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import {
  actionsPermissionValidator,
  capitalizeFirstLetterAndRemoveUnderScore,
  extractPlainText
} from "Helpers/ats.helper";
import userImg from "Static/img/user.jpg";
import { tabletWidth } from "Helpers/ats.constants";

import * as XLSX from "xlsx";
import BrandBulkUpload from "./BrandBulkUpload";
import ProgressCount from "Components/Shared/ProgressCount";
import { getFullImageUrl } from "Helpers/functions";

const BrandsList = () => {
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
  const [pageSize, setPageSize] = useState(20);
  const { apiService } = useServices();
  const [sorting, setSorting] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [delAllVisible, setDelAllVisible] = useState(false);
  const [showBulkUploadModel, setshowBulkUploadModel] = useState(false);
  const [percentageCountLoading, setPercentageCountLoading] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

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
      title: "Brands Name",
      dataIndex: "brand_name",
      sorter: (a, b) => a.brand_name.localeCompare(b.brand_name),
      key: "brand_name",
      width: checkInnerWidth() ? "200px" : "auto",
      render: (value, { logo }) => {
        const logoSrc = logo?.file_path
          ? logo.origin_type === "local"
            ? getFullImageUrl(logo.file_path)
            : logo.file_path
          : userImg;

        return (
          <Space>
            <Avatar src={logoSrc} className="textCapitalize">
              {value}
            </Avatar>
            <Typography.Text className="textCapitalize">{value}</Typography.Text>
          </Space>
        );
      }
    },
    {
      title: "Status",
      dataIndex: "brand_status",
      sorter: (a, b) => a.brand_status.localeCompare(b.brand_status),
      width: "120px",
      key: "brand_status",
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

  const imagePath = (image) => {
    try {
      const logoSrc = image?.file_path
        ? image.origin_type === "local"
          ? getFullImageUrl(image.file_path)
          : image.file_path
        : "";
      return logoSrc;
    } catch (error) {}
  };

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

  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    const size = parseInt(searchParams.get("pageSize") || pageSize, 10);
    setCurrent(page);
    setPageSize(size);

    // refetch(null, page, size); // fetch API with page + pageSize
  }, []);

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
    navigate(`/${Paths.brandEdit}/${data.brand_id}?page=${current}&pageSize=${pageSize}`);
  };

  /**
   * Function to fetch brand list
   * @param {*} storeFilterData
   * @returns
   */
  const fetchTableData = async (storeFilterData, page, pagesize) => {
    try {
      // Ensure storeFilterData is defined, set to an empty object if not provided
      storeFilterData = storeFilterData || {};

      // Extract sort and status from storeFilterData
      const { sort, status } = storeFilterData;

      // Define the base URL for the API endpoint

      let baseUrl;

      if (page && pagesize) {
        baseUrl = `/brands/all/${page}/${pagesize}`;
      } else {
        baseUrl = `/brands/all/${searchEnable.current ? 0 : current - 1}/${pageSize}`;
      }

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
      title: "Brands",
      icon: "category",
      path: Paths.brandList
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

  // this method used to download excel file
  const downloadSheet = async () => {
    try {
      let data1 = await apiService.exportBrands();
    } catch (error) {}
  };

  const bulkUpload = () => {
    try {
      setshowBulkUploadModel(true);
    } catch (error) {}
  };

  const recallPincodeApi = () => {
    try {
      refetch();
    } catch (error) {}
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Title level={5}>All Brands</Title>
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
              <Button
                type="primary"
                size="large"
                onClick={downloadSheet}
                icon={<DownloadOutlined />}>
                Download
              </Button>

              {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                <>
                  <Button
                    size="large"
                    type="primary"
                    onClick={bulkUpload}
                    icon={<UploadOutlined />}>
                    Bulk Upload
                  </Button>
                  <NavLink to={`/${Paths.brandAdd}`}>
                    <Button size="large" type="primary" className="wrapButton">
                      <PlusOutlined />
                      Add New
                    </Button>
                  </NavLink>
                </>
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
            setSearchParams({ page: newPage.toString(), pageSize: newPageSize.toString() });
          }}
          showSizeChanger={true}
          showQuickJumper
        />
      </div>

      {showBulkUploadModel && (
        <BrandBulkUpload
          recallPincodeApi={recallPincodeApi}
          type={"product"}
          setshowBulkUploadModel={(e) => setshowBulkUploadModel(e)}
          setPercentageCountLoading={setPercentageCountLoading}
        />
      )}

      {percentageCountLoading ? (
        <Modal
          title="Upload Progress"
          centered
          open={true}
          closable={false}
          width={700}
          footer={false}>
          <>
            <Flex justify="center" align="middle" style={{ height: "100%" }}>
              <ProgressCount setPercentageCountLoading={setPercentageCountLoading} />
            </Flex>
          </>
        </Modal>
      ) : (
        <></>
      )}
    </>
  ) : (
    ""
  );
};
export default BrandsList;
