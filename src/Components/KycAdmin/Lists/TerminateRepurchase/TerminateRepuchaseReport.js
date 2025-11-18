import { SearchOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Pagination,
  Row,
  Spin,
  Table,
  Typography
} from "antd";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { abNoMaxLength, DATEFORMAT, PermissionAction } from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  convertRangeISODateFormat,
  disableFutureDates,
  getDateTimeFormat,
  safeString,
  validationNumber
} from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import searchByIcon from "Static/KYC_STATIC/img/search_by_calendar.svg";

const TerminateRepurchaseReport = () => {
  const { apiService } = useServices();
  const [terminateRepurchaseForm] = Form.useForm();
  const [rangeDate, setRangeDate] = useState(null);
  const [show, setShow] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchEnable, setISearchEnable] = useState(false);

  // handle search change
  const handleChange = (e) => {
    try {
      if (e) {
        const value = e.target.value;
        // Update the state with the numeric value
        setSearchValue(value);
      }

      // If the input is cleared, trigger refetch
      if (isSearchEnable && !e.target.value) {
        if (rangeDate) {
          const data = {
            start_date: rangeDate.start,
            end_date: rangeDate?.end,
            page: current - 1,
            pageSize: pageSize
          };
          setISearchEnable(false);
          // api call
          current == 1 ? terminateRepurchase(data) : setCurrent(1);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle search
  const handleSearch = (values) => {
    try {
      const trimmedValue = values?.trim();

      if (!trimmedValue) return;
      setSearchValue(trimmedValue);
      if (rangeDate) {
        const data = {
          start_date: rangeDate.start,
          end_date: rangeDate?.end,
          page: current - 1,
          pageSize: pageSize,
          searchTerm: trimmedValue
        };
        current == 1 ? terminateRepurchase(data) : setCurrent(1);
        setISearchEnable(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle search  date range
  const handleSubmit = () => {
    try {
      if (rangeDate) {
        const data = {
          start_date: rangeDate.start,
          end_date: rangeDate?.end,
          page: current - 1,
          pageSize: pageSize,
          ...(searchValue && { searchTerm: searchValue })
        };

        // api call
        current == 1 ? terminateRepurchase(data) : setCurrent(1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // validate value
  const handleSearchSubmit = () => {
    terminateRepurchaseForm
      .validateFields()
      .then((value) => {
        let range = convertRangeISODateFormat(value?.date);
        setISearchEnable(false);
        setSearchValue("");
        setRangeDate(range);
        terminateRepurchaseForm.submit();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // api call
  const { mutate: terminateRepurchase, isLoading: loadingDeclareReport } = useMutation(
    (data) => apiService.listTerminateRepurchase(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success) {
          const updatedData = data?.data.map((item, index) => {
            return {
              ...item,
              join_date: getDateTimeFormat(item.join_date, "DD / MM / YYYY") // Format the join_date
            };
          });

          setTotal(data?.totalCount);
          setDataSource(updatedData || []);
          setShow(true);
        }
      },
      onError: (error) => {
        setShow(false);
        setTotal(0);
        setDataSource([]);
        console.log(error);
      }
    }
  );

  useEffect(() => {
    if (rangeDate) {
      const data = {
        start_date: rangeDate?.start,
        end_date: rangeDate?.end,
        page: current - 1,
        pageSize: pageSize,
        ...(searchValue && { searchTerm: searchValue })
      };
      // api call
      terminateRepurchase(data);
    }
  }, [current, pageSize]);

  // set range picker value
  const handleDateChange = (value) => {
    terminateRepurchaseForm.setFieldsValue({ date: value });
  };

  // column
  const columns = [
    {
      title: "Associate Buyer Number",
      dataIndex: "associate_buyer_no",
      key: "associate_buyer_no",
      sorter: (a, b) => Number(a.associate_buyer_no) - Number(b.associate_buyer_no),
      render: (associate_buyer_no) => (
        <Typography.Text type="secondary">{associate_buyer_no}</Typography.Text>
      )
    },
    {
      title: "Associate Buyer Name",
      dataIndex: "associate_buyer_name",
      key: "associate_buyer_name",
      sorter: (a, b) =>
        safeString(a.associate_buyer_name).localeCompare(safeString(b.associate_buyer_name)),
      render: (name) => <Typography.Text type="secondary">{name}</Typography.Text>
    },
    {
      title: "AB Phone",
      dataIndex: "ab_phone",
      key: "ab_phone",
      sorter: (a, b) => Number(a.ab_phone) - Number(b.ab_phone),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Bill No",
      dataIndex: "bill_no",
      key: "bill_no",
      sorter: (a, b) => Number(a.bill_no) - Number(b.bill_no),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Bill Amount",
      dataIndex: "bill_amount",
      key: "bill_amount",
      sorter: (a, b) => Number(a.bill_amount) - Number(b.bill_amount),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Join Date",
      dataIndex: "join_date",
      key: "join_date",
      sorter: (a, b) => new Date(a.join_date).getTime() - new Date(b.join_date).getTime(),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Repurchase Amount",
      dataIndex: "repurchase_amount",
      key: "repurchase_amount",
      sorter: (a, b) => Number(a.repurchase_amount) - Number(b.repurchase_amount),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Store Code",
      dataIndex: "store_code",
      key: "store_code",
      sorter: (a, b) => Number(a.store_code) - Number(b.store_code),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    }
  ];

  // style sheet
  const StyleSheet = {
    marginTop8: {
      marginTop: "8px"
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={loadingDeclareReport}>
      <Row gutter={[20, 24]} style={StyleSheet.marginTop8}>
        <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
          <Flex vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              Terminate Repurchase Report
            </Typography.Title>
            <Typography.Text className="removeMargin">
              <Typography.Text type="secondary">Reports /</Typography.Text> Terminate Repurchase
              Report
            </Typography.Text>
          </Flex>
        </Col>
        <Card className="fullWidth">
          <Col
            xs={{ span: 24 }}
            sm={{ span: 24 }}
            md={{ span: 24 }}
            lg={{ span: 12 }}
            className="removePadding">
            <Form
              name="terminate_repurchase_form"
              form={terminateRepurchaseForm}
              layout="vertical"
              onFinish={handleSubmit}>
              <Form.Item
                name="date"
                label="Date Range"
                rules={[
                  {
                    required: true,
                    message: "Please select a date range!"
                  }
                ]}
                className="removeMargin">
                <Flex justify="space-between" gap={10}>
                  <DatePicker.RangePicker
                    size="large"
                    className="fullWidth"
                    disabledDate={disableFutureDates}
                    onChange={handleDateChange}
                    format={DATEFORMAT.RANGE_FORMAT}
                  />
                  <Button
                    size="large"
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleSearchSubmit}>
                    Search
                  </Button>
                </Flex>
              </Form.Item>
            </Form>
          </Col>
        </Card>
        {show ? (
          <>
            <Card className="fullWidth">
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Flex justify="space-between">
                  {/* <ExportBtn
                    columns={columns}
                    fetchData={dataSource}
                    fileName={"terminate_report"}
                  /> */}
                  <Row gutter={[12]} className="fullWidth marginBottom16">
                    <Col xs={24} md={12}></Col>
                    <Col xs={24} md={12}>
                      <Input.Search
                        onInput={(e) => validationNumber(e)}
                        maxLength={abNoMaxLength}
                        size="large"
                        allowClear
                        placeholder="Search by Associate Buyer Number"
                        onSearch={handleSearch}
                        onChange={handleChange}
                        value={searchValue}></Input.Search>
                    </Col>
                  </Row>
                </Flex>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Table
                  dataSource={dataSource}
                  columns={columns}
                  bordered
                  pagination={false}
                  scroll={{
                    x: "max-content"
                  }}
                />
              </Col>
              <Col span={24}>
                <div className="paginationStyle">
                  <Pagination
                    align="end"
                    total={total}
                    showTotal={(total) => `Total ${total} items`}
                    current={current}
                    onChange={(newPage, newPageSize) => {
                      setCurrent(newPage);
                      setPageSize(newPageSize);
                    }}
                    showSizeChanger={true}
                    showQuickJumper
                  />
                </div>
              </Col>
            </Card>
          </>
        ) : (
          <SearchByFallbackComponent
            title={"Search by Date Range"}
            subTitle={"Quickly search by Date Range to process the Terminate Repurchase Report"}
            image={searchByIcon}
          />
        )}
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default TerminateRepurchaseReport;
