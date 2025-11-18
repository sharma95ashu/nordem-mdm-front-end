import { Card, Col, Flex, Input, Table } from "antd";
import ExportBtn from "Components/Shared/ExportBtn";
import React, { useState } from "react";

const ListViewTable = ({
  columns,
  dataSource,
  setSearchValue,
  searchValue,
  filteredData,
  setFilteredData,
  fileName
}) => {
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

  const handleSearch = (value) => {
    try {
      //allowed keys for search
      const allowedKeys = [
        "associate_buyer_no",
        "associate_buyer_name",
        "dist_no",
        "distno",
        "tech_name",
        "dist_name",
        "core_name",
        "ab_no",
        "technical_name",
        "technical_no"
      ];
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

  return (
    <Card className="fullWidth">
      <Col span={24}>
        <Flex justify="space-between" align="center">
          <ExportBtn
            columns={columns}
            fetchData={filteredData != null ? filteredData : dataSource}
            fileName={fileName}
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
            placeholder="Search by Associate Buyer No."></Input.Search>
        </Flex>
      </Col>
      <Col span={24}>
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
    </Card>
  );
};

export default ListViewTable;
