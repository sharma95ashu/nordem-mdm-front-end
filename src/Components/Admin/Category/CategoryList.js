/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable no-undef */
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
  Space,
  Tag,
  theme,
  TreeSelect,
  Avatar,
  Divider,
  Flex,
  Popconfirm,
  Modal,
  Grid
} from "antd";

import userImg from "Static/img/user.jpg";

import {
  PlusOutlined,
  DeleteOutlined,
  DownCircleOutlined,
  UpCircleOutlined,
  CheckCircleOutlined,
  FilterOutlined,
  DownloadOutlined,
  UploadOutlined
} from "@ant-design/icons";

import { useServices } from "Hooks/ServicesContext";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { Typography } from "antd";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { Paths } from "Router/Paths";
import { useUserContext } from "Hooks/UserContext";
import { enqueueSnackbar } from "notistack";
import { PermissionAction, snackBarErrorConf, snackBarSuccessConf } from "Helpers/ats.constants";
import { Content } from "antd/es/layout/layout";
import {
  actionsPermissionValidator,
  capitalizeFirstLetterAndRemoveUnderScore,
  extractPlainText,
  firstlettCapital
} from "Helpers/ats.helper";
import { tabletWidth } from "Helpers/ats.constants";
import * as XLSX from "xlsx";
import CategoryBulkUpload from "./CategoryBulkUpload";
import PincodeProgressCount from "../PincodeMapping/PincodeProgressCount";
import ProgressCount from "Components/Shared/ProgressCount";
import { getFullImageUrl } from "Helpers/functions";

const { Title } = Typography;

const categoryList = () => {
  const { Search } = Input;
  const { setBreadCrumb, setWindowWidth, windowWidth } = useUserContext();
  const queryClient = useQueryClient();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const searchEnable = useRef();
  const [current, setCurrent] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [total, setTotal] = useState(0);
  const [storeInputValue, setstoreInputValue] = useState("");
  const [loader, setLoader] = useState(false);
  const [checkFilter, setCheckFilter] = useState(false);
  const [submitSearchInput, setSubmitSearchInput] = useState(false);
  const [pageSize, setPageSize] = useState(20);
  const [parentCategory, setParentCategory] = useState([]);
  const [categoryValue, setCategoryValue] = useState(undefined);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const [delAllVisible, setDelAllVisible] = useState(false);
  const [showBulkUploadModel, setshowBulkUploadModel] = useState(false);
  const [percentageCountLoading, setPercentageCountLoading] = useState(false);
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();
  const [searchParams, setSearchParams] = useSearchParams();

  // check window inner width
  const checkInnerWidth = () => {
    try {
      return !screens.lg && (screens.md || screens.sm || screens.xs);
    } catch (error) {}
  };

  const {
    token: {
      colorBgLayout,
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
    }
  };

  // Column list for table
  const columns = [
    {
      title: "Category Name",
      dataIndex: "category_name",
      width: checkInnerWidth() ? "200px" : "auto",
      key: "category_name",
      sorter: (a, b) => a.category_name.localeCompare(b.category_name),
      render: (value, record) => {
        const { image } = record;
        const logoSrc = image?.file_path
          ? image.origin_type === "local"
            ? getFullImageUrl(image.file_path)
            : image.file_path
          : userImg;
        return (
          <Space>
            <Avatar src={logoSrc} className="textCapitalize" />

            <Typography.Text className="textCapitalize">{value}</Typography.Text>
          </Space>
        );
      }
    },
    {
      title: "Sub Category",
      width: "140px",
      dataIndex: "categoryCount",
      key: "categoryCount",
      sorter: (a, b) => a.categoryCount.localeCompare(b.categoryCount),
      render: (value, record) => (
        <Space>
          <Typography.Text className="textCapitalize">{value}</Typography.Text>
        </Space>
      )
    },
    {
      title: "Display Order",
      dataIndex: "category_display_order",
      width: "140px",
      key: "category_display_order",
      sorter: (a, b) => a.category_display_order - b.category_display_order
    },
    // {
    //   title: "Is Featured",
    //   dataIndex: "is_featured",
    //   key: "is_featured",
    //   width: "150px",
    //   sorter: (a, b) => a.is_featured - b.is_featured,
    //   render: (value) => (
    //     <>{value === true ? <Tag color="success">Yes</Tag> : <Tag color="error">No</Tag>}</>
    //   )
    // },
    // {
    //   title: "Show On",
    //   dataIndex: "show_on_type",
    //   width: "120px",
    //   key: "show_on_type",
    //   sorter: (a, b) => {
    //     const aType = a.show_on_type.join(" ") || ""; // Join the array elements with a space
    //     const bType = b.show_on_type.join(" ") || "";
    //     return aType.localeCompare(bType);
    //   },
    //   render: (value) => (
    //     <>
    //       {value?.map((item, index) => (
    //         <Typography.Text className="textCapitalize" key={index}>
    //           {item}
    //           {index !== value.length - 1 && ", "}
    //         </Typography.Text>
    //       ))}
    //     </>
    //   )
    // },
    {
      title: "Status",
      dataIndex: "category_status",
      key: "category_status",
      width: "120px",
      sorter: (a, b) => a.category_status.localeCompare(b.category_status),
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
              onCancel={() => {}}
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

  // Get page and pageSize from URL on initial load
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    const size = parseInt(searchParams.get("pageSize") || pageSize, 10);
    setCurrent(page);
    setPageSize(size);

    // refetch(null, page, size); // fetch API with page + pageSize
  }, []);

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

  // Function to fetch tag data
  const fetchTableData = async (reset = false, page, pagesize) => {
    try {
      // Define the base URL for the API endpoint
      let baseUrl;

      if (page && pagesize) {
        baseUrl = `/categories/all/v2/${page}/${pagesize}`;
      } else {
        baseUrl = `/categories/all/v2/${searchEnable.current ? 0 : current - 1}/${pageSize}`;
      }

      // Flag to check if any filter value is empty
      let isAnyValueEmpty = false;

      // Check if category is provided, update isAnyValueEmpty accordingly
      if (categoryValue && !reset && categoryValue !== "") {
        isAnyValueEmpty = true;
      }

      // Set the checkFilter state to indicate if any filter value is empty
      setCheckFilter(isAnyValueEmpty);

      // Create filterData object with category id as a key-value pair
      const filterData = {
        ...{ category_id: categoryValue }
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
        return tableData;
      }
    } catch (error) {
      // Handle errors by displaying a Snackbar notification
    }
  };

  // Destructure data, mutate function, loading status, and refetching status from useMutation hook
  const { data, mutate: refetch, isLoading } = useMutation("fetchCategoryData", fetchTableData);

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

  // Function to delete category
  const { mutate: deleteMutate } = useMutation(
    // Mutation function to handle the API call for creating a new tags
    (data) => apiService.deleteCategory(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (res, payload) => {
        if (res) {
          if (data.length == payload?.load?.categoryIds?.length) {
            setCurrent(1);
          }

          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(res.message, snackBarSuccessConf);
          setCategoryValue(null);
          setSelectedRowKeys([]);
          setDelAllVisible(false);

          // Invalidate the "getAllRoles" query in the query client to trigger a refetch
          queryClient.invalidateQueries("fetchCategoryData");
          queryClient.invalidateQueries("getAllCategory");
          refetch();
        }
      },
      onError: (error) => {
        setSelectedRowKeys([]);
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

  const filterDeleteIds = (deleteArr) => {
    try {
      const filteredKeys = data
        .filter((obj) => deleteArr.includes(obj.key))
        .map((obj) => obj.category_id);
      return filteredKeys;
    } catch (error) {}
  };

  // Function to handle deletion of tags
  const handleDelete = (data) => {
    try {
      // Create a request body with tagsIds array
      const body = {
        categoryIds: Array.isArray(data) ? filterDeleteIds(data) : [data.category_id]
      };

      // Define the request object with the API endpoint and request body
      let obj = { load: body };

      // Perform the API call for tags deletion
      deleteMutate(obj);
    } catch (error) {}
  };

  const apiUrl = `/categories/all/0/200`;

  // UseQuery hook for fetching data of a All Category from the API
  useQuery(
    "getAllCategory",

    // Function to fetch data of a single Category using apiService.getRequest
    () => apiService.getRequest(apiUrl),
    {
      // Configuration options
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        // Filtering category which has no sub category
        const filteredData = data?.data?.data?.filter(
          (item) => item.children && item.children.length > 0
        );

        // Set form values based on the fetched data
        setParentCategory([]);

        filteredData?.map((item) =>
          setParentCategory((prev) => [
            ...prev,
            {
              value: item.category_id,
              label: firstlettCapital(item.category_name),
              // children: item?.children?.map((child) => ({
              //   value: child.category_id,
              //   label: firstlettCapital(child.category_name),
              //   children: child?.children?.map((subchild) => ({
              //     value: subchild.category_id,
              //     label: firstlettCapital(subchild.category_name)
              //   }))
              // }))

              children: item?.children?.map((child) => ({
                value: child.category_id,
                label: firstlettCapital(child.category_name),
                children: child?.children?.map((subchild) => ({
                  value: subchild.category_id,
                  label: firstlettCapital(subchild.category_name),
                  children: subchild?.children?.map((level4) => ({
                    value: level4.category_id,
                    label: firstlettCapital(level4.category_name),
                    children: level4?.children?.map((level5) => ({
                      value: level5.category_id,
                      label: firstlettCapital(level5.category_name),
                      children: level5?.children?.map((level6) => ({
                        value: level6.category_id,
                        label: firstlettCapital(level6.category_name),
                        children: level6?.children?.map((level7) => ({
                          value: level7.category_id,
                          label: firstlettCapital(level7.category_name)
                        }))
                      }))
                    }))
                  }))
                }))
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
  // Function to handle Edit of tags
  const handleEdit = (data) => {
    navigate(`/${Paths.categoryEdit}/${data.category_id}?page=${current}&pageSize=${pageSize}`);
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

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    setBreadCrumb({
      title: "Categories",
      icon: "category",
      path: Paths.users
    });
  }, []);

  // Run useEffect to get the updated data when a user changes category
  useEffect(() => {
    refetch();
  }, [categoryValue]);

  /**
   * Filter rest
   */
  const handleReset = () => {
    setCategoryValue(null);
    setCurrent(1);
    // Reset filter true
    refetch(true);
    setSearchTerm("");
  };

  //  Handle Apply Filter
  const handleApplyFilter = () => {
    refetch();
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
      // exportProducts();
      let data1 = await apiService.exportCategory();
      // const capitalizedData = data.map((obj) => {
      //   const newObj = {};
      //   for (let key in obj) {
      //     if (
      //       [
      //         "category_name",
      //         "parent",
      //         "category_body",
      //         "category_display_order",
      //         "is_featured",
      //         // "show_on_type",
      //         "category_status",
      //         // "supported_stores",
      //         "image",
      //         "banner",
      //         "banner_mobile"
      //       ].includes(key)
      //     ) {
      //       if (key === "category_name") {
      //         newObj["Category Name"] = obj[key];
      //       } else if (key === "category_body") {
      //         newObj["Description"] = extractPlainText(obj[key]);
      //       } else if (key == "parent") {
      //         newObj["Parent Category"] = obj[key]?.category_name;
      //       } else if (key == "is_featured") {
      //         newObj["Is Featured"] = obj[key] ? 1 : 0;
      //       } else if (key == "category_display_order") {
      //         newObj["Display Order"] = obj[key];
      //       } else if (key == "category_status") {
      //         newObj["Status"] = obj[key];
      //         // } else if (key == "show_on_type") {
      //         //   newObj["Show On Type"] = obj[key] ? obj[key].toString() : "";
      //         // } else if (key == "supported_stores") {
      //         //   newObj["Supported Stores"] = obj[key] ? obj[key].toString() : "";
      //       } else if (key == "image") {
      //         newObj["Category Image"] = imagePath(obj[key]);
      //       } else if (key == "banner") {
      //         newObj["Banner Image"] = imagePath(obj[key]);
      //       } else if (key == "banner_mobile") {
      //         newObj["Banner Mobile Image"] = imagePath(obj[key]);
      //       } else {
      //         newObj[capitalizeFirstLetterAndRemoveUnderScore(key)] = obj[key];
      //       }
      //     }
      //   }
      //   return newObj;
      // });
      // const ws = XLSX.utils.json_to_sheet(capitalizedData);
      // // Freeze the first row
      // ws["!freeze"] = {
      //   xSplit: 0,
      //   ySplit: 1,
      //   topLeftCell: "A2",
      //   activePane: "bottomRight",
      //   state: "frozen"
      // };

      // const workbook = XLSX.utils.book_new();
      // XLSX.utils.book_append_sheet(workbook, ws, "Category List");
      // XLSX.writeFile(workbook, "category-sheet.xlsx");
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
      <Title level={5}>All Categories</Title>
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
                      danger
                      size="large"
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
                  <Flex style={StyleSheet.flexFullStyle} gap="middle" justify="flex-end">
                    <NavLink to={`/${Paths.categoryAdd}`}>
                      <Button size="large" type="primary" className="wrapButton">
                        <PlusOutlined />
                        Add New
                      </Button>
                    </NavLink>
                  </Flex>
                </>
              )}
            </Flex>
          </Flex>
        </Col>
        <Col className="gutter-row" span={24}>
          <Content style={StyleSheet.contentSubStyle}>
            <Row>
              <Col flex={"auto"}>
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
                      placeholder="Select Category"
                    />
                  }
                  size="large"
                  placeholder="Search in selected category..."
                  enterButton="Search"
                  value={searchTerm}
                  onSearch={handleSearchSubmit}
                  onChange={handleSearch}
                  onKeyPress={handleKeyPress}
                  allowClear
                  className="custom-input-hover"
                />
              </Col>
            </Row>
            <Row className="noteStyle">
              Note: Use select category filter to view subcategories. Use search to refine results.
            </Row>
          </Content>
        </Col>
      </Row>
      <Row></Row>
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
          pageSize={pageSize}
          onChange={(newPage, newPageSize) => {
            setSelectedRowKeys([]);
            setCurrent(newPage);
            setPageSize(newPageSize);
            setSelectedRowKeys([]);
            setSearchParams({ page: newPage.toString(), pageSize: newPageSize.toString() });
          }}
          showSizeChanger
          showQuickJumper
        />
      </div>

      {showBulkUploadModel && (
        <CategoryBulkUpload
          recallPincodeApi={recallPincodeApi}
          type={"product"}
          setshowBulkUploadModel={(e) => {
            setshowBulkUploadModel(e);
            queryClient.invalidateQueries("getAllCategory");
          }}
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
    <></>
  );
};
export default categoryList;
