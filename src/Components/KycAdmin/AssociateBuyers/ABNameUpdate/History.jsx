import React, { useState } from "react";
import { Pagination, Table, Tag, Typography } from "antd";
import dayjs from "dayjs";

const History = ({ historyData = [] }) => {
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  /**
   * Handles pagination change
   * @param {number} newPage - The new page number
   * @param {number} newPageSize - The new page size
   */

  const handlePageChange = (newPage, newPageSize) => {
    setCurrent(newPage);
    setPageSize(newPageSize);
  };

  // Get the current page's data
  const paginatedData = historyData?.slice((current - 1) * pageSize, current * pageSize);

  // Columns for the table
  const columns = [
    {
      title: "AB Name",
      dataIndex: "dist_name",
      sorter: (a, b) => a?.dist_name?.localeCompare(b?.dist_name),
      key: "dist_name"
    },
    {
      title: "Father Name",
      dataIndex: "father_name",
      sorter: (a, b) => a?.father_name?.localeCompare(b?.father_name),
      key: "father_name"
    },
    {
      title: "Spouse Name",
      dataIndex: "spouse_name",
      sorter: (a, b) => a?.spouse_name?.localeCompare(b?.spouse_name),
      key: "spouse_name"
    },
    {
      title: "Nominee Name",
      dataIndex: "nominee_name",
      sorter: (a, b) => a?.nominee_name?.localeCompare(b?.nominee_name),
      key: "nominee_name"
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => a?.status?.localeCompare(b?.status),
      render: (value) => (
        <>{value === "OLD" ? <Tag color="gold">Old</Tag> : <Tag color="purple">New</Tag>}</>
      )
    },
    {
      title: "User Name",
      dataIndex: "created_by",
      sorter: (a, b) => a?.created_by?.localeCompare(b?.created_by),
      key: "created_by"
    },
    {
      title: "Date Time",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a, b) =>
        a?.created_at && b?.created_at
          ? dayjs(a.created_at).unix() - dayjs(b.created_at).unix()
          : 0,
      render: (value) => (
        <Typography.Text>
          {value ? dayjs(value).format("DD MMMM YYYY hh:mm A") : "-"}
        </Typography.Text>
      )
    }
  ];

  return (
    <>
      <Table
        columns={columns}
        dataSource={paginatedData}
        pagination={false}
        bordered={true}
        rowKey={(record, index) => index}
        scroll={{ x: "max-content" }}
      />

      <div className="marginTop24">
        <Pagination
          total={historyData?.length}
          showTotal={(total) => `Total ${total} items`}
          pageSize={pageSize}
          current={current}
          onChange={handlePageChange}
          showSizeChanger={true}
          showQuickJumper
        />
      </div>
    </>
  );
};

export default History;
