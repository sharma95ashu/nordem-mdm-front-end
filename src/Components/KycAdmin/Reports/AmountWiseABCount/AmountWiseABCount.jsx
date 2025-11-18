import { SearchOutlined } from "@ant-design/icons";
import { Button, Card, Col, Flex, Form, Input, Row, Select, Spin, Table, Typography } from "antd";
import ExportBtn from "Components/Shared/ExportBtn";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { PermissionAction } from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  getFilteredMonths,
  removeKeysFromObject
} from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useEffect, useState } from "react";
import { useMutation, useQueries } from "react-query";
import searchByIcon from "Static/KYC_STATIC/img/search_by_calendar.svg";

const formKeys = {
  YEAR: "year",
  MONTH: "month"
};

const AmountWiseABCount = () => {
  const [dataSource, setDataSource] = useState([]);
  const [filterData, setFilterData] = useState(null);
  const [selectionList, setSelectionList] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const { apiService } = useServices();
  const [form] = Form.useForm();

  // column
  const tableColumns = [
    {
      title: "Sr. No.",
      dataIndex: "serial_number",
      key: "serial_number",
      width: 100,
      sorter: (a, b) => Number(a?.serial_number) - Number(b?.serial_number),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Range",
      dataIndex: "range",
      key: "range",
      sorter: (a, b) => Number(a?.serial_number) - Number(b?.serial_number),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Total Count AB",
      dataIndex: "total_count_ds",
      key: "total_count_ds",
      sorter: (a, b) => Number(a?.total_count_ds) - Number(b?.total_count_ds),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Total Amount",
      dataIndex: "total_amount",
      key: "total_amount",
      sorter: (a, b) => Number(a?.total_amount) - Number(b?.total_amount),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Total P.V.",
      dataIndex: "total_pv",
      key: "total_pv",
      sorter: (a, b) => Number(a?.total_pv) - Number(b?.total_pv),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    }
  ];

  // API CALL - fetching the year and month
  const [
    { data: yearsList, isLoading: isYearsLoading, isSuccess: isYearsSuccess },
    { data: monthsList, isLoading: isMonthsLoading, isSuccess: isMonthsSuccess }
  ] = useQueries([
    {
      queryKey: "yearsList",
      queryFn: () => apiService.getAvailableYearsforKYC(),
      enabled: true,
      select: (data) =>
        data?.success && data?.data
          ? data?.data?.map((e) => ({
              value: e.year,
              label: e.year
            }))
          : [],
      onError: (error) => {
        //
      }
    },
    {
      queryKey: "monthsList",
      queryFn: () => apiService.getAvailableMonthsforKYC(),
      enabled: true,
      select: (data) =>
        data?.success && data?.data
          ? data?.data?.map((e) => ({
              value: e.month,
              label: e.month_name
            }))
          : [],
      onError: (error) => {
        //
      }
    }
  ]);

  // this will set the dropdown option values...
  const handleSetSelectionList = () => {
    setSelectionList([
      {
        formKey: formKeys.YEAR,
        formLabel: "Select Year",
        options: yearsList
      },
      {
        formKey: formKeys.MONTH,
        formLabel: "Select Month",
        options: getFilteredMonths(form, monthsList) // this will return the filtered months based on year selected...
      }
    ]);
  };

  // This will be called when all YEARS, and MONTHS are fetched successfully!
  useEffect(() => {
    if (isYearsSuccess && isMonthsSuccess) {
      handleSetSelectionList();
    }
  }, [isYearsSuccess, isMonthsSuccess, yearsList, monthsList]);

  // trigged on select field selection
  const handleSelectionChange = (key) => {
    if (key === formKeys.YEAR) {
      handleSetSelectionList();
    }
  };

  // API CALL - fetching the list of associate buyers
  const { mutate: getABCountByAmountWiseReport, isLoading } = useMutation(
    ["get-ab-count-amount-wise"],
    (request) => apiService.getABCountByAmountWiseReport(request),
    {
      enabled: false,
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const updatedData = data?.data?.map((record, i) => {
            const modifiedResult = removeKeysFromObject(record, "index");
            return { serial_number: i + 1, ...modifiedResult };
          });

          setFilterData(null);
          setDataSource(updatedData);
          setShowTable(true); // show data
        }
      },
      onError: (error) => {
        setFilterData(null);
        setDataSource([]);
        setShowTable(false); // hide data
        console.log(error);
      }
    }
  );

  // fetch data on form submission
  const onFinish = (values) => {
    const { year, month } = values ?? {}; // de-structured form input values...

    if (!year || !month) return; // early return for safety...

    // making an api call to fetch data...
    getABCountByAmountWiseReport({
      fyear: year,
      month
    });
  };

  // handle table search
  const handleTableSearch = (value) => {
    try {
      //allowed keys for search
      const allowedKeys = ["range", "total_count_ds", "total_amount", "total_pv"];
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
    <Spin spinning={isLoading || isYearsLoading || isMonthsLoading}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Flex gap={12} vertical>
            <div></div>
            <Flex justify="space-between" vertical gap={8} className="fullWidth">
              <Typography.Title level={4} className="removeMargin">
                {"Amount Wise AB Count"}
              </Typography.Title>
              <Typography.Text style={StyleSheet.fontSize14} className="removeMargin">
                <Typography.Text type="secondary">{"Reports /"}</Typography.Text>{" "}
                {"Amount Wise AB Count"}
              </Typography.Text>
            </Flex>
          </Flex>
        </Col>
        <Col span={24}>
          <Card>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Row gutter={[24, 24]}>
                <Col span={21}>
                  {/* Options */}
                  <Flex gap={24}>
                    {selectionList.length > 0 &&
                      selectionList.map((item) => {
                        return (
                          <Form.Item
                            key={item.formKey}
                            name={item.formKey}
                            className="margin-bottom-0 flex-1"
                            label={item.formLabel}
                            rules={[{ required: true, message: "Field Selection is Required" }]}>
                            <Select
                              size="large"
                              placeholder={item.formLabel}
                              options={item?.options || []}
                              onChange={() => handleSelectionChange(item.formKey)}
                            />
                          </Form.Item>
                        );
                      })}
                  </Flex>
                </Col>
                <Col span={3}>
                  {/* Search */}
                  <Button
                    htmlType="submit"
                    type="primary"
                    size="large"
                    className="margin-top-28 fullWidth"
                    icon={<SearchOutlined />}>
                    Search
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>
        <Col span={24}>
          {showTable ? (
            <Card>
              <Flex justify="space-between">
                <ExportBtn
                  columns={tableColumns}
                  fetchData={dataSource}
                  fileName={"amount-wise-ab-count"}
                />
                <Input.Search
                  size="large"
                  allowClear
                  maxLength={50}
                  placeholder="Search..."
                  onSearch={handleTableSearch}
                  onInput={handleKeyDown}></Input.Search>
              </Flex>
              <Table
                dataSource={filterData != null ? filterData : dataSource}
                columns={tableColumns}
                bordered
                scroll={{
                  x: "max-content"
                }}
                pagination={false}
              />
            </Card>
          ) : (
            <SearchByFallbackComponent
              title={"Search by Date & Month"}
              subTitle={"Quickly search by Year & Month to process the Amount Wise AB Count"}
              image={searchByIcon}
            />
          )}
        </Col>
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default AmountWiseABCount;
