import { Button, Col, Flex, Form, Input, Row, Select, Switch, Typography } from "antd";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import {
  PermissionAction,
  snackBarErrorConf,
  snackBarSuccessConf,
  otherUsergroup,
  paymentMethods,
  dispatchBy,
  // whiteSpaceDecimalandValueGreaterthanZERO,
  shippingChargeOptions,
  RULES_MESSAGES,
  pucUsergroup
} from "Helpers/ats.constants";
import { useMutation, useQuery } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { actionsPermissionValidator, negativeValueValiation } from "Helpers/ats.helper";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";

export default function AddEditShippingCharges() {
  const [currentFunctionality, setCurrentFunctionality] = useState("Add");
  const params = useParams();
  const { Title } = Typography;
  const { setBreadCrumb } = useUserContext();
  const [form] = Form.useForm();
  const { apiService } = useServices();
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState(null);
  const currentShippingRule = Form.useWatch(["shipping_rule"], form);
  const [showMaxCODamntField, setShowMaxCODamntField] = useState(false); // state to display max cod amnt field
  const [otherUsergroupDisabled, setOtherUsergroupDisabled] = useState(true);
  const [otherUserGroupData, setOtherUserGroupData] = useState(otherUsergroup);

  // UseQuery hook for creating a new user via API
  const { refetch } = useQuery(
    "singleShippingCharge",
    // Query function to handle the API call for creating a new user
    () => apiService.getSingleShippingChargesDetails(params.id),
    {
      enabled: false,
      // Configuration options for the Query
      onSuccess: (data) => {
        if (data) {
          const { status, payment_method } = data?.data || {};
          form.setFieldsValue(data.data);
          form.setFieldValue("status", status == "active");
          setShowMaxCODamntField(payment_method?.includes("cod"));
        }
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  /**
   * Function to submit form data
   * @param {*} value
   */

  const onFinish = (value) => {
    try {
      if (
        (value?.max_cod_amount &&
          parseFloat(value?.max_cod_amount) > parseFloat(value?.maximum_order)) ||
        parseFloat(value?.max_cod_amount) < parseFloat(value?.minimum_order)
      ) {
        enqueueSnackbar(
          "COD amount should be between Min and Max. Order Amount",
          snackBarErrorConf
        );
        return;
      }
      if (value?.shipping_rule?.some((item) => item.when === "always")) {
        let data = value;
        data.status = data.status ? "active" : "inactive";
        data.max_cod_amount = data.max_cod_amount || null;
        // Initiate the user creation process by triggering the mutate function
        mutate(data);
      } else {
        value?.shipping_rule
          ? setErrorMessage("Please select always option.")
          : setErrorMessage("Please add rule.");
      }
    } catch (error) {}
  };

  // addEditShippingCharges
  // UseMutation hook for creating a new user via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call
    (data) => apiService.shippingCharges(params.id, data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        // Display a success Snackbar notification with the API response message
        enqueueSnackbar(data.message, snackBarSuccessConf);

        // Navigate to the current window pathname after removing a specified portion
        navigate(`/${Paths.shippingChargesList}`);
      }
    }
  );

  /**
   * UseEffect function to set breadcrumb
   */

  const addUseEffect = () => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.ADD)
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Shipping Charges",
      icon: "shippingPrice",
      titlePath: Paths.shippingChargesList,
      subtitle: "Add Shipping Charge",
      path: Paths.users
    });
    form.setFieldValue("status", true);
  };

  const editUseEffect = () => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT)
      ? refetch()
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Shipping Charges",
      icon: "shippingPrice",
      titlePath: Paths.shippingChargesList,
      subtitle: "Edit Shipping Charge",
      path: Paths.users
    });
    setCurrentFunctionality("Edit");
  };

  useEffect(() => {
    params?.id ? editUseEffect() : addUseEffect();
  }, []);

  const minOrderValidation = (_, value) => {
    const maxValue = form.getFieldValue("maximum_order");
    if (value && maxValue && Number(value) >= Number(maxValue)) {
      form.setFields([{ name: "maximum_order", errors: [] }]);
      return Promise.reject("Minimum order should not be greater than or equal to maximum order");
    }
    return Promise.resolve();
  };

  const maxOrderValidation = (_, value) => {
    const minValue = form.getFieldValue("minimum_order");
    if (value && minValue && Number(value) <= Number(minValue)) {
      form.setFields([{ name: "minimum_order", errors: [] }]);
      return Promise.reject("Maximum order should not be lesser than or equal to minimum order");
    }
    return Promise.resolve();
  };

  const checkRange = (value, array) => {
    try {
      for (let i = 0; i < array.length; i++) {
        const obj = array[i];
        if (obj.is_from && obj.to) {
          if (value >= parseInt(obj.is_from) && value <= parseInt(obj.to)) {
            return true;
          }
        } else if (obj.is_from && value == parseInt(obj.is_from)) {
          return true;
        } else if (obj.to && value == parseInt(obj.to)) {
          return true;
        }
      }
      return false;
    } catch (error) {}
  };

  const isFromValidation = (_, value, name) => {
    const minValue = form.getFieldValue("minimum_order");
    if (value && minValue && Number(value) < Number(minValue)) {
      // form.setFields([{ name: "minimum_order", errors: [] }]);
      return Promise.reject("Value can not be lesser than min. order amount");
    }

    const maxValue = form.getFieldValue("maximum_order");
    if (value && maxValue && Number(value) >= Number(maxValue)) {
      return Promise.reject("Value cannot be greater or equal to max. order amount");
    }

    const toValue = form.getFieldValue(["shipping_rule", name, "to"]);
    if (value && toValue && Number(value) >= Number(toValue)) {
      return Promise.reject("Value cannot be greater or equal to max. amount");
    }

    const shippingRuleValues = [...form.getFieldValue(["shipping_rule"])];
    if (shippingRuleValues.length > 1 && value) {
      const filterArray = shippingRuleValues?.filter((item, index) => index !== name);
      if (checkRange(value, filterArray)) {
        return Promise.reject("Value lies in the range");
      }
    }

    return Promise.resolve();
  };

  const toValidation = (_, value, name) => {
    const maxValue = form.getFieldValue("maximum_order");
    if (value && maxValue && Number(value) > Number(maxValue)) {
      return Promise.reject("Value cannot be greater than max. order amount");
    }

    const isFromValue = form.getFieldValue(["shipping_rule", name, "is_from"]);
    if (value && isFromValue && Number(value) <= Number(isFromValue)) {
      return Promise.reject("Value cannot be lesser than or equal to min. amount");
    }
    // if (value && isFromValue && Number(value) == Number(isFromValue)) {
    //   return Promise.reject("Value cannot be lesser than min. amount");
    // }

    const shippingRuleValues = [...form.getFieldValue(["shipping_rule"])];
    if (shippingRuleValues.length > 1 && value) {
      const filterArray = shippingRuleValues?.filter((item, index) => index !== name);
      if (checkRange(value, filterArray)) {
        return Promise.reject("Value lies in the range");
      }
    }

    return Promise.resolve();
  };

  const whenValidation = (_, value, name) => {
    const shippingRuleValues = [...form.getFieldValue(["shipping_rule"])];
    if (shippingRuleValues.length > 1 && value == "always") {
      const hasAlways = shippingRuleValues
        ?.filter((item, index) => index !== name)
        ?.some((obj) => obj.when == "always");
      if (hasAlways) {
        return Promise.reject(`"Always" is already selected.`);
      }
    } else {
    }
    return Promise.resolve();
  };

  const handleRemoveField = (name, remove) => {
    try {
      setErrorMessage(null);
      remove(name);
    } catch (error) {}
  };

  const handleSelectWhen = (name, val) => {
    try {
      form.setFieldValue(["shipping_rule", name, "is_from"], null);
      form.setFieldValue(["shipping_rule", name, "to"], null);
      form.setFieldValue(["shipping_rule", name, "when"], val);

      form.setFields([{ name: ["shipping_rule", name, "is_from"], errors: [] }]);
      form.setFields([{ name: ["shipping_rule", name, "to"], errors: [] }]);

      setErrorMessage(null);
    } catch (error) {}
  };

  const handleMinOrderAmount = (val) => {
    if (form.getFieldValue(["shipping_rule"])) {
      const result = confirm(
        "Changing this value will affect the shipping rule. Are you sure you want to proceed?"
      );
      if (result == true) {
        form.setFieldValue("minimum_order", val);
        form.setFieldValue("shipping_rule", null);
      }
    }
  };

  const handleMaxOrderAmount = (val) => {
    if (form.getFieldValue(["shipping_rule"])) {
      const result = confirm(
        "Changing this value will affect the shipping rule. Are you sure you want to proceed?"
      );
      if (result == true) {
        form.setFieldValue("maximum_order", val);
        form.setFieldValue("shipping_rule", null);
      }
    }
  };

  const handleSelectChange = (value) => {
    try {
      if (value.includes("all")) {
        form.setFieldValue(
          "order_user_group",
          (form.getFieldValue("dispatch_by") == "PUC" ? pucUsergroup : otherUsergroup)
            .filter((item) => item.value !== "all")
            .map((option) => option.value)
        );
      }
    } catch (error) {}
  };

  const handeleDeSelectChange = () => {
    try {
      const otherUserVal = form.getFieldValue("order_user_group");
      form.setFieldValue(
        "order_user_group",
        otherUserVal?.filter((item) => item !== "all")
      );
    } catch (error) {}
  };

  const handlePayementSelect = (value) => {
    try {
      if (value.includes("all")) {
        form.setFieldValue(
          "payment_method",
          paymentMethods.filter((item) => item.value !== "all").map((option) => option.value)
        );
      }
    } catch (error) {}
  };

  const handlePayementDeSelect = () => {
    try {
      const paymentVal = form.getFieldValue("payment_method");
      form.setFieldValue(
        "payment_method",
        paymentVal?.filter((item) => item !== "all")
      );
    } catch (error) {}
  };

  // handle payment change
  const handlePaymentChange = (val) => {
    try {
      const status = val?.includes("cod");
      setShowMaxCODamntField(status);
      !status &&
        form.setFields([
          { name: "max_cod_amount", errors: [], value: form.getFieldValue("maximum_order") }
        ]);
    } catch (error) {}
  };

  return actionsPermissionValidator(
    window.location.pathname,
    currentFunctionality == "Add" ? PermissionAction.ADD : PermissionAction.EDIT
  ) ? (
    <>
      <Title level={5}>{currentFunctionality + " Shipping Charge"}</Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={24}>
            <Row gutter={[24, 0]}>
              <Col span={12}>
                <Form.Item
                  name="dispatch_by"
                  label="Dispatch By"
                  rules={[{ required: true, message: "Dispatch By is required" }]}>
                  <Select
                    allowClear
                    showSearch
                    size="large"
                    placeholder="Select Dispatch By"
                    options={dispatchBy}
                    filterOption={(input, option) =>
                      (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                    }
                    onChange={(e) => {
                      form.setFieldValue("order_user_group", null);
                      setOtherUsergroupDisabled(false);
                      if (!e) {
                        setOtherUsergroupDisabled(true);
                        return;
                      }
                      if (e === "PUC") {
                        setOtherUserGroupData(pucUsergroup);
                      } else {
                        setOtherUserGroupData(otherUsergroup);
                      }
                    }}
                  />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="order_user_group"
                  label="Order User Group"
                  rules={[{ required: true, message: "Order User Group is required" }]}>
                  <Select
                    allowClear
                    mode="multiple"
                    size="large"
                    placeholder="Select Order User Group"
                    onSelect={handleSelectChange}
                    onDeselect={handeleDeSelectChange}
                    filterOption={(input, option) =>
                      (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                    }
                    options={otherUserGroupData}
                    disabled={otherUsergroupDisabled}
                  />
                  {/* {otherUsergroup.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select> */}
                </Form.Item>
              </Col>

              <Col
                className="gutter-row"
                xs={{ span: 12 }}
                sm={{ span: 12 }}
                md={{ span: 12 }}
                lg={{ span: 6 }}>
                <Form.Item
                  name="minimum_order"
                  label="Min. Order Amount"
                  type="number"
                  rules={[
                    { required: true, message: "Min. Order Amount is required" },
                    { validator: minOrderValidation }
                    // ...whiteSpaceDecimalandValueGreaterthanZERO
                  ]}>
                  <Input
                    placeholder="Enter Min. Order Amount"
                    size="large"
                    type="number"
                    onInput={(e) => handleMinOrderAmount(e.target.value)}
                    // onChange={(e) => handleMinOrderAmount(e.target.value)}
                  />
                </Form.Item>
              </Col>
              <Col
                className="gutter-row"
                xs={{ span: 12 }}
                sm={{ span: 12 }}
                md={{ span: 12 }}
                lg={{ span: 6 }}>
                <Form.Item
                  name="maximum_order"
                  label="Max. Order Amount"
                  rules={[
                    { required: true, message: "Max. Order Amount is required" },
                    {
                      pattern: /^(?:[1-9]|[1-9]\d{0,6}|1000000)(?:\.\d+)?$/,
                      message: "The value must be between 1 and 1000000 characters long."
                    },
                    { validator: maxOrderValidation }
                    // ...whiteSpaceDecimalandValueGreaterthanZERO
                  ]}>
                  <Input
                    placeholder="Enter Max. Order Amount"
                    size="large"
                    type="number"
                    onChange={(e) => handleMaxOrderAmount(e.target.value)}
                    onBlur={(e) => {
                      form.setFieldValue("max_cod_amount", e.target.value);
                    }}
                  />
                </Form.Item>
              </Col>
              <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 8 }}>
                <Form.Item
                  name="payment_method"
                  label="Payment Method"
                  rules={[{ required: true, message: "Payment Method is required" }]}>
                  <Select
                    allowClear
                    showSearch
                    mode="multiple"
                    size="large"
                    onSelect={handlePayementSelect}
                    onDeselect={handlePayementDeSelect}
                    onChange={handlePaymentChange}
                    placeholder="Select Payment Method(s)"
                    options={paymentMethods}
                    filterOption={(input, option) => (option?.label ?? "").includes(input)}
                    maxTagCount={"responsive"}
                  />
                </Form.Item>
              </Col>
              {showMaxCODamntField && (
                <Col
                  className="gutter-row"
                  xs={{ span: 12 }}
                  sm={{ span: 12 }}
                  md={{ span: 12 }}
                  lg={{ span: 4 }}>
                  <Form.Item
                    name="max_cod_amount"
                    label="Max. COD Amount"
                    type="number"
                    rules={[
                      {
                        required: true,
                        message: "Max. COD Amount is required"
                      },
                      { validator: negativeValueValiation },
                      {
                        pattern: /^.{1,15}$/,
                        message: "The value must be between 1 and 15 digits long."
                      }
                    ]}>
                    <Input
                      placeholder="Enter Max. COD Amount"
                      size="large"
                      type="number"
                      onBlur={(e) => {
                        if (
                          parseFloat(e.target.value) >
                            parseFloat(form.getFieldValue("maximum_order")) ||
                          parseFloat(e.target.value) <
                            parseFloat(form.getFieldValue("minimum_order"))
                        ) {
                          form.setFields([
                            {
                              name: "max_cod_amount",
                              errors: [`Value should be between Min and Max. Order Amount`]
                            }
                          ]);
                        }
                      }}
                    />
                  </Form.Item>
                </Col>
              )}
            </Row>
            <Row gutter={[24, 0]}>
              <Col className="gutter-row" span={24}>
                <Typography.Title level={5}>Shipping Charges Rule</Typography.Title>
              </Col>

              <Col span={24}>
                <Form.List name="shipping_rule">
                  {(fields, { add, remove }) => (
                    <>
                      <>
                        {fields.map(({ key, name, ...restField }, index) => (
                          <Row gutter={[20, 0]} index={index} key={key}>
                            <Col span={1}>
                              <Flex align="center" justify="flex-end" className="fullHeight">
                                <Typography.Text code>{1 + name}</Typography.Text>
                              </Flex>
                            </Col>

                            <Col
                              className="gutter-row"
                              xs={{ span: 23 }}
                              sm={{ span: 23 }}
                              md={{ span: 23 }}
                              lg={{ span: 6 }}>
                              <Form.Item
                                name={[name, "when"]}
                                label="When"
                                rules={[
                                  { required: true, message: "Field is required" },
                                  { validator: (_, value) => whenValidation(_, value, name) }
                                ]}>
                                <Select
                                  allowClear
                                  showSearch
                                  size="large"
                                  placeholder="Select"
                                  options={shippingChargeOptions}
                                  onChange={(val) => handleSelectWhen(name, val)}
                                  filterOption={(input, option) =>
                                    (option?.label ?? "").includes(input)
                                  }
                                />
                              </Form.Item>
                            </Col>

                            <Col
                              className="gutter-row"
                              xs={{ span: 12 }}
                              sm={{ span: 12 }}
                              md={{ span: 12 }}
                              lg={{ span: 5 }}>
                              <Form.Item
                                name={[name, "is_from"]}
                                label="Min. Amount"
                                type="number"
                                rules={[
                                  {
                                    required:
                                      currentShippingRule[name]?.when == "price" ? true : false,
                                    message: "Field is required"
                                  },
                                  // ...whiteSpaceDecimalandValueGreaterthanZERO,
                                  { validator: (_, value) => isFromValidation(_, value, name) }
                                ]}>
                                <Input
                                  placeholder="Enter Min. Amount"
                                  size="large"
                                  type="number"
                                  addonBefore={<span>₹ </span>}
                                  disabled={
                                    currentShippingRule[name]?.when == "price" ? false : true
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col
                              xs={{ span: 12 }}
                              sm={{ span: 12 }}
                              md={{ span: 12 }}
                              lg={{ span: 5 }}>
                              <Form.Item
                                name={[name, "to"]}
                                label="Max. Amount"
                                type="number"
                                rules={[
                                  {
                                    required:
                                      currentShippingRule[name]?.when == "price" ? true : false,
                                    message: "Field is required"
                                  },
                                  // ...whiteSpaceDecimalandValueGreaterthanZERO,
                                  { validator: (_, value) => toValidation(_, value, name) }
                                ]}>
                                <Input
                                  placeholder="Enter Max. Amount"
                                  size="large"
                                  type="number"
                                  addonBefore={<span>₹ </span>}
                                  disabled={
                                    currentShippingRule[name]?.when == "price" ? false : true
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col
                              className="gutter-row"
                              xs={{ span: 22 }}
                              sm={{ span: 22 }}
                              md={{ span: 22 }}
                              lg={{ span: 5 }}>
                              <Form.Item
                                name={[name, "rule_cost"]}
                                label="Rule Cost Is"
                                type="number"
                                rules={[
                                  { required: true, message: "Field is required" },
                                  {
                                    pattern:
                                      /^(?:0|[1-9]\d{0,4}(?:\.\d+)?|0\.\d*[1-9]\d*|99999(?:\.0+)?)$/,
                                    message: "The value must be between 1 to 99999"
                                  },
                                  {
                                    pattern: /^\S(.*\S)?$/,
                                    message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE
                                  }
                                ]}>
                                <Input
                                  placeholder="Enter Cost"
                                  size="large"
                                  type="number"
                                  addonBefore={<span>₹ </span>}
                                />
                              </Form.Item>
                            </Col>

                            <Col span={2}>
                              <Flex align="center" justify="flex-start" className="fullHeight">
                                <DeleteOutlined
                                  style={{ fontSize: "large", color: "#DC2626" }}
                                  onClick={() => handleRemoveField(name, remove)}
                                />
                              </Flex>
                            </Col>
                          </Row>
                        ))}
                      </>
                      <Col span={24}>
                        <Form.Item>
                          <Button
                            type="dashed"
                            onClick={() => {
                              setErrorMessage(null);
                              add();
                            }}
                            block
                            disabled={fields.some((field) => field.errors?.length)}
                            icon={<PlusOutlined />}>
                            Add Rule
                          </Button>
                        </Form.Item>
                      </Col>
                    </>
                  )}
                </Form.List>
                {errorMessage && (
                  <Typography.Paragraph type="danger">{errorMessage}</Typography.Paragraph>
                )}
              </Col>
            </Row>
          </Col>
        </Row>

        <Flex gap="middle">
          <Form.Item name="status" label="Status">
            <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Flex justify={"flex-end"} align={"center"} className="width_full">
            <NavLink to={"/" + Paths.shippingChargesList}>
              <Button style={StyleSheet.backBtnStyle} disabled={isLoading}>
                Cancel
              </Button>
            </NavLink>
            {actionsPermissionValidator(
              window.location.pathname,
              currentFunctionality == "Add" ? PermissionAction.ADD : PermissionAction.EDIT
            ) && (
              <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
                {currentFunctionality == "Add" ? "Add" : "Update"}
              </Button>
            )}
          </Flex>
        </Flex>
      </Form>
    </>
  ) : (
    ""
  );
}

/***
 * styles
 */
const StyleSheet = {
  backBtnStyle: {
    marginRight: "10px"
  }
};
