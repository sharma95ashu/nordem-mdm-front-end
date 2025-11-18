import { CheckCircleOutlined, CloseCircleOutlined, SearchOutlined } from "@ant-design/icons";
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
  Tag,
  Typography
} from "antd";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { DATEFORMAT, PermissionAction, snackBarErrorConf } from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  convertRangeISODateFormat,
  disableFutureDates,
  getAntTimeFormat,
  getDateTimeFormat,
  safeString
} from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";
import searchByIcon from "Static/KYC_STATIC/img/search_by_calendar.svg";

const MonthlyMeeting = () => {
  const [show, setShow] = useState(false);
  const { apiService } = useServices();
  const [monthlyMeetingForm] = Form.useForm();
  const [dataSource, setDataSource] = useState([]);
  const [rangeDate, setRangeDate] = useState(null);

  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchEnable, setISearchEnable] = useState(false);

  // api method
  const { mutate: getMonthlyMeetingData, isLoading: loadingMonthlyMeetingData } = useMutation(
    (data) => apiService.listMonthlyMeetingReport(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success) {
          // adding serial number to each record
          const updatedData = data?.data.map((item, index) => {
            return {
              serial_number: index + 1,
              ...item,
              start_date: getDateTimeFormat(item.start_date, "DD MMMM, YYYY"), // Format the start_date
              time: getAntTimeFormat(item.time) // Format the time
            };
          });

          // updating variable states
          setTotal(data?.totalCount);
          setDataSource(updatedData || []);
          setShow(true);

          if (updatedData?.length === 0) {
            enqueueSnackbar("No Monthly Meetings Found", snackBarErrorConf);
          }
        }
      },
      onError: (error) => {
        setDataSource([]);
        setShow(false);
        console.log(error);
        setTotal(0);
      }
    }
  );

  // validate form on submit
  const handleSearchSubmit = () => {
    // validate value
    monthlyMeetingForm
      .validateFields()
      .then((value) => {
        let range = convertRangeISODateFormat(value?.date);
        setISearchEnable(false);
        setSearchValue("");
        setRangeDate(range);
        monthlyMeetingForm.submit();
      })
      .catch((error) => {
        console.log(error);
      });
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
        current == 1 ? getMonthlyMeetingData(data) : setCurrent(1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // set range picker value
  const handleDateChange = (value) => {
    monthlyMeetingForm.setFieldsValue({ date: value });
  };

  // column
  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "serial_number",
      key: "serial_number",
      sorter: (a, b) => Number(a.serial_number) - Number(b.serial_number),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Associate Buyer Number",
      dataIndex: "associate_buyer_number",
      key: "associate_buyer_number",
      sorter: (a, b) => Number(a.associate_buyer_number) - Number(b.associate_buyer_number),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Start Date",
      dataIndex: "start_date",
      key: "start_date",
      sorter: (a, b) => safeString(a?.start_date).localeCompare(safeString(b?.start_date)),
      render: (start_date) => <Typography.Text type="secondary">{start_date}</Typography.Text>
    },
    {
      title: "Venue",
      dataIndex: "venue",
      key: "venue",
      sorter: (a, b) => safeString(a?.venue).localeCompare(safeString(b?.venue)),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      sorter: (a, b) => safeString(a?.city).localeCompare(safeString(b?.city)),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
      sorter: (a, b) => safeString(a?.district).localeCompare(safeString(b?.district)),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      sorter: (a, b) => safeString(a?.state).localeCompare(safeString(b?.state)),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Time",
      dataIndex: "time",
      key: "time",
      sorter: (a, b) => safeString(a?.time).localeCompare(safeString(b?.time)),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Mobile No. 1",
      dataIndex: "mobile_no_1",
      key: "mobile_no_1",
      sorter: (a, b) => Number(a.mobile_no_1) - Number(b.mobile_no_1),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Mobile No. 2",
      dataIndex: "mobile_no_2",
      key: "mobile_no_2",
      sorter: (a, b) => Number(a.mobile_no_2) - Number(b.mobile_no_2),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Visiting Leader",
      dataIndex: "visiting_leader",
      key: "visiting_leader",
      sorter: (a, b) =>
        safeString(a?.visiting_leader).localeCompare(safeString(b?.visiting_leader)),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      sorter: (a, b) => safeString(a?.type).localeCompare(safeString(b?.type)),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "PUC Code",
      dataIndex: "puc_code",
      key: "puc_code",
      sorter: (a, b) => Number(a.puc_code) - Number(b.puc_code),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Leader Name",
      dataIndex: "leader_name",
      key: "leader_name",
      sorter: (a, b) => safeString(a?.leader_name).localeCompare(safeString(b?.leader_name)),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Pin Description",
      dataIndex: "pin_description",
      key: "pin_description",
      sorter: (a, b) =>
        safeString(a?.pin_description).localeCompare(safeString(b?.pin_description)),
      render: (text) => text && <Tag bordered={true}>{text}</Tag>
    },
    {
      title: "Status",
      dataIndex: "approved",
      key: "approved",
      fixed: "right",
      sorter: (a, b) => safeString(a?.approved).localeCompare(safeString(b?.approved)),
      render: (text) => {
        const iSApproved = text === "approved";
        return (
          <Tag
            bordered={true}
            icon={iSApproved ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            color={iSApproved ? "success" : "error"}
            className="textCapitalize">
            {text}
          </Tag>
        );
      }
    }
  ];

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
          current == 1 ? getMonthlyMeetingData(data) : setCurrent(1);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle Search
  const handleSearch = (values) => {
    try {
      const trimmedValue = values?.trim();

      if (!trimmedValue) return;
      setSearchValue(values);
      if (rangeDate) {
        const data = {
          start_date: rangeDate.start,
          end_date: rangeDate?.end,
          page: current - 1,
          pageSize: pageSize,
          searchTerm: values
        };
        current == 1 ? getMonthlyMeetingData(data) : setCurrent(1);
        setISearchEnable(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // function to handle search on key down or backspace
  const handleKeyDown = (e) => {
    if (e.nativeEvent.inputType === "deleteContentBackward") {
      if (e.target?.value?.length === 0) {
      }
    }
  };

  const StyleSheet = {
    marginTop8: {
      marginTop: "8px"
    }
  };

  useEffect(() => {
    if (rangeDate) {
      const data = {
        start_date: rangeDate?.start,
        end_date: rangeDate?.end,
        page: current - 1,
        pageSize: pageSize,
        ...(searchValue && { searchTerm: searchValue })
      };
      getMonthlyMeetingData(data);
    }
  }, [current, pageSize]);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={loadingMonthlyMeetingData}>
      <Row gutter={[20, 24]} style={StyleSheet.marginTop8}>
        <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
          <Flex vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              Monthly Meetings Report
            </Typography.Title>

            <Typography.Text className="removeMargin">
              <Typography.Text type="secondary">Lists /</Typography.Text> Download Monthly Meetings
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
              name="form_monthly_meeting"
              form={monthlyMeetingForm}
              layout="vertical"
              onFinish={handleSubmit}>
              <Form.Item
                name="date"
                label={"Date Range"}
                required
                className="removeMargin"
                rules={[
                  {
                    required: true,
                    message: "Please select a date range!"
                  }
                ]}>
                <Flex justify="space-between" gap={10}>
                  <DatePicker.RangePicker
                    size="large"
                    className="fullWidth"
                    disabledDate={disableFutureDates}
                    format={DATEFORMAT.RANGE_FORMAT}
                    onChange={handleDateChange}
                  />

                  <Button
                    type="primary"
                    size="large"
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
                    fileName={"monthly-meeting"}
                    isLandscape={true}
                  /> */}
                  <Row gutter={[12]} className="fullWidth marginBottom16">
                    <Col xs={24} md={12}></Col>
                    <Col xs={24} md={12}>
                      <Input.Search
                        size="large"
                        allowClear
                        maxLength={50}
                        placeholder="Search by Associate Buyer Number, City, Venue, Leader Name, State, District or Phone Number"
                        onSearch={handleSearch}
                        onChange={handleChange}
                        onInput={handleKeyDown}></Input.Search>
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
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
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
            subTitle={"Quickly search by Date Range to process the Monthly Meetings Report"}
            image={searchByIcon}
          />
        )}
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default MonthlyMeeting;
