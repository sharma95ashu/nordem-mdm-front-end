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
  Tooltip,
  Typography
} from "antd";
import React, { useEffect, useState } from "react";
import { SearchOutlined } from "@ant-design/icons";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { useMutation } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import {
  actionsPermissionValidator,
  convertRangeISODateFormat,
  disableFutureDates,
  getDateTimeFormat,
  safeString,
  statusTag,
  StringTruncate
} from "Helpers/ats.helper";
import { abNoMaxLength, DATEFORMAT, PermissionAction } from "Helpers/ats.constants";
import searchByIcon from "Static/KYC_STATIC/img/search_by_calendar.svg";

const KycDetailReport = () => {
  const { apiService } = useServices();
  const [kycDetailForm] = Form.useForm();
  const [rangeDate, setRangeDate] = useState(null);
  const [show, setShow] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchEnable, setISearchEnable] = useState(false);

  // columns
  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "sr_no",
      key: "sr_no",
      render: (sr_no) => <Typography.Text type="secondary">{sr_no}</Typography.Text>
    },
    {
      title: "Join Date & Time",
      dataIndex: "join_date",
      key: "join_date",
      sorter: (a, b) => new Date(a.join_date) - new Date(b.join_date),
      render: (join_date) => (
        <Typography.Text type="secondary">
          {getDateTimeFormat(join_date, "YYYY/MM/DD hh:mm A")}
        </Typography.Text>
      )
    },
    {
      title: "Associate Buyer No.",
      dataIndex: "associate_buyer_no",
      key: "associate_buyer_no",
      sorter: (a, b) =>
        safeString(a.associate_buyer_no).localeCompare(safeString(b.associate_buyer_no)),
      render: (associate_buyer_no) => (
        <Typography.Text type="secondary">{associate_buyer_no}</Typography.Text>
      )
    },
    {
      title: "AB Name",
      dataIndex: "ab_name",
      key: "ab_name",
      sorter: (a, b) => safeString(a?.ab_name).localeCompare(safeString(b?.ab_name)),
      render: (ab_name) => (
        <Tooltip title={ab_name}>
          <Typography.Text type="secondary">{StringTruncate(ab_name, 20)}</Typography.Text>
        </Tooltip>
      )
    },
    {
      title: "KYC Status",
      dataIndex: "kyc_status",
      key: "kyc_status",
      sorter: (a, b) => safeString(a?.kyc_status).localeCompare(safeString(b?.kyc_status)),
      render: (kyc_status) => (
        <Typography.Text type="secondary">{statusTag(kyc_status)}</Typography.Text>
      )
    },
    {
      title: "KYC Date",
      dataIndex: "kyc_date",
      key: "kyc_date",
      sorter: (a, b) => new Date(a.kyc_date) - new Date(b.kyc_date),
      render: (kyc_date) => (
        <Typography.Text type="secondary">
          {kyc_date ? getDateTimeFormat(kyc_date, "YYYY/MM/DD hh:mm A") : "-"}
        </Typography.Text>
      )
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      sorter: (a, b) => safeString(a?.city).localeCompare(safeString(b?.city)),
      render: (city) => (
        <Tooltip title={city}>
          <Typography.Text type="secondary">{StringTruncate(city, 20)}</Typography.Text>
        </Tooltip>
      )
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
      sorter: (a, b) => safeString(a?.district).localeCompare(safeString(b?.district)),
      render: (district) => (
        <Tooltip title={district}>
          <Typography.Text type="secondary">{StringTruncate(district, 20)}</Typography.Text>
        </Tooltip>
      )
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      sorter: (a, b) => safeString(a?.state).localeCompare(safeString(b?.state)),
      render: (state) => (
        <Tooltip title={state}>
          <Typography.Text type="secondary">{StringTruncate(state, 20)}</Typography.Text>
        </Tooltip>
      )
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
          current == 1 ? getDeclarationReportData(data) : setCurrent(1);
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
      setSearchValue(values);
      if (rangeDate) {
        const data = {
          start_date: rangeDate.start,
          end_date: rangeDate?.end,
          page: current - 1,
          pageSize: pageSize,
          searchTerm: values
        };
        current == 1 ? getDeclarationReportData(data) : setCurrent(1);
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
        current == 1 ? getDeclarationReportData(data) : setCurrent(1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // validate value
  const handleSearchSubmit = () => {
    kycDetailForm
      .validateFields()
      .then((value) => {
        let range = convertRangeISODateFormat(value?.date);
        setISearchEnable(false);
        setSearchValue("");
        setRangeDate(range);
        kycDetailForm.submit();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // api call
  const { mutate: getDeclarationReportData, isLoading: loadingDeclareReport } = useMutation(
    (data) => apiService.kycDetailsReport(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success) {
          const updatedData =
            data?.data?.length > 0 &&
            data?.data.map((item, index) => {
              return {
                sr_no: index + 1, // Add sr_no starting from 1
                ...item,
                join_date: item?.join_date
                  ? getDateTimeFormat(item.join_date, "YYYY/MM/DD hh:mm A")
                  : "-" // Format join_date
              };
            });

          setTotal(data?.totalCount);
          setDataSource(updatedData || []);
          setShow(true);
        }
      },
      onError: (error) => {
        setTotal(0);
        setDataSource([]);
        setShow(false);
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
      getDeclarationReportData(data);
    }
  }, [current, pageSize]);

  // set range picker value
  const handleDateChange = (value) => {
    kycDetailForm.setFieldsValue({ date: value });
  };

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
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              KYC Detail Report
            </Typography.Title>
            <Typography.Text className="removeMargin">
              <Typography.Text type="secondary">Reports /</Typography.Text> KYC Detail Report
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
              name="search_form_kyc_detail_report"
              form={kycDetailForm}
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
                className="removeMargin ">
                <Flex align="center" gap={10}>
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
                <Flex justify="end">
                  <div style={{ width: "50%" }}>
                    <Input.Search
                      className="marginBottom16"
                      maxLength={abNoMaxLength}
                      size="large"
                      onSearch={handleSearch}
                      onChange={handleChange}
                      allowClear
                      value={searchValue}
                      placeholder="Search by Associate Buyer Number, KYC Status"></Input.Search>
                  </div>
                </Flex>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Table
                  dataSource={dataSource}
                  columns={columns}
                  bordered={true}
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
            subTitle={"Quickly search by Date Range to process the KYC Detail Report"}
            image={searchByIcon}
          />
        )}
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default KycDetailReport;
