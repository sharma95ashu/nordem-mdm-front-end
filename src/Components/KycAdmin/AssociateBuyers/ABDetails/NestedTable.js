import React, { useState } from "react";
import { Table } from "antd";
import { useServices } from "Hooks/ServicesContext";
import { useMutation } from "react-query";

const NestedTable = ({
  columns,
  hidePagination = true,
  dataSource,
  size,
  expandedColumnsList,
  financialYear
}) => {
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

  const { mutate: getDeclarationReportData, isLoading: loadingDeclarationReport } = useMutation(
    (data) => apiService.getABRepurchaseDetails(data),
    {
      onSuccess: (data, variable) => {
        if (data?.success) {
          const foundItem = dataSource?.find((item) => item?.month === variable?.month);
          if (foundItem) {
            foundItem.orderItem = data?.data || []; // Set orderItem to the API response data
          }
        }
      },
      onError: (error) => {
        console.log("Error fetching declaration data:", error);
      }
    }
  );

  const handleApi = (record) => {
    try {
      const data = {
        dist_no: record?.associate_buyer_no,
        month: record?.month,
        fiscal_year: financialYear
      };
      getDeclarationReportData(data); // Call API to get order items for that record
    } catch (error) {
      console.log("Error in handleApi:", error);
    }
  };

  const expandedRowRender = (record) => {
    // Check if the record has orderItem data
    if (record?.orderItem && Array.isArray(record?.orderItem) && record.orderItem.length > 0) {
      const expandedData = record?.orderItem?.map((item, index) => ({
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
  };

  const handleRowExpand = (expanded, record) => {
    if (expanded) {
      // If the row is expanding and orderItem is not loaded, trigger the API call
      handleApi(record);
    }
  };

  return (
    <Table
      columns={columns}
      expandable={{
        expandedRowRender, // Attach the handler for expandable rows
        onExpand: handleRowExpand // Handle row expansion and API call
      }}
      dataSource={dataSource}
      loading={loadingDeclarationReport}
      size={size || "small"} // Use default size if not passed
      pagination={hidePagination ? false : pagination}
      bordered
      rowKey={(record) => record.month} // Ensure rowKey is correctly set
      scroll={{ x: true }}
    />
  );
};

export default NestedTable;
