import React, { useEffect, useState } from "react";
import { Table } from "antd";

const TransactionTable = ({
  columns,
  hidePagination = true,
  data,
  size,
  expandedColumnsList,
  loading
}) => {
  const [expandedRow, setExpandedRow] = useState([]);
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
  // expandable table
  const expandedRowRender = (record) => {
    if (record?.order_items && record.order_items.length > 0) {
      const expandedData = record.order_items.map((item, index) => ({
        ...item,
        key: `${index}`
      }));
      // ?.filter((item) => item?.is_offer_product == false);

      return (
        <Table
          columns={expandedColumnsList} // Explicitly provide columns for nested table
          dataSource={expandedData}
          pagination={false}
          size={"small"} // Pass size prop for consistency
          rowKey={(record) => record.key}
        />
      );
    }
    return null; // Return null if there are no children
  };

  useEffect(() => {
    setExpandedRow([]);
  }, [data]);

  return (
    <Table
      columns={columns}
      expandable={{
        expandedRowRender,
        rowExpandable: (record) => record?.order_items && record.order_items.length > 0 // Only expand rows with bill items
      }}
      dataSource={data}
      loading={loading}
      size={"small"}
      pagination={hidePagination ? pagination : hidePagination}
      bordered
      rowKey={(record) => record.order_no}
      scroll={{ x: true }}
      expandedRowKeys={expandedRow}
      onExpand={(expanded, record) => {
        setExpandedRow(
          (prevExpanded) =>
            expanded
              ? [...prevExpanded, record.order_no] // Add to expanded rows
              : prevExpanded.filter((key) => key !== record.order_no) // Remove if collapsed
        );
      }}
    />
  );
};

// return true;

export default TransactionTable;
