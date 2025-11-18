import {
  Form,
  Input,
  Button,
  DatePicker,
  Select,
  Row,
  Col,
  Segmented,
  Tabs,
  Flex,
  Checkbox,
  Typography
} from "antd";
import { validateNumberWithMaxLength, validateLength } from "CrmHelper/crm.helper";
import { DATEFORMAT } from "Helpers/ats.constants";
import { ORDER_STATUS_CODE } from "CrmHelper/crmConstant";
import { useEffect, useState } from "react";
import { DownloadOutlined, FilterOutlined } from "@ant-design/icons";

const CombinedSearchComponent = ({
  handleDate,
  handleKeyDownShow,
  filterTab,
  FiltertabOnchange,
  startDate,
  endDate,
  rangeDate,
  disableFutureDates,
  ORDER_STATUS,
  fieldRequired,
  ORDER_SEARCH_TYPE,
  tableData,
  getLoadingOrders,
  handleShow,
  handleSegment,
  onChange,
  activeKey,
  orderSearch,
  handleReset,
  setCurrent,
  setFilterTab,
  getOrderDownload,
  params
}) => {
  const [callApi, setCallApi] = useState(false);
  const STATUS_SEGMENT_CRM = [
    { label: `All (${tableData?.order_counts?.all || 0})`, value: "all" },
    {
      label: `Pending (${tableData?.order_counts?.pending || 0})`,
      value: ORDER_STATUS_CODE.PENDING
    },
    {
      label: `Delivered (${tableData?.order_counts?.delivered || 0}) `,
      value: ORDER_STATUS_CODE.DELIVERED
    },
    {
      label: ` Packed (${tableData?.order_counts?.packed || 0}) `,
      value: ORDER_STATUS_CODE.PACKED
    },
    {
      label: ` Cancelled (${tableData?.order_counts?.cancelled || 0}) `,
      value: ORDER_STATUS_CODE.CANCELLED
    },
    {
      label: `Confirmed (${tableData?.order_counts?.confirmed || 0})`,
      value: ORDER_STATUS_CODE.CONFIRMED
    },
    {
      label: ` Out For Delivery (${tableData?.order_counts?.out_for || 0})`,
      value: ORDER_STATUS_CODE.OUT_FOR_DELIVERY
    }
  ];

  const handleStoreCode = (e) => {
    if (e?.target?.value === "") {
      handleReset();
    }
  };

  const FILTER_TYPE = [
    { label: "B2B", value: "b2b" },
    { label: "B2C", value: "b2c" },
    { label: "PUC", value: "puc" },
    { label: "HO", value: "depot" }
  ];

  const updateState = (value) => {
    setFilterTab((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
    setCallApi(true);
  };

  useEffect(() => {
    if (callApi) {
      // Api call
      FiltertabOnchange();
      setCallApi(false);
    }
  }, [filterTab]);

  useEffect(() => {
    const { type } = params;

    if (type === "order-return") {
      orderSearch.setFieldValue("order_status", ORDER_STATUS_CODE.RETURNED);
    }
  }, [params]);

  // Tabs Items
  const items = [
    {
      key: ORDER_SEARCH_TYPE.ORDER_NO,
      label: params?.type === "order-return" ? "Return Order Number" : "Order Number",
      children: (
        <Row gutter={[0, 10]}>
          <Col span={24}>
            <Flex gap={"small"}>
              <Col span={6}>
                <Form.Item
                  className="removeMargin"
                  name={ORDER_SEARCH_TYPE.ORDER_NO}
                  rules={[
                    {
                      required: fieldRequired.order_no,
                      message:
                        params?.type === "order-return"
                          ? "Please Enter Return Order Number"
                          : "Please Enter Order Number"
                    },
                    {
                      validator: validateNumberWithMaxLength(
                        10,
                        null,
                        "Order Number must be a number and up to 10 digits long"
                      )
                    }
                  ]}>
                  <Input
                    size="large"
                    maxLength={10}
                    onInput={validateLength}
                    type="number"
                    inputMode="numeric"
                    placeholder={
                      params?.type === "order-return"
                        ? "Enter Return Order Number"
                        : "Enter Order Number"
                    }
                    onKeyDown={handleKeyDownShow}
                  />
                </Form.Item>
              </Col>
              <Col span={2}>
                <Button
                  type="primary"
                  size="large"
                  loading={!tableData.length > 0 && getLoadingOrders}
                  onClick={() => {
                    orderSearch.setFieldValue("store_code", null);
                    handleShow();
                    setCurrent(1);
                  }}>
                  Show
                </Button>
              </Col>
            </Flex>
          </Col>
        </Row>
      )
    },
    ...(params?.type !== "order-return"
      ? [
          {
            key: ORDER_SEARCH_TYPE.CUSTOMER_ID,
            label: "Customer Id",
            children: (
              <Row gutter={[0, 10]}>
                <Col span={24}>
                  <Flex gap={"small"}>
                    <Col span={6}>
                      <Form.Item
                        className="removeMargin"
                        name={ORDER_SEARCH_TYPE.CUSTOMER_ID}
                        rules={[
                          {
                            required: fieldRequired.customer_id,
                            message: "Please Enter Customer Id"
                          },
                          {
                            validator: validateNumberWithMaxLength(
                              10,
                              null,
                              "Customer Id must be a number and up to 10 digits long"
                            )
                          }
                        ]}>
                        <Input
                          size="large"
                          type="number"
                          onInput={validateLength}
                          inputMode="numeric"
                          maxLength={10}
                          placeholder="Enter Customer Id"
                          onKeyDown={handleKeyDownShow}
                        />
                      </Form.Item>
                    </Col>
                    <Button
                      type="primary"
                      size="large"
                      loading={!tableData.length > 0 && getLoadingOrders}
                      onClick={() => {
                        orderSearch.setFieldValue("store_code", null);
                        handleShow();
                        setCurrent(1);
                      }}>
                      Show
                    </Button>
                  </Flex>
                </Col>
              </Row>
            )
          }
        ]
      : [{}]),
    {
      key: ORDER_SEARCH_TYPE.ORDER_DATE,
      label: params?.type === "order-return" ? "Return Order Date" : "Order Date",
      children: (
        <>
          <Row gutter={[0, 10]}>
            <Col span={24}>
              <Flex gap={"small"} justify="space-between" wrap="wrap">
                <Flex gap={"small"}>
                  <Form.Item
                    className="removeMargin"
                    name={ORDER_SEARCH_TYPE.ORDER_DATE}
                    rules={[{ required: fieldRequired.order_date, message: "Please Select Date" }]}>
                    <DatePicker.RangePicker
                      className="fullWidth"
                      defaultValue={[startDate, endDate]}
                      onChange={handleDate}
                      allowClear={false}
                      size="large"
                      format={DATEFORMAT.RANGE_FORMAT}
                      disabledDate={disableFutureDates}
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    size="large"
                    loading={!tableData.length > 0 && getLoadingOrders}
                    onClick={() => {
                      orderSearch.setFieldValue("store_code", null);
                      handleShow();
                      setCurrent(1);
                    }}>
                    Show
                  </Button>
                </Flex>

                {params?.type !== "order-return" && (
                  <Flex justify="flex-end" align="flex-end">
                    {
                      <Form.Item className="removeMargin" name={"delivered_from"}>
                        <div className="segmented">
                          <Typography.Text>
                            <FilterOutlined className="filter-icon-size" />
                            Filter By :
                          </Typography.Text>

                          {FILTER_TYPE.map((option) => (
                            <Checkbox
                              key={option.value}
                              checked={filterTab.includes(option.value)}
                              onChange={() => updateState(option.value)}>
                              {option.label}
                            </Checkbox>
                          ))}
                        </div>
                      </Form.Item>
                    }
                  </Flex>
                )}
                <Flex justify="flex-end" align="flex-end">
                  {tableData?.data?.length > 0 && (
                    <Button
                      type="primary"
                      size="large"
                      onClick={() => getOrderDownload({ type: "order_date" })}
                      icon={<DownloadOutlined />}>
                      Download
                    </Button>
                  )}
                </Flex>
              </Flex>
            </Col>
            <Col span={24}>
              {tableData && tableData?.order_counts != null && params?.type !== "order-return" && (
                <Segmented
                  options={STATUS_SEGMENT_CRM}
                  className="textCapitalize"
                  size="large"
                  block={true}
                  onChange={handleSegment}
                />
              )}
            </Col>
          </Row>
        </>
      )
    },
    ...(params?.type !== "order-return"
      ? [
          {
            key: ORDER_SEARCH_TYPE.ORDER_STATUS,
            label: "Order Status",
            children: (
              <>
                <Row gutter={[0, 10]}>
                  <Col span={24}>
                    <Flex gap={"small"} justify="space-between" wrap="wrap">
                      <Flex gap={"small"}>
                        <Col span={6}>
                          <Form.Item
                            className="removeMargin"
                            name={ORDER_SEARCH_TYPE.ORDER_STATUS}
                            rules={[
                              {
                                required: fieldRequired.order_status,
                                message: "Please Select Status"
                              }
                            ]}>
                            <Select
                              defaultValue="Pending"
                              className="fullWidth"
                              size="large"
                              options={ORDER_STATUS}
                              disabled={params?.type === "order-return"}
                            />
                          </Form.Item>
                        </Col>

                        <Form.Item
                          className="removeMargin"
                          name={ORDER_SEARCH_TYPE.ORDER_STATUS_RANGE}>
                          <DatePicker.RangePicker
                            className="fullWidth"
                            defaultValue={[rangeDate[0], rangeDate[1]]}
                            size="large"
                            allowClear={false}
                            onChange={handleDate}
                            format={DATEFORMAT.RANGE_FORMAT}
                            disabledDate={disableFutureDates}
                          />
                        </Form.Item>

                        <Button
                          type="primary"
                          size="large"
                          loading={!tableData.length > 0 && getLoadingOrders}
                          onClick={() => {
                            orderSearch.setFieldValue("store_code", null);
                            handleShow();
                            setCurrent(1);
                          }}>
                          Show
                        </Button>
                      </Flex>

                      <Flex justify="flex-end" align="flex-end">
                        {
                          <Form.Item className="removeMargin" name={"delivered_from"}>
                            <div className="segmented">
                              <Typography.Text>
                                <FilterOutlined className="filter-icon-size" />
                                Filter By :
                              </Typography.Text>

                              {FILTER_TYPE.map((option) => (
                                <Checkbox
                                  key={option.value}
                                  checked={filterTab.includes(option.value)}
                                  onChange={() => updateState(option.value)}>
                                  {option.label}
                                </Checkbox>
                              ))}
                            </div>
                          </Form.Item>
                        }
                      </Flex>
                      {
                        <Flex justify="flex-end" align="flex-end">
                          {tableData?.data?.length > 0 && (
                            <Button
                              type="primary"
                              size="large"
                              onClick={() => getOrderDownload()}
                              icon={<DownloadOutlined />}>
                              Download
                            </Button>
                          )}
                        </Flex>
                      }
                    </Flex>
                  </Col>
                </Row>
              </>
            )
          },
          {
            key: ORDER_SEARCH_TYPE.ORDER_STORE,
            label: "Store",
            children: (
              <>
                <Row gutter={[0, 10]}>
                  <Col span={24}>
                    <Flex gap={"small"}>
                      <Col span={6}>
                        <Form.Item
                          className="removeMargin"
                          name={ORDER_SEARCH_TYPE.ORDER_STORE}
                          rules={[
                            {
                              required: fieldRequired.store_code,
                              message: "Please Enter Store Code"
                            },
                            {
                              validator: validateNumberWithMaxLength(
                                10,
                                3,
                                "Store Code must be a number and up to 10 digits long",
                                "store_code"
                              )
                            }
                          ]}>
                          <Input
                            size="large"
                            maxLength={10}
                            onInput={validateLength}
                            type="number"
                            inputMode="numeric"
                            onKeyDown={handleKeyDownShow}
                            onChange={handleStoreCode}
                            placeholder="Enter Store Code"
                          />
                        </Form.Item>
                      </Col>
                      <Button
                        type="primary"
                        size="large"
                        loading={!tableData.length > 0 && getLoadingOrders}
                        onClick={() => {
                          handleShow();
                          setCurrent(1);
                        }}>
                        Show
                      </Button>
                    </Flex>
                  </Col>
                </Row>
              </>
            )
          }
        ]
      : [{}])
  ];

  return <Tabs type="card" defaultActiveKey={activeKey} items={items} onChange={onChange} />;
};

export default CombinedSearchComponent;
