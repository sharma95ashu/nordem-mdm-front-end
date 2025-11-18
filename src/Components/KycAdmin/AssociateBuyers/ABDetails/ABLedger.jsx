import { Col, Flex, Form, Row, Select, Table, Typography } from "antd";
import ExportBtn from "Components/Shared/ExportBtn";
import { useServices } from "Hooks/ServicesContext";
import React, { useState } from "react";
import { useQuery } from "react-query";

const ABLedger = (props) => {
  const { dist_no, financialYear, setFinancialYear } = props;
  const { apiService } = useServices();

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

  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "sr_no",
      key: "sr_no",
      render: (text) => <Typography.Text type="secondary">{text} </Typography.Text>
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (text) => <Typography.Text type="secondary">{text} </Typography.Text>
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => <Typography.Text type="secondary">{text} </Typography.Text>
    },
    {
      title: "Debit",
      dataIndex: "debit",
      key: "debit",
      render: (text) => <Typography.Text type="secondary">{text} </Typography.Text>
    },
    {
      title: "Credit",
      dataIndex: "credit",
      key: "credit",
      render: (text) => <Typography.Text type="secondary">{text} </Typography.Text>
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      render: (text) => <Typography.Text type="secondary">{text} </Typography.Text>
    },
    {
      title: "Type",
      dataIndex: "tr_type",
      key: "tr_type",
      render: (text) => <Typography.Text type="secondary">{text} </Typography.Text>
    }
  ];

  const { data, isLoading } = useQuery(
    ["fetchABLedgerData", financialYear], // Query key
    () =>
      apiService.getABLedgerData({
        dist_no: dist_no,
        fiscal_year: financialYear
        // page: current - 1,
        // pageSize: pageSize
      }),
    {
      enabled: !!financialYear, // Trigger only when financialYear is selected
      select: (res) => {
        // Transform the data here
        if (res?.success) {
          return res.data.map((item, index) => ({
            sr_no: index + 1, // Adding a serial number
            ...item
          }));
        }
        return [];
      },
      onSuccess: (res) => {
        if (res?.success) {
        }
      },
      onError: (error) => {
        console.error("Error fetching data:", error);
      }
    }
  );

  const handleFinancialYearChange = (val) => {
    setFinancialYear(val);
  };

  return (
    <>
      <Row>
        <Col span={12}>
          <ExportBtn columns={columns} fetchData={data} fileName={"AbLedger"} />
        </Col>
        <Col span={12}>
          <Flex justify="end">
            <Form layout="horizontal">
              <Form.Item
                label=" Financial Year"
                required
                // This defines the width of the input
              >
                <Select
                  size="large"
                  options={props?.financialYearsListData || []}
                  value={financialYear}
                  onChange={handleFinancialYearChange}
                  placeholder="Select Financial Year"
                  loading={isLoading}
                />
              </Form.Item>
            </Form>
          </Flex>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data || []}
        bordered
        pagination={data?.length > 10 ? pagination : false}
      />
    </>
  );
};

export default ABLedger;
