import { SearchOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Flex,
  Form,
  Grid,
  Input,
  Row,
  Select,
  Spin,
  Table,
  Typography
} from "antd";
import ExportBtn from "Components/Shared/ExportBtn";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { DATEFORMAT, PermissionAction } from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  convertRangeISODateFormat,
  disableDatesBefore,
  disableFutureDates,
  isDesktopScreen,
  safeString
} from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { Link } from "react-router-dom";
import { KycAdminPaths } from "Router/KYCAdminPaths";

const EKYC = () => {
  const { useBreakpoint } = Grid;
  const screens = useBreakpoint();

  const [eKycTypeOptions, setEKycTypeOptions] = useState([]);
  const [show, setShow] = useState(false);
  const [dataSource, setDataSource] = useState([]);
  const [filteredData, setFilteredData] = useState(dataSource);
  const [optionLabel, setOptionValue] = useState(null);
  const [optionKey ,setOptionKey]=useState(null);

  const [ekycForm] = Form.useForm();
  const [searchValue, setSearchValue] = useState("");
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

  const { apiService } = useServices();

  // Table Columns
  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "serial_number",
      key: "serial_number",
      sorter: (a, b) => Number(a.serial_number) - Number(b.serial_number),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Join Date",
      dataIndex: "join_date",
      key: "join_date",
      sorter: (a, b) => new Date(a.join_date) - new Date(b.join_date),
      render: (join_date) => <Typography.Text type="secondary">{join_date || "-"}</Typography.Text>
    },
    {
      title: "Associate Buyer No.",
      dataIndex: "associate_buyer_no",
      key: "associate_buyer_no",
      sorter: (a, b) =>
        safeString(a.associate_buyer_no).localeCompare(safeString(b.associate_buyer_no)),
      render: (text, record) => {
        // Define links per ekycType
        const linkMap = {
          "e_registration": `/${KycAdminPaths.kycNewEntry}?ab_number=${record.associate_buyer_no}`,
          "e_registration_edit": `/${KycAdminPaths.kycNewEntry}?ab_number=${record.associate_buyer_no}`,
          "old_kyc": `/${KycAdminPaths.kycOldEntry}?ab_number=${record.associate_buyer_no}`,
          "not_ok_kyc`s_tonight": `/${KycAdminPaths.kycNewEntry}?ab_number=${record.associate_buyer_no}`
        };

        const targetLink = linkMap[optionKey];

        return targetLink ? (
          <Link to={targetLink} className="underline">
            {text}
          </Link>
        ) : (
          <Typography.Text type="secondary">{text || "-"}</Typography.Text>
        );
      }

    },
    {
      title: "Associate Buyer Name",
      dataIndex: "associate_buyer_name",
      key: "associate_buyer_name",
      width: 500,
      sorter: (a, b) =>
        safeString(a.associate_buyer_name).localeCompare(safeString(b.associate_buyer_name)),
      render: (associate_buyer_name) => (
        <Typography.Text type="secondary">{associate_buyer_name || "-"}</Typography.Text>
      )
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      render: (username) => <Typography.Text type="secondary">{username || "-"}</Typography.Text>
    }
  ];

  const handleChange = (_, data) => {
    setOptionValue(data?.label);
    setOptionKey(data?.value);
    setSearchValue("");   
    setFilteredData(null); 
  };

  // this will disable the dates in the date picker
  const disabledDates = (current) => {
    return disableFutureDates(current) || disableDatesBefore(current, "2018-10-31");
  };

  // function triggerd on click of search button
  const handleSubmit = (values) => {
    const { date, ekycType } = values;
    const { start, end } = convertRangeISODateFormat(date);
    let request = {
      list_slug: ekycType,
      start_date: start,
      end_date: end
    };
    getEkycListByTypeMutate(request);
  };

  // function to handle search on the table
  const handleSearch = (value) => {
    try {
      //allowed keys for search
      const allowedKeys = ["associate_buyer_no", "associate_buyer_name", "username"];
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
      setFilteredData(filterTable);
    } catch (error) {
      // Handle error
      console.log(error);
    }
  };

  // function to handle search on key down or backspace
  const handleKeyDown = (e) => {
    if (e.nativeEvent.inputType === "deleteContentBackward") {
      if (e.target?.value?.length === 0) {
        setFilteredData(null);
      }
    }
  };

  // ----- GET DROPDOWN LIST - API CALL -----
  const { isLoading: kycOptionsLoading } = useQuery(
    "getEKycTypeList",
    () => apiService.getEkycListDropdown(),
    {
      enabled: true,
      onSuccess: ({ data, success }) => {
        if (success) {
          setEKycTypeOptions(data); // adding dropdowns to the state
        }
      },
      onError: (error) => {
        console.error(error);
      }
    }
  );

  // ----- GET EKYC List By Type - API MUTATION -----
  const { mutate: getEkycListByTypeMutate, isLoading: kycListDataLoading } = useMutation(
    (request) => apiService.getEkycListByType(request),
    {
      // Update confirmation
      onSuccess: ({ data, success }) => {
        if (success) {
          setFilteredData(null);
          if (Array.isArray(data)) {
            let result = data.map((record, index) => {
              return { serial_number: index + 1, ...record };
            });
            setDataSource(result || []); // set records
            setShow(true);
          }
        }
      },
      onError: () => {
        setDataSource([]); // clear records
        setShow(false); // hide data
      }
    }
  );
console.log(dataSource,"dataSourceeeeeeeeeeeee");

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={kycOptionsLoading || kycListDataLoading}>
      <Row gutter={[20, 24]}>
        <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
          <Flex justify="space-between" vertical>
            <Typography.Title level={4} className="removeMargin">
              Download KYC Data For Checklist
            </Typography.Title>
            <Typography.Text className="removeMargin">Lists / E-KYC List</Typography.Text>
          </Flex>
        </Col>
        <Card className="fullWidth">
          <Form name="search_form" form={ekycForm} onFinish={handleSubmit} layout="vertical">
            <Flex
              justify="space-between"
              gap={24}
              align="center"
              {...(!isDesktopScreen(screens) && { vertical: "true" })}>
              <Row gutter={[24, 24]} className="fullWidth">
                <Col xs={24} sm={12}>
                  {/* Dropdown Options */}
                  <Form.Item
                    name="ekycType"
                    label={"Type"}
                    className="removeMargin"
                    rules={[
                      {
                        required: true,
                        message: "Please choose the type"
                      }
                    ]}>
                    <Select
                      placeholder="Select Type"
                      options={eKycTypeOptions}
                      size="large"
                      disabled={eKycTypeOptions?.length === 0}
                      onChange={handleChange}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  {/* Date Range */}
                  <Form.Item
                    name="date"
                    label={"Date Range"}
                    className="removeMargin"
                    rules={[
                      {
                        required: true,
                        message: "Please select dates"
                      }
                    ]}>
                    <DatePicker.RangePicker
                      size="large"
                      className="fullWidth"
                      disabledDate={disabledDates}
                      format={DATEFORMAT.RANGE_FORMAT}
                    />
                  </Form.Item>
                </Col>
              </Row>
              {/* Search */}
              <Button
                htmlType="submit"
                icon={<SearchOutlined />}
                type="primary"
                size="large"
                className="margin-top-30">
                Search
              </Button>
            </Flex>
          </Form>
        </Card>

        {/* Alert for Re-KYC */}

        {!show && (
          <Alert
            className="bordered__info__alert fullWidth"
            message={
              "Only those KYC submissions are displayed here which were filled out till yesterday. ( i.e, completed at least 24 hours since submission)"
            }
            type="info"
            showIcon
          />
        )}

        {show ? (
          <>
            <Card className="fullWidth">
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Flex justify="space-between">
                  <ExportBtn
                    columns={columns}
                    fetchData={filteredData != null ? filteredData : dataSource}
                    fileName={`${optionLabel}-List`}
                  />
                  <Input.Search
                    allowClear
                    className="marginBottom16"
                    size="large"
                    maxLength={50}
                    onSearch={handleSearch}
                    onChange={(e) => setSearchValue(e.target.value)}
                    value={searchValue}
                    onInput={handleKeyDown}
                    placeholder="Search by Associate Buyer Number or Name..."></Input.Search>
                </Flex>
              </Col>
              <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
                <Table
                  dataSource={filteredData != null ? filteredData : dataSource}
                  pagination={pagination}
                  scroll={{
                    x: "max-content"
                  }}
                  columns={columns}
                  bordered={true}
                />
              </Col>
              <Col span={24}></Col>
            </Card>
          </>
        ) : (
          <SearchByFallbackComponent
            title={"Search by Type"}
            subTitle={"Quickly search by Type to Download the Report of KYC Data For Checklist"}
          />
        )}
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default EKYC;
