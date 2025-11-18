import React, { useContext } from "react";
import { CRMOrderContext } from "Helpers/contexts";
import { Button, Card, Col, Flex, Row, Space, Tag, Timeline, Typography } from "antd";
import { getDateTimeFormat } from "Helpers/ats.helper";
import { EditOutlined } from "@ant-design/icons";
import { getStatusTag, getStatusTagCount } from "CrmHelper/crm.helper";
import { ACTION_TYPE } from "CrmHelper/crmConstant";
import { CART_TYPE } from "Helpers/ats.constants";

const OrderDetails = (props) => {
  const orderMethod = useContext(CRMOrderContext);

  // Function to return is address updated
  const IsAddressUpdated = () => {
    return orderMethod?.timeLineData?.some(
      (item) => item?.action_type === ACTION_TYPE.ADDRESS_UPDATED
    );
  };

  return (
    <>
      <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 18 }}>
        <Card>
          <Col span={24}>
            <Row gutter={[20, 10]}>
              <Col span={24} className="MarginCard">
                <Row gutter={[20, 20]}>
                  <Col span={24} ref={orderMethod?.scrollDetails}>
                    <Flex gap="middle" align="center" wrap="wrap">
                      <Typography.Text strong>Order Details</Typography.Text>
                      <Tag bordered={true} color="success">
                        {orderMethod?.orderDetails?.order_to?.toUpperCase()}
                      </Tag>
                    </Flex>
                  </Col>

                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Order Number</Typography.Text>
                      <Typography.Text>
                        {orderMethod?.orderDetails?.order_no || "N/A"}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Order Date & Time</Typography.Text>
                      <Typography.Text>
                        {getDateTimeFormat(orderMethod?.orderDetails?.order_date)}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Payment Mode</Typography.Text>
                      <Typography.Text>
                        <Tag className="textCapitalize">
                          {orderMethod?.orderDetails?.payment_method?.toUpperCase() || "N/A"}
                        </Tag>
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Order Status</Typography.Text>
                      <Typography.Text className="textCapitalize">
                        {getStatusTag(orderMethod?.orderDetails?.order_status)}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Order User ID</Typography.Text>
                      {/* <Typography.Text>
                        {orderMethod?.orderDetails?.customer_id || "N/A"}
                      </Typography.Text> */}
                      <Typography.Text strong>
                        {`${orderMethod?.orderDetails?.cust_type || "N/A"}-${
                          orderMethod?.orderDetails?.puc_store_code
                            ? orderMethod?.orderDetails?.puc_store_code
                            : orderMethod?.orderDetails?.customer_id || "N/A"
                        }`}
                      </Typography.Text>
                    </Space>
                  </Col>
                  {orderMethod?.orderDetails?.order_to != CART_TYPE.DEPOT && (
                    <>
                      <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                        <Space direction="vertical" size={10}>
                          <Flex gap={2} justify="space-between" wrap="wrap">
                            <Typography.Text type="secondary">{"Store Code"} </Typography.Text>
                            {orderMethod?.actionType == ACTION_TYPE.ORDER_TRANSFERRED && (
                              <>
                                <Tag bordered={true} color="processing">
                                  Updated Store Code
                                </Tag>
                              </>
                            )}
                          </Flex>

                          <Typography.Text strong>
                            {orderMethod?.orderDetails?.store_code || "N/A"}
                          </Typography.Text>
                        </Space>
                      </Col>
                      <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                        <Space direction="vertical" size={10}>
                          <Typography.Text type="secondary">Store Name</Typography.Text>
                          <Typography.Text strong>
                            {orderMethod?.orderDetails?.store_name || "N/A"}
                          </Typography.Text>
                        </Space>
                      </Col>
                      <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                        <Space direction="vertical" size={10}>
                          <Typography.Text type="secondary">Store Mobile Number</Typography.Text>
                          <Typography.Text strong>
                            {orderMethod?.orderDetails?.store_mobile_name || "N/A"}
                          </Typography.Text>
                        </Space>
                      </Col>
                    </>
                  )}
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="horizontal" size={10} className="mb-16">
                      <Typography.Text type="secondary">Current Order Status</Typography.Text>
                      {orderMethod?.orderDetails?.item_status?.length > 0 ? (
                        orderMethod?.orderDetails?.item_status?.map((item, index) =>
                          getStatusTagCount(item, index)
                        )
                      ) : (
                        <Typography.Text className="textCapitalize">
                          {getStatusTag(orderMethod?.orderDetails?.order_status)}
                        </Typography.Text>
                      )}
                    </Space>
                  </Col>

                  <Col span={24}>
                    <Flex gap="middle" align="center">
                      <Typography.Text strong>Item(s) Pricing & P.V. Details</Typography.Text>
                      <Tag bordered={true} color="processing">
                        Current
                      </Tag>
                    </Flex>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Flex gap={2} wrap="wrap">
                        <Typography.Text type="secondary">{"Item(s) Amount"} </Typography.Text>
                      </Flex>

                      <Typography.Text>
                        {(
                          Number(orderMethod?.orderDetails?.total_amount || 0) -
                            Number(orderMethod?.orderDetails?.total_shipping) || 0
                        )?.toFixed(2)}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Shipping Charge</Typography.Text>
                      <Typography.Text>
                        {orderMethod?.orderDetails?.total_shipping || "N/A"}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Discount</Typography.Text>
                      <Typography.Text>
                        {orderMethod?.orderDetails?.total_discount || "N/A"}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Total Amount</Typography.Text>
                      <Typography.Text>
                        {orderMethod?.orderDetails?.price_after_shipping_and_discount || "N/A"}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Refund Amount</Typography.Text>
                      <Typography.Text>
                        {orderMethod?.orderDetails?.refund_amount || "N/A"}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Flex gap={2} wrap="wrap">
                        <Typography.Text type="secondary">Item(s) P.V.</Typography.Text>
                      </Flex>
                      <Typography.Text>{orderMethod?.orderDetails?.items_pv || ""}</Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Extra P.V.</Typography.Text>
                      <Typography.Text>
                        {parseInt(orderMethod?.orderDetails?.extra_pv, 10)}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Total P.V.</Typography.Text>
                      <Typography.Text>
                        {/* {parseInt(orderMethod?.orderDetails?.total_pv, 10) || "N/A"} */}
                        {orderMethod?.orderDetails?.total_pv || ""}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col span={24}>
                    <Flex gap="middle" align="center">
                      <Typography.Text strong>Shipping Details</Typography.Text>
                      {orderMethod?.orderDetails?.order_status == "pending" && !props?.isReturn && (
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={() => orderMethod?.handleModal()}>
                          {"Edit Details"}
                        </Button>
                      )}
                    </Flex>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Shipping Name </Typography.Text>
                      <Typography.Text>
                        {orderMethod?.orderDetails?.shipping_name || "N/A"}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Flex gap={2} wrap="wrap">
                        <Typography.Text type="secondary">{"Shipping Address"} </Typography.Text>
                        {(orderMethod?.orderDetails?.initial_address?.address !=
                          orderMethod?.orderDetails?.shipping_address ||
                          IsAddressUpdated()) && (
                          <>
                            <Tag bordered={true} color="processing">
                              Updated
                            </Tag>
                          </>
                        )}
                      </Flex>

                      <Typography.Text>
                        {orderMethod?.orderDetails?.shipping_address || "N/A"}
                      </Typography.Text>
                    </Space>
                  </Col>

                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Contact Number</Typography.Text>
                      <Typography.Text>
                        {orderMethod?.orderDetails?.initial_address?.recipient_mobile || "N/A"}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">City</Typography.Text>
                      <Typography.Text>
                        {orderMethod?.orderDetails?.initial_address?.city || "N/A"}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">District</Typography.Text>
                      <Typography.Text>
                        {orderMethod?.orderDetails?.initial_address?.district || "N/A"}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">State</Typography.Text>
                      <Typography.Text>
                        {orderMethod?.orderDetails?.initial_address?.state || "N/A"}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Pincode</Typography.Text>
                      <Typography.Text>
                        {orderMethod?.orderDetails?.initial_address?.pincode || "N/A"}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Flex gap={2} wrap="wrap">
                        <Typography.Text type="secondary">
                          {"Shipping Contact Number"}{" "}
                        </Typography.Text>
                        {orderMethod?.orderDetails?.shipping_mobile !=
                          orderMethod?.orderDetails?.initial_address?.recipient_mobile && (
                          <>
                            <Tag bordered={true} color="processing">
                              Updated
                            </Tag>
                          </>
                        )}
                      </Flex>
                      <Typography.Text>
                        {orderMethod?.orderDetails?.shipping_mobile || "N/A"}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">E-mail</Typography.Text>
                      <Typography.Text>
                        {orderMethod?.orderDetails?.initial_address?.recipient_email || "N/A"}
                      </Typography.Text>
                    </Space>
                  </Col>

                  <Col span={24}>
                    <Typography.Text strong>Initial Order Amount</Typography.Text>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Total Amount</Typography.Text>
                      <Typography.Text>{orderMethod?.orderDetails?.tia || "N/A"}</Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Total PV</Typography.Text>
                      <Typography.Text>
                        {Number(orderMethod?.orderDetails?.tipv)?.toFixed(2) || ""}
                      </Typography.Text>
                    </Space>
                  </Col>
                  <Col xs={{ span: 12 }} sm={{ span: 12 }} md={{ span: 12 }} lg={{ span: 6 }}>
                    <Space direction="vertical" size={10}>
                      <Typography.Text type="secondary">Shipping Amount</Typography.Text>
                      <Typography.Text>
                        {orderMethod?.orderDetails?.shipping_amount || "N/A"}
                      </Typography.Text>
                    </Space>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Col>
        </Card>
      </Col>
      <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 6 }}>
        <Card
          title="Order Tracking"
          headStyle={{ backgroundColor: "#1755A6", color: "white" }}
          className="scrollableTimeline">
          <Timeline items={orderMethod?.timelineItems} />
        </Card>
      </Col>
    </>
  );
};

export default OrderDetails;
