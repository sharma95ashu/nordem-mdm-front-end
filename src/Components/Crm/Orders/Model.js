import {
  Alert,
  Button,
  Col,
  Collapse,
  Flex,
  Form,
  Image,
  Input,
  Modal,
  Popconfirm,
  Result,
  Row,
  Select,
  Space,
  Spin,
  // Steps,
  Table,
  Tag,
  Timeline,
  Tooltip,
  Typography
} from "antd";
import {
  CARD_STATUS,
  ORDER_ACTION,
  ORDER_STATUS_ENUM,
  REMARK_CANCEL_REQUEST
} from "CrmHelper/crmConstant";
import { snackBarSuccessConf } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import React, { memo, useEffect, useState } from "react";
import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";
import {
  getReturnTrackingStatus,
  getTrackingIconColor,
  // getStatusTag,
  validateAddress,
  validateMaxLength,
  validateMessage,
  validateMobileNumber
} from "CrmHelper/crm.helper";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  QuestionCircleOutlined
} from "@ant-design/icons";
import TextArea from "antd/es/input/TextArea";
import {
  getDateTimeFormat,
  getNextFivePickupDates,
  validateLength,
  validateOTP
} from "Helpers/ats.helper";
import { InputOTP } from "antd-input-otp";
import PICKUP_ICON_ADDRESS from "Static/CRM_STATIC/img/pickupAddress.svg";
import dayjs from "dayjs";

// Cancel modal
const CancelRequestModel = memo((props) => {
  const [cancelRequestForm] = Form.useForm();
  const { apiService } = useServices();
  const [selectedReason, setSelectedReason] = useState(null);

  // Api call cancel request
  const { mutate: cancelRequestData, isLoading: cancelRequestLoading } = useMutation(
    (data) => apiService.orderCancelRequest(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          props?.orderApi();
          props?.hide(false);
          enqueueSnackbar(data.message, snackBarSuccessConf);
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );

  // Handle deny request(cancel request)
  const handleDenyRequest = () => {
    try {
      const data = {
        order_no: props?.orderDetails?.order_no,
        order_action: ORDER_ACTION.DENY
      };
      // api call  to reject cancel request
      cancelRequestData(data);
    } catch (error) {
      console.log(error);
    }
  };

  // handle Approved request
  const handleApprovedRequest = (values) => {
    try {
      const data = {
        order_no: props?.orderDetails?.order_no,
        order_action: ORDER_ACTION.APPROVED,
        order_remark:
          values?.reason === ORDER_ACTION.OTHER && values?.message
            ? values?.message
            : values?.reason
      };
      // api call for approve cancel request
      cancelRequestData(data);
    } catch (error) {
      console.log(error);
    }
  };

  // handle select on change
  const handleSelectChange = (value) => {
    setSelectedReason(value);
    if (value !== "other") {
      cancelRequestForm.setFieldValue("message", null);
    }
  };

  return (
    <Modal
      className="sequencebody"
      title={<Typography.Text strong>Cancel Order Request</Typography.Text>}
      loading={cancelRequestLoading}
      open={props?.show}
      onCancel={() => {
        props?.hide(false);
        cancelRequestForm.resetFields();
      }}
      footer={false}>
      <Form
        form={cancelRequestForm}
        layout="vertical"
        onFinish={handleApprovedRequest}
        id="cancelRequestForm">
        <Spin spinning={cancelRequestLoading}>
          <Row gutter={[20, 5]}>
            <Col span={24}>
              <Typography.Text type="secondary">Remark</Typography.Text>
            </Col>
            <Col span={24}>
              <Form.Item
                name="reason"
                rules={[{ required: true, message: "Please select a reason" }]}>
                <Select
                  size="large"
                  placeholder="Select reason"
                  className="fullWidth"
                  options={REMARK_CANCEL_REQUEST}
                  onChange={handleSelectChange}
                />
              </Form.Item>
            </Col>
            {selectedReason === "other" && (
              <Col span={24}>
                <Form.Item
                  name="message"
                  rules={[
                    { required: true, message: "Please provide a reason" },
                    {
                      validator: validateMessage(10, 250, "Invalid Reason")
                    }
                  ]}>
                  <Input.TextArea
                    minLength={10}
                    maxLength={50}
                    onInput={(e) => validateMaxLength(e, 50)}
                    placeholder="Please specify other reasons"
                    className="fullWidth"
                    rows={4}
                  />
                </Form.Item>
              </Col>
            )}
            <Col span={24}>
              <Row justify="end">
                <Button
                  onClick={handleDenyRequest}
                  style={{ marginRight: 10 }}
                  type="primary"
                  disabled={cancelRequestLoading}>
                  Reject
                </Button>
                <Button
                  type="default"
                  disabled={cancelRequestLoading}
                  onClick={() => cancelRequestForm.submit()}>
                  Approve
                </Button>
              </Row>
            </Col>
            <Col span={24}></Col>
          </Row>
        </Spin>
      </Form>
    </Modal>
  );
});

// Offer modal
const OfferModal = memo((props) => {
  const columns = [
    {
      title: "Offer Product Name",
      dataIndex: "product_name",
      key: "product_name",
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },

    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      render: (text, record) => {
        return (
          <Space>
            <Typography.Text type="secondary">{text ? `₹ ${text}` : "N/A"}</Typography.Text>
          </Space>
        );
      }
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "P.V.",
      dataIndex: "item_pv",
      sorter: (a, b) => parseFloat(a.item_pv) - parseFloat(b.item_pv),
      render: (text) => <Typography.Text type="secondary">{text || "N/A"}</Typography.Text>
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      render: (text, record) => {
        // Fallback to 0 if values are missing or invalid
        const rate = Number(record?.rate) || 0;
        const quantity = Number(record?.quantity) || 0;
        const discount = Number(record?.discount) || 0;

        const totalPrice = rate * quantity;

        // Check if the total price is less than or equal to the discount
        const isFree = totalPrice <= discount;

        return (
          <Space>
            <Typography.Text
              style={isFree ? { textDecoration: "line-through" } : {}}
              type="secondary">
              {`₹ ${Number(record?.rate) * Number(record?.quantity)}`}
            </Typography.Text>

            <Tag color="success">{isFree ? "FREE" : `Saved ₹ ${discount}`}</Tag>
          </Space>
        );
      }
    },
    {
      title: "SAP Code",
      dataIndex: "sap_code",
      key: "sap_code",
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    }
  ];
  return (
    <Modal
      title={
        <Typography.Text strong>
          Offer Applied <CheckCircleOutlined style={{ color: "green" }} />
        </Typography.Text>
      }
      className="remove-footer_border"
      open={props?.show}
      onCancel={() => {
        props?.hide(false);
      }}
      footer={false}
      maskClosable={false}
      width="60%">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={24}>
          <Flex gap={"middle"} wrap="wrap">
            <Space>
              <Typography.Text strong>{"	Offer Type :"}</Typography.Text>
              <Tag color="success">{props?.data[0]?.offer_details?.offer_type}</Tag>
            </Space>
            <Space>
              <Typography.Text strong>{"	Offer Name :"}</Typography.Text>
              <Tag color="success">{props?.data[0]?.offer_details?.offer_title}</Tag>
            </Space>
          </Flex>
        </Col>
        <Col xs={24} sm={24} md={24} lg={24}>
          <Table dataSource={props?.data || []} columns={columns} pagination={false} />
        </Col>
      </Row>
    </Modal>
  );
});

// Shipping modal
const ShippingModal = memo(
  ({
    open,
    shippingForm,
    handleCancel,
    handleForm,
    handleFormChange,
    handleShipAddress,
    shippingLoading,
    isFormTouched,
    orderDetails
  }) => {
    return (
      <Modal
        size="small"
        title="Update Shipping Details"
        footer={
          <>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button
              type="primary"
              loading={shippingLoading}
              disabled={isFormTouched}
              onClick={handleShipAddress}>
              Save Changes
            </Button>
          </>
        }
        open={open}
        onCancel={handleCancel}>
        <Form
          form={shippingForm}
          initialValues={{
            shipping_address: orderDetails?.shipping_address,
            shipping_mobile: orderDetails?.shipping_mobile
          }}
          layout="vertical"
          onFinish={handleForm}
          onValuesChange={handleFormChange}>
          <Form.Item
            label="Address"
            rules={[
              { required: true, message: "Enter Address" },
              { validator: validateAddress(10, 255, "Invalid Address") }
            ]}
            name="shipping_address">
            <TextArea minLength={10} maxLength={255} placeholder="Enter Address" rows={4} />
          </Form.Item>
          <Form.Item
            label="Shipping Contact Number"
            rules={[
              { required: true, message: "Enter Phone Number" },
              { validator: validateMobileNumber("Phone number must be of 10 digits.") }
            ]}
            name="shipping_mobile">
            <Input
              type="number"
              onInput={validateLength} // Prevent user input of non-numeric characters
              inputMode="numeric"
              maxLength={10}
              minLength={10}
              placeholder="Enter Number"
            />
          </Form.Item>
        </Form>
      </Modal>
    );
  }
);

// Return Tracking Modal

const TrackingModal = memo((props) => {
  // Local state for collapse
  const [activeKeys, setActiveKeys] = useState([]);

  const { apiService } = useServices();

  const handleModalClose = () => {
    setActiveKeys([]); // Reset collapse active keys when modal is closed
    props.setTracking(false); // Close the modal
  };

  // Api order confirm items
  const { mutate: cancelItemApi, isLoading: loadingCancel } = useMutation(
    (data) => apiService.cancelReturnItem(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          enqueueSnackbar(data.message, snackBarSuccessConf);
          props.setTracking(false);
          props.handlereset();
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  const handleSubmit = (item) => {
    let data = {
      order_no: props?.orderDetails?.order_no,
      return_order_id: item.return_id,
      items_to_cancel: [item.return_order_item_id]
    };

    cancelItemApi(data);
  };

  // Steps data for each tracking stage

  const itemsData = props?.trackingData?.return_order_item?.map((item) => {
    const reason = item?.return_reason;

    const timelineItems = item.return_order.return_tracking.map((item, index) => ({
      children: (
        <div>
          <Typography.Text className="textCapitalize">
            {getReturnTrackingStatus(item.confirm_status.status_value)}
          </Typography.Text>
          <br />

          {item?.confirm_status?.status_value == CARD_STATUS.PENDING && reason ? (
            <>
              <Typography.Text>Remark : </Typography.Text>

              <Typography.Text type="secondary">{reason}</Typography.Text>
              <br />
            </>
          ) : (
            ""
          )}

          <Typography.Text type="secondary">{getDateTimeFormat(item.date)}</Typography.Text>
        </div>
      ),
      dot: (
        <>
          {item.confirm_status.status_value === ORDER_STATUS_ENUM.CANCELLED ? (
            <CloseCircleOutlined
              style={{ color: getTrackingIconColor(item.confirm_status.status_value) }}
            />
          ) : (
            <CheckCircleOutlined
              style={{ color: getTrackingIconColor(item.confirm_status.status_value) }}
            />
          )}
        </>
      )
    }));

    return {
      key: item.key,
      label: (
        <Flex justify="space-between">
          {/* <Typography.Text>{getDateTimeFormat(item.return_initiated_at)}</Typography.Text> */}
          <Typography.Text strong>
            {`${item?.main_order?.return_order_no} `}
            <Typography.Text type="secondary">
              ({getDateTimeFormat(item.return_initiated_at)})
            </Typography.Text>
            {""}
          </Typography.Text>
          {item.return_status !== CARD_STATUS.RETURNED &&
            item.return_status !== CARD_STATUS.CANCELLED &&
            props?.orderDetails?.show_return_button && (
              <Popconfirm
                title="Are you sure you want to cancel?"
                okText="Yes"
                cancelText="No"
                onConfirm={() => handleSubmit(item)}>
                <Button type="primary" key={item.key} danger>
                  Cancel
                </Button>
              </Popconfirm>
            )}
          {item.return_status === CARD_STATUS.CANCELLED && (
            <Tag color="error" bordered={true}>
              Cancelled
            </Tag>
          )}
        </Flex>
      ),
      children: (
        <Row gutter={[10, 15]}>
          {/* Product Name */}
          <Col xs={24} sm={12} md={12} lg={12}>
            <Space direction="vertical">
              <Typography.Text className="font_size12" type="secondary">
                Product Name
              </Typography.Text>
              <Typography.Text className="font_size12" strong>
                {item.product_name}
              </Typography.Text>
            </Space>
          </Col>

          {/* SAP Code */}
          <Col xs={24} sm={12} md={12} lg={4}>
            <Space direction="vertical">
              <Typography.Text className="font_size12" type="secondary">
                SAP Code
              </Typography.Text>
              <Typography.Text className="font_size12" strong>
                {props?.trackingData.sap_code}
              </Typography.Text>
            </Space>
          </Col>

          {/* Qty Ordered */}
          <Col xs={24} sm={12} md={12} lg={4}>
            <Space direction="vertical">
              <Typography.Text className="font_size12" type="secondary">
                Ordered Qty
              </Typography.Text>
              <Typography.Text className="font_size12" strong>
                {props?.trackingData?.quantity}
              </Typography.Text>
            </Space>
          </Col>

          {/* Qty Returned */}
          <Col xs={24} sm={12} md={12} lg={4}>
            <Space direction="vertical">
              <Typography.Text className="font_size12" type="secondary">
                Qty Returned
              </Typography.Text>
              <Typography.Text className="font_size12" strong>
                {item.quantity}
              </Typography.Text>
            </Space>
          </Col>
          <Col span={24}>
            <Typography.Text strong>{` Order Tracking`}</Typography.Text>
          </Col>
          {/* Tracking Steps */}
          <Col
            // className="steps_div paddingTop viewTracking_scroll"
            xs={24}
            sm={24}
            md={24}
            lg={24}>
            {/* <Steps current={trackingSteps.length} labelPlacement="vertical" items={trackingSteps} /> */}
            <Timeline items={timelineItems} />
          </Col>
        </Row>
      )
    };
  });

  return (
    <Modal
      className="sequencebody"
      title={<Typography.Text strong>Return Order Tracking</Typography.Text>}
      open={props?.show}
      width="60%"
      onCancel={handleModalClose}
      footer={false}>
      <Spin spinning={loadingCancel}>
        <Collapse
          collapsible="icon"
          defaultActiveKey={[]}
          activeKey={activeKeys} // Control collapse active keys
          onChange={setActiveKeys}
          items={itemsData}
        />
      </Spin>

      <br />
      <br />
    </Modal>
  );
});

// OTP Verfication Modal
const OtpVerficationModal = memo(
  ({ otpModal, setOtpModal, apiData, otpform, returnOrderItem, returnRefundLoader }) => {
    const handleVerifyCancel = (values) => {
      if (otpform.getFieldValue("user_otp").length === 6) {
        // setShowSuccessModal(true);
        // Api call
        const res = values?.user_otp?.join("");
        const newApiData = structuredClone(apiData); // deep copy

        newApiData.user_otp = res;
        // delete newApiData.remark

        returnOrderItem(newApiData);
      }
    };

    // Reset Otp form
    const handleResetOtpForm = () => {
      otpform.resetFields();
      setOtpModal(false);
    };

    return (
      <Modal
        title={"Verification"}
        open={otpModal}
        className="otp_verify"
        onCancel={() => handleResetOtpForm()}
        footer={
          <>
            <Button
              loading={returnRefundLoader}
              type="primary"
              key={"submit"}
              onClick={() => {
                otpform.submit();
              }}>
              Submit
            </Button>

            <Button type="default" onClick={() => handleResetOtpForm()}>
              Cancel
            </Button>
          </>
        }>
        <Form form={otpform} layout="vertical" onFinish={handleVerifyCancel}>
          <Row gutter={[0, 4]}>
            <Col span={24}>
              <Flex justify="center">
                <Typography.Title level={5}>Verify OTP</Typography.Title>
              </Flex>
            </Col>

            <Col span={24}>
              <Flex justify="center">
                <Typography.Text type="secondary">
                  Please enter OTP for verification
                </Typography.Text>
              </Flex>
            </Col>

            <Col span={24}>
              <Form.Item
                name="user_otp"
                rules={[
                  {
                    validator: validateOTP
                  }
                ]}
                className="formStyle">
                <InputOTP
                  inputType="numeric"
                  length={6}
                  inputMode="numeric"
                  size="small"
                  autoSubmit={false}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    );
  }
);

// Success Model
const SuccessModal = memo(
  ({ showSuccessModel, setShowSuccessModal, message, setReturnMessage }) => {
    return (
      <Modal
        title={message ? "" : "Return Order Confirmed"}
        className="successContainer"
        closable={true}
        onCancel={() => {
          setShowSuccessModal(false);
          if (setReturnMessage) {
            setReturnMessage("");
          }
        }}
        open={showSuccessModel}
        footer={false}>
        <Result
          className="successModal removePadding"
          status="success"
          title={
            <Typography.Text strong size="large">
              {message || "Order Return Initiated"}
            </Typography.Text>
          }
        />
      </Modal>
    );
  }
);

//  Shipping Dimension Modal
const DimensionModal = memo((props) => {
  const [form] = Form.useForm();

  const [volWeight, setVolWeight] = useState(0);
  const [appWeight, setAppWeight] = useState(0);

  const addOrderShipRocket = () => {
    try {
      let orderItems = props?.recordData?.order_items?.map((item) => {
        return {
          id: item.order_item_id,
          name: item.product_name,
          sku: item.sap_code,
          units: item.quantity,
          selling_price: item.rate,
          discount: 0,
          hsn: item.hsn_no
        };
      });

      let data = {
        order_id: props.recordData.depot_order_id,
        order_date: new Date().toISOString(),
        pickup_location: "Rcm Consumer",
        billing_customer_name: props.orderDetails?.shipping_name,
        billing_last_name: "DIST02",
        billing_address: props.orderDetails?.shipping_address,
        billing_city: props.orderDetails.initial_address?.city,
        billing_pincode: props.orderDetails?.initial_address?.pincode,
        billing_state: props.orderDetails?.initial_address?.state,
        billing_email: props.orderDetails?.initial_address?.recipient_email,
        billing_phone: props.orderDetails?.shipping_mobile,
        billing_country: "INDIA",
        shipping_is_billing: true,
        length: form.getFieldValue("length"),
        breadth: form.getFieldValue("breadth"),
        height: form.getFieldValue("height"),
        weight: form.getFieldValue("weight"),
        order_items: orderItems,
        payment_method: props.orderDetails?.payment_method,
        total_discount: "0.00",
        sub_total: props.orderDetails.price_after_shipping_and_discount,
        shipping_charges: props.orderDetails.shipping_amount
      };

      // ship rocket api call for create order
      props?.apiMethod(data);
      form.resetFields();
    } catch (error) {}
  };

  const handleSubmitOrderDetails = () => {
    try {
      form
        .validateFields()
        .then((values) => {
          // Form is valid, proceed to call API
          addOrderShipRocket();
        })
        .catch((validationError) => {
          // Form validation failed
        });
    } catch (unexpectedError) {
      // Catch any unexpected synchronous errors (rare in this case)
      console.log("Unexpected error:", unexpectedError);
    }
  };

  const getVolWeight = (length, breadth, height) => {
    length = length || form.getFieldValue("length") || 0;
    breadth = breadth || form.getFieldValue("breadth") || 0;
    height = height || form.getFieldValue("height") || 0;

    let volWeight = (length * breadth * height) / 5000;
    setVolWeight(volWeight.toFixed(2));
    return parseFloat(volWeight);
  };
  const getAppWeight = (val) => {
    let weight = val || form.getFieldValue("weight") || 0;
    let volWeight = getVolWeight() || 0;

    let appWeight = Math.max(parseFloat(weight), volWeight);
    setAppWeight(appWeight.toFixed(2));
  };

  return (
    <Modal
      title='Add Dimension of order No. "1033076"'
      // className="successContainer"
      closable={true}
      onCancel={() => props?.setDimensionModal(false)}
      open={props.isDimensionalModal}
      width="60%"
      footer={
        <>
          <Button
            loading={props.loading}
            type="primary"
            key={"submit"}
            onClick={() => {
              handleSubmitOrderDetails();
            }}>
            Submit
          </Button>

          <Button type="default" onClick={() => props?.setDimensionModal(false)}>
            Cancel
          </Button>
        </>
      }>
      <Form form={form} layout="vertical" onFinish={handleSubmitOrderDetails}>
        <Row gutter={[20, 20]}>
          {/* Package Weight Section */}
          <Col span={24}>
            <Typography.Title level={5} style={{ color: "#1755A6" }}>
              Package Weight
            </Typography.Title>
          </Col>
          <Col xs={24} xl={8}>
            <Form.Item
              className="removeMargin"
              label={
                <>
                  Dead Weight&nbsp;
                  <Tooltip title="Enter the weight in kilograms">
                    <QuestionCircleOutlined />
                  </Tooltip>
                </>
              }
              name="weight"
              rules={[
                { required: true, message: "Please input the package weight!" },
                {
                  pattern: /^\d*\.?\d+$/,
                  message: "Please enter a valid number "
                },
                {
                  validator: (_, value) =>
                    value && parseFloat(value) >= 0.5
                      ? Promise.resolve()
                      : Promise.reject(new Error("Weight must be greater than 0.5"))
                }
              ]}>
              <Space direction="vertical" className="fullWidth">
                <Input.Search
                  placeholder="Enter weight"
                  className="fullWidth"
                  onInput={(e) => {
                    e.target.value = e.target.value.replace(/[^0-9.]/g, "");
                  }}
                  onChange={(e) => {
                    getAppWeight(e.target.value);
                  }}
                  size="large"
                  enterButton={
                    <Button type="primary" disabled htmlType="submit">
                      KG
                    </Button>
                  }
                />
                <Typography.Text type="secondary">
                  The minimum changeable weight is 0.50 Kg
                </Typography.Text>
              </Space>
            </Form.Item>
          </Col>

          {/* Package Dimensions Section */}
          <Col span={24}>
            <Typography.Title level={5} style={{ color: "#1755A6" }}>
              Package & Dimensions
            </Typography.Title>
          </Col>

          <Col xs={24} xl={8}>
            <Form.Item
              label=""
              className="removeMargin"
              name="length"
              rules={[
                { required: true, message: "Please input the package length!" },
                {
                  pattern: /^\d*\.?\d+$/,
                  message: "Please enter a valid number "
                },
                {
                  validator: (_, value) =>
                    value && parseFloat(value) >= 0.5
                      ? Promise.resolve()
                      : Promise.reject(new Error("length must be greater than 0.5"))
                }
              ]}>
              <Input.Search
                placeholder="Enter length"
                className="fullWidth"
                size="large"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, "");
                }}
                onChange={(e) => {
                  getVolWeight(e.target.value, null, null);
                  getAppWeight(e.target.value);
                }}
                enterButton={
                  <Button type="primary" disabled htmlType="submit">
                    CM
                  </Button>
                }
              />
            </Form.Item>
          </Col>

          <Col xs={24} xl={8}>
            <Form.Item
              label=""
              className="removeMargin"
              name="breadth"
              rules={[
                { required: true, message: "Please input the package breadth!" },
                {
                  pattern: /^\d*\.?\d+$/,
                  message: "Please enter a valid number "
                },
                {
                  validator: (_, value) =>
                    value && parseFloat(value) >= 0.5
                      ? Promise.resolve()
                      : Promise.reject(new Error("Breadth must be greater than 0.5"))
                }
              ]}>
              <Input.Search
                placeholder="Enter width"
                className="fullWidth"
                size="large"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, "");
                }}
                onChange={(e) => {
                  getVolWeight(null, e.target.value, null);
                  getAppWeight(e.target.value);
                }}
                enterButton={
                  <Button type="primary" disabled htmlType="submit">
                    CM
                  </Button>
                }
              />
            </Form.Item>
          </Col>

          <Col xs={24} xl={8}>
            <Form.Item
              label=""
              className="removeMargin"
              name="height"
              rules={[
                { required: true, message: "Please input the package height!" },
                {
                  pattern: /^\d*\.?\d+$/,
                  message: "Please enter a valid number "
                },
                {
                  validator: (_, value) =>
                    value && parseFloat(value) >= 0.5
                      ? Promise.resolve()
                      : Promise.reject(new Error("Height must be greater than 0.5"))
                }
              ]}>
              <Input.Search
                placeholder="Enter height"
                className="fullWidth"
                onInput={(e) => {
                  e.target.value = e.target.value.replace(/[^0-9.]/g, "");
                }}
                onChange={(e) => {
                  getVolWeight(null, null, e.target.value);
                  getAppWeight(e.target.value);
                }}
                size="large"
                enterButton={
                  <Button type="primary" disabled htmlType="submit">
                    CM
                  </Button>
                }
              />
            </Form.Item>
          </Col>

          {/* Info Section */}
          <Col span={24} style={{ margin: 0 }}>
            <Typography.Text type="secondary" style={{ margin: 0 }}>
              Note: Dimensions should be in centimeters only and values should be greater than 0.50
              cm.
            </Typography.Text>
          </Col>

          <Col span={24}>
            <Alert message={`Volumetric Weight : ${volWeight}`} type="warning" showIcon />
          </Col>

          <Col span={24}>
            <Alert message={`Applicable Weight : ${appWeight}`} type="info" showIcon />
          </Col>
        </Row>
      </Form>
    </Modal>
  );
});

// ShipRocket pickup modal
const PickupModalShipRocket = memo((props) => {
  const handleButtonClick = (value) => {
    props.setSelectedValue(value);
  };

  const OnSubmitApi = () => {
    try {
      let data = {
        shipment_id: [
          props.isReturn
            ? props.recordId.ship_rocket_return_shipment_id
            : props.recordId.ship_rocket_shipment_id
        ],
        pickup_date: [props.selectedValue],
        depot_order_id: props.recordId.depot_order_id,
        status: "retry",
        is_return: props.isReturn ? true : false
      };
      props.getPickUpDateApi(data);
    } catch (error) {}
  };

  useEffect(() => {
    props.setSelectedValue(props.recordId?.pick_up_date); // Reset selected value when modal opens
  }, [props.recordId]);

  return (
    <Modal
      title="Schedule Your Pick Up"
      closable={true}
      onCancel={() => props?.setClose(false)}
      open={props.open}
      width="60%"
      footer={
        <>
          <Button
            loading={props.loading}
            type="primary"
            key={"submit"}
            onClick={() => OnSubmitApi()}
            disabled={props.selectedValue == null}>
            Submit
          </Button>

          <Button type="default" onClick={() => props?.setClose(false)}>
            Cancel
          </Button>
        </>
      }>
      <Row gutter={[20, 16]}>
        {/* Info Section */}
        <Col span={24}>
          <Alert
            message={`Your package has been assigned to Delhivery Surface 20Kg successfully. The AWB number of the same is ${props.recordId?.awb}`}
            type="success"
            showIcon
          />
        </Col>
        <Col span={24}>
          <div className="shipping-modal">
            <Image
              src={PICKUP_ICON_ADDRESS}
              preview={false}
              style={{ width: "35px", height: "37px" }}
            />
            <Flex justify="space-between" align="center" wrap="wrap" style={{ flex: 1 }}>
              <Flex vertical gap={6}>
                <Typography.Text strong>Pickup Address</Typography.Text>
                <Typography.Text>{props?.singleOrderDetails?.pickup_location}</Typography.Text>
              </Flex>
            </Flex>
          </div>
        </Col>

        <Col span={24}>
          <Alert
            icon={
              <Image
                src={PICKUP_ICON_ADDRESS}
                preview={false}
                style={{ width: "35px", height: "37px" }}
              />
            }
            message={
              <Flex justify="space-between" align="center" wrap="wrap" style={{ flex: 1 }}>
                <Flex vertical gap={6}>
                  <Typography.Text strong>
                    {" "}
                    Please select suitable date for your order to be picked up
                  </Typography.Text>

                  <Flex vertical={false} gap={10}>
                    {getNextFivePickupDates().map((item, index) => (
                      <Button
                        key={index}
                        shape="round"
                        type={
                          dayjs(props.selectedValue).format("YYYY-MM-DD") === item.value
                            ? "primary"
                            : "default"
                        } // Highlight if selected
                        onClick={() => handleButtonClick(item.value)}>
                        {item.label}
                      </Button>
                    ))}
                  </Flex>
                </Flex>
              </Flex>
            }
            type="info"
            showIcon
          />
        </Col>
        {/* 
          <Col span={24}>
            <div className="shipping-modal-date-pickup">
              <Image
                src={PICKUP_ICON_ADDRESS}
                preview={false}
                style={{ width: "35px", height: "37px" }}
              />
              <Flex justify="space-between" align="center" wrap="wrap" style={{ flex: 1 }}>
                <Flex vertical gap={6}>
                  <Typography.Text strong>
                    {" "}
                    Please select suitable date for your order to be picked up
                  </Typography.Text>

                  <Flex vertical={false} gap={10}>
                    {getNextFivePickupDates().map((item, index) => (
                      <Button key={index} shape="round">
                        {item.label}
                      </Button>
                    ))}
                  </Flex>
                </Flex>
              </Flex>
            </div>
          </Col> */}
        <Col span={24}>
          <Typography.Text>
            Note :
            <Typography.Text type="secondary">
              {" "}
              Please ensure that your invoice in the package, and your label is visible on the
              package to be delivered.
            </Typography.Text>
          </Typography.Text>
        </Col>
      </Row>
    </Modal>
  );
});

export {
  CancelRequestModel,
  OfferModal,
  ShippingModal,
  TrackingModal,
  OtpVerficationModal,
  SuccessModal,
  DimensionModal,
  PickupModalShipRocket
};
