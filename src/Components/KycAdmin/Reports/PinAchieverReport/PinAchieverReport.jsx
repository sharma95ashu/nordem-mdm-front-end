import { Card, Col, Flex, Input, Pagination, Row, Spin, Table, Tag, Typography } from "antd";
// import ExportBtn from "Components/Shared/ExportBtn";
import { PermissionAction } from "Helpers/ats.constants";
import { actionsPermissionValidator, getRankColor, safeString } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";

const PinAchieverReport = () => {
  const [pageSize, setPageSize] = useState(10);
  const [dataSource, setDataSource] = useState([]);
  // const [exportSheetData, setExportSheetData] = useState([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchEnable, setISearchEnable] = useState(false);

  const { apiService } = useServices();

  // column
  const tableColumns = [
    {
      title: "Sr. No.",
      dataIndex: "sr_no",
      key: "sr_no",
      sorter: (a, b) => Number(a.sr_no) - Number(b.sr_no),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "AB No.",
      dataIndex: "ab_no",
      key: "ab_no",
      sorter: (a, b) => Number(a.ab_no) - Number(b.ab_no),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "AB Name",
      dataIndex: "ab_name",
      key: "ab_name",
      sorter: (a, b) => safeString(a?.ab_name).localeCompare(safeString(b?.ab_name)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Mobile  No.",
      dataIndex: "mobile_no",
      key: "mobile_no",
      sorter: (a, b) => Number(a.mobile_no) - Number(b.mobile_no),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Highest Pin",
      dataIndex: "highest_pin",
      key: "highest_pin",
      sorter: (a, b) => Number(a.highest_pin_code || 0) - Number(b.highest_pin_code || 0),
      render: (text) =>
        text != null ? (
          <Tag bordered={true} color={getRankColor(text)}>
            {text}
          </Tag>
        ) : (
          "-"
        )
    },
    {
      title: "Current Pin",
      dataIndex: "current_pin",
      key: "current_pin",
      sorter: (a, b) => Number(a.current_pin_code || 0) - Number(b.current_pin_code || 0),
      render: (text) =>
        text != null ? (
          <Tag bordered={true} color={getRankColor(text)}>
            {text}
          </Tag>
        ) : (
          "-"
        )
    },
    {
      title: "Join Date",
      dataIndex: "join_date",
      key: "join_date",
      sorter: (a, b) => new Date(a?.join_date)?.getTime() - new Date(b?.join_date)?.getTime(),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "State",
      dataIndex: "state",
      key: "state",
      sorter: (a, b) => safeString(a?.state).localeCompare(safeString(b?.state)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "City",
      dataIndex: "city",
      key: "city",
      sorter: (a, b) => Number(a.city) - Number(b.city),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "District",
      dataIndex: "district",
      key: "district",
      sorter: (a, b) => Number(a.district) - Number(b.district),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Address",
      dataIndex: "address_line",
      key: "address_line",
      sorter: (a, b) => safeString(a?.address_line).localeCompare(safeString(b?.address_line)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "D.O.B",
      dataIndex: "dob",
      key: "dob",
      sorter: (a, b) => new Date(a?.dob)?.getTime() - new Date(b?.dob)?.getTime(),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Email Id",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => safeString(a?.email).localeCompare(safeString(b?.email)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    }
  ];

  // API CALL - fetching the list of PIN Achievers on page load...
  const { mutate: getPinAchieverReportMutate, isLoading: reportLoading } = useMutation(
    (data) => apiService.getPinAchieverReport(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const newData = data?.data?.map((record, index) => {
            return {
              sr_no: index + 1 + (current - 1) * pageSize,
              ...record
            };
          });

          setDataSource(newData || []);
          setTotal(data?.totalCount);

          // set export sheet data
          // const exportData = newData?.map((record) => {
          //   return removeKeysFromObject(record, "current_pin_code", "highest_pin_code");
          // });
          // setExportSheetData(exportData);
        }
      },
      onError: (error) => {
        setTotal(0);
        setDataSource([]);
        console.log(error);
      }
    }
  );

  // handle search
  const handleSearch = (values) => {
    try {
      const trimmedValue = values?.trim();

      if (!trimmedValue) return;

      setSearchValue(trimmedValue);

      const data = {
        page: current - 1,
        pageSize: pageSize,
        searchTerm: trimmedValue
      };
      // api call
      current == 1 ? getPinAchieverReportMutate(data) : setCurrent(1);
      setISearchEnable(true);
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
        const data = {
          page: current - 1,
          pageSize: pageSize
        };
        setISearchEnable(false);
        // api call
        current == 1 ? getPinAchieverReportMutate(data) : setCurrent(1);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // handle pagination
  useEffect(() => {
    const data = {
      page: current - 1,
      pageSize: pageSize,
      ...(searchValue && { searchTerm: searchValue })
    };
    // api call
    getPinAchieverReportMutate(data);
  }, [current, pageSize]);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={reportLoading}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <Flex gap={12} vertical>
            <div></div>
            <Flex justify="space-between" vertical gap={8} className="fullWidth">
              <Typography.Title level={4} className="removeMargin">
                {"Pin Achiever Report"}
              </Typography.Title>
              <Typography.Text style={StyleSheet.fontSize14} className="removeMargin">
                <Typography.Text type="secondary">{"Reports /"}</Typography.Text>{" "}
                {"Pin Achiever Report"}
              </Typography.Text>
            </Flex>
          </Flex>
        </Col>
        <Col span={24}>
          <Card className="fullWidth">
            <Flex>
              {/* <ExportBtn
                columns={tableColumns}
                fetchData={exportSheetData}
                fileName={"pin-achievers-report"}
                isLandscape={true}
              /> */}
              <Row gutter={[12]} className="fullWidth marginBottom16">
                <Col xs={24} md={12}></Col>
                <Col xs={24} md={12}>
                  <Input.Search
                    size="large"
                    allowClear
                    maxLength={50}
                    placeholder="Search By Associate Buyer Name, or AB Number"
                    onSearch={handleSearch}
                    onChange={handleChange}></Input.Search>
                </Col>
              </Row>
            </Flex>
            <Table
              dataSource={dataSource}
              columns={tableColumns}
              bordered
              scroll={{
                x: "max-content"
              }}
              pagination={false}
            />
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
          </Card>
        </Col>
      </Row>
    </Spin>
  ) : (
    <></>
  );
};

export default PinAchieverReport;
