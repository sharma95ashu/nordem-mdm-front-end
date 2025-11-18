import { MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";
import { Button, Flex, Image, Space, Tooltip, Typography } from "antd";
import { getStatusTag } from "CrmHelper/crm.helper";
import { CARD_STATUS } from "CrmHelper/crmConstant";
import { FALL_BACK } from "Helpers/ats.constants";
import { StringTruncate } from "Helpers/ats.helper";
import Images from "Static/CRM_STATIC/img";

export const getDepoOrderColums = (
  handleConfirmedQuantity,
  isOrderItemIncluded,
  checkField,
  handleConfirmedQuantityDepot,
  actionType,
  setOfferData,
  setOfferEnable,
  orderDetails
) => {
  return [
    {
      title: "S.No.",
      dataIndex: "sr_no",
      sorter: (a, b) => Number(a.sr_no) - Number(b.sr_no),
      render: (text, record, index) => (
        <Space>
          <Typography.Text type="secondary">{text}</Typography.Text>
        </Space>
      ) // Render auto-increment serial number
    },
    {
      title: "SAP Code",
      dataIndex: "sap_code",
      sorter: (a, b) => a.sap_code.localeCompare(b.sap_code)
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      width: 400,
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
      render: (text) => (
        <Tooltip title={text}>
          <Typography.Text type="secondary">{StringTruncate(text, 15) || "N/A"}</Typography.Text>
        </Tooltip>
      )
    },

    {
      title: "Status",
      dataIndex: "crm_item_status",
      sorter: (a, b) => a.crm_item_status.localeCompare(b.crm_item_status),
      render: (text, record) => (
        <Typography.Text type="secondary">{getStatusTag(text)}</Typography.Text>
      )
    },

    {
      title: "Quantity",
      dataIndex: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (text, record) => <>{Number(text) + Number(record.cancelled_qty || 0)}</>
    },

    {
      title: "Confirmed quantity",
      dataIndex: "total_accepted_qty",
      sorter: (a, b) => a.total_accepted_qty - b.total_accepted_qty,
      render: (text, record) => {
        return (
          <>
            <div style={{ display: "flex", alignItems: "center" }}>
              <Button
                type="link"
                icon={<MinusCircleOutlined />}
                onClick={() => handleConfirmedQuantityDepot(record, "decrement")}
                disabled={
                  record.offer_items.length ||
                  record?.total_accepted_qty == 1 ||
                  !isOrderItemIncluded(checkField, record.order_item_id) ||
                  actionType[record.depot_order_id] === "cancel"
                }
              />
              <span style={{ margin: "0 8px" }}>
                {record?.total_accepted_qty ? record?.total_accepted_qty : record?.quantity}
              </span>
              <Button
                type="link"
                icon={<PlusCircleOutlined />}
                onClick={() => handleConfirmedQuantityDepot(record, "increment")}
                // Disable increment if quantity  is equal to total_accepted_qty  reaches
                disabled={
                  record.offer_items.length ||
                  record?.quantity == record?.total_accepted_qty ||
                  !isOrderItemIncluded(checkField, record.order_item_id) ||
                  actionType[record.depot_order_id] === "cancel"
                }
              />
            </div>
          </>
        );
      }
    },

    {
      title: "Total Cancelled Qty",
      dataIndex: "cancelled_qty",
      sorter: (a, b) => a.cancelled_qty - b.cancelled_qty,
      render: (text, record) => (
        <Typography.Text type="secondary">
          {record.crm_item_status == CARD_STATUS.CANCELLED ? record.quantity : text || 0}
        </Typography.Text>
      )
    },

    {
      title: "Rate (₹)",
      dataIndex: "rate",
      width: 200,
      sorter: (a, b) => a.rate - b.rate
    },
    {
      title: "Discount (₹)",
      dataIndex: "discount",
      width: 200,
      fixed: "right",
      sorter: (a, b) => parseFloat(a.discount) - parseFloat(b.discount),
      render: (text) => <Typography.Text type="secondary">{text ? text : ""}</Typography.Text>
    },

    {
      title: "P.V.",
      dataIndex: "item_pv",
      width: 200,
      sorter: (a, b) => parseFloat(a.item_pv) - parseFloat(b.item_pv),
      render: (text) => <Typography.Text type="secondary">{text || "N/A"}</Typography.Text>
    },
    {
      title: "Total P.V.",
      dataIndex: "total_pv",
      width: 200,
      render: (text, record) => (
        <Typography.Text type="secondary">
          {(record?.quantity - record?.returned_qty) * record?.item_pv}
        </Typography.Text>
      )
    },
    {
      title: "Total Amount (₹)",
      dataIndex: "total_amount",
      width: 200,
      sorter: (a, b) =>
        Number(Number(a.rate) * Number(a.quantity)) - Number(Number(b.rate) * Number(b.quantity)),
      render: (text, record, index) => {
        const totalAmount = Number(record.rate) * Number(record.quantity);
        return <Typography.Text>{totalAmount.toFixed(2)}</Typography.Text>;
      }
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <Flex align="center" gap={5}>
          <Tooltip title={!record?.offer_items?.length > 0 ? "No offer product" : ""}>
            <Button
              type="primary"
              icon={
                record?.offer_items?.length > 0 && (
                  <img
                    src={Images.Offer}
                    alt="icon"
                    style={{ maxWidth: 16, maxHeight: 16, cursor: "pointer" }}
                  />
                )
              }
              disabled={!record?.offer_items?.length > 0}
              onClick={() => {
                setOfferData(record?.offer_items);
                setOfferEnable(true);
              }}>
              View Offer
            </Button>
          </Tooltip>
        </Flex>
      )
    }
  ];
};

export const getDepoOrderColumsForReturn = (
  handleConfirmedQuantity,
  isOrderItemIncluded,
  checkField,
  handleConfirmedQuantityDepot,
  actionType,
  setOfferData,
  setOfferEnable,
  orderDetails
) => {
  console.log("orderDetails", orderDetails);
  return [
    {
      title: "S.No.",
      dataIndex: "sr_no",
      sorter: (a, b) => Number(a.sr_no) - Number(b.sr_no),
      render: (text, record, index) => (
        <Space>
          <Typography.Text type="secondary">{text}</Typography.Text>
        </Space>
      ) // Render auto-increment serial number
    },
    {
      title: "SAP Code",
      dataIndex: "sap_code",
      sorter: (a, b) => a.sap_code.localeCompare(b.sap_code)
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      width: 400,
      sorter: (a, b) => a.product_name.localeCompare(b.product_name),
      render: (text) => (
        <Tooltip title={text}>
          <Typography.Text type="secondary">{StringTruncate(text, 15) || "N/A"}</Typography.Text>
        </Tooltip>
      )
    },

    {
      title: "Status",
      dataIndex: "return_status",
      sorter: (a, b) => a.return_status.localeCompare(b.return_status),
      render: (text, record) => (
        <Typography.Text type="secondary">{getStatusTag(text)}</Typography.Text>
      )
    },

    // {
    //   title: "Quantity",
    //   dataIndex: "quantity",
    //   sorter: (a, b) => a.quantity - b.quantity,
    //   render: (text, record) => <>{Number(text) + Number(record.cancelled_qty || 0)}</>
    // },

    // {
    //   title: "Confirmed quantity",
    //   dataIndex: "total_accepted_qty",
    //   sorter: (a, b) => a.total_accepted_qty - b.total_accepted_qty,
    //   render: (text, record) => {
    //     return (
    //       <>
    //         <div style={{ display: "flex", alignItems: "center" }}>
    //           <Button
    //             type="link"
    //             icon={<MinusCircleOutlined />}
    //             onClick={() => handleConfirmedQuantityDepot(record, "decrement")}
    //             disabled={
    //               record.offer_items.length ||
    //               record?.total_accepted_qty == 1 ||
    //               !isOrderItemIncluded(checkField, record.order_item_id) ||
    //               actionType[record.depot_order_id] === "cancel"
    //             }
    //           />
    //           <span style={{ margin: "0 8px" }}>
    //             {record?.total_accepted_qty ? record?.total_accepted_qty : record?.quantity}
    //           </span>
    //           <Button
    //             type="link"
    //             icon={<PlusCircleOutlined />}
    //             onClick={() => handleConfirmedQuantityDepot(record, "increment")}
    //             // Disable increment if quantity  is equal to total_accepted_qty  reaches
    //             disabled={
    //               record.offer_items.length ||
    //               record?.quantity == record?.total_accepted_qty ||
    //               !isOrderItemIncluded(checkField, record.order_item_id) ||
    //               actionType[record.depot_order_id] === "cancel"
    //             }
    //           />
    //         </div>
    //       </>
    //     );
    //   }
    // },
    {
      title: "Returned quantity",
      dataIndex: "quantity",
      sorter: (a, b) => a.quantity - b.quantity
    },

    {
      title: "Rate (₹)",
      dataIndex: "rate",
      width: 200,
      sorter: (a, b) => a.rate - b.rate
    },
    {
      title: "Discount (₹)",
      dataIndex: "discount",
      width: 200,
      fixed: "right",
      sorter: (a, b) => parseFloat(a.discount) - parseFloat(b.discount),
      render: (text) => <Typography.Text type="secondary">{text ? text : ""}</Typography.Text>
    },

    {
      title: "P.V.",
      dataIndex: "item_pv",
      width: 200,
      sorter: (a, b) => parseFloat(a.item_pv) - parseFloat(b.item_pv),
      render: (text) => <Typography.Text type="secondary">{text || "N/A"}</Typography.Text>
    },
    {
      title: "Total P.V.",
      dataIndex: "total_pv",
      width: 200,
      render: (text, record) => (
        <Typography.Text type="secondary">
          {Number(record?.quantity) * Number(record?.item_pv)}
        </Typography.Text>
      )
    },
    {
      title: "Total Amount (₹)",
      dataIndex: "total_amount",
      width: 200,
      sorter: (a, b) =>
        Number(Number(a.rate) * Number(a.quantity)) - Number(Number(b.rate) * Number(b.quantity)),
      render: (text, record, index) => {
        const totalAmount = Number(record.rate) * Number(record.quantity);
        return <Typography.Text>{totalAmount.toFixed(2)}</Typography.Text>;
      }
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) => {
        return (
          <Flex align="center" gap={5}>
            <Tooltip title={!record?.offer_items?.length > 0 ? "No offer product" : ""}>
              <Button
                type="primary"
                icon={
                  record?.offer_items?.length > 0 && (
                    <img
                      src={Images.Offer}
                      alt="icon"
                      style={{ maxWidth: 16, maxHeight: 16, cursor: "pointer" }}
                    />
                  )
                }
                disabled={!record?.offer_items?.length > 0}
                onClick={() => {
                  setOfferData(record?.offer_items);
                  setOfferEnable(true);
                }}>
                View Offer
              </Button>
            </Tooltip>
            {(record.return_status === CARD_STATUS.CONFIRMED ||
              record.return_status === CARD_STATUS.OUT_FOR_PICKUP) &&
              record.ship_rocket_return_order_id === null &&
              record?.user_reciept !== null && (
                <>
                  <Tooltip title={"View Return Receipt"}>
                    {" "}
                    <Image
                      // ref={imgRef}
                      src={`http://localhost:5800${record?.file_path}`}
                      preview={true}
                      style={{ visibility: "none" }}
                      height={50}
                      width={50}
                      fallback={FALL_BACK}
                    />{" "}
                  </Tooltip>
                </>
              )}
          </Flex>
        );
      }
    }
  ];
};

export const confirmedDepotOrder = (record, orderNo) => {
  try {
    record?.order_items.map((row) => {
      const data = {
        order_item_id: row.order_item_id,
        sap_code: row.sap_code,
        total_accepted_qty: row.total_accepted_qty
      };
      return data;
    });

    // let filter = {
    //   order_no: orderNo,
    //   order_info: selectedData
    // };

    // console.log(filter, "filter");

    return false;
    // Api call to confirm order
  } catch (error) {
    console.log();
  }
};
