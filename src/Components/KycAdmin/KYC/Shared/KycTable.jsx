import { Table } from "antd";
import React, { useState } from "react";

const KycTable = ({ tableKey, columns, data, hasRowSelection }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  return (
    <div className={`fullWidth KycTable__${tableKey}`}>
      <Table
        rowSelection={hasRowSelection ? rowSelection : undefined}
        columns={columns}
        dataSource={data}
        pagination={false}
        scroll={{ x: true, ...(data?.length > 5 && { y: 375 }) }}
      />
    </div>
  );
};

export default KycTable;
