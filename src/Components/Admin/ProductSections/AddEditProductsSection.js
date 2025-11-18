import {
  PermissionAction,
  snackBarSuccessConf,
  RULES_MESSAGES,
  snackBarErrorConf,
  productSectionSheetData,
  SECTION_CATEGORY
} from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  convertRangeISODateFormat,
  uniqueArray
} from "Helpers/ats.helper";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import {
  Button,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Radio,
  Row,
  Select,
  Spin,
  Switch,
  Typography
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import dayjs from "dayjs";
import ProductSectionBulkUpload from "./ProductSectionBulkUpload";
import * as XLSX from "xlsx";
import { DownloadOutlined, UploadOutlined } from "@ant-design/icons";
import { debounce } from "lodash";

// Add/Edit Products Section Component
const AddEditProductsSection = () => {
  const { setBreadCrumb } = useUserContext();
  const navigate = useNavigate();
  const params = useParams();
  const [form] = Form.useForm();
  const { apiService } = useServices();
  const { RangePicker } = DatePicker;
  const [productsList, setProductsList] = useState([]);
  const [showBulkUploadModel, setshowBulkUploadModel] = useState(false);
  const [productsLoading, setProductsLoading] = useState(false);
  const [radioBtnValue, setRadioBtnValue] = useState("manual"); // initializing default value of radio btn
  const [fileData, setFileData] = useState(null); // initaialized state for excel file
  const [fileName, setFileName] = useState(null);

  // Styles
  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    },
    width100: {
      width: "100%"
    },
    sampleFileBtnStyle: {
      border: "none",
      width: "100%",
      boxShadow: "none",
      color: "#0062A6"
    }
  };

  // Function to submit form data
  const onFinish = (value) => {
    try {
      let dateRangeConversion = convertRangeISODateFormat(value.dateRange);
      let formData = new FormData();

      formData.append("section_title", value?.section_title);
      formData.append("section_subTitle", value?.section_subTitle || "");
      formData.append("create_type", value?.create_type);

      formData.append("start_date", dateRangeConversion["start"]);
      formData.append("end_date", dateRangeConversion["end"]);
      formData.append("status", value?.status ? "active" : "inactive");
      formData.append("product_category", value?.product_category);
      if (value.create_type == "manual") {
        if (Array.isArray(value?.product_ids)) {
          value?.product_ids.forEach((item, index) => {
            formData.append(`${"product_ids"}[${index}]`, item);
          });
        }
      } else {
        formData.append("product_section_bulk_file", value.product_section_bulk_file);
      }
      mutate(formData); // api call for add/update form data
    } catch (error) {}
  };

  // UseMutation hook for creating or updating existing product section via API
  const { mutate, isLoading } = useMutation(
    (data) => apiService.addEditProductSection(data, params?.id),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data.success) {
          enqueueSnackbar(data.message, snackBarSuccessConf); // Display a success Snackbar notification
          navigate(`/${Paths.productSectionsList}`); // Navigate to the window pathname
        }
      },
      onError: (error) => {
        // Handle errors
      }
    }
  );

  // UseMutation hook for fetching single product section data via API
  const { refetch: fetchSingleProductSectionData, isLoading: dataLoading } = useQuery(
    "singleProductSectionData",
    () => apiService.getSingleProductSection(params?.id),
    {
      enabled: false,
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data.data) {
          try {
            const { start_date, end_date, status, is_trending, section_subTitle } = data.data;
            form.setFieldsValue(data.data);
            form.setFieldValue("section_subTitle", section_subTitle || "");
            form.setFieldValue(
              "product_ids",
              data?.data?.product_ids?.map((item) => item?.sap_code)
            );
            form.setFieldValue("dateRange", [dayjs(start_date), dayjs(end_date)]);
            form.setFieldValue("status", status == "active" ? true : false);
            form.setFieldValue("is_trending", is_trending);
            const tempArrr = data?.data?.product_ids?.map((item) => ({
              label: `${item?.product_name}` + " " + "(" + `${item?.sap_code}` + ")",
              value: item?.sap_code
            }));
            setProductsList(tempArrr);
          } catch (error) {}
        }
      },
      onError: (error) => {
        console.log(error);
        //
      }
    }
  );

  /**
   * useEffect function
   */
  useEffect(() => {
    actionsPermissionValidator(
      window.location.pathname,
      params?.id ? PermissionAction.EDIT : PermissionAction.ADD
    )
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Products Section",
      icon: "productsSection",
      titlePath: Paths.productSectionsList,
      subtitle: params?.id ? "Edit" : "Add", // setting sub title based on params id
      path: Paths.users
    });

    if (params?.id) {
      fetchSingleProductSectionData(); // api call for fetching single section data
    } else {
      // initializing default form values
      form.setFieldValue("status", true);
      form.setFieldValue("is_trending", false);
      form.setFieldValue("create_type", "manual");
      fetchProduct();
    }
  }, []);

  // Function to disable past dates using Day.js
  const disablePastDates = (currentDate) => {
    // Disable dates before today
    return currentDate && currentDate.isBefore(dayjs().startOf("day"));
  };

  // To handle bulk upload feature
  const bulkUpload = () => {
    try {
      setshowBulkUploadModel(true);
    } catch (error) {}
  };

  // Function call on radio btn change
  const handleRadioBtnChange = (val) => {
    try {
      setRadioBtnValue(val); // setting state for toggling between select or upload option
      if (val == "manual") {
        handleBulkModalClose();
      } else {
        form.setFieldValue("product_ids", null);
      }
    } catch (error) {}
  };

  // update product list
  const updateProductList = (tempProductList) => {
    try {
      // get array having unique items based on unique value
      const finalArray = uniqueArray(productsList, tempProductList, "value");
      setProductsList(finalArray);
      setProductsLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  //  api for fetching products for select drop-down
  const { mutate: fetchProduct, isLoading: loadingProduct } = useMutation(
    "fetchProduct",
    (payload) => apiService.getAllProductsforProductsSection(payload?.search),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data && data?.data?.data?.length > 0) {
            const tempProductList = data?.data?.data?.map((item) => ({
              label: `${item?.product_name}` + " " + "(" + `${item?.sap_code}` + ")",
              value: item?.sap_code
            }));
            updateProductList(tempProductList); // function for setting product list
          } else {
            enqueueSnackbar("Product not found", snackBarErrorConf);
            setProductsLoading(false);
          }
        } catch (error) {
          console.log(error);
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // for producst search - debounce
  const debounceFetcherProduct = useMemo(() => {
    const loadOptions = (value) => {
      const obj = { search: value };
      fetchProduct(obj);
    };
    return debounce(loadOptions, 1000);
  }, [fetchProduct]);

  const searchProduct = (val) => {
    try {
      if (val && val.length >= 3) {
        const searchExist = productsList?.some((item) =>
          String(item?.label).toLowerCase().includes(val)
        ); // Check if any item matches the condition
        if (!searchExist) {
          setProductsLoading(true);
          debounceFetcherProduct(val);
        }
      }
    } catch (error) {}
  };

  useEffect(() => {
    form.setFieldValue("product_section_bulk_file", fileData);
    form.setFields([{ name: "product_section_bulk_file", errors: [] }]);
    setFileName(fileData?.name || null);
  }, [fileData]);

  // handle modal close function
  const handleBulkModalClose = () => {
    setshowBulkUploadModel(false);
    form.setFieldValue("product_section_bulk_file", null);
    setFileData(null);
  };

  // this method used to download sample file
  const downloadSheet = () => {
    try {
      const data = productSectionSheetData.productSectionSheet;

      const ws = XLSX.utils.json_to_sheet(data);
      // Freeze the first row
      ws["!freeze"] = {
        xSplit: 0,
        ySplit: 1,
        topLeftCell: "A2",
        activePane: "bottomRight",
        state: "frozen"
      };
      const instructionData = [
        {
          "Column Name": "SAP Code",
          Description: "This column represents the unique code of the products."
        }
      ];
      const ws3 = XLSX.utils.json_to_sheet(instructionData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, ws, "Products Sap Code List");
      XLSX.utils.book_append_sheet(workbook, ws3, "Instructions");
      XLSX.writeFile(workbook, "Products-SAP-Code-Sample-Sheet.xlsx");
    } catch (error) {}
  };

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Spin spinning={dataLoading} fullscreen />
        <Row gutter={[24, 0]}>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="section_title"
              label="Section Title"
              rules={[
                { required: true, whitespace: true, message: "Section title is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                {
                  pattern: /^.{3,50}$/,
                  message: "The value must be between 3 and 50 characters long."
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Enter Section Title" size="large" />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="section_subTitle"
              label="Section Subtitle"
              rules={[
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                {
                  pattern: /^.{3,50}$/,
                  message: "The value must be between 3 and 50 characters long."
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Enter Section Subtitle" size="large" />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="create_type"
              label="Upload Products"
              whitespace={false}
              rules={[{ required: true, message: "Field is required" }]}>
              <Radio.Group onChange={(e) => handleRadioBtnChange(e.target.value)}>
                <Radio value={"manual"}>Manually</Radio>
                {!params?.id && <Radio value={"bulk"}>Bulk Upload</Radio>}
              </Radio.Group>
            </Form.Item>
          </Col>

          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            {radioBtnValue == "manual" ? (
              <Form.Item
                name="product_ids"
                label="Assign Products"
                rules={[{ required: true, message: "Please select products" }]}>
                <Select
                  allowClear
                  showSearch
                  size="large"
                  placeholder="Select Products"
                  mode="multiple"
                  onSearch={searchProduct}
                  loading={productsLoading}
                  notFoundContent={loadingProduct ? <Spin size="small" /> : null}
                  options={productsList}
                  // filterOption={(input, option) => (option?.label ?? "").includes(input)}
                  filterOption={(input, option) => {
                    const label = String(option?.label) ?? "";
                    return label.toLowerCase().includes(String(input).toLowerCase());
                  }}
                />
              </Form.Item>
            ) : (
              <>
                <Form.Item
                  name="product_section_bulk_file"
                  label="Upload Products List (in .xlsx, .xls & .csv)"
                  rules={[{ required: true, message: "Please upload file" }]}>
                  <Flex>
                    <Button
                      size="large"
                      type="default"
                      onClick={bulkUpload}
                      style={StyleSheet.width100}
                      icon={<UploadOutlined />}>
                      Bulk Upload
                    </Button>

                    <Button
                      size="large"
                      style={StyleSheet.sampleFileBtnStyle}
                      onClick={downloadSheet}
                      icon={<DownloadOutlined />}>
                      Download Sample File
                    </Button>
                  </Flex>
                  {fileName && <Typography.Text strong>{fileName}</Typography.Text>}
                </Form.Item>
              </>
            )}
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="dateRange"
              label="Start Date & Expiry Date"
              rules={[{ required: true, message: "Start date & expiry date is required" }]}>
              <RangePicker
                disabledDate={disablePastDates}
                style={StyleSheet.width100}
                size="large"
                format="DD-MM-YYYY"
              />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="product_category"
              label="Category"
              rules={[{ required: true, message: "Please select category" }]}>
              <Select
                allowClear
                showSearch
                size="large"
                placeholder="Select Category"
                options={SECTION_CATEGORY}
                filterOption={(input, option) => {
                  const label = String(option?.label) ?? "";
                  return label.toLowerCase().includes(String(input).toLowerCase());
                }}
              />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 24 }}>
            <Flex gap={20} justify="space-between">
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Status is required" }]}>
                <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
              </Form.Item>
              <Flex align="center" justify={"flex-end"}>
                <NavLink to={"/" + Paths.productSectionsList}>
                  <Button disabled={isLoading} style={StyleSheet.backBtnStyle}>
                    Cancel
                  </Button>
                </NavLink>
                {actionsPermissionValidator(
                  window.location.pathname,
                  params?.id ? PermissionAction.EDIT : PermissionAction.ADD
                ) && (
                  <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
                    {params?.id ? "Update" : "Add"}
                  </Button>
                )}
              </Flex>
            </Flex>
          </Col>
        </Row>
      </Form>

      {showBulkUploadModel && (
        <ProductSectionBulkUpload
          type={"productSection"}
          setFileData={setFileData}
          handleModalClose={handleBulkModalClose}
          setshowBulkUploadModel={(e) => setshowBulkUploadModel(e)}
        />
      )}
    </>
  ) : (
    <></>
  );
};

export default AddEditProductsSection;
