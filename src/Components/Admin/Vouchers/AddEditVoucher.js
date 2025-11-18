import {
  PermissionAction,
  snackBarSuccessConf,
  RULES_MESSAGES,
  DISCOUNT_TYPE
} from "Helpers/ats.constants";
import { actionsPermissionValidator, disablePastTimes } from "Helpers/ats.helper";
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
  Switch,
  Typography
} from "antd";
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery } from "react-query";
import dayjs from "dayjs";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";

// Add/Edit Voucher Component
export default function AddEditVoucher() {
  const params = useParams();
  const [form] = Form.useForm();

  const { RangePicker } = DatePicker;
  const { apiService } = useServices();
  const { setBreadCrumb } = useUserContext();
  const navigate = useNavigate();

  const [disableMaxDiscountAmount, setDisableMaxDiscountAmount] = useState(false);

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

  // useQuery hook for getting single voucher details
  const { refetch } = useQuery(
    "getSingleVoucherDetails",
    // Mutation function to handle the API call for creating a new voucher
    () => apiService.getSingleVoucherData(params?.id),

    {
      enabled: false, //Disable the query by default
      onSuccess: (data) => {
        if (data.data) {
          form.setFieldsValue(data.data);
          const { discount_type, start_date, end_date, status, min_purchase_amount } =
            data.data || {};
          form.setFieldValue("select_start_date_expiry_date", [dayjs(start_date), dayjs(end_date)]);
          form.setFieldValue("status", status == "active" ? true : false);
          form.setFieldValue(
            "min_purchase_amount",
            min_purchase_amount == 0.0 ? parseInt(min_purchase_amount) : min_purchase_amount
          );

          setDisableMaxDiscountAmount(discount_type == "fixed");
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  // submit data
  const onFinish = (value) => {
    try {
      let data = value;

      // Convert falsy or empty values to null
      for (let key in data) {
        if (data[key] === "") {
          data[key] = null;
        }
      }
      data.status = data.status ? "active" : "inactive";
      data.start_date = data.select_start_date_expiry_date[0];
      data.end_date = data.select_start_date_expiry_date[1];

      delete data.select_start_date_expiry_date;
      mutate(data); // api call for  voucher creation/updation process
    } catch (error) {}
  };

  // UseMutation hook for creating/updating voucher via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a new voucher
    (data) => apiService.addEditVoucher(params?.id, data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          navigate(`/${Paths.voucherList}`);
        }
      },
      onError: (error) => {
        //
      }
    }
  );

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    actionsPermissionValidator(
      window.location.pathname,
      params?.id ? PermissionAction.EDIT : PermissionAction.ADD
    )
      ? ""
      : navigate("/", { state: { from: null }, replace: true });
    setBreadCrumb({
      title: "Vouchers",
      icon: "Offer&Coupon",
      titlePath: Paths.voucherList,
      subtitle: params?.id ? "Edit Voucher" : "Add Voucher",
      path: Paths.users
    });

    if (params?.id) {
      refetch();
    } else {
      form.setFieldValue("status", true);
      form.setFieldValue("discount_type", "percentage");
    }
  }, []);

  // Function to disable past dates using Day.js
  const disablePastDates = (currentDate) => {
    // Disable dates before today
    return currentDate && currentDate.isBefore(dayjs().startOf("day"));
  };

  // handle discount type change
  const handleDiscountType = (val) => {
    try {
      form.setFieldValue("discount_type", val);

      // Update fields regardless of discount type
      form.setFields([
        { name: "discount_value", errors: [], value: null },
        { name: "max_discount_amount", errors: [], value: null }
      ]);

      // Toggle max discount amount based on discount type
      setDisableMaxDiscountAmount(val == "fixed");
    } catch (error) {}
  };

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.EDIT : PermissionAction.ADD
  ) ? (
    <>
      <Typography.Title level={5}>{params?.id ? "Edit Voucher" : "Add Voucher"}</Typography.Title>

      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="voucher_code"
              label="Voucher Code"
              rules={[
                { required: true, message: "Voucher Code is required" },
                { pattern: /^\S(.*\S)?$/, message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE },
                { pattern: /^[A-Z0-9]*$/, message: "Please enter valid voucher code" },
                {
                  pattern: /^.{3,15}$/,
                  message: "The value must be between 3 and 15 characters long."
                }
              ]}>
              <Input
                onInput={(e) => (e.target.value = e.target.value.toUpperCase())}
                placeholder="Enter Voucher Code"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={6}>
            <Form.Item
              name="discount_type"
              label="Discount Type"
              rules={[{ required: true, message: "Discount type is required" }]}>
              <Select
                placeholder="Select Discount Type"
                block
                size="large"
                onChange={handleDiscountType}
                options={DISCOUNT_TYPE}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={6}>
            <Form.Item
              name="discount_value"
              label="Discount Value"
              rules={[
                { required: true, message: "Discount value is required" },
                {
                  pattern: /^(?!0(\.0+)?$)(?:[1-9]\d{0,4}|[1-9]\d{0,4}(?:\.\d+)?|100000(?:\.0+)?)$/,
                  message: "Please enter a number up to 1,00,000 and not zero"
                },

                disableMaxDiscountAmount
                  ? {
                      pattern: /^(?:0|[1-9]\d{0,4}|[1-9]\d{0,4}(?:\.\d+)?|100000(?:\.0+)?)$/,
                      message: "Please enter a number up to 1,00,000"
                    }
                  : {
                      pattern: /^(100(?:\.0*)?|[0-9]?\d(?:\.\d*)?)$/,
                      message: "Please enter a number up to 100"
                    }
              ]}>
              <Input
                type="number"
                addonBefore={disableMaxDiscountAmount && <span>₹ </span>}
                addonAfter={!disableMaxDiscountAmount && <span>%</span>}
                placeholder="Enter Discount Value"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={12}>
            <Form.Item
              name="usage_limit"
              label="Total Usage Limit"
              rules={[
                { required: true, message: "Total Usage Limit is required" },
                { pattern: /^[1-9]\d*$/, message: "Please enter valid number" },
                { pattern: /^.{0,5}$/, message: "Value should not exceed 5 characters" }
              ]}>
              <Input type="number" placeholder="Enter Total Usage Limit" size="large" />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={12}>
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

          <Col className="gutter-row" span={6}>
            <Form.Item
              name="min_purchase_amount"
              label="Minimum Purchase Amount"
              rules={[
                {
                  pattern: /^(?:0|[1-9]\d{0,4}|[1-9]\d{0,4}(?:\.\d+)?|100000(?:\.0+)?)$/,
                  message: "Please enter a number up to 1,00,000"
                }
              ]}>
              <Input type="number" placeholder="Enter Minimum Purchase Amount" size="large" />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={6}>
            <Form.Item
              name="max_discount_amount"
              label="Maximum Discount Amount"
              rules={
                !disableMaxDiscountAmount && [
                  {
                    pattern: /^(?:0|[1-9]\d{0,4}|[1-9]\d{0,4}(?:\.\d+)?|100000(?:\.0+)?)$/,
                    message: "Please enter a number up to 1,00,000"
                  }
                ]
              }>
              <Input
                type="number"
                disabled={disableMaxDiscountAmount}
                placeholder="Enter Maximum Discount Amount"
                size="large"
              />
            </Form.Item>
          </Col>

          <Col className="gutter-row" span={6}>
            <Form.Item
              name="supported_types"
              label="Show on"
              rules={[{ required: true, message: "Show on is required" }]}>
              <Checkbox.Group>
                <Checkbox value="web">Web (E-com)</Checkbox>
                <Checkbox value="app">App (E-com)</Checkbox>
                <Checkbox value="wonder_world">PUC</Checkbox>
              </Checkbox.Group>
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={6}>
            <Form.Item name="status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Flex align="start" justify={"flex-end"}>
              <NavLink to={"/" + Paths.voucherList}>
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
          </Col>
        </Row>
      </Form>
    </>
  ) : (
    <></>
  );
}
