import React, { useEffect, useState } from "react";
import { Paths } from "Router/Paths";
import { Button, Card, Col, Flex, Row, Space, Tag, Typography } from "antd";
import BarChart from "./chart/barChart";
import AreaChart from "./chart/areaChart";
import Table from "./NestedTableComponent";
import Images from "Static/CRM_STATIC/img/index";
import CardComponent from "./CardComponent";
import { useMutation, useQuery } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { actionsPermissionValidator, getDateTimeFormat } from "Helpers/ats.helper";
import { useNavigate } from "react-router-dom";
// import { CARD_OPTIONS } from "CrmHelper/crmConstant";
import { PermissionAction } from "Helpers/ats.constants";
import { getDateRange, getStatusTag } from "CrmHelper/crm.helper";
import { CUST_TYPE } from "CrmHelper/crmConstant";
// import { CUST_TYPE } from "CrmHelper/crmConstant";

/**
 *
 * @returns Dashboard component
 */
const Home = () => {
  const { apiService } = useServices();

  const navigate = useNavigate();
  const [orderCount, setOrderCount] = useState();
  const [recentOrdersData, setRecentOrderData] = useState();
  const [segmentKey, setSegmentKey] = useState("daily");
  const [barChatSegmentKey, setBarChartSegmentKey] = useState("daily");
  const [saleSummaryData, setSaleSummaryData] = useState();
  const [topSellingData, setTopSellingData] = useState();

  // Order Summary Card Data
  const cardData = [
    {
      sales: "Total Order",
      slug: "total_orders",
      value: orderCount?.total_orders || "0",
      icon: Images.TotalOrders,
      gradient: "TotalOrders",
      type: "#1755A6"
    },
    {
      sales: "Pending Confirmation",
      slug: "pending_orders",
      value: orderCount?.pending_orders || "0",
      icon: Images.PendingOrders,
      gradient: "PendingOrders ",
      type: "#873800"
    },
    {
      sales: "Confirmed Order",
      slug: "confirmed_order",
      value: orderCount?.confirmed_orders || "0",
      icon: Images.PartiallyCleared,
      gradient: "PartiallyCleared ",
      type: "#D48806"
    },

    {
      sales: "Cancelled Order",
      slug: "cancel_order",
      value: orderCount?.cancelled_orders || "0",
      icon: Images.ReadyToClose,
      gradient: "Close ",
      type: "#DC2626"
    },
    {
      sales: "Delivered Order",
      slug: "delivered_order",
      value: orderCount?.delivered_order || "0",
      icon: Images.ClearOrder,
      gradient: "Cleared ",
      type: "#085F37"
    }
  ];

  // Table Columns
  const columns = [
    {
      title: "Order No.",
      dataIndex: "order_no",
      key: "order_no",
      sorter: (a, b) => a.order_no - b.order_no,
      render: (text, record) =>
        text && (
          <Typography.Link underline onClick={() => navigateOrder(record)}>
            {text}
          </Typography.Link>
        )
    },
    {
      title: "Customer ID",
      dataIndex: "customer_id",
      key: "customer_id",
      sorter: (a, b) => a.customer_id.localeCompare(b.customer_id),
      render: (text) => text && <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Delivered From",
      dataIndex: "delivered_from",
      key: "delivered_from",
      sorter: (a, b) => a.delivered_from.localeCompare(b.delivered_from),
      render: (text) => <Typography.Text type="secondary">{text || "N/A"}</Typography.Text>
    },
    {
      title: "Order Date & Time",
      dataIndex: "order_date",
      key: "order_date",
      sorter: (a, b) => new Date(a.order_date) - new Date(b.order_date),
      render: (text) =>
        text && <Typography.Text type="secondary">{getDateTimeFormat(text)}</Typography.Text>
    },
    {
      title: "Order Status",
      dataIndex: "order_status",
      key: "order_status",
      sorter: (a, b) => a.order_status.localeCompare(b.order_status),
      render: (text) => getStatusTag(text)
    },
    {
      title: "Total P.V.",
      dataIndex: "total_pv",
      key: "total_pv",
      sorter: (a, b) => parseFloat(a.total_pv) - parseFloat(b.total_pv),
      render: (text, record) =>
        text && (
          <Typography.Text type="secondary">
            {record?.cust_type == CUST_TYPE.DIST ? text : "N/A"}
          </Typography.Text>
        )
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      fixed: "right",
      sorter: (a, b) => a.total_amount - b.total_amount,
      render: (text) => text && <Typography.Text type="secondary">Rs {text}</Typography.Text>
    }
  ];

  // Table Expandable Columns

  const expandedColumnsList = [
    {
      title: "Sr.No.",
      dataIndex: "sr_no",
      key: "sr_no",
      render: (text, record, index) => (
        <Typography.Text type="secondary">{index + 1}</Typography.Text>
      ) // Render auto-increment serial number
    },
    // {
    //   title: "Product Name",
    //   dataIndex: "product_name",
    //   key: "product_name",
    //   render: (text) => <Typography.Text type="secondary">{text || "N/A"}</Typography.Text>
    // },
    {
      title: "Product Name",
      dataIndex: "product_name",
      key: "product_name",
      render: (text, record) => (
        <Space>
          <Typography.Text type="secondary">{text || "N/A"}</Typography.Text>
          {record?.is_offer_product && <Tag color="success">{"Offered Product"}</Tag>}
        </Space>
      )
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      key: "quantity",
      render: (text) => <Typography.Text type="secondary"> {text}</Typography.Text>
    },
    {
      title: "Rate",
      dataIndex: "rate",
      key: "rate",
      render: (text) => <Typography.Text type="secondary">Rs {text}</Typography.Text>
    },
    {
      title: "Sap Code",
      dataIndex: "sap_code",
      key: "sap_code",
      render: (text) => <Typography.Text type="secondary"> {text}</Typography.Text>
    }
  ];

  // Navigate to  order page
  const navigateOrder = (record) => {
    navigate(`/${Paths.crmOrderView}/${record.order_no}`);
  };

  // Api call Order count

  const { mutate: salesOrderCount, isLoading: loadingOrderCount } = useMutation(
    (data) => apiService.getOrdersCount(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          setOrderCount(data?.data);
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );

  // Api Call Recent Orders

  const { isLoading: loadingRecentOrder } = useQuery(
    "recentOrder", // Unique query key for tracking in the query client

    () => apiService.recentOrders(),
    {
      // Configuration options for the query
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        if (data?.success) {
          setRecentOrderData(data?.data);
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        console.log(error);
      }
    }
  );

  // Navigate to order View page
  const handleView = () => {
    navigate(`/${Paths.crmOrders}`);
  };

  // api call get summary report (Area chart)
  const {
    refetch: areaChartData,
    isLoading: chartLoading,
    isRefetching: chartRefetchLoading
  } = useQuery(
    "getSaleSummary", // Unique query key for tracking in the query client

    () => apiService.getSaleSummary(segmentKey),
    {
      // Configuration options for the query
      // Enable the query by default
      onSuccess: (data) => {
        if (data?.success) {
          setSaleSummaryData(data?.data);
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        console.log(error);
      }
    }
  );

  // Api call Top selling Products
  const {
    refetch: barChartData,
    isLoading: barChartLoading,
    isRefetching: barChartRefetchLoading
  } = useQuery(
    "getTopSellingProducts", // Unique query key for tracking in the query client

    () => apiService.getTopSelling(barChatSegmentKey),
    {
      // Configuration options for the query
      // Enable the query by default
      onSuccess: (data) => {
        if (data?.success) {
          setTopSellingData(data?.data);
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        console.log(error);
      }
    }
  );

  // handle segment on Change
  // const handleSegment = (value) => {
  //   setSegmentKey(value);
  // };

  useEffect(() => {
    const data = getDateRange("daily");
    salesOrderCount(data);
  }, []);

  // call when barChatSegmentKey key update
  useEffect(() => {
    // (Top Selling Product) bar chart api call
    barChartData();
  }, [barChatSegmentKey]);

  // call when segment key are update
  useEffect(() => {
    //(Sales Summary) area chart api
    areaChartData();
  }, [segmentKey]);

  return (
    <>
      <Row gutter={[20, 20]}>
        <Col span={24}>
          <Flex justify="space-between" gap={10}>
            <Typography.Title level={5}>{"CRM Dashboard"}</Typography.Title>
            {/* <Segmented options={CARD_OPTIONS} className="textCapitalize" onChange={handleSegment} /> */}
          </Flex>
        </Col>
        <Col span={24}>
          <Row gutter={[20, 16]}>
            <CardComponent
              data={cardData}
              title={"Order Summary"}
              loading={loadingOrderCount}
              fetchOrderCount={salesOrderCount}
            />

            <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 12 }}>
              <Card className="CardFullHeight" classNames={{ body: "CardFullHeight" }}>
                <BarChart
                  xField={"product_name"}
                  yField={"value"}
                  data={topSellingData}
                  loading={barChartLoading || barChartRefetchLoading}
                  setBarChartSegmentKey={setBarChartSegmentKey}
                />
              </Card>
            </Col>

            <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 12 }}>
              <Card classNames={{ body: "CardFullHeight" }}>
                <AreaChart
                  xField={"date"}
                  yField={"price"}
                  reportKey={segmentKey}
                  data={saleSummaryData}
                  loading={chartLoading || chartRefetchLoading}
                  setSegmentKey={setSegmentKey}
                />
              </Card>
            </Col>

            <Col span={24}>
              <Card className={"cardFullHeight"}>
                <Row gutter={[20, 5]}>
                  <Col span={24}>
                    <Flex justify="space-between" gap={10}>
                      <Typography.Title level={5}>{"Recent Orders"}</Typography.Title>
                    </Flex>
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={24}>
                    <Table
                      bordered
                      hidePagination={false}
                      size={"small"}
                      loading={loadingRecentOrder ? loadingRecentOrder : false}
                      columns={columns}
                      data={recentOrdersData || []}
                      expandedColumnsList={expandedColumnsList}
                    />
                  </Col>
                  <Col xs={24} sm={24} md={24} lg={24}>
                    {/* check permission */}
                    {actionsPermissionValidator(Paths.crmOrders, PermissionAction.VIEW) &&
                      recentOrdersData?.length > 0 && (
                        <Button block onClick={handleView}>
                          {"View All"}
                        </Button>
                      )}
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </>
  );
};
export default Home;
