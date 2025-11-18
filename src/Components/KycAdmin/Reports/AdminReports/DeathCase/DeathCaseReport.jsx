import { Card, Col, Flex, Input, Pagination, Row, Spin, Table, Typography } from "antd";
import { PermissionAction } from "Helpers/ats.constants";
import { actionsPermissionValidator, getDateTimeFormat, safeString } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useEffect, useState } from "react";
import { useMutation } from "react-query";

const DeathCaseReport = () => {
  const [pageSize, setPageSize] = useState(10);
  const [dataSource, setDataSource] = useState([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [isSearchEnable, setISearchEnable] = useState(false);

  const { apiService } = useServices();

  // Table Columns
  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "sr_no",
      key: "sr_no",
      sorter: (a, b) => Number(a?.sr_no) - Number(b?.sr_no),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>,
      width: 80
    },
    {
      title: "Old AB ID",
      dataIndex: "old_ab_no",
      key: "old_ab_no",
      sorter: (a, b) => Number(a?.old_ab_no) - Number(b?.old_ab_no),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>,
      onHeaderCell: () => ({
        style: { backgroundColor: "#FFCCC7" }
      }),
      onCell: () => ({
        style: { backgroundColor: "#FEF2F2" }
      })
    },
    {
      title: "Old AB Name",
      dataIndex: "old_ab_name",
      key: "old_ab_name",
      sorter: (a, b) => safeString(a?.old_ab_name).localeCompare(safeString(b?.old_ab_name)),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "New AB ID",
      dataIndex: "new_ab_no",
      key: "new_ab_no",
      sorter: (a, b) => Number(a?.new_ab_no) - Number(b?.new_ab_no),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>,
      onHeaderCell: () => ({
        style: { backgroundColor: "#C2D8F5" }
      }),
      onCell: () => ({
        style: { backgroundColor: "#F2F7FD" }
      })
    },
    {
      title: "New AB Name",
      dataIndex: "new_ab_name",
      key: "new_ab_name",
      sorter: (a, b) => safeString(a?.new_ab_name).localeCompare(safeString(b?.new_ab_name)),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    },
    {
      title: "Dated On",
      dataIndex: "dated_on",
      key: "dated_on",
      sorter: (a, b) => new Date(a?.dated_on)?.getTime() - new Date(b?.dated_on)?.getTime(),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
      sorter: (a, b) => safeString(a?.created_by).localeCompare(safeString(b?.created_by)),
      render: (text) => <Typography.Text type="secondary">{text}</Typography.Text>
    }
  ];

  // Api method
  const { mutate: getDeathCaseReport, isLoading: reportLoading } = useMutation(
    (data) => apiService.getDeathCaseReport(data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data?.success && data?.data) {
          const newData = data?.data?.map((record, index) => {
            return {
              sr_no: index + 1 + (current - 1) * pageSize,
              ...record,
              dated_on: getDateTimeFormat(record.dated_on, "YYYY/MM/DD") || null
            };
          });

          setDataSource(newData || []);
          setTotal(data?.totalCount);
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
      current == 1 ? getDeathCaseReport(data) : setCurrent(1);
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
        current == 1 ? getDeathCaseReport(data) : setCurrent(1);
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
    getDeathCaseReport(data);
  }, [current, pageSize]);

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <Spin spinning={reportLoading}>
      <Flex gap={12} vertical>
        <div></div>
        <Flex gap={24} vertical>
          {/* ------------- Title & Breadcrumbs ------------- */}
          <Flex justify="space-between" vertical gap={8}>
            <Typography.Title level={4} className="removeMargin">
              Death Case Report
            </Typography.Title>
            <Typography.Text className="removeMargin">
              <Typography.Text type="secondary">Reports /</Typography.Text> Death Case Report
            </Typography.Text>
          </Flex>

          <Card className="fullWidth">
            <Col span={24}>
              <Flex justify="space-between">
                {/* <ExportBtn
                  columns={columns}
                  fetchData={dataSource}
                  fileName={"death-case-report"}
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
                      placeholder="Search..."
                    />
                  </Col>
                </Row>
              </Flex>
            </Col>
            <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
              <Table
                className="compact_table"
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
        </Flex>
      </Flex>
    </Spin>
  ) : (
    <></>
  );
};

export default DeathCaseReport;
