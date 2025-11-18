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
  Tag,
  Space,
  theme,
  Divider,
  Popconfirm,
  Flex,
  TreeSelect,
  Modal,
  Grid
} from "antd";
import {
  PlusOutlined,
  FilterOutlined,
  UploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  SyncOutlined
} from "@ant-design/icons";
import { useServices } from "Hooks/ServicesContext";
import { tabletWidth } from "Helpers/ats.constants";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { Typography } from "antd";
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { Paths } from "Router/Paths";
import { useUserContext } from "Hooks/UserContext";
import {
  PermissionAction,
  productExportKeys,
  snackBarErrorConf,
  snackBarSuccessConf
} from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import { Content } from "antd/es/layout/layout";
import BulkUpload from "Components/Shared/BulkUpload";
import {
  actionsPermissionValidator,
  capitalizeFirstWORDAndSecondWordFirstLetterCapital,
  extractPlainText,
  firstlettCapital,
  getDateTimeFormat
} from "Helpers/ats.helper";
import ProgressCount from "Components/Shared/ProgressCount";
import * as XLSX from "xlsx";
import ExportModal from "./DownloadFilterModal";

const ProductList = () => {
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
  const [showBulkUploadModel, setshowBulkUploadModel] = useState(false);
  const [categoryValue, setCategoryValue] = useState(null);
  const [parentCategory, setParentCategory] = useState([]);
  const [percentageCountLoading, setPercentageCountLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const [delAllVisible, setDelAllVisible] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  // check window inner width
  const checkInnerWidth = () => {
    try {
      return !screens.lg && (screens.md || screens.sm || screens.xs);
    } catch (error) {}
  };

  const {
    token: {
      colorBorder,
      colorBgLayout,
      paddingContentHorizontal,
      borderRadiusLG,
      colorPrimaryBg,
      colorPrimaryBorder,
      colorPrimary,
      colorError
    }
  } = theme.useToken();
  /**
   * style
   */
  const StyleSheet = {
    searchBarStyle: {
      marginBottom: 5
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
    formItemStyle: {
      marginBottom: 0
    },
    filterIconStyle: {
      marginRight: 6,
      marginTop: 2,
      color: colorPrimary
    }
  };

  /**
   * Column constant show in table
   */
  const columns = [
    {
      title: "Product Names",
      dataIndex: "product_name",
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
      key: "product_name",
      width: checkInnerWidth() ? "200px" : "auto"
    },

    {
      title: "Type",
      dataIndex: "product_type",
      sorter: (a, b) => a.product_type.localeCompare(b.product_type),
      key: "product_type",
      width: checkInnerWidth() ? "200px" : "auto"
    },
    {
      title: "Brand",
      dataIndex: "brand_name",
      sorter: (a, b) => a.brand.brand_name.localeCompare(b.brand_name),
      key: "brand_name",
      width: "160px",
      render: (value, record) => <>{record?.brand?.brand_name}</>
    },
    {
      title: "Category",
      dataIndex: "category_name",
      sorter: (a, b) => a.category?.category_name.localeCompare(b.category?.category_name),
      key: "category_name",
      width: "160px",
      render: (value, record) => <>{record?.category?.category_name}</>
    },
    // {
    //   title: "Display Order",
    //   dataIndex: "display_order",
    //   sorter: (a, b) => a.display_order - b.display_order,
    //   width: "130px",
    //   key: "display_order"
    // },
    {
      title: "SAP Code",
      dataIndex: "sap_code",
      sorter: (a, b) => a.sap_code - b.sap_code,
      width: "110px",
      key: "sap_code"
    },
    {
      title: "Show On",
      dataIndex: "show_on_type",
      width: "120px",
      key: "show_on_type",
      sorter: (a, b) => {
        const aType = a.show_on_type.join(" ") || ""; // Join the array elements with a space
        const bType = b.show_on_type.join(" ") || "";
        return aType.localeCompare(bType);
      },
      render: (value) => (
        <>
          {value?.map((item, index) => (
            <Typography.Text className="textCapitalize" key={index}>
              {item}
              {index !== value.length - 1 && ", "}
            </Typography.Text>
          ))}
        </>
      )
    },
    {
      title: "Created On",
      dataIndex: "created_at",
      // sorter: (a, b) => a.created_at.localeCompare(b.created_at),
      width: checkInnerWidth() ? "200px" : "auto",
      render: (value) => getDateTimeFormat(value, "DD/MMM/YYYY"),
      key: "created_at"
    },
    {
      title: "Status",
      dataIndex: "product_status",
      sorter: (a, b) => a.product_status.localeCompare(b.product_status),
      key: "product_status",
      width: "110px",
      render: (value) => (
        <>
          {value === "active" ? (
            <Tag color="success">Active</Tag>
          ) : value === "inactive" ? (
            <Tag color="error">Inactive</Tag>
          ) : (
            <Tag color="warning">Discontinued</Tag>
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

  // Get page and pageSize from URL on initial load
  useEffect(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    const size = parseInt(searchParams.get("pageSize") || "10", 10);
    setCurrent(page);
    setPageSize(size);

    // refetch(null, page, size); // fetch API with page + pageSize
  }, []);

  // Function to delete product
  const { mutate: deleteMutate } = useMutation(
    // Mutation function to handle the API call for creating a new brands
    (data) => apiService.deleteProduct(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (res, payload) => {
        if (data.length == payload?.load?.productIds?.length) {
          setCurrent(1);
        }

        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(res.message, snackBarSuccessConf);
        setSelectedRowKeys([]);
        setDelAllVisible(false);

        // Invalidate the "getAllRoles" query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchProductData");
        refetch();
      },
      onError: (error) => {
        setSelectedRowKeys([]);
        // Handle errors by displaying an error Snackbar notification
        // enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const filterDeleteIds = (deleteArr) => {
    try {
      const filteredKeys = data
        .filter((obj) => deleteArr.includes(obj.key))
        .map((obj) => obj.product_id);
      return filteredKeys;
    } catch (error) {}
  };

  // Function to handle deletion of brands
  const handleDelete = (data) => {
    try {
      // Create a request body with productIds array
      const body = {
        productIds: Array.isArray(data) ? filterDeleteIds(data) : [data.product_id]
      };

      // Define the request object with the API endpoint and request body
      let obj = { load: body };

      // Perform the API call for brands deletion
      deleteMutate(obj);
    } catch (error) {}
  };

  // Function to handle Edit of brands
  const handleEdit = (data) => {
    navigate(`/${Paths.productEdit}/${data.product_id}?page=${current}&pageSize=${pageSize}`);
  };

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
   * Function to fetch brand list
   * @param {*} storeFilterData
   * @returns
   */
  const fetchTableData = async (reset = false, page, pagesize) => {
    try {
      // Define the base URL for the API endpoint

      let baseUrl;

      if (page && pagesize) {
        baseUrl = `/products/all/${page}/${pagesize}`;
      } else {
        baseUrl = `/products/all/${searchEnable.current ? 0 : current - 1}/${pageSize}`;
      }
      // Flag to check if any filter value is empty
      let isAnyValueEmpty = false;

      // Check if category is provided, update isAnyValueEmpty accordingly
      if (!reset && categoryValue !== "" && categoryValue !== undefined) {
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
      setIsLoading(true);
      // Make an API call to get the table data
      const data = await apiService.getRequest(apiUrl);

      // Check if the API call is successful
      if (data.success) {
        searchEnable.current = false;
        setTotal(data?.data?.total_count);
        let tableData = data?.data?.data.map((item, index) => ({ ...item, key: index }));
        // Return the fetched data
        setIsLoading(false);
        return tableData;
      }
    } catch (error) {
      setIsLoading(false);
      // Handle errors by displaying a Snackbar notification
    }
  };

  // Destructure data, mutate function, loading status, and refetching status from useMutation hook
  const { data, mutate: refetch } = useMutation("fetchProductData", fetchTableData);
  //Keeping the old logic as of now for product listing
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
        if (data) {
          // Filtering category which has no sub category
          // const filteredData = data?.data?.data.filter(
          //   (item) => item.children && item.children.length > 0
          // );

          // Set form values based on the fetched data
          setParentCategory([]);

          data?.data?.data.map((item) =>
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
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );
  /**
   * UseEffect function to set breadcrumb
   */
  useEffect(() => {
    setBreadCrumb({
      title: "Products",
      icon: "Product",
      path: Paths.productList
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
      setCurrent(1);
      setPageSize(10);
      setSearchParams({ page: "1", pageSize: "10" });
      actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
        ? refetch()
        : navigate("/", { state: { from: null }, replace: true });

      setSubmitSearchInput(false);
      setstoreInputValue("");
    }
  }, [searchTerm, submitSearchInpt]);

  // Run useEffect to get the updated data when a user changes category
  useEffect(() => {
    if (categoryValue) {
      refetch();
    }
  }, [categoryValue]);

  // handle table search row data
  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  // search bar button when click search button then call api
  const handleSearchSubmit = () => {
    if (searchTerm !== null && searchTerm !== "" && searchTerm !== storeInputValue) {
      setCurrent(1);
      setPageSize(10);
      setSearchParams({ page: "1", pageSize: "10" });
      searchEnable.current = true;
      actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
        ? refetch()
        : navigate("/", { state: { from: null }, replace: true });

      setSubmitSearchInput(true);
      setstoreInputValue(searchTerm.trim());
    }
  };

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

  // To handle bulk upload feature
  const bulkUpload = () => {
    try {
      setshowBulkUploadModel(true);
    } catch (error) {}
  };

  const recallProductApi = () => {
    try {
      refetch();
    } catch (error) {}
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
  const downloadSheet = () => {
    try {
      // console.log("data", data);
      // formatting api data for columns
      const capitalizedData = data.map((obj) => {
        const newObj = {};
        for (let key in obj) {
          //if not includes
          if (
            ![
              "product_id",
              "category_id",
              "brand_id",
              "is_draft",
              "key",
              "brand",
              "product_prices"
            ].includes(key)
          ) {
            // product_name
            if (key == "sap_code") {
              newObj["SAP Code"] = obj[key];
            } else if (key == "product_type") {
              newObj["Type"] = capitalizeFirstWORDAndSecondWordFirstLetterCapital(obj[key]);
            } else if (key == "product_name") {
              newObj["Name"] = obj[key];
            } else if (key == "brand_name") {
              newObj["Brand"] = obj[key];
            }
            //  else if (key === "long_desc" || key === "short_desc") {
            //   key === "long_desc"
            //     ? (newObj["Full Description"] = extractPlainText(obj[key]))
            //     : (newObj["Short Description"] = extractPlainText(obj[key]));
            // }
            else if (key === "long_desc") {
              newObj["Full Description"] = extractPlainText(obj[key]);
            } else if (key == "cart_details") {
              newObj["Min Cart Quantity"] = obj?.[key]?.min_cart_qty || 0;
              newObj["Max Cart Quantity"] = obj?.[key]?.max_cart_qty || 0;
              newObj["Multiple Cart Quantity"] = obj?.[key]?.multiple_cart_qty ? 1 : 0;
            } else if (key == "seo_details") {
              newObj["Meta Title"] = obj[key]?.meta_title;
              newObj["Meta Description"] = obj[key]?.meta_desc;
              newObj["Meta Keyword"] = obj[key]?.meta_keyword;
            } else if (key == "hsn_no") {
              newObj["HSN Number"] = obj[key];
            } else if (key == "gst_rate") {
              newObj["GST"] = obj[key];
            } else if (key == "gst_exempted") {
              newObj["GST Exempted"] = obj[key] ? 1 : 0;
            } else if (key == "product_mrp") {
              newObj["MRP"] = obj[key];
            } else if (key == "is_price_same_in_all_states") {
              newObj["Same Price For All State"] = obj[key] ? 1 : 0;
            } else if (key == "is_trending") {
              newObj["Is Trending"] = obj[key] ? 1 : 0;
            } else if (key == "new_arrival") {
              newObj["New Arrival"] = obj[key] ? 1 : 0;
            } else if (key == "show_stock") {
              newObj["Show Stock"] = obj[key] ? 1 : 0;
            } else if (key == "category") {
              newObj["Category"] = obj[key].category_name;
            } else if (key.includes("visible")) {
              newObj[key] = obj[key] ? 1 : 0;
            } else {
              newObj[capitalizeFirstWORDAndSecondWordFirstLetterCapital(key)] = obj[key];
            }
          }
        }

        // console.log("newObj", newObj);
        return newObj;
      });

      // formatting product and its variants and state prices
      const variantStatePrices = [];
      const productAndVariantArray = capitalizedData?.map((product) => {
        const tempArr = product["Product Variants"]?.map((elem) => {
          let obj = {};
          elem?.product_variant_attributes.forEach((item, index) => {
            obj["Type"] = "Variant";
            obj["Parent"] = product["SAP Code"];
            obj["SAP Code"] = elem.sap_code;
            obj["Same Price For All State"] = item?.is_price_same_in_all_states ? 1 : 0;
            obj[`Attribute ${index + 1} name`] = item.attribute.attr_name;
            obj[`Attribute ${index + 1} value(s)`] = item.attribute_value.attr_value;
          });

          elem?.product_prices?.forEach((item) => {
            let tempObj = {};
            tempObj["SAP Code"] = elem?.sap_code;
            tempObj["State"] = item?.state?.state_name;
            tempObj["Sale Price"] = item?.sale_price;
            tempObj["PV Price"] = item?.purchase_volume;
            tempObj["Shipping Price"] = item?.shipping_price;
            variantStatePrices.push(tempObj);
          });

          return obj;
        });

        delete product.product_variant;
        return [product, ...tempArr];
      });

      // matching formatted data with the pre-set columns
      const filteredData = [];
      productAndVariantArray.forEach((innerArray) => {
        innerArray.forEach((object) => {
          const filteredItem = {};
          const objectKeys = Object.keys(object);
          for (const key of productExportKeys) {
            if (objectKeys.includes(key)) {
              filteredItem[key] = object[key];
            }
          }
          filteredData.push(filteredItem);
        });
      });
      // formatting product's state prices - flattening the array
      const prices = data
        ?.filter((item) => item?.product_prices?.length > 0)
        .flatMap((product) =>
          product?.product_prices?.map((item) => ({
            "SAP Code": product?.sap_code,
            State: item?.state?.state_name,
            "Sale Price": item?.sale_price,
            "PV Price": item?.purchase_volume,
            "Shipping Price": item?.shipping_price
          }))
        );

      //final product data
      const ws = XLSX.utils.json_to_sheet(filteredData);

      //product and variant state prices sheet data
      const ws1 = XLSX.utils.json_to_sheet([...prices, ...variantStatePrices]);

      // Freeze the first row
      ws["!freeze"] = {
        xSplit: 0,
        ySplit: 1,
        topLeftCell: "A2",
        activePane: "bottomRight",
        state: "frozen"
      };

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, ws, "Product List");
      XLSX.utils.book_append_sheet(workbook, ws1, "State List");
      XLSX.writeFile(workbook, "product-sheet.xlsx");
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <Title level={5}>All Products</Title>
      <Spin spinning={loader} fullscreen />
      <>
        <Row gutter={[0, 6]}>
          <Col className="gutter-row" span={24}>
            <Flex gap="middle" justify="end">
              <Flex gap="middle">
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
                {/* <Button
                  type="primary"
                  size="large"
                  onClick={downloadSheet}
                  icon={<DownloadOutlined />}>
                  Download
                </Button> */}
                {
                  //on this click open the model in other file
                }{" "}
                <Button
                  type="primary"
                  size="large"
                  icon={<DownloadOutlined />}
                  onClick={() => setShowExportModal(true)}>
                  Download
                </Button>
                {/* {actionsPermissionValidator(
                  window.location.pathname,
                  PermissionAction.BULK_UPLOAD
                ) && ( */}
                {/* )} */}
                {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                  <>
                    <Button
                      size="large"
                      type="primary"
                      onClick={bulkUpload}
                      icon={<UploadOutlined />}>
                      Bulk Upload
                    </Button>
                    <NavLink to={`/${Paths.productAdd}`}>
                      <Button size="large" type="primary" block>
                        <PlusOutlined />
                        Add New
                      </Button>
                    </NavLink>
                  </>
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
                          setCurrent(1);
                          setPageSize(10);
                          setSearchParams({ page: "1", pageSize: "10" });
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
                    placeholder="Search by Product Name, Brand, SAP Code..."
                    enterButton="Search"
                    value={searchTerm}
                    onChange={handleSearch}
                    onSearch={handleSearchSubmit}
                    onKeyPress={handleKeyPress}
                    allowClear
                    className="custom-input-hover"
                  />
                  {searchTerm && (
                    <Button
                      type="primary"
                      size="small"
                      icon={<SyncOutlined />}
                      onClick={handleClear}
                      style={{
                        position: "absolute",
                        right: 90, // Adjust as per your layout
                        top: "50%",
                        transform: "translateY(-50%)",
                        zIndex: 1
                      }}>
                      Reset
                    </Button>
                  )}
                </Col>
              </Row>
              <Row className="noteStyle">
                Note: Use select category to get all products within the selected category.
              </Row>
            </Content>
          </Col>
        </Row>
      </>
      <Table
        columns={columns}
        rowSelection={rowSelection}
        dataSource={data}
        pagination={false}
        bordered={true}
        loading={isLoading}
        scroll={{
          x: checkInnerWidth() ? "1350px" : "auto"
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
          showSizeChanger={true}
          showQuickJumper
        />
      </div>
      {showBulkUploadModel && (
        <BulkUpload
          recallProductApi={recallProductApi}
          type={"product"}
          setshowBulkUploadModel={(e) => setshowBulkUploadModel(e)}
          setPercentageCountLoading={setPercentageCountLoading}
        />
      )}
      {showExportModal ? (
        <ExportModal
          setLoader={setLoader}
          loader={loader}
          visible={showExportModal}
          onClose={() => setShowExportModal(false)}
        />
      ) : (
        ""
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
export default ProductList;
