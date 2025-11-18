import React, { useState, useEffect } from "react";
import { Col, Row, Typography, Flex, Card, Form, Spin, Pagination, Tag, Space } from "antd";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import NestedTable from "../CrmDashboard/NestedTableComponent";
import { Paths } from "Router/Paths";
import {
  CARD_STATUS,
  CUST_TYPE,
  // CUST_TYPE,
  ORDER_SEARCH_TYPE,
  ORDER_STATUS,
  ORDER_STATUS_CODE,
  ORDER_STATUS_ENUM
} from "CrmHelper/crmConstant";
import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";
import { disableFutureDates, downloadExcelData, getDateTimeFormat } from "Helpers/ats.helper";
import { useUserContext } from "Hooks/UserContext";
import {
  getStatusTag,
  convertRangeISODateFormat,
  convertDateISODateFormat
} from "CrmHelper/crm.helper";
import CombinedSearchComponent from "./TabComponent";

const OrderSearch = () => {
  const [orderSearch] = Form.useForm();
  const navigate = useNavigate();
  // const searchEnable = useRef();
  const location = useLocation();
  const params = useParams();
  const { lastOrderDetails } = location.state || {};
  const { apiService } = useServices();
  const { setBreadCrumb } = useUserContext();
  const [startDate, endDate] = convertDateISODateFormat();
  const [lastPageData, setLastPageData] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [orderDateApi, setOrderDateApi] = useState(null);
  const [segmentKey, setSegmentKey] = useState(null);
  // const [storeCode, setStoreCode] = useState(null);
  const [filterTab, setFilterTab] = useState([]);
  const [filterData, setFilterData] = useState({});

  // const [searchEnable, setSearchEnable] = useState("");

  // invoked function
  const activeKey = (() => {
    if (lastOrderDetails?.order_status != null) {
      return ORDER_SEARCH_TYPE.ORDER_STATUS;
    }

    if (lastOrderDetails?.start_date && lastOrderDetails?.end_date) {
      return ORDER_SEARCH_TYPE.ORDER_DATE;
    }

    const type = params?.type;
    if (
      type === CARD_STATUS.PENDING ||
      type === CARD_STATUS.CONFIRMED ||
      type === CARD_STATUS.CANCELLED ||
      type === CARD_STATUS.DELIVERED
    ) {
      return ORDER_SEARCH_TYPE.ORDER_STATUS;
    }

    if (type === CARD_STATUS.TOTAL) {
      return ORDER_SEARCH_TYPE.ORDER_DATE;
    }

    // Final fallback
    return lastOrderDetails?.search_type ?? ORDER_SEARCH_TYPE.ORDER_NO;
  })();

  const [searchKey, setSearchKey] = useState(activeKey);

  const [fieldRequired, setFieldRequired] = useState({
    order_no: true,
    customer_id: false,
    order_date: false,
    order_status: false,
    store_code: false
  });
  const [rangeDate, setRangeDate] = useState(convertDateISODateFormat());

  // Backend fields you want to export (matching EXACT API keys)
  const extraFields = [
    { title: "Order User Id", dataIndex: "order_user_id" },
    { title: "Shipping Name", dataIndex: "shipping_name" },
    { title: "Shipping Address", dataIndex: "shipping_address" },
    { title: "Refund Amount", dataIndex: "refund_amount" },
    { title: "Store Name", dataIndex: "store_name" },
    { title: "Order City", dataIndex: "order_city" },
    { title: "Order District", dataIndex: "order_district" },
    { title: "Order State", dataIndex: "order_state" },
    { title: "Order Pincode", dataIndex: "order_pincode" },

    { title: "Payment Order ID", dataIndex: "payment_order_id" },

    { title: "Delivered From", dataIndex: "delivered_from" },
    { title: "Store Code", dataIndex: "store_code" }
  ];

  // Navigate to View page

  const handleView = (record) => {
    navigate(
      params.type !== "order-return"
        ? `/${Paths.crmOrderView}/${record.order_no}`
        : `/${Paths.crmOrderReturnView}/${record.return_order_no}`,
      {
        state: {
          lastOrderDetails: lastPageData
        }
      }
    );
  };

  // handle segment on Change
  const handleSegment = (value) => {
    try {
      setSegmentKey(value);

      if (current == 1) {
        const data = {
          start_date: filterData?.start_date || rangeDate[0],
          end_date: filterData?.end_date || rangeDate[1],

          order_status: value,
          page: current - 1,
          pageSize: pageSize
        };
        if (filterTab?.length > 0) {
          data.delivered_from = filterTab;
        }

        if (value == "all") {
          delete data.order_status;
        }

        getOrdersByDate(data);
      } else {
        setCurrent(1);
      }
    } catch (error) {}
  };

  // setField required
  const setFieldTrue = (key) => {
    setFieldRequired((prevState) => {
      const newState = Object.keys(prevState).reduce((acc, currKey) => {
        acc[currKey] = currKey === key;
        return acc;
      }, {});
      return newState;
    });
  };

  // get order details call api and set values
  const getOrderDetails = (params) => {
    try {
      switch (params?.type) {
        case CARD_STATUS.PENDING:
          orderSearch.setFieldValue(ORDER_SEARCH_TYPE.ORDER_STATUS, ORDER_STATUS_ENUM.PENDING);
          orderSearch.submit();
          break;

        case CARD_STATUS.CONFIRMED:
          orderSearch.setFieldValue(ORDER_SEARCH_TYPE.ORDER_STATUS, ORDER_STATUS_CODE.CONFIRMED);
          orderSearch.submit();
          break;

        case CARD_STATUS.CANCELLED:
          orderSearch.setFieldValue(ORDER_SEARCH_TYPE.ORDER_STATUS, ORDER_STATUS_CODE.CANCELLED);
          orderSearch.submit();
          break;
        case CARD_STATUS.DELIVERED:
          orderSearch.setFieldValue(ORDER_SEARCH_TYPE.ORDER_STATUS, ORDER_STATUS_CODE.DELIVERED);
          orderSearch.submit();
          break;
        case CARD_STATUS.TOTAL:
          orderSearch.submit();
          break;

        // Add more cases as needed
        default:
          break;
      }
    } catch (error) {}
  };

  useEffect(() => {
    setBreadCrumb({
      title: "CRM Orders "
    });

    // Api call
    getOrderDetails(params);

    if (lastOrderDetails && Object.keys(lastOrderDetails).length > 0) {
      if (lastOrderDetails?.delivered_from?.length > 0) {
        setFilterTab(lastOrderDetails?.delivered_from);
      }
      handleReset();

      delete lastOrderDetails?.page;
      delete lastOrderDetails?.pageSize;

      // delete lastOrderDetails?.searchTerm;
      const data = {
        ...lastOrderDetails
        // search_type: lastOrderDetails.search_type
      };

      orderSearch.setFieldsValue(data);
      let search =
        params?.type === "order-return"
          ? ORDER_SEARCH_TYPE.ORDER_NO
          : lastOrderDetails?.order_status != null
            ? ORDER_SEARCH_TYPE.ORDER_STATUS
            : lastOrderDetails?.start_date && lastOrderDetails?.end_date
              ? ORDER_SEARCH_TYPE.ORDER_DATE
              : lastOrderDetails?.search_type ?? ORDER_SEARCH_TYPE.ORDER_NO;

      setSearchKey(search);
      orderSearch.submit();
    }
  }, []);

  // Table Column
  const columns = [
    {
      title: "Order No.",
      dataIndex: "order_no",
      key: "order_no",
      sorter: (a, b) => a.order_no - b.order_no,
      render: (text, record) =>
        text && (
          <Typography.Link underline onClick={() => handleView(record)}>
            {text}
          </Typography.Link>
        )
    },
    {
      title: "Customer ID",
      dataIndex: "customer_id",
      key: "customer_id",
      sorter: (a, b) => parseFloat(a.customer_id) - parseFloat(b.customer_id),
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

    ...(orderDateApi === ORDER_SEARCH_TYPE.ORDER_STATUS
      ? [
          {
            title: "Status Date & Time",
            dataIndex: "change_date",
            key: "change_date",
            sorter: (a, b) => new Date(a.change_date) - new Date(b.change_date),
            render: (text) =>
              text ? (
                <Typography.Text type="secondary">{getDateTimeFormat(text)}</Typography.Text>
              ) : null
          }
        ]
      : []),

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
      title: "Total Amount (₹)",
      dataIndex: "total_amount",
      key: "total_amount",
      fixed: "right",
      sorter: (a, b) => parseFloat(a.total_amount) - parseFloat(b.total_amount),
      render: (text) => text && <Typography.Text type="secondary"> {text}</Typography.Text>
    }
  ];

  const depotColumns = [
    {
      title: "Return Order No.",
      dataIndex: "return_order_no",
      key: "return_order_no",
      sorter: (a, b) => a.return_order_no - b.return_order_no,
      render: (text, record) =>
        text && (
          <Typography.Link underline onClick={() => handleView(record)}>
            {text}
          </Typography.Link>
        )
    },
    {
      title: "Order No.",
      dataIndex: "order_no",
      key: "order_no",
      sorter: (a, b) => a.order_no - b.order_no
      // render: (text, record) =>
      //   text && (
      //     <Typography.Link underline onClick={() => handleView(record)}>
      //       {text}
      //     </Typography.Link>
      //   )
    },

    {
      title: "Customer ID",
      dataIndex: "customer_id",
      key: "customer_id",
      sorter: (a, b) => parseFloat(a.customer_id) - parseFloat(b.customer_id),
      render: (text) => text && <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Customer Name",
      dataIndex: "shipping_name",
      key: "shipping_name",
      sorter: (a, b) => parseFloat(a.shipping_name) - parseFloat(b.shipping_name),
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
    }
  ];
  // Table Expanded Column
  const expandedColumnsList = [
    {
      title: "S.No.",
      dataIndex: "sr_no",
      key: "sr_no",
      render: (text, record, index) => (
        <Typography.Text type="secondary">{index + 1}</Typography.Text>
      ) // Render auto-increment serial number
    },
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
      title: "Rate (₹)",
      dataIndex: "rate",
      key: "rate",
      render: (text) => <Typography.Text type="secondary"> {text}</Typography.Text>
    },
    {
      title: "Sap Code",
      dataIndex: "sap_code",
      key: "sap_code",
      render: (text) => <Typography.Text type="secondary"> {text}</Typography.Text>
    }
  ];

  // reset all fields
  const handleReset = () => {
    setTableData([]);
    setCurrent(1);
    setTotalCount(0);
    setPageSize(10);
  };

  const getOrderDownload = async (arg) => {
    const filter = lastPageData;
    delete filter.page;
    delete filter.pageSize;
    console.log(arg, "chek arg");

    if (orderDateApi == ORDER_SEARCH_TYPE.ORDER_DATE || searchKey == ORDER_SEARCH_TYPE.ORDER_DATE) {
      delete filter.search_type;

      if (segmentKey !== null && segmentKey !== "all") {
        filter.order_status = segmentKey;
      }

      const data =
        params.type === "order-return"
          ? await apiService.getCrmReturnOrdersByDate(filter)
          : await apiService.getCrmOrdersByDateDownload(filter);

      if (data?.success) {
        downloadSheet(data?.data, arg.type);
      }
    } else if (
      orderDateApi == ORDER_SEARCH_TYPE.ORDER_STATUS ||
      searchKey == ORDER_SEARCH_TYPE.ORDER_STATUS
    ) {
      delete filter.search_type;
      const data = await apiService.getCrmOrdersByStatus(filter);
      if (data?.success) {
        downloadSheet(data?.data);
      }
    } else {
      delete filter.delivered_from;
      orderSearch.getFieldValue("store_code")
        ? (filter["store_code"] = orderSearch.getFieldValue("store_code"))
        : null;
      const data = await apiService.getCrmOrders(data);
      if (data?.success) {
        downloadSheet(data?.data);
      }
    }
  };

  const downloadSheet = (data, type) => {
    console.log(type, "checktype");
    let allColumns = [];
    if (type === "order_date") {
      allColumns = [
        ...columns.map((c) => ({ title: c.title, dataIndex: c.dataIndex })),
        ...extraFields
      ];
    } else {
      allColumns = columns;
    }
    // Merge UI table columns + extra export columns

    const formattedData = data.map((e) => {
      let row = {};

      allColumns.forEach((col) => {
        if (col.dataIndex === "order_user_id") {
          row[col.title] = `${e.cust_type || "N/A"}-${
            e.puc_store_code ? e.puc_store_code : e.customer_id || "N/A"
          }`;
          return;
        }

        if (col.dataIndex === "order_date") {
          row[col.title] = getDateTimeFormat(e[col.dataIndex]);
        } else {
          row[col.title] = e[col.dataIndex] ?? "";
        }
      });

      return row;
    });
    console.log(formattedData, "fomradatedata");

    downloadExcelData(formattedData, "ORDER_LIST" + Math.floor(new Date()));
  };

  // handle Form on submit

  const handleForm = (value) => {
    try {
      const { type } = params;
      let filter = {
        ...value,
        search_type: searchKey,
        delivered_from: filterTab,
        ...(type === "order-return" ? { order_status: ORDER_STATUS_CODE.RETURNED } : {})
      };

      if (filter.delivered_from && filter.delivered_from?.length == 0) {
        delete filter.delivered_from;
      }

      setFilterData(filter);
      if (
        searchKey === ORDER_SEARCH_TYPE.ORDER_STATUS ||
        searchKey === ORDER_SEARCH_TYPE.ORDER_DATE ||
        lastOrderDetails?.order_status != null
      ) {
        const { start, end } = convertRangeISODateFormat(rangeDate);

        filter.start_date = start;
        filter.end_date = end;
        delete filter.order_date;
      }
      filter.page = current - 1;
      filter.pageSize = pageSize;
      if (value?.order_status_range) {
        delete filter.order_status_range;
      }

      // Filter out undefined (or null) values
      filter = Object.fromEntries(
        Object.entries(filter).filter(([_, v]) => v !== undefined && v !== null)
      );

      setLastPageData(filter); // this is used in export as well

      if (
        lastOrderDetails?.delivered_from &&
        lastOrderDetails?.delivered_from?.length > 0 &&
        filter?.delivered_from == null
      ) {
        filter.delivered_from = lastOrderDetails?.delivered_from;
        location.state.lastOrderDetails = null;
      }

      if (
        orderDateApi == ORDER_SEARCH_TYPE.ORDER_DATE ||
        searchKey == ORDER_SEARCH_TYPE.ORDER_DATE
      ) {
        delete filter.search_type;

        if (segmentKey !== null && segmentKey !== "all") {
          filter.order_status = segmentKey;
        }

        getOrdersByDate(filter);
      } else if (
        orderDateApi == ORDER_SEARCH_TYPE.ORDER_STATUS ||
        searchKey == ORDER_SEARCH_TYPE.ORDER_STATUS
      ) {
        delete filter.search_type;

        getOrdersByStatus(filter);
      } else {
        delete filter.delivered_from;
        orderSearch.getFieldValue("store_code")
          ? (filter["store_code"] = orderSearch.getFieldValue("store_code"))
          : null;
        if (filter.order_no || filter.return_order_no) {
          getOrders(filter);
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  // handle show table data
  const handleShow = () => {
    orderSearch
      .validateFields()
      .then((values) => {
        handleForm(values);
      })
      .catch((errorInfo) => {
        //
      });
  };

  // Handle Tab change
  const onChange = (key) => {
    setOrderDateApi(null);
    setSegmentKey(null);
    setFilterTab([]);

    orderSearch.resetFields();
    if (params?.type !== "order-return") {
      navigate(`/${Paths.crmOrders}`);
    } else {
      navigate(`/${Paths.crmOrderReturnSearch}`);
    }

    setRangeDate(convertDateISODateFormat());
    handleReset();

    setFieldTrue(key);
    let [startDate, endDate] = convertDateISODateFormat();

    if (key == ORDER_SEARCH_TYPE.ORDER_STATUS) {
      setOrderDateApi(ORDER_SEARCH_TYPE.ORDER_STATUS);
      orderSearch.setFieldsValue({
        [ORDER_SEARCH_TYPE.ORDER_STATUS]: ORDER_STATUS_ENUM.PENDING,
        [ORDER_SEARCH_TYPE.ORDER_STATUS_RANGE]: [startDate, endDate]
      });
    }
    if (key == ORDER_SEARCH_TYPE.ORDER_DATE) {
      setOrderDateApi(ORDER_SEARCH_TYPE.ORDER_DATE);

      // Set the field value
      orderSearch.setFieldValue(ORDER_SEARCH_TYPE.ORDER_DATE, [startDate, endDate]);
    }
    setSearchKey(key);
  };

  //  Api call Get  orders

  const { mutate: getOrders, isLoading: getLoadingOrders } = useMutation(
    (data) =>
      params?.type === "order-return"
        ? apiService.getCrmReturnOrders(data)
        : apiService.getCrmOrders(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          setTableData(data);
          setTotalCount(data?.totalCount);
        }
      },
      onError: (error) => {
        handleReset();
        //error log
        console.log(error);
      }
    }
  );

  //  Api call Get  orders by date

  const { mutate: getOrdersByDate, isLoading: getLoadingOrdersByDate } = useMutation(
    (data) =>
      params.type === "order-return"
        ? apiService.getCrmReturnOrdersByDate(data)
        : apiService.getCrmOrdersByDate(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          setTableData(data);
          setTotalCount(data?.totalCount);
        }
      },
      onError: (error) => {
        handleReset();
        //error log
        console.log(error);
      }
    }
  );

  // Api Call get orders by status

  const { mutate: getOrdersByStatus, isLoading: getLoadingOrdersByStatus } = useMutation(
    (data) =>
      params?.type === "order-return"
        ? apiService.getCrmReturnOrdersByStatus(data)
        : apiService.getCrmOrdersByStatus(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          setTableData(data);
          setTotalCount(data?.totalCount);
        }
      },
      onError: (error) => {
        handleReset();
        //error log
        console.log(error);
      }
    }
  );

  // handle Enter to show
  const handleKeyDownShow = (e) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent form submission if inside a form

      handleShow();
    }
  };

  // handle date (Range picker)
  const handleDate = (date, string) => {
    setRangeDate(date);
  };

  const FiltertabOnchange = () => {
    if (current == 1) {
      handleShow();
    } else {
      setCurrent(1);
    }
  };

  // Calling api when click pagination
  useEffect(() => {
    if (tableData?.data?.length > 0) {
      handleShow();
    }
  }, [current, pageSize]);

  useEffect(() => {
    const type = params?.type;
    setTableData([]);
    orderSearch.resetFields();
    orderSearch.resetFields();
    if (type === "order-return") {
      setOrderDateApi(CARD_STATUS?.RETURN_INITIATED);
    }
  }, [params?.type]);

  console.log(params?.type);

  return (
    <Form form={orderSearch} layout="vertical" onFinish={handleForm}>
      <Spin spinning={getLoadingOrders || getLoadingOrdersByDate || getLoadingOrdersByStatus}>
        <Row gutter={[20, 5]}>
          <Col span={24}>
            <Card>
              <Typography.Title level={5}>{`CRM ${
                params?.type === "order-return" ? "Return" : ""
              } Orders`}</Typography.Title>
              <Row gutter={[20, 20]}>
                <Col span={24}>
                  <CombinedSearchComponent
                    handleDate={handleDate}
                    handleKeyDownShow={handleKeyDownShow}
                    filterTab={filterTab}
                    FiltertabOnchange={FiltertabOnchange}
                    startDate={startDate}
                    endDate={endDate}
                    rangeDate={rangeDate}
                    disableFutureDates={disableFutureDates}
                    ORDER_STATUS={ORDER_STATUS}
                    fieldRequired={fieldRequired}
                    ORDER_SEARCH_TYPE={ORDER_SEARCH_TYPE}
                    tableData={tableData}
                    getLoadingOrders={getLoadingOrders}
                    handleShow={handleShow}
                    handleSegment={handleSegment}
                    onChange={onChange}
                    activeKey={activeKey}
                    orderSearch={orderSearch}
                    handleReset={handleReset}
                    setCurrent={setCurrent}
                    setFilterTab={setFilterTab}
                    getOrderDownload={getOrderDownload}
                    params={params}
                  />
                </Col>
                {/* {tableData?.length > 0 && ( */}
                <>
                  <Col span={24}>
                    <Flex gap="middle" justify="space-between" vertical>
                      <NestedTable
                        bordered
                        size={"small"}
                        hidePagination={false}
                        columns={params?.type === "order-return" ? depotColumns : columns}
                        data={tableData?.data || []}
                        expandedColumnsList={expandedColumnsList}
                      />

                      <div className="paginationStyle">
                        <Pagination
                          total={totalCount || 0}
                          showTotal={(total) => `Total ${total} items`}
                          pageSize={pageSize} // Use pageSize instead of defaultPageSize
                          current={current}
                          onChange={(newPage, newPageSize) => {
                            setCurrent(newPage);
                            setPageSize(newPageSize);
                          }}
                          showSizeChanger={true}
                          showQuickJumper
                        />
                      </div>
                    </Flex>
                  </Col>
                </>
                {/* )} */}
              </Row>
            </Card>
          </Col>
        </Row>
      </Spin>
    </Form>
  );
};

export default OrderSearch;
