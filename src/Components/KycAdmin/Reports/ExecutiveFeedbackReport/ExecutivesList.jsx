import {
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Spin,
  Table,
  Typography
} from "antd";
import React, { useEffect, useState } from "react";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import ExportBtn from "Components/Shared/ExportBtn";
import { DATEFORMAT, PermissionAction } from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  convertDateISODateFormat,
  disableFutureDates,
  safeString
} from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";
import searchByIcon from "Static/KYC_STATIC/img/search_by_calendar.svg";
import { SearchOutlined } from "@ant-design/icons";
import { Link, useSearchParams } from "react-router-dom";
import { KycAdminPaths } from "Router/KYCAdminPaths";
import dayjs from "dayjs";

const ExecutiveFeedbackReport = () => {
  // Query Params
  const [searchParams] = useSearchParams();
  const params = {
    start: searchParams.get("start") || null
  };

  const { apiService } = useServices();
  const [feedbackForm] = Form.useForm();
  const [show, setShow] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [filterData, setFilterData] = useState(null);
  const [rangeDate, setRangeDate] = useState(null);
  const [pagination, setPagination] = useState({
    pageSize: 10,
    showSizeChanger: true,
    showQuickJumper: true,
    pageSizeOptions: ["10", "20", "50", "100"],
    showTotal: (total, range) => `Total ${total} items`,
    onShowSizeChange: (current, size) => {
      setPagination((prevPagination) => ({ ...prevPagination, pageSize: size }));
    }
  });

  // column
  const columns = [
    {
      title: "Executive Name",
      dataIndex: "executive_name",
      key: "executive_name",
      sorter: (a, b) => safeString(a.executive_name).localeCompare(safeString(b.executive_name)),
      render: (username) => <Typography.Text type="secondary">{username}</Typography.Text>
    },
    {
      title: "Approved",
      dataIndex: "approved",
      key: "approved",
      sorter: (a, b) => Number(a.approved) - Number(b.approved),
      render: (active) => <Typography.Text type="secondary">{active}</Typography.Text>
    },
    {
      title: "Rejected",
      dataIndex: "rejected",
      key: "rejected",
      sorter: (a, b) => Number(a.rejected) - Number(b.rejected),
      render: (inactive) => <Typography.Text type="secondary">{inactive}</Typography.Text>
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      sorter: (a, b) => Number(a.total) - Number(b.total),
      render: (total) => <Typography.Text type="secondary">{total}</Typography.Text>
    },
    {
      title: "Action",
      dataIndex: "action",
      key: "action",
      skipColumn: true,
      render: (_, record) => (
        <Link
          to={`/${KycAdminPaths.executiveFeedback_ReportData}?id=${record?.executive_id}&name=${
            record?.executive_name
          }&start=${rangeDate.start}&end=${rangeDate.end}&record_type=${
            parseInt(record?.rejected || "0", 10) > 0 ? "rejected" : "approved"
          }`}>
          View
        </Link>
      )
    }
  ];

  // Api method
  const { mutate: getKycData, isLoading: loading } = useMutation(
    (data) => apiService.getExecutivesForFeedbacks(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          setFilterData(null);
          setDataSource(data?.data || []);
          setShow(true);
        }
      },
      onError: (error) => {
        setFilterData(null);
        setDataSource([]);
        setShow(false);
        console.log(error);
      }
    }
  );

  // validate value
  const handleSearchSubmit = () => {
    feedbackForm
      .validateFields()
      .then((value) => {
        let range = convertDateISODateFormat(value?.start_date);
        setRangeDate(range);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // submit form if range date is changed
  useEffect(() => {
    if (rangeDate) {
      feedbackForm.submit();
    }
  }, [rangeDate]);

  // handle search  Date range
  const handleSubmit = () => {
    try {
      if (rangeDate) {
        const data = {
          start_date: rangeDate.start,
          end_date: rangeDate?.end
        };
        // api call
        getKycData(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // set range picker valuye
  const handleDateChange = (value) => {
    feedbackForm.setFieldsValue({ start_date: value });
  };

  // style sheet
  const StyleSheet = {
    marginTop8: {
      marginTop: "8px"
    }
  };

  // handle Search
  const handleSearch = (value) => {
    try {
      //allowed keys for search
      const allowedKeys = ["executive_name", "approved", "rejected", "total"];
      const filterTable =
        dataSource.length > 0 &&
        dataSource.filter((o) =>
          Object.keys(o).some((k) => {
            // Check if the key matches any of the specified columns and if the value contains the search text
            if (
              allowedKeys.includes(k) &&
              String(o[k])?.toLowerCase().includes(String(value)?.toLowerCase())
            ) {
              return true;
            }

            return false;
          })
        );
      setFilterData(filterTable);
    } catch (error) {
      // Handle error
      console.log(error);
    }
  };

  // function to handle search on key down or backspace
  const handleKeyDown = (e) => {
    if (e.nativeEvent.inputType === "deleteContentBackward") {
      if (e.target?.value?.length === 0) {
        setFilterData(null);
      }
    }
  };

  useEffect(() => {
    // setting the already selected start date and display data
    if (params.start) {
      feedbackForm.setFieldsValue({ start_date: dayjs(params.start) });
      handleSearchSubmit(); // search with start date
    }
  }, []);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={loading}>
      <Row gutter={[20, 24]} style={StyleSheet.marginTop8}>
        <Col span={24}>
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              Executive Feedback
            </Typography.Title>
            <Typography.Text className="removeMargin">
              <Typography.Text type="secondary">KYC /</Typography.Text> Executive Feedback
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
            <Form form={feedbackForm} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                name="start_date"
                label={"Select Date"}
                rules={[{ required: true, message: "Please select a date" }]}
                className="removeMargin">
                <Flex align="center" gap={10}>
                  <DatePicker
                    size="large"
                    placeholder="Select date"
                    disabledDate={disableFutureDates}
                    className="fullWidth"
                    onChange={handleDateChange}
                    format={DATEFORMAT.RANGE_FORMAT}
                    defaultValue={params.start ? dayjs(params.start) : undefined}
                  />
                  <Button
                    size="large"
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={() => handleSearchSubmit()}>
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
              <Col span={24}>
                <Flex justify="space-between">
                  <ExportBtn
                    columns={columns}
                    fetchData={filterData != null ? filterData : dataSource}
                    fileName={"Executive-Feedback-Reports"}
                  />
                  <Input.Search
                    maxLength={50}
                    size="large"
                    placeholder="Search..."
                    onSearch={handleSearch}
                    allowClear
                    onInput={handleKeyDown}></Input.Search>
                </Flex>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Table
                  dataSource={filterData != null ? filterData : dataSource}
                  columns={columns}
                  bordered
                  scroll={{
                    x: "max-content"
                  }}
                  pagination={pagination}
                />
              </Col>
            </Card>
          </>
        ) : (
          <SearchByFallbackComponent
            title={"Search by Date"}
            subTitle={"Quickly Search by Date to process the Executive Feedback"}
            image={searchByIcon}
          />
        )}
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default ExecutiveFeedbackReport;
