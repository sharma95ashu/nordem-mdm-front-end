import {
  PermissionAction,
  snackBarSuccessConf,
  snackBarErrorConf,
  RULES_MESSAGES
} from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  checkDiscountValue,
  checkMinimumPriceValue,
  checkTotalUsageLimit,
  checkUsagePerUser,
  disablePastTimes
} from "Helpers/ats.helper";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Switch,
  Typography
} from "antd";
import React, { useEffect, useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "react-query";
import dayjs from "dayjs";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import { debounce } from "lodash";

export default function CouponAdd() {
  const { setBreadCrumb } = useUserContext();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { RangePicker } = DatePicker;
  const [applicableOn, SetApplicableOn] = useState("");
  const [applicableOnIds, SetApplicableOnIds] = useState([]);
  const { apiService } = useServices();
  const queryClient = useQueryClient();
  const [userInfo, setUserInfo] = useState([]);
  const [disableMinPurchaseAmount, setDisableMinPurchaseAmount] = useState(false);
  const [productLoading, setProductLoading] = useState(false);

  /***
   * styles
   */
  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    },
    datePickerStyle: {
      width: "100%"
    }
  };

  /**
   * Function to submit form data
   * @param {*} value
   */

  const onFinish = (value) => {
    let data = value;

    if (!data.usage_limit) {
      delete data.usage_limit;
    }

    if (!data.usage_limit_per_user) {
      delete data.usage_limit_per_user;
    }

    if (!data.applicable_users || data.applicable_users.length == 0) {
      delete data.applicable_users;
    }

    data.coupon_status = data.coupon_status ? "active" : "inactive";

    data.start_date = data.select_start_date_expiry_date[0];
    data.expiry_date = data.select_start_date_expiry_date[1];

    delete data.select_start_date_expiry_date;

    let obj = { load: data };

    // Initiate the coupon creation process by triggering the mutate function
    mutate(obj);
  };

  // UseMutation hook for creating a new coupon via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a new coupon
    (data) => apiService.createCoupon(data.load),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(data.message, snackBarSuccessConf);

        // Navigate to the current window pathname after removing a specified portion
        navigate(`/${Paths.couponList}`);

        // Invalidate the "getAllRoles" query in the query client to trigger a refetch
        queryClient.invalidateQueries("fetchCouponData");
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
        // enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    form.setFieldValue("coupon_status", true);

    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? ""
      : navigate("/", { state: { from: null }, replace: true });
    setBreadCrumb({
      title: "Coupons",
      icon: "Offer&Coupon",
      titlePath: Paths.couponList,
      subtitle: "Add Coupon",
      path: Paths.users
    });
  }, []);

  // Function to disable past dates using Day.js
  const disablePastDates = (currentDate) => {
    // Disable dates before today
    return currentDate && currentDate.isBefore(dayjs().startOf("day"));
  };

  const handleApplicableType = (value) => {
    form.setFields([{ name: "type_ids", errors: [] }]);

    if (value) {
      SetApplicableOn(value);
      if (value === "brand") {
        fetchApplicableBrand();
      } else if (value === "category") {
        fetchApplicableCategory();
      } else {
        fetchApplicableProduct();
      }
      form.setFieldValue("type_ids", null);
    } else {
      SetApplicableOn("");
    }
  };

  // UseQuery hook for fetching data of a brand Details from the API
  const { refetch: fetchApplicableBrand } = useQuery(
    "getCouponBrandDetails",

    // Function to fetch data of a applicable field using apiService.getAttributesDetails
    () => apiService.getCouponBrandDetails(),
    {
      // Configuration options
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        SetApplicableOnIds([]);
        data?.data?.data?.map((item) =>
          SetApplicableOnIds((prev) => [
            ...prev,
            {
              value: item?.brand_id,
              label: item?.brand_name
            }
          ])
        );
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );
  // UseQuery hook for fetching data of a category  Details from the API
  const { refetch: fetchApplicableCategory } = useQuery(
    "getCouponCategoryDetails",

    // Function to fetch data of a applicable field Details using apiService.getAttributesDetails
    () => apiService.getCouponCategoryDetails(),
    {
      // Configuration options
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        SetApplicableOnIds([]);
        data?.data?.data?.map((item) =>
          SetApplicableOnIds((prev) => [
            ...prev,
            {
              value: item?.category_id,
              label: item?.category_name
            }
          ])
        );
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // UseQuery hook for fetching data of a product  Details from the API
  const { mutate: fetchApplicableProduct } = useMutation(
    "getCouponProductDetails",
    // Function to fetch data of applicable field using apiService.getCouponProductDetails
    (val) => apiService.getCouponProductDetails(val?.search || null),
    {
      // Configuration options
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        if (data) {
          if (data?.data?.data?.length > 0) {
            const tempProductList = data?.data?.data?.map((item) => ({
              value: item?.product_id,
              label: item?.product_name
            }));
            updateProductList(tempProductList);
          } else {
            enqueueSnackbar("Product not found", snackBarErrorConf);
            setProductLoading(false);
          }
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // UseQuery hook for fetching data of all Users from the API
  useQuery(
    "getAllUser",
    // Function to fetch data of a all user using apiService.getRequest
    () => apiService.getRequest(`/offers/get-all-roles/0/200`),
    {
      // Configuration options
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        setUserInfo([]);
        data?.data.map((item) =>
          setUserInfo((prev) => [...prev, { value: item?.role_id, label: item?.role_name }])
        );
        // Set form values based on the fetched data
      },
      onError: (error) => {
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const handleDiscountType = (val) => {
    try {
      form.setFieldValue("discount_type", val);

      if (val == "percentage") {
        setDisableMinPurchaseAmount(true);
        form.setFields([
          { name: "discount_value", errors: [], value: null },
          { name: "minimum_purchase_amount", errors: [], value: null }
        ]);
      } else {
        setDisableMinPurchaseAmount(false);
        form.setFields([
          { name: "discount_value", errors: [], value: null },
          { name: "minimum_purchase_amount", errors: [], value: null }
        ]);
      }
    } catch (error) {}
  };

  const updateProductList = (tempProductList) => {
    try {
      // Create a set of unique ids from products array and wholeData array
      const uniqueIDs = [
        ...new Set([
          ...applicableOnIds.map((item) => item.value),
          ...tempProductList.map((item) => item.value)
        ])
      ];
      // createing a whole data array
      const mergedArr = [...tempProductList, ...applicableOnIds];
      // Create a final array by filtering the wholeData array based on uniqueIDs set
      const finalArray = uniqueIDs.map((item) => {
        return mergedArr.find((product) => product?.value === item);
      }); //
      SetApplicableOnIds([...finalArray]);
      setProductLoading(false);
    } catch (error) {}
  };

  // for product - debounce
  const debounceFetcherProduct = useMemo(() => {
    const loadOptions = (value) => {
      const obj = { search: value };
      fetchApplicableProduct(obj);
    };
    return debounce(loadOptions, 1000);
  }, [fetchApplicableProduct]);

  // search product function
  const searchProduct = (val) => {
    try {
      if (val && val.length >= 3) {
        const searchExist = applicableOnIds?.some((item) =>
          String(item?.label).toLowerCase().includes(val)
        ); // Check if any item matches the condition

        if (applicableOn == "product" && !searchExist) {
          setProductLoading(true);
          debounceFetcherProduct(val);
        }
      }
    } catch (error) {}
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) ? (
    <>
      <Typography.Title level={5}>Add Coupon</Typography.Title>

      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="coupon_code"
              label="Coupon Code"
              rules={[
                { required: true, whitespace: true, message: "Coupon code is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                { pattern: /^[A-Z0-9]*$/, message: "Please enter valid coupon code" },
                {
                  pattern: /^.{3,16}$/,
                  message: "The value must be between 3 and 16 characters long."
                }
              ]}>
              <Input
                onInput={(e) => (e.target.value = e.target.value.toUpperCase())}
                placeholder="Enter Coupon Code"
                size="large"
              />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Row gutter={[24, 0]}>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="discount_type"
                  label="Discount Type"
                  rules={[{ required: true, message: "Discount type is required" }]}>
                  <Select
                    placeholder="Select Discount Type"
                    block
                    size="large"
                    onChange={(e) => handleDiscountType(e)}
                    options={[
                      {
                        value: "percentage",
                        label: "Percentage"
                      },
                      {
                        value: "fixed",
                        label: "Fixed"
                      }
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="discount_value"
                  label="Discount Value"
                  rules={[
                    { required: true, message: "Discount value is required" },
                    {
                      pattern: /^(?:0|[1-9]\d{0,9}(?:\.\d+)?|1000000000(?:\.0+)?)$/,
                      message: "Please enter a number up to 1,000,000,000"
                    },
                    checkDiscountValue(form)
                  ]}>
                  <Input type="number" placeholder="Enter Discount Value" size="large" />
                </Form.Item>
              </Col>
            </Row>
          </Col>

          <Col className="gutter-row" span={12}>
            <Form.Item
              name="applicable_on"
              label="Applicable On"
              rules={[{ required: true, message: "Applicable on is required" }]}>
              <Select
                block
                onChange={(value) => {
                  handleApplicableType(value);
                }}
                placeholder="Select Applicable On"
                size="large"
                options={[
                  {
                    value: "brand",
                    label: "Brand"
                  },
                  {
                    value: "category",
                    label: "Category"
                  },
                  {
                    value: "product",
                    label: "Product"
                  }
                ]}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              className="textCapitalize"
              name="type_ids"
              label={`${applicableOn || "Select applicable criteria first"}`}
              rules={[{ required: true, message: `${applicableOn || "This field"} is required` }]}>
              <Select
                showSearch
                allowClear
                size="large"
                mode="multiple"
                disabled={!applicableOn}
                onSearch={searchProduct}
                loading={productLoading}
                notFoundContent={productLoading ? <Spin size="small" /> : null}
                placeholder={`${applicableOn || ""}`}
                options={applicableOnIds}
                filterOption={(input, option) => {
                  const label = String(option?.label) ?? "";
                  return label.includes(String(input));
                }}
              />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Row gutter={[24, 0]}>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="usage_limit"
                  label="Total Usage Limit"
                  rules={[
                    { pattern: /^[1-9]\d*$/, message: "Please enter valid number" },
                    { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" },
                    checkTotalUsageLimit(form)
                  ]}>
                  <Input type="number" placeholder="Enter Total Usage Limit" size="large" />
                </Form.Item>
              </Col>

              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="usage_limit_per_user"
                  label="Usage Per User"
                  rules={[
                    { pattern: /^[1-9]\d*$/, message: "Please enter valid number" },
                    { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" },
                    checkUsagePerUser(form)
                  ]}>
                  <Input type="number" placeholder="Enter Usage Per User" size="large" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Form.Item
              name="select_start_date_expiry_date"
              label="Start Date & Expiry Date"
              rules={[{ required: true, message: "Start date & expiry date is required" }]}>
              <RangePicker
                disabledDate={disablePastDates}
                disabledTime={(current, picker) => disablePastTimes(current, picker)}
                style={StyleSheet.datePickerStyle}
                size="large"
                showTime={{
                  format: "HH:mm"
                }}
                format="DD-MM-YYYY HH:mm"
              />
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}>
            <Row gutter={[24, 0]}>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="minimum_purchase_amount"
                  label="Minimum Purchase Amount"
                  rules={
                    disableMinPurchaseAmount
                      ? []
                      : [
                          { required: true, message: "Minimum purchase amount is required" },
                          {
                            pattern: /^(?:0|[1-9]\d{0,9}(?:\.\d+)?|1000000000(?:\.0+)?)$/,
                            message: "Please enter a number up to 1,000,000,000"
                          },
                          { validator: (_, value) => checkMinimumPriceValue(_, value, form) }
                        ]
                  }>
                  <Input
                    type="number"
                    disabled={disableMinPurchaseAmount}
                    placeholder="Enter Minimum Purchase Amount"
                    size="large"
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item name="applicable_users" label="Select User Group">
                  <Select
                    block
                    size="large"
                    mode="multiple"
                    placeholder="Select User Group"
                    options={userInfo}
                    filterOption={(input, option) =>
                      (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 12 }}
            sm={{ span: 12 }}
            md={{ span: 12 }}
            lg={{ span: 6 }}>
            <Form.Item
              name="supported_types"
              label="Show on"
              // rules={[{ required: true, message: "Show on is required" }]}
            >
              <Checkbox.Group>
                <Checkbox value="web">Web (E-com)</Checkbox>
                <Checkbox value="app">App (E-com)</Checkbox>
                <Checkbox value="wonder_world">PUC</Checkbox>
              </Checkbox.Group>
            </Form.Item>
          </Col>
          <Col
            className="gutter-row"
            xs={{ span: 12 }}
            sm={{ span: 12 }}
            md={{ span: 12 }}
            lg={{ span: 6 }}>
            <Form.Item name="coupon_status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
        </Row>
        <Flex align="start" justify={"flex-end"}>
          <NavLink to={"/" + Paths.couponList}>
            <Button disabled={isLoading} style={StyleSheet.backBtnStyle}>
              Cancel
            </Button>
          </NavLink>
          {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
            <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
              Add
            </Button>
          )}
        </Flex>
      </Form>
    </>
  ) : (
    <></>
  );
}
