// Dashboard card options

export const CARD_OPTIONS = [
  { label: "Today ", value: "daily" },
  { label: "Weekly ", value: "weekly" },
  { label: "Monthly ", value: "monthly" }
];

// Card total options(CRM)

export const CRM_OPTIONS_TOTAL = [
  { label: "Today ", value: "daily" },
  { label: "Last 7 Days ", value: "weekly" },
  { label: "Last 30 Days ", value: "monthly" }
];

// export const STATUS_SEGMENT_CRM = [
//   { label: <Tag color="processing">All</Tag>, value: "all" },
//   { label: <Tag color="warning">Pending</Tag>, value: "pending" },
//   { label: <Tag color="success">Delivered</Tag>, value: "delivered" },
//   { label: <Tag color="blue">Packed</Tag>, value: "packed" },
//   { label: <Tag color="error">Cancelled</Tag>, value: "cancelled" },
//   { label: <Tag color="cyan">Confirm</Tag>, value: "confirm" },
//   { label: <Tag color="geekblue">Out For Delivery</Tag>, value: "out_for_delivery" }
// ];

// Search type order
export const ORDER_SEARCH_TYPE = {
  ORDER_NO: "order_no",
  CUSTOMER_ID: "customer_id",
  ORDER_DATE: "order_date",
  ORDER_STATUS: "order_status",
  ORDER_STORE: "store_code",
  ORDER_STATUS_RANGE: "order_status_range"
};

export const ORDER_STATUS_CODE = {
  PENDING: 0,
  NOT_DELIVERED: 1,
  CONFIRMED: 2,
  CANCELLED: 3,
  RETURNED: 4,
  COMPLETED: 5,
  OUT_FOR_DELIVERY: 6,
  SHIPPED: 7,
  PROCESSING: 8,
  PACKED: 9,
  DELIVERED: 10,
  CANCEL_REQUEST: 11,
  DELIVERY_ATTEMPTED: 12,
  PROCESSED: 13,
  OUT_FOR_PICKUP: 14,
  PICKUP_ATTEMPTED: 15,
  PRODUCT_VERIFIED: 16,
  PRODUCT_RETURNED: 17
};
export const return_status_sequence = {
  pending: 0,
  confirmed: 2,
  out_for_pickup: 3,
  returned: 4
};

// Status
export const ORDER_STATUS_ENUM = {
  PENDING: ORDER_STATUS_CODE.PENDING,
  NOT_DELIVERED: "undelivered",
  CONFIRMED: "confirmed",
  CANCELLED: "cancelled",
  RETURNED: "returned",
  COMPLETED: "completed",
  OUT_FOR_DELIVERY: "out_for_delivery",
  PACKED: "packed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  PARTIAL_CONFIRMED: "partial_confirmed",
  CANCEL_REQUEST: "cancel_request",
  DELIVERY_ATTEMPTED: "delivery_attempted",
  PARTIAL_RETURNED: "partially_returned",
  DELIVERED: "delivered",
  PARTIAL_RETURNED_INITIATED: "partial_return_initiated",
  REFUND_INITIATED: "refund_initiated",
  RETURN_INITIATED: "return_initiated"
};

export const ACTION_TYPE = {
  ORDER_CREATED: "order_created",
  ADDRESS_UPDATED: "address_updated",
  ORDER_CONFIRMED: "order_confirmed",
  BILL_SAVE: "bill_save",
  ORDER_TRANSFERRED: "order_transferred",
  CANCEL_REQUEST: "cancel_request",
  DELIVERED: "delivered"
};

// Crm cancel request options

export const REMARK_CANCEL_REQUEST = [
  { label: "Customer changed mind", value: "Customer changed mind" },
  { label: "Item out of stock", value: "Item out of stock" },
  { label: "Delivery took too long", value: "Delivery took too long" },
  { label: "Found a better price elsewhere", value: "Incorrect product ordered" },
  { label: "Incorrect product ordered", value: "Incorrect product ordered" },
  { label: "Other", value: "other" }
];

// Crm cancel order items options
export const REMARK_CANCEL_ITEMS = [
  { label: "Customer changed mind", value: "Customer changed mind" },
  { label: "Delivery took too long", value: "Delivery took too long" },
  { label: "Found a better price elsewhere", value: "Incorrect product ordered" },
  { label: "Incorrect product ordered", value: "Incorrect product ordered" },
  { label: "Other", value: "other" }
];

// Order cancel request Action
export const ORDER_ACTION = {
  APPROVED: "approved",
  DENY: "deny",
  OTHER: "other"
};

export const CARD_STATUS = {
  PENDING: "pending",
  TOTAL: "total",
  CANCELLED: "cancelled",
  CONFIRMED: "confirmed",
  DELIVERED: "delivered",
  RETURNED: "returned",
  RETURN_INITIATED: "return_initiated",
  OUT_FOR_PICKUP: "out_for_pickup"
};

export const CUST_TYPE = {
  DIST: "DIST",
  REG: "REG",
  CUST: "CUST"
};

// Order status
export const ORDER_STATUS = [
  {
    value: ORDER_STATUS_CODE.PENDING,
    label: "Pending"
  },
  {
    value: ORDER_STATUS_CODE.NOT_DELIVERED,
    label: "Undelivered"
  },
  {
    value: ORDER_STATUS_CODE.CONFIRMED,
    label: "Confirmed"
  },
  {
    value: ORDER_STATUS_CODE.CANCELLED,
    label: "Cancelled"
  },
  {
    value: ORDER_STATUS_CODE.OUT_FOR_DELIVERY,
    label: "Out For Delivery"
  },
  {
    value: ORDER_STATUS_CODE.PACKED,
    label: "Packed"
  },
  // {
  //   value: ORDER_STATUS_CODE.CANCEL_REQUEST,
  //   label: "Cancel Request"
  // },
  {
    value: ORDER_STATUS_CODE.DELIVERED,
    label: "Delivered"
  },
  {
    value: ORDER_STATUS_CODE.RETURNED,
    label: "Returned"
  }
];

// CRM ORDER key

export const CRM_ORDER_KEY = {
  PREPAID: "prepaid"
};
