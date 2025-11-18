import React, { useState } from "react";
import { Table, Tooltip } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import { CARD_STATUS } from "CrmHelper/crmConstant";

const OrderTable = ({
  columns,
  hidePagination = true,
  data,
  size,
  expandedColumnsList,
  loading,
  rowSelect,
  status,
  depotExpand,
  setDepoExpand,
  actionType,
  orderDetails
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
  // expandable table
  const expandedRowRender = (record) => {
    if (record?.order_items && record.order_items.length > 0) {
      const expandedData = record.order_items.map((item, index) => ({
        ...item,
        key: `${index}`
      }));

      return (
        <Table
          columns={expandedColumnsList} // Explicitly provide columns for nested table
          dataSource={expandedData}
          rowSelection={
            rowSelect &&
            (record.status === CARD_STATUS.PENDING || record.status === CARD_STATUS.CONFIRMED) &&
            orderDetails?.offer_id == null &&
            actionType[record.depot_order_id]
              ? {
                  type: "checkbox",
                  ...rowSelect,
                  // getCheckboxProps: (record) => ({
                  //   disabled: record.item_status !== "PENDING" // Customize based on your enum
                  // })
                  renderCell: (checked, record, index, originNode) => {
                    const isConditionMet =
                      record.is_returnable == false && record.item_status == CARD_STATUS.DELIVERED; // Check your condition here

                    return (
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {isConditionMet ? (
                          // Show icon and checkbox when condition is met
                          <>
                            <Tooltip title="This product is not Returnable.">
                              <ExclamationCircleOutlined
                                style={{
                                  color: "red",
                                  fontSize: "16px"
                                }}
                              />
                            </Tooltip>
                            {/* {originNode}  */}
                          </>
                        ) : (
                          // Show only checkbox when condition is not met
                          originNode
                        )}
                      </div>
                    );
                  }
                }
              : null
          }
          pagination={false}
          size={"small"} // Pass size prop for consistency
          rowKey={(record) => record.order_item_id}
        />
      );
    }
    return null; // Return null if there are no children
  };

  // Custom expand icon function

  console.log(data);

  return (
    <Table
      columns={columns}
      expandable={{
        expandedRowRender,
        rowExpandable: (record) => record?.order_items && record.order_items.length > 0,
        // &&
        // (!depotExpand || record.sr_no === depotExpand), // Only expand rows with bill items
        expandedRowKeys: depotExpand ? depotExpand : [],
        onExpand: (expanded, record) => {
          if (expanded) {
            // If expanding, set the expanded row key
            setDepoExpand([...depotExpand, record.sr_no]);
          } else {
            // If collapsing, clear the expanded row key
            setDepoExpand([]);
          }
        }
      }}
      dataSource={data}
      loading={loading}
      size={"small"}
      pagination={hidePagination ? pagination : hidePagination}
      bordered
      rowKey={(record) => record.sr_no}
      scroll={{ x: true }}
    />
  );
};

export default OrderTable;
