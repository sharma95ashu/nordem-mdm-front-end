import { Tag } from "antd";

import { ACTION_TYPE, CARD_STATUS, ORDER_STATUS_ENUM } from "./crmConstant";
import dayjs from "dayjs";
import { splitConversion } from "Helpers/ats.helper";
import { Paths } from "Router/Paths";

export const validateNumberWithMaxLength =
  (maxLength, minLength, errorMessage, type) => (_, value) => {
    if (!value) {
      return Promise.resolve(); // No value, no validation required
    }
    if (type && value.length < minLength) {
      return Promise.reject(new Error(`Minimum length must be ${minLength} digit`));
    }
    if (/^\d+$/.test(value) && value.length <= maxLength) {
      return Promise.resolve(); // Valid number with acceptable length
    }
    return Promise.reject(new Error(errorMessage)); // Invalid number or exceeds maxLength
  };

// export const mobilenumberRegex = /^[0-9]+$/;
export const mobilenumberRegex = /^[6-9][0-9]{9}$/;

// validator for phone number
export const validateMobileNumber = (message = "Mobile number must be exactly 10 digits.") => {
  return (_, value) => {
    if (value && value.length !== 10) {
      return Promise.reject(message);
    }

    if (value && !mobilenumberRegex.test(value)) {
      return Promise.reject("Invalid mobile number.");
    }

    return Promise.resolve();
  };
};

// validateAddress for shipping
export const validateAddress =
  (minLength = 10, maxLength = 60, errorMessage) =>
  (_, value) => {
    const regex = /^[^\s][\w\d\s\W]+[^\s]$/; // Allows words, numbers, and special characters, but no spaces at the start or end

    if (!value) {
      return Promise.resolve();
    }
    if (!regex.test(value)) {
      return Promise.reject(new Error("Address cannot start or end with a space."));
    }
    if (value.length < minLength) {
      return Promise.reject(new Error(`Address must be at least ${minLength} characters long.`));
    }
    if (value.length > maxLength) {
      return Promise.reject(new Error(`Address cannot exceed ${maxLength} characters.`));
    }
    return Promise.resolve();
  };

export const getStatusTag = (value) => {
  try {
    switch (value) {
      case CARD_STATUS.PENDING:
        return (
          <Tag color="warning" bordered={true}>
            Pending
          </Tag>
        );

      case ORDER_STATUS_ENUM.NOT_DELIVERED:
        return (
          <Tag color="error" bordered={true}>
            Undelivered
          </Tag>
        );
      case ORDER_STATUS_ENUM.CONFIRMED:
        return (
          <Tag color="green" bordered={true}>
            Confirmed
          </Tag>
        );
      case ORDER_STATUS_ENUM.CANCELLED:
        return (
          <Tag color="error" bordered={true}>
            Cancelled
          </Tag>
        );
      case ORDER_STATUS_ENUM.OUT_FOR_DELIVERY:
        return (
          <Tag color="error" bordered={true}>
            Out For Delivery
          </Tag>
        );

      case ORDER_STATUS_ENUM.RETURNED:
        return (
          <Tag color="error" bordered={true}>
            Returned
          </Tag>
        );
      case ORDER_STATUS_ENUM.COMPLETED:
        return (
          <Tag color="error" bordered={true}>
            Completed
          </Tag>
        );
      case ORDER_STATUS_ENUM.PACKED:
        return (
          <Tag color="processing" bordered={true}>
            Packed
          </Tag>
        );
      case ORDER_STATUS_ENUM.PROCESSING:
        return (
          <Tag color="processing" bordered={true}>
            Processing
          </Tag>
        );
      case ORDER_STATUS_ENUM.SHIPPED:
        return (
          <Tag color="processing" bordered={true}>
            Shipped
          </Tag>
        );
      case ORDER_STATUS_ENUM.PARTIAL_CONFIRMED:
        return (
          <Tag color="success" bordered={true}>
            Partial ConFirmed
          </Tag>
        );

      case ORDER_STATUS_ENUM.CANCEL_REQUEST:
        return <Tag color="magenta">Cancel Request</Tag>;
      case ACTION_TYPE.ADDRESS_UPDATED:
        return <Tag color="gold">{splitConversion(ACTION_TYPE.ADDRESS_UPDATED)}</Tag>;
      case ACTION_TYPE.ORDER_CREATED:
        return <Tag color="lime">{splitConversion(ACTION_TYPE.ORDER_CREATED)}</Tag>;
      case ACTION_TYPE.ORDER_CONFIRMED:
        return <Tag color="green">{splitConversion(ACTION_TYPE.ORDER_CONFIRMED)}</Tag>;
      case ACTION_TYPE.BILL_SAVE:
        return <Tag color="purple">{splitConversion(ACTION_TYPE.BILL_SAVE)}</Tag>;
      case ACTION_TYPE.ORDER_TRANSFERRED:
        return <Tag color="cyan">{splitConversion(ACTION_TYPE.ORDER_TRANSFERRED)}</Tag>;
      case ACTION_TYPE.DELIVERED:
        return <Tag color="success">Delivered</Tag>;
      case ORDER_STATUS_ENUM.DELIVERY_ATTEMPTED:
        return (
          <Tag color="processing">{splitConversion(ORDER_STATUS_ENUM.DELIVERY_ATTEMPTED)}</Tag>
        );
      case ORDER_STATUS_ENUM.PARTIAL_RETURNED:
        return <Tag color="processing">{splitConversion(ORDER_STATUS_ENUM.PARTIAL_RETURNED)}</Tag>;
      case ORDER_STATUS_ENUM.RETURN_INITIATED:
        return <Tag color="lime">{splitConversion(ORDER_STATUS_ENUM.RETURN_INITIATED)}</Tag>;
      case ORDER_STATUS_ENUM.PARTIAL_RETURNED_INITIATED:
        return (
          <Tag color="purple">{splitConversion(ORDER_STATUS_ENUM.PARTIAL_RETURNED_INITIATED)}</Tag>
        );
      default:
        return (
          <Tag bordered={true} className="textCapitalize">
            {(value && splitConversion(value)) || "N/A"}
          </Tag>
        );
    }
  } catch (error) {}
};

export const getIconsColor = (value) => {
  try {
    switch (value) {
      case ORDER_STATUS_ENUM.PENDING:
        return "orange";
      case ORDER_STATUS_ENUM.NOT_DELIVERED:
        return "red";
      case ORDER_STATUS_ENUM.CONFIRMED:
        return "green";
      case ORDER_STATUS_ENUM.CANCELLED:
        return "red";
      case ORDER_STATUS_ENUM.OUT_FOR_DELIVERY:
        return "red";

      case ORDER_STATUS_ENUM.RETURNED:
        return "red";
      case ORDER_STATUS_ENUM.COMPLETED:
        return "green";

      case ORDER_STATUS_ENUM.PARTIAL_CONFIRMED:
        return "green";
      case ORDER_STATUS_ENUM.CANCEL_REQUEST:
        return "magenta";
      case ACTION_TYPE.ADDRESS_UPDATED:
        return "gold";
      case ACTION_TYPE.ORDER_TRANSFERRED:
        return "cyan";
      case ACTION_TYPE.BILL_SAVE:
        return "purple";
      case ACTION_TYPE.ORDER_CREATED:
        return "lime";
      case ACTION_TYPE.ORDER_CONFIRMED:
        return "green";
      case ACTION_TYPE.DELIVERED:
        return "green";
      default:
        return "";
    }
  } catch (error) {}
};

// Return current
export const getCurrentDate = () => {
  return dayjs();
};

export const validateLength = (e) => {
  let value = e.target.value;
  // Remove any non-numeric characters
  value = value.replace(/\D/g, "");
  // Limit the length to 10 characters
  e.target.value = value.slice(0, 10);
};

/**
 * Convert ranges for Start and End of the Day
 * @param {*} values
 * @returns
 */

export const convertRangeISODateFormat = (values) => {
  try {
    let range = {};
    range["start"] = dayjs(values[0]).startOf("day").utc().toISOString();
    range["end"] = dayjs(values[1]).endOf("day").utc().toISOString();

    return range;
  } catch (error) {
    console.log(error, "error");
  }
};

export const convertDateISODateFormat = () => {
  try {
    const startDate = dayjs.utc().startOf("day");
    const endDate = dayjs.utc().endOf("day");

    return [startDate, endDate];
  } catch (error) {
    console.log(error);
  }
};

export const getFinancialYearRange = () => {
  const currentYear = dayjs().year();
  const fiscalYearStart = dayjs(`${currentYear}-04-01`);

  // Adjust for fiscal year starting in the previous calendar year
  const startDate = dayjs().isBefore(fiscalYearStart)
    ? fiscalYearStart.subtract(1, "year")
    : fiscalYearStart;
  const endDate = dayjs();

  return [startDate, endDate];
};

export const validateMessage =
  (minLength = 10, maxLength = 60, errorMessage) =>
  (_, value) => {
    const regex = /^\S.*\S$|^\S$/; // Allows words, numbers, and special characters, but no spaces at the start or end

    if (!value) {
      return Promise.resolve();
    }
    if (!regex.test(value)) {
      return Promise.reject(new Error("Cannot start or end with a space."));
    }
    if (value.length < minLength) {
      return Promise.reject(new Error(`Must be at least ${minLength} characters long.`));
    }
    if (value.length > maxLength) {
      return Promise.reject(new Error(`Cannot exceed ${maxLength} characters.`));
    }
    return Promise.resolve();
  };

export const validateMaxLength = (e, maxLength = 10) => {
  const value = e.target.value;

  if (value.length > maxLength) {
    e.target.value = value.slice(0, maxLength);
  }
};

export const navigatePath = (item) => {
  switch (item?.slug) {
    case "pending_orders":
      return `${Paths.crmOrders}/pending`;
    case "total_orders":
      return `${Paths.crmOrders}/total`;
    case "cancel_order":
      return `${Paths.crmOrders}/cancelled`;
    case "confirmed_order":
      return `${Paths.crmOrders}/confirmed`;
    case "delivered_order":
      return `${Paths.crmOrders}/delivered`;
    default:
      return Paths.crmOrders;
  }
};

export const getDateRange = (frequency) => {
  const now = new Date();

  if (frequency === "daily") {
    // Start date: today at 12 AM
    const start_date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    // End date: tomorrow at 12 AM
    const end_date = new Date(start_date);
    end_date.setHours(23, 59, 59, 999); // Set to 11:59:59.999 PM
    return { start_date, end_date };
  } else if (frequency === "weekly") {
    // Start date: 12 AM of the previous day, 7 days ago
    const start_date = new Date(now);
    start_date.setDate(now.getDate() - 7);
    start_date.setHours(0, 0, 0, 0); // Set to 12 AM
    // End date: today at 12 AM of next day
    const end_date = new Date(now);
    end_date.setHours(23, 59, 59, 999); // Set to 11:59:59.999 PM
    return { start_date, end_date };
  } else if (frequency === "monthly") {
    // Start date: 12 AM of the date 30 days ago
    const start_date = new Date(now);
    start_date.setDate(now.getDate() - 30);
    start_date.setHours(0, 0, 0, 0); // Set to 12 AM
    // End date: today at 12 AM of next day
    const end_date = new Date(now);
    end_date.setHours(23, 59, 59, 999); // Set to 11:59:59.999 PM

    return { start_date, end_date };
  }
};

export const isOrderItemIncluded = (checkField, orderItemId) => {
  return checkField?.some((item) => item.order_item_id === orderItemId);
};

export const getStatusTagCount = (value, index = 0) => {
  try {
    switch (value.crm_item_status) {
      case CARD_STATUS.PENDING:
        return (
          <Tag color="warning" key={index} bordered={true}>
            Pending {value.count > 0 ? `(${value.count})` : ""}
          </Tag>
        );
      case ORDER_STATUS_ENUM.NOT_DELIVERED:
        return (
          <Tag color="error" key={index} bordered={true}>
            Undelivered ({value.count})
          </Tag>
        );
      case ORDER_STATUS_ENUM.CONFIRMED:
        return (
          <Tag color="purple" key={index} bordered={true}>
            Confirmed ({value.count})
          </Tag>
        );
      case ORDER_STATUS_ENUM.CANCELLED:
        return (
          <Tag color="error" key={index} bordered={true}>
            Cancelled {value.count > 0 ? `(${value.count})` : ""}
          </Tag>
        );
      case ORDER_STATUS_ENUM.OUT_FOR_DELIVERY:
        return (
          <Tag color="error" key={index} bordered={true}>
            Out For Delivery ({value.count})
          </Tag>
        );
      case ORDER_STATUS_ENUM.DELIVERED:
        return (
          <Tag color="success" key={index} bordered={true}>
            Delivered ({value.count})
          </Tag>
        );

      case ORDER_STATUS_ENUM.RETURNED:
        return (
          <Tag color="error" key={index} bordered={true}>
            Returned {value.count > 0 ? `(${value.count})` : ""}
          </Tag>
        );
      case ORDER_STATUS_ENUM.COMPLETED:
        return (
          <Tag color="error" key={index} bordered={true}>
            Completed ({value.count})
          </Tag>
        );
      case ORDER_STATUS_ENUM.PACKED:
        return (
          <Tag color="processing" key={index} bordered={true}>
            Packed ({value.count})
          </Tag>
        );
      case ORDER_STATUS_ENUM.PROCESSING:
        return (
          <Tag color="processing" key={index} bordered={true}>
            Processing ({value.count})
          </Tag>
        );
      case ORDER_STATUS_ENUM.SHIPPED:
        return (
          <Tag color="processing" key={index} bordered={true}>
            Shipped ({value.count})
          </Tag>
        );
      case ORDER_STATUS_ENUM.PARTIAL_CONFIRMED:
        return (
          <Tag color="success" key={index} bordered={true}>
            Partial ConFirmed ({value.count})
          </Tag>
        );
      case ORDER_STATUS_ENUM.PARTIAL_RETURNED:
        return (
          <Tag color="purple" key={index} bordered={true}>
            Partially Returned {value.count > 0 ? `(${value.count})` : ""}
          </Tag>
        );
      case ORDER_STATUS_ENUM.CANCEL_REQUEST:
        return (
          <Tag color="magenta" key={index}>
            Cancel Request ({value.count})
          </Tag>
        );
      case ORDER_STATUS_ENUM.FAILED:
        return (
          <Tag color="red" key={index} bordered={true}>
            Failed {value.count > 0 ? `(${value.count})` : ""}
          </Tag>
        );
      case ORDER_STATUS_ENUM.RETURN_INITIATED:
        return (
          <Tag color="lime" key={index} bordered={true}>
            Return Initiated {value.count > 0 ? `(${value.count})` : ""}
          </Tag>
        );

      case ORDER_STATUS_ENUM.PARTIAL_RETURNED_INITIATED:
        return (
          <Tag color="purple" key={index} bordered={true}>
            Partial Return Initiated {value.count > 0 ? `(${value.count})` : ""}
          </Tag>
        );
      case ORDER_STATUS_ENUM.DELIVERY_ATTEMPTED:
        return (
          <Tag color="processing" key={index} bordered={true}>
            Delivery Attempted {value.count > 0 ? `(${value.count})` : ""}
          </Tag>
        );

      default:
        return (
          <Tag bordered={true} key={index} className="textCapitalize">
            {(value && splitConversion(value)) || "N/A"}
          </Tag>
        );
    }
  } catch (error) {}
};

export const checkStatusDelivered = (arr = []) => {
  let status = arr.some(
    (item) =>
      item.crm_item_status === "delivered" ||
      item.crm_item_status === ORDER_STATUS_ENUM.PARTIAL_RETURNED ||
      item.crm_item_status === ORDER_STATUS_ENUM.PARTIAL_RETURNED_INITIATED
  );
  //   let status = arr.some(item => item.crm_item_status === "delivered");
  return status;
};

// check all item return

export const checkReturnOrder = (arr = []) => {
  let result = arr.some(
    (item) =>
      (item?.item_status == "delivered" && item.is_returnable == true) ||
      (item?.item_status == "returned" && item?.partially_returned == true)
  );
  return result;
};

export const getReturnTrackingStatus = (value) => {
  try {
    switch (value) {
      case CARD_STATUS.PENDING:
        return (
          <Tag color="success" bordered={true}>
            Return Initiated
          </Tag>
        );
      case CARD_STATUS.CANCELLED:
        return (
          <Tag color="error" bordered={true}>
            Cancelled
          </Tag>
        );

      case ORDER_STATUS_ENUM.RETURNED:
        return (
          <Tag color="success" bordered={true}>
            Returned
          </Tag>
        );

      case ORDER_STATUS_ENUM.RETURN_INITIATED:
        return <Tag color="lime">{splitConversion(ORDER_STATUS_ENUM.RETURN_INITIATED)}</Tag>;
      default:
        return (
          <Tag bordered={true} className="textCapitalize">
            {(value && splitConversion(value)) || "N/A"}
          </Tag>
        );
    }
  } catch (error) {}
};

export const getTrackingIconColor = (value) => {
  try {
    switch (value) {
      case ORDER_STATUS_ENUM.CANCELLED:
        return "red";

      default:
        return "green";
    }
  } catch (error) {}
};
