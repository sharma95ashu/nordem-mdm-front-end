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
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
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

const KycNotOk = () => {
  const { apiService } = useServices();
  const [kycNotOkform] = Form.useForm();
  const [show, setShow] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchEnable, setISearchEnable] = useState(false);
  const [rangeDate, setRangeDate] = useState(null);

  // column
  const columns = [
    {
      title: "Associate Buyer Number",
      dataIndex: "associate_buyer_number",
      key: "associate_buyer_number",
      sorter: (a, b) =>
        safeString(a?.associate_buyer_number).localeCompare(safeString(b?.associate_buyer_number)),
      render: (ab_no) => <Typography.Text type="secondary">{ab_no}</Typography.Text>
    },
    {
      title: "Associate Buyer Name",
      dataIndex: "associate_buyer_name",
      key: "associate_buyer_name",
      sorter: (a, b) =>
        safeString(a?.associate_buyer_name).localeCompare(safeString(b?.associate_buyer_name)),
      render: (ab_name) => <Typography.Text type="secondary">{ab_name}</Typography.Text>
    },
    {
      title: "AB Mobile No.",
      dataIndex: "AB_mobile_no",
      key: "AB_mobile_no",
      sorter: (a, b) => safeString(a?.AB_mobile_no).localeCompare(safeString(b?.AB_mobile_no)),
      render: (ab_mobile) => <Typography.Text type="secondary">{ab_mobile}</Typography.Text>
    },
    {
      title: "Proposer No.",
      dataIndex: "proposer_no",
      key: "proposer_no",
      sorter: (a, b) => safeString(a?.proposer_no).localeCompare(safeString(b?.proposer_no)),
      render: (proposer) => <Typography.Text type="secondary">{proposer}</Typography.Text>
    },
    {
      title: "Proposer Name",
      dataIndex: "proposer_name",
      key: "proposer_name",
      sorter: (a, b) => safeString(a?.proposer_name).localeCompare(safeString(b?.proposer_name)),
      render: (proposer_name) => (
        <Tooltip title={proposer_name}>
          <Typography.Text type="secondary">{proposer_name}</Typography.Text>
        </Tooltip>
      )
    },
    {
      title: "Proposer Mobile No.",
      dataIndex: "proposer_mobile_no",
      key: "proposer_mobile_no",
      sorter: (a, b) =>
        safeString(a?.proposer_mobile_no).localeCompare(safeString(b?.proposer_mobile_no)),
      render: (proposer_mobile) => (
        <Typography.Text type="secondary">{proposer_mobile}</Typography.Text>
      )
    },
    {
      title: "KYC Desc",
      dataIndex: "kyc_desc",
      key: "kyc_desc",
      render: (kyc_desc) => (
        <Typography.Text type="secondary">
          {kyc_desc?.length > 0 && kyc_desc?.join(", ")}
        </Typography.Text>
      )
    },
    {
      title: "Remark",
      dataIndex: "remark",
      key: "remark",
      width: 350,
      fixed: "right",
      sorter: (a, b) => safeString(a?.remark).localeCompare(safeString(b?.remark)),
      render: (description) => (
        <Tooltip title={description}>
          <Typography.Text type="secondary">{description}</Typography.Text>
        </Tooltip>
      )
    }
  ];

  // Api method
  const { mutate: getKycReportData, isLoading: loadingDeclareReport } = useMutation(
    (data) => apiService.kycNotOKReport(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success) {
          setTotal(data?.totalCount);
          setDataSource(data?.data || []);
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

  // handle search click

  useEffect(() => {
    if (rangeDate) {
      const data = {
        start_date: rangeDate.start,
        end_date: rangeDate?.end,
        page: current - 1,
        pageSize: pageSize,
        ...(searchValue && { searchTerm: searchValue })
      };
      // api call
      getKycReportData(data);
    }
  }, [current, pageSize]);

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
        // api call
        current == 1 ? getKycReportData(data) : setCurrent(1);
        setISearchEnable(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

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
          current == 1 ? getKycReportData(data) : setCurrent(1);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  // validate value
  const handleSearchSubmit = () => {
    kycNotOkform
      .validateFields()
      .then((value) => {
        let range = convertDateISODateFormat(value?.start_date);
        setISearchEnable(false);
        setSearchValue("");
        setRangeDate(range);
        kycNotOkform.submit();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // handle search  Date range
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
        current == 1 ? getKycReportData(data) : setCurrent(1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // set range picker value
  const handleDateChange = (value) => {
    kycNotOkform.setFieldsValue({ start_date: value });
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
        <Col span={24}>
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              KYC Not OK Report
            </Typography.Title>
            <Typography.Text className="removeMargin">
              <Typography.Text type="secondary">Reports /</Typography.Text> KYC Not OK Report
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
              name="search_form_kyc_not_ok"
              form={kycNotOkform}
              layout="vertical"
              onFinish={handleSubmit}>
              <Form.Item
                name="start_date"
                label={"Start Date"}
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
                  {/* <ExportBtn
                    columns={columns}
                    fetchData={dataSource}
                    fileName={"kyc-not-ok-report"}
                  /> */}
                  <Row gutter={[12]} className="fullWidth marginBottom16">
                    <Col xs={24} md={12}></Col>
                    <Col xs={24} md={12}>
                      <Input.Search
                        maxLength={50}
                        onSearch={handleSearch}
                        onChange={handleChange}
                        value={searchValue}
                        allowClear
                        size="large"
                        placeholder="Search by AB Number, AB Name , Mobile Number, Proposer Number, Proposer Name..."
                      />
                    </Col>
                  </Row>
                </Flex>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Table
                  dataSource={dataSource}
                  columns={columns}
                  bordered
                  scroll={{
                    x: "max-content"
                  }}
                  pagination={false}
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
            title={"Search by Date "}
            subTitle={"Quickly search by Start Date to process the KYC Not OK Report"}
            image={searchByIcon}
          />
        )}
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default KycNotOk;
