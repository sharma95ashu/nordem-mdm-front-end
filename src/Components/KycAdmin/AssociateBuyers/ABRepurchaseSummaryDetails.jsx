import { Col, Row, Table, Tag, Typography } from "antd";
import ExportBtn from "Components/Shared/ExportBtn";
import SearchByComponent from "Components/Shared/SearchByComponent";
import SearchByFallbackComponent from "Components/Shared/SearchByFallbackComponent";
import { monthsMapping, PermissionAction, snackBarErrorConf, STORES } from "Helpers/ats.constants";
import { actionsPermissionValidator, safeString } from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import React, { useState } from "react";
import { useMutation, useQuery } from "react-query";
import { enqueueSnackbar } from "notistack";
import searchByIcon from "Static/KYC_STATIC/img/search_by.svg";

const ABRepurchaseSummaryDetails = () => {
  const [payload, setPayload] = useState(null);
  const { apiService } = useServices();
  const [fetchData, setFetchData] = useState([]);
  const [exportData, setExportData] = useState([]);

  // table columns list
  const columns = [
    {
      title: "Sr. No.",
      dataIndex: "sr_no",
      key: "sr_no",
      width: 100,
      render: (sr_no, record, index) => (
        <Typography.Text type="secondary">{index + 1}</Typography.Text>
      )
    },
    {
      title: "Month",
      dataIndex: "month_name",
      key: "month_name",
      sorter: (a, b) => safeString(a.month_name).localeCompare(safeString(b.month_name)),
      render: (value) => <Typography.Text type="secondary">{value}</Typography.Text>
    },
    {
      title: "Amount",
      dataIndex: "amount_aggregate",
      key: "amount_aggregate",
      sorter: (a, b) => Number(a.amount_aggregate || 0) - Number(b.amount_aggregate || 0),
      render: (value) => <Typography.Text type="secondary">{value}</Typography.Text>
    },
    {
      title: "PV ",
      dataIndex: "total_pv",
      key: "total_pv",
      sorter: (a, b) => safeString(a.total_pv).localeCompare(safeString(b.total_pv)),
      render: (value) => <Typography.Text type="secondary">{value}</Typography.Text>
    }
  ];

  const expandedColumnsList = [
    {
      title: "Bill No.",
      dataIndex: "bill_num",
      key: "bill_num",
      sorter: (a, b) => a.bill_num - b.bill_num,
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Bill Date",
      dataIndex: "bill_date_ch",
      key: "bill_date_ch",
      sorter: (a, b) => new Date(a.bill_date_ch) - new Date(b.bill_date_ch),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Type",
      dataIndex: "bill_type",
      key: "bill_type",
      sorter: (a, b) => a.bill_type.localeCompare(b.bill_type),
      render: (val) => <Tag>{val}</Tag>
    },
    {
      title: "AB No.",
      dataIndex: "dist_num",
      key: "dist_num",
      sorter: (a, b) => Number(a.dist_num || 0) - Number(b.dist_num || 0),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"} </Typography.Text>
    },
    {
      title: "PV",
      dataIndex: "total_pv",
      key: "total_pv",
      sorter: (a, b) => a.total_pv - b.total_pv,
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
    },
    {
      title: "Amount",
      dataIndex: "amount_agg",
      key: "amount_agg",
      sorter: (a, b) => Number(a.amount_agg || 0) - Number(b.amount_agg || 0),
      render: (text) => <Typography.Text type="secondary">{text ?? "-"}</Typography.Text>
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
      title: "Store Code",
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

  // export coulns list
  const exportColumns = [
    {
      title: "Sr. No.",
      dataIndex: "sr_no"
    },
    {
      title: "Fiscal Year",
      dataIndex: "fiscal_year"
    },
    {
      title: "Associate Buyer No",
      dataIndex: "associate_buyer_no"
    },
    {
      title: "Associate Buyer Name",
      dataIndex: "associate_buyer_name"
    },
    {
      title: "Month",
      dataIndex: "month"
    },
    {
      title: "Amount",
      dataIndex: "amount"
    },
    {
      title: "PV ",
      dataIndex: "pv"
    }
  ];

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

  // useQuery to fetch data
  const { isLoading } = useQuery(
    ["fetchAbRepurchaseSummaryDetails", payload],
    () => apiService.getABRepurchaseSummaryDetail(payload),
    {
      enabled: !!payload, // Fetch only when payload is available
      onSuccess: (data) => {
        if (data?.success) {
          setFetchData(data?.data || []);
          const tempData = data?.data?.map((item, index) => ({
            sr_no: index + 1,
            associate_buyer_no: item?.associate_buyer_no,
            associate_buyer_name: item?.associate_buyer_name,
            fiscal_year: item?.fiscal_year,
            month: item?.month_name,
            amount: item?.amount_aggregate,
            pv: item?.total_pv
          }));
          setExportData(tempData || []); // set export data in the state
        }
      },
      onError: (error) => {
        setFetchData([]);
      }
    }
  );

  // useQuery hook for fetching financial year
  const { data: financialYearsList } = useQuery(
    "getFinancialYearsrsList",
    () => apiService.getFinancialYearsList(),
    {
      select: (data) => {
        if (data?.data) {
          return data?.data?.map((item) => ({
            label: `${item?.fiscal_year_start}-${item?.fiscal_year_end}`,
            value: item?.fiscal_year_code
          }));
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // handle search click
  const handleSearchClick = (val) => {
    try {
      if (val) {
        setPayload(val);
      }
    } catch (error) {}
  };

  // handle search change / search clear
  const handleClear = () => {
    setPayload(null);
  };

  const { mutate: getAbRepurhaseRowDetailData, isLoading: loadingDeclarationReport } = useMutation(
    (data) => apiService.getAbRepurhaseRowDetailData(data),
    {
      onSuccess: (data, variable) => {
        if (data?.success) {
          const foundItem = fetchData?.find((item) => item?.month === variable?.month);
          if (foundItem) {
            foundItem.rowData = data?.data || []; // Set orderItem to the API response data
          }
        }
      },
      onError: (error) => {
        console.log(error);
      }
    }
  );

  const handleApi = (record) => {
    try {
      if (record?.month && payload) {
        const data = {
          ...payload,
          month: record?.month
        };

        getAbRepurhaseRowDetailData(data); //api call to get row details
      }
    } catch (error) {}
  };

  const expandedRowRender = (record) => {
    try {
      // Check if the record has rowData
      if (record?.rowData && Array.isArray(record?.rowData) && record.rowData.length > 0) {
        const expandedData = record?.rowData?.map((item, index) => ({
          ...item,
          key: `${index}`
        }));
        return (
          <Table
            columns={expandedColumnsList} // Pass the correct expanded columns
            dataSource={expandedData}
            pagination={false}
            size="small"
            rowKey={(item) => item.key}
          />
        );
      }
      return null; // Return null if there's no data to display
    } catch (error) {}
  };

  const handleRowExpand = (expanded, record) => {
    if (expanded) {
      handleApi(record); // fn call for row details
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW) ? (
    <>
      <SearchByComponent
        moduleName={"ab_repurchase_summary_detail"}
        handleSearchClick={handleSearchClick}
        handleClear={handleClear}
        searchLoading={isLoading}
        dropdownOptions={financialYearsList}
      />

      <Row gutter={[20, 24]}>
        {fetchData?.length > 0 ? (
          <div className="kyc_admin_base">
            <Col span={24}>
              <ExportBtn
                columns={exportColumns}
                fetchData={exportData}
                fileName={"ABRePurchaseSummaryDetail"}
              />
            </Col>
            <Col span={24}>
              <Table
                columns={columns}
                expandable={{
                  expandedRowRender, // Attach the handler for expandable rows
                  onExpand: handleRowExpand // Handle row expansion and API call
                }}
                dataSource={fetchData}
                loading={loadingDeclarationReport}
                size={"small"} // Use default size if not passed
                pagination={pagination}
                bordered
                rowKey={(record) => record.month}
                scroll={{ x: true }}
              />
            </Col>
          </div>
        ) : (
          <SearchByFallbackComponent
            image={searchByIcon}
            title={"Search by Associate Buyer Number / Reference Number"}
            subTitle={
              "Quickly search the Associate Buyer Number / Reference Number to process Re-Purchase Summary & Detail"
            }
          />
        )}
      </Row>
    </>
  ) : (
    <></>
  );
};

export default ABRepurchaseSummaryDetails;
