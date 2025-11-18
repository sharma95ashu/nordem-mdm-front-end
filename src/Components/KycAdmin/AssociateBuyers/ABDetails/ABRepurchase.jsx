import { Col, Flex, Form, Row, Select, Typography } from "antd";
import ExportBtn from "Components/Shared/ExportBtn";
import { useServices } from "Hooks/ServicesContext";
import React, { useState } from "react";
import { useQuery } from "react-query";
import NestedTable from "./NestedTable";
import { safeString } from "Helpers/ats.helper";
import { cloneDeep } from "lodash";
import { monthsMapping, STORES } from "Helpers/ats.constants";

const ABRepurchase = (props) => {
  const { dist_no, financialYear, setFinancialYear } = props;
  const [exportData, setExportData] = useState([]);
  const { apiService } = useServices();

  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "sr_no",
      key: "sr_no",
      sorter: (a, b) => b.sr_no - a.sr_no,
      render: (text) => <Typography.Text type="secondary">{text ?? "-"} </Typography.Text>
    },
    {
      title: "Month",
      dataIndex: "month_name",
      key: "month_name",
      sorter: (a, b) => safeString(a.month_name).localeCompare(safeString(b.month_name)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"} </Typography.Text>
    },
    {
      title: "Amount",
      dataIndex: "amount_aggregate",
      key: "amount_aggregate",
      sorter: (a, b) => Number(a.amount_aggregate || 0) - Number(b.amount_aggregate || 0),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"} </Typography.Text>
    },
    {
      title: "PV",
      dataIndex: "total_pv",
      key: "total_pv",
      sorter: (a, b) => a.total_pv - b.total_pv,
      render: (text) => <Typography.Text type="secondary">{text ?? "-"} </Typography.Text>
    }
  ];

  const expandedColumnsList = [
    {
      title: "Bill Date",
      dataIndex: "bill_date_ch",
      key: "bill_date_ch",
      sorter: (a, b) => safeString(a.bill_date_ch).localeCompare(safeString(b.bill_date_ch)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"} </Typography.Text>
    },
    {
      title: "Bill No.",
      dataIndex: "bill_num",
      key: "bill_num",
      sorter: (a, b) => Number(a.bill_num || 0) - Number(b.bill_num || 0),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"} </Typography.Text>
    },
    {
      title: "Amount",
      dataIndex: "amount_agg",
      key: "amount_agg",
      sorter: (a, b) => Number(a.amount_agg || 0) - Number(b.amount_agg || 0),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"} </Typography.Text>
    },
    {
      title: "Total PV",
      dataIndex: "total_pv",
      key: "total_pv",
      sorter: (a, b) => Number(a.total_pv || 0) - Number(b.total_pv || 0),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"} </Typography.Text>
    },
    {
      title: "Dist No.",
      dataIndex: "dist_num",
      key: "dist_num",
      sorter: (a, b) => Number(a.dist_num || 0) - Number(b.dist_num || 0),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"} </Typography.Text>
    },
    {
      title: "Month",
      dataIndex: "mon",
      key: "mon",
      sorter: (a, b) => Number(a.mon || 0) - Number(b.mon || 0),
      render: (text) => (
        <Typography.Text type="secondary">{monthsMapping[text] ?? "-"} </Typography.Text>
      )
    },
    {
      title: "Score Code",
      dataIndex: "store_code",
      key: "store_code",
      sorter: (a, b) => safeString(a.store_code).localeCompare(safeString(b.store_code)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"} </Typography.Text>
    },
    {
      title: "Store Name",
      dataIndex: "store_name",
      key: "store_name",
      sorter: (a, b) => safeString(a.store_name).localeCompare(safeString(b.store_name)),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"} </Typography.Text>
    },
    {
      title: "Store Type",
      dataIndex: "store_type",
      key: "store_type",
      sorter: (a, b) => safeString(a.store_type).localeCompare(safeString(b.store_type)),
      render: (text) => <Typography.Text type="secondary">{STORES[text] ?? "-"} </Typography.Text>
    }
  ];

  const { data, isLoading } = useQuery(
    ["fetchABRepurchaseData", financialYear], // Query key
    () =>
      apiService.getABRepurchaseData({
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
        const deepClonedArr = cloneDeep(res);
        setExportData(deepClonedArr);
      },
      onError: (error) => {
        //
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
          <ExportBtn
            columns={columns}
            fetchData={exportData}
            fileName={"Associate-Buyer-Repurchase"}
          />
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
      <NestedTable
        financialYear={financialYear}
        bordered
        hidePagination={false}
        size={"small"}
        columns={columns}
        dataSource={data || []}
        expandedColumnsList={expandedColumnsList}
      />
    </>
  );
};

export default ABRepurchase;
