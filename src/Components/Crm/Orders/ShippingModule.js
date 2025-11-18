import { Button, Col, Flex, Row, Space, Spin, Table, Tag, Typography } from "antd";
import { getExpectedPickupTime } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useEffect, useState } from "react";
import { useMutation, useQuery } from "react-query";
// import ShippingSvg from "Static/CRM_STATIC/img/Shipping.svg";
import { PickupModalShipRocket } from "./Model";
import { enqueueSnackbar } from "notistack";
import { snackBarSuccessConf } from "Helpers/ats.constants";

const ShippingModule = ({
  orderDetails,
  recordId,
  getSingleOrder,
  setRecordData,
  setShowShippingScreen
}) => {
  const [shippingTableData, setShippingTableData] = useState([]);
  const [isPickupAddress, setIsPickupAddress] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [singleOrderDetails, setSingleOrderDetails] = useState(null);
  const [lastPartner, setLastPartner] = useState("");
  const { apiService } = useServices();

  // Api method ship rocket courier list
  const { mutate: apiCourierList, isLoading: loadingCourierList } = useMutation(
    "getCourierDetails",
    () => apiService.getCourierList(recordId.ship_rocket_order_id, orderDetails?.customer_id),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data?.success) {
            setShippingTableData(data?.data);
            data?.data.map((e) => {
              if (e.isRecomended) {
                setLastPartner(e.courier_name);
              }
            });
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  const { isLoading: loadingOrderDetails } = useQuery(
    "singleOrderDetails",
    () => apiService.getShipRocketSingleOrder(recordId.ship_rocket_order_id),
    {
      // Configuration options
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        if (data?.success) {
          setSingleOrderDetails(data?.data?.data);
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // Api method to assign awb
  const { mutate: assignAwbApi, isLoading: loadingAssignAwb } = useMutation(
    "assignAwbApiKey",
    (data) => apiService.AssignAwbShipRocketApi(data),
    {
      enabled: false, // Enable the query by default
      onSuccess: async (data) => {
        try {
          if (data?.success) {
            await getSingleOrder();
            apiCourierList();
            setShowShippingScreen(false);

            enqueueSnackbar(data.message, snackBarSuccessConf);
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // GET Available Pickup Dates
  const { mutate: getPickUpDateApi, isLoading: pickupLoading } = useMutation(
    "getCourierDetails",
    (data) => apiService.apiPickupScheduleDate(data),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data?.success) {
            enqueueSnackbar(data.message, snackBarSuccessConf);
            setSelectedValue(null);
            setIsPickupAddress(false);
          }
        } catch (error) {}
      },
      onError: (error) => {
        setSelectedValue(null);
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // component for rating
  const RatingCircle = ({ rating }) => {
    const radius = 20;
    const strokeWidth = 9;
    const normalizedRadius = radius;
    const circumference = 2 * Math.PI * normalizedRadius;

    const percentage = Math.min(Math.max(rating / 5, 0), 1); // clamp between 0 and 1
    const strokeDashoffset = circumference * (1 - percentage);

    return (
      <svg width="80" height="80" style={{ display: "block", margin: "20px" }}>
        {/* Background circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="#e0e0e0"
          strokeWidth={strokeWidth}
          fill="white"
        />

        {/* Foreground (progress) circle */}
        <circle
          cx="40"
          cy="40"
          r={radius}
          stroke="rgb(0, 165, 87)" // <-- Custom color
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 40 40)"
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />

        <text x="50%" y="55%" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#4caf50">
          {rating.toFixed(1)}
        </text>
      </svg>
    );
  };

  useEffect(() => {
    // api call
    apiCourierList();
  }, []);

  // Handle Assign AWB
  const handleAssignAwb = (record) => {
    try {
      let data = {
        shipment_id: recordId.ship_rocket_shipment_id,
        courier_id: record.courier_company_id,
        depot_order_id: recordId.depot_order_id
      };
      if (recordId.courier_id && record.courier_company_id != recordId.courier_id) {
        data.status = "reassign";
      }
      // Api call to Assign AWB
      assignAwbApi(data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const find = orderDetails.order_items.find((e) => e.depot_order_id === recordId.depot_order_id);
    if (find) {
      setRecordData(find);
    }
  }, [orderDetails]);

  return (
    <Spin spinning={loadingCourierList || loadingAssignAwb || pickupLoading || loadingOrderDetails}>
      <Col span={24}>
        <Row className="full-width-border">
          <Col xs={18} lg={18}>
            <Flex vertical gap={8}>
              <Typography.Text strong style={{ color: "#1755A6" }}>
                Shipping Details
              </Typography.Text>
              <Row gutter={[24, 16]}>
                <Col xs={12} lg={8}>
                  <Space direction="vertical" size={10}>
                    <Typography.Text type="secondary">Pickup From</Typography.Text>
                    <Typography.Text>
                      {`${singleOrderDetails?.pickup_location},
                        `}
                    </Typography.Text>
                    <Typography.Text>
                      {`${singleOrderDetails?.pickup_address.pin_code},
                        ${singleOrderDetails?.pickup_address.state}`}
                    </Typography.Text>
                  </Space>
                </Col>
                <Col xs={12} lg={8}>
                  <Space direction="vertical" size={10}>
                    <Typography.Text type="secondary">Deliver To</Typography.Text>
                    <Typography.Text>{`${singleOrderDetails?.customer_address},`}</Typography.Text>
                    <Typography.Text>
                      {`${singleOrderDetails?.customer_pincode}, ${singleOrderDetails?.customer_state}`}
                    </Typography.Text>
                  </Space>
                </Col>
                <Col xs={12} lg={8}>
                  <Space direction="vertical" size={10}>
                    <Typography.Text type="secondary">Order Value</Typography.Text>
                    <Typography.Text>{singleOrderDetails?.total || "N/A"}</Typography.Text>
                  </Space>
                </Col>
                <Col xs={12} lg={8}>
                  <Space direction="vertical" size={10}>
                    <Typography.Text type="secondary">Payment Mode</Typography.Text>
                    <Tag className="textCapitalize">
                      {singleOrderDetails?.payment_method?.toUpperCase() || "N/A"}
                    </Tag>
                  </Space>
                </Col>
                <Col xs={12} lg={8}>
                  <Space direction="vertical" size={10}>
                    <Typography.Text type="secondary">Applicable Weight (in Kg)</Typography.Text>
                    <Typography.Text>
                      {Math.max(
                        singleOrderDetails?.shipments?.weight,
                        singleOrderDetails?.shipments?.volumetric_weight
                      ) || "N/A"}
                    </Typography.Text>
                  </Space>
                </Col>
              </Row>
            </Flex>
          </Col>

          <Col xs={0} lg={1}>
            <div className="vertical-line" />
          </Col>

          <Col xs={24} lg={5}>
            <Col span={24}>
              <Typography.Title level={5} style={{ color: "#1755A6" }}>
                Buyer Insights
              </Typography.Title>
            </Col>
            <Col span={24}>
              <Typography.Text type="secondary">Last Successful Delivery To Buyer</Typography.Text>
            </Col>

            <Col span={24} style={{ marginTop: 8 }}>
              {lastPartner && (
                <div className="info-box">
                  <Typography.Text strong>On Your Store</Typography.Text>
                  <div style={{ marginTop: 8 }}>
                    <Typography.Text type="secondary">{lastPartner}</Typography.Text>
                  </div>
                </div>
              )}
            </Col>
          </Col>
        </Row>
      </Col>

      {/* <Col span={24} style={{ marginTop: "16px" }}>
        <Alert
          icon={
            <Image src={ShippingSvg} preview={false} style={{ width: "50px", height: "48px" }} />
          }
          showIcon={true}
          description={
            <Flex justify="space-between" align="center" wrap="wrap">
              <Flex vertical={true} gap={6}>
                <Typography.Text strong>Your shipment is secured</Typography.Text>
                <Typography.Text>
                  You can eligible for full refund on your shipment upto ₹475000{" "}
                </Typography.Text>
              </Flex>

              <Button danger>Unsecure My Shipment</Button>
            </Flex>
          }
          type="success"
        />
      </Col> */}

      <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
        <Table
          columns={[
            {
              title: "Shipping Name",
              dataIndex: "courier_name",
              width: 200,
              render: (text, record) => (
                <Flex justify="space-between" align="center" wrap="wrap">
                  {/* <Image
                    src={ShippingSvg}
                    preview={false}
                    style={{ width: "45px", height: "45px", borderRadius: "8px" }}
                  /> */}
                  <Flex vertical={true}>
                    <Typography.Text>{text}</Typography.Text>
                    <Typography.Text type="secondary">
                      RTO Charges : <Typography.Text strong>{record.rto_charges}</Typography.Text>
                    </Typography.Text>
                  </Flex>
                </Flex>
              )
            },
            {
              title: "Rating",
              dataIndex: "rating",
              width: 80,
              render: (text) => (
                <Typography.Text>
                  {text ? <RatingCircle rating={text} /> : "No Rating"}
                </Typography.Text>
              )
            },
            {
              title: "Expected Pickup",
              dataIndex: "seconds_left_for_pickup",
              width: 120,
              render: (text) => (
                <Typography.Text type="secondary">
                  {getExpectedPickupTime(text) || "Not Scheduled"}
                </Typography.Text>
              )
            },
            {
              title: "Chargeable Weight (kg)",
              dataIndex: "charge_weight",
              width: 120,
              render: (text) => <Typography.Text type="secondary">{text ?? "0"}</Typography.Text>
            },
            {
              title: "Estimated Delivery",
              dataIndex: "etd",
              width: 120,
              render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
            },
            {
              title: "Charges",
              dataIndex: "rate",
              width: 120,
              render: (text) => (
                <Typography.Text type="secondary">{`₹ ${text}` ?? "0"}</Typography.Text>
              )
            },
            {
              title: "Action",
              dataIndex: "action",
              width: 100,
              render: (_, record) => (
                <Flex gap={5}>
                  {recordId.courier_id != record.courier_company_id && (
                    <Button type="primary" onClick={() => handleAssignAwb(record)}>
                      Ship Now
                    </Button>
                  )}

                  {recordId.courier_id == record.courier_company_id && (
                    <Button
                      type="primary"
                      onClick={() => {
                        // Api call get Pickup date
                        setIsPickupAddress(true);
                      }}>
                      Schedule Pick Up
                    </Button>
                  )}
                </Flex>
              )
            }
          ]}
          dataSource={shippingTableData}
          rowClassName={() => "custom-row-shipping"}
          className="shipping-custom-table"
        />
      </Col>
      <Col span={24}>
        <PickupModalShipRocket
          open={isPickupAddress}
          setClose={setIsPickupAddress}
          selectedValue={selectedValue}
          setSelectedValue={setSelectedValue}
          getPickUpDateApi={getPickUpDateApi}
          recordId={recordId}
          singleOrderDetails={singleOrderDetails}
        />
      </Col>
    </Spin>
  );
};

export default ShippingModule;
