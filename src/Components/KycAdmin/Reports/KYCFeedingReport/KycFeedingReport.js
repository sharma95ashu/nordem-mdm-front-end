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
import React, { useState } from "react";
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

const KycFeedingReport = () => {
  const { apiService } = useServices();
  const [kycFeedingform] = Form.useForm();
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
      title: "User Name",
      dataIndex: "username",
      key: "username",
      sorter: (a, b) => safeString(a.username).localeCompare(safeString(b.username)),
      render: (username) => <Typography.Text type="secondary">{username}</Typography.Text>
    },
    {
      title: "Active",
      dataIndex: "active",
      key: "active",
      sorter: (a, b) => Number(a.active) - Number(b.active),
      render: (active) => <Typography.Text type="secondary">{active}</Typography.Text>
    },
    {
      title: "Inactive",
      dataIndex: "inactive",
      key: "inactive",
      sorter: (a, b) => Number(a.inactive) - Number(b.inactive),
      render: (inactive) => <Typography.Text type="secondary">{inactive}</Typography.Text>
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      sorter: (a, b) => Number(a.total) - Number(b.total),
      render: (total) => <Typography.Text type="secondary">{total}</Typography.Text>
    }
  ];

  // Api method
  const { mutate: getKycFeedingData, isLoading: loadingKycFeeding } = useMutation(
    (data) => apiService.getKycFeeding(data),
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
    kycFeedingform
      .validateFields()
      .then((value) => {
        let range = convertDateISODateFormat(value?.start_date);
        setRangeDate(range);
        kycFeedingform.submit();
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
          end_date: rangeDate?.end
        };
        // api call
        getKycFeedingData(data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // set range picker valuye
  const handleDateChange = (value) => {
    kycFeedingform.setFieldsValue({ start_date: value });
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
      const allowedKeys = ["username"];
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

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={loadingKycFeeding}>
      <Row gutter={[20, 24]} style={StyleSheet.marginTop8}>
        <Col span={24}>
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              KYC Feeding Report
            </Typography.Title>
            <Typography.Text className="removeMargin">
              <Typography.Text type="secondary">Reports /</Typography.Text> KYC Feeding Report
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
              name="search_form_kyc_feeding_user"
              form={kycFeedingform}
              layout="vertical"
              onFinish={handleSubmit}>
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
                    fileName={"kyc-feeding-report"}
                  />

                  <Input.Search
                    maxLength={50}
                    size="large"
                    placeholder="Search by Username"
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
            subTitle={"Quickly search by Start Date to process the KYC Feeding Report"}
            image={searchByIcon}
          />
        )}
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default KycFeedingReport;
