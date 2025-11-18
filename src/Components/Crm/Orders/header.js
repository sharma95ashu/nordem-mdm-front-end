import React from "react";
import { Button, Typography, Alert, Flex } from "antd";
import {
  ArrowLeftOutlined,
  EyeOutlined,
  CloseOutlined,
  CheckOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  ExclamationCircleFilled
} from "@ant-design/icons";
import Images from "Static/CRM_STATIC/img";
import { CARD_STATUS, ORDER_STATUS_ENUM } from "CrmHelper/crmConstant";
import { checkReturnOrder } from "CrmHelper/crm.helper";
import { getAntDateTimeFormat } from "Helpers/ats.helper";
import { CART_TYPE } from "Helpers/ats.constants";

const add30Days = (value) => {
  const date = new Date(value);
  date.setDate(date.getDate() + 30);
  return date;
};

const OrderActions = ({
  orderDetails,
  mode,
  handleBack,
  scrollToElement,
  handleModal,
  onSelectAll,
  showButton,
  handleCancelRefund,
  setTableModal,
  checkStatusDelivered,
  setShowReturn,
  showReturn,
  handleReturnRefund,
  handleReturn,
  setCancelOrderModel,
  getStatusTag,
  getStatusTagCount,
  setSelectButton,
  selectButton,
  setShowButton,
  ResetOnCancel,
  checkField,
  isReturn
}) => {
  return (
    <Flex justify="space-between" align="center" gap="middle" wrap="wrap">
      <Flex gap="middle" align="center" wrap="wrap">
        <Button icon={<ArrowLeftOutlined />} onClick={handleBack}>
          Back
        </Button>

        <Typography.Text strong>{`Details Of Order No. "${
          isReturn ? orderDetails?.return_order_no : orderDetails?.order_no
        }"`}</Typography.Text>

        {orderDetails?.item_status?.length > 0 ? (
          orderDetails?.item_status?.map((item, index) => getStatusTagCount(item, index))
        ) : (
          <Typography.Text className="textCapitalize">
            {getStatusTag(orderDetails?.order_status)}
          </Typography.Text>
        )}

        <Button type="link" icon={<EyeOutlined />} onClick={scrollToElement}>
          View Details
        </Button>
      </Flex>

      <Flex align="center" gap="middle" wrap="wrap">
        {orderDetails?.order_status === CARD_STATUS.PENDING && !showButton && !isReturn && (
          <>
            <Button
              className="InlineIcon"
              icon={<img src={mode ? Images.AddressIcon : Images.AddressIconDarkMode} />}
              onClick={handleModal}>
              {"Edit Shipping Details"}
            </Button>

            {orderDetails?.offer_id && (
              <Button type="primary" danger onClick={() => onSelectAll("cancel")}>
                {"Cancel All Items"}
              </Button>
            )}
            {orderDetails?.order_to === CART_TYPE.PUC && (
              <>
                {
                  <Button
                    type="primary"
                    danger
                    onClick={() => {
                      setShowButton(true);
                      setSelectButton("cancel");
                    }}>
                    {"Cancel items"}
                  </Button>
                }

                <Button
                  type="primary"
                  onClick={() => {
                    setShowButton(true);
                    setSelectButton("confirm");
                  }}>
                  {"Confirm  Items"}
                </Button>
              </>
            )}
          </>
        )}
        {orderDetails?.order_status === CARD_STATUS.CONFIRMED && !showButton && !isReturn && (
          <>
            {/* <Button
              className="InlineIcon"
              icon={<img src={mode ? Images.AddressIcon : Images.AddressIconDarkMode} />}
              onClick={handleModal}>
              {"Edit Shipping Details"}
            </Button> */}

            {/* {orderDetails?.offer_id && (
              <Button type="primary" danger onClick={() => onSelectAll("cancel")}>
                {"Cancel All Items"}
              </Button>
            )} */}
            {orderDetails?.order_to === CART_TYPE.PUC && (
              <>
                {
                  <Button
                    type="primary"
                    danger
                    onClick={() => {
                      setShowButton(true);
                      setSelectButton("cancel");
                    }}>
                    {"Cancel items"}
                  </Button>
                }

                <Button
                  type="primary"
                  onClick={() => {
                    setShowButton(true);
                    setSelectButton("confirm");
                  }}>
                  {"Update Item's Quantity"}
                </Button>
              </>
            )}
          </>
        )}

        {(showButton || orderDetails?.order_to === CART_TYPE.DEPOT) &&
          orderDetails?.order_status === CARD_STATUS.PENDING && (
            <>
              {selectButton == "cancel" &&
                checkField?.length > 0 &&
                orderDetails?.order_to === CART_TYPE.PUC && (
                  // (orderDetails?.order_to === CART_TYPE.DEPOT &&
                  //   (orderDetails.cust_type === "DW" ||
                  //     orderDetails.cust_type === "DIST" ||
                  //     orderDetails.cust_type === "REG")))
                  <Button type="primary" onClick={handleCancelRefund}>
                    Cancel Selected Items
                  </Button>
                )}
              {console.log(
                orderDetails?.order_to === CART_TYPE.DEPOT && orderDetails.offer_id,
                checkField
              )}
              {selectButton == "confirm" ||
              (orderDetails?.order_to === CART_TYPE.DEPOT && orderDetails.offer_id) ? (
                <>
                  {checkField &&
                    checkField?.length > 0 &&
                    orderDetails?.order_to === CART_TYPE.PUC && (
                      <Button
                        type="primary"
                        onClick={() => setTableModal(true)}
                        icon={<CheckOutlined />}>
                        Confirm Items
                      </Button>
                    )}

                  {(checkField == null || checkField?.length === 0) && (
                    <Button type="primary" onClick={onSelectAll} icon={<CheckOutlined />}>
                      Confirm All Items
                    </Button>
                  )}
                </>
              ) : null}

              {orderDetails?.order_to === CART_TYPE.PUC && (
                <Button
                  type="primary"
                  danger
                  onClick={() => {
                    ResetOnCancel();
                  }}
                  icon={<CloseOutlined />}>
                  Cancel
                </Button>
              )}
            </>
          )}

        {(showButton || orderDetails?.order_to === CART_TYPE.DEPOT) &&
          orderDetails?.order_status === CARD_STATUS.CONFIRMED && (
            <>
              {selectButton == "cancel" &&
                checkField?.length > 0 &&
                orderDetails?.order_to === CART_TYPE.PUC && (
                  // (orderDetails?.order_to === CART_TYPE.DEPOT &&
                  //   (orderDetails.cust_type === "DW" ||
                  //     orderDetails.cust_type === "DIST" ||
                  //     orderDetails.cust_type === "REG")))
                  <Button type="primary" onClick={handleCancelRefund}>
                    Cancel Selected Items
                  </Button>
                )}
              {console.log(
                orderDetails?.order_to === CART_TYPE.DEPOT && orderDetails.offer_id,
                checkField
              )}
              {selectButton == "confirm" ||
              (orderDetails?.order_to === CART_TYPE.DEPOT && orderDetails.offer_id) ? (
                <>
                  {checkField &&
                    checkField?.length > 0 &&
                    orderDetails?.order_to === CART_TYPE.PUC && (
                      <Button
                        type="primary"
                        onClick={() => setTableModal(true)}
                        icon={<CheckOutlined />}>
                        Update Items
                      </Button>
                    )}
                </>
              ) : null}

              {orderDetails?.order_to === CART_TYPE.PUC && (
                <Button
                  type="primary"
                  danger
                  onClick={() => {
                    ResetOnCancel();
                  }}
                  icon={<CloseOutlined />}>
                  Cancel
                </Button>
              )}
            </>
          )}

        {orderDetails?.order_status === CARD_STATUS.DELIVERED &&
          orderDetails?.show_return_button &&
          orderDetails?.order_to != CART_TYPE.DEPOT && (
            <>
              {!showReturn && checkStatusDelivered(orderDetails?.item_status) && (
                <Flex horizontal align="center" justify="center" gap={5}>
                  <ExclamationCircleFilled style={{ color: "#1755a6", fontSize: "16px" }} />

                  <Typography.Text style={{ color: "#1755a6", fontWeight: 500 }}>
                    Return valid until{" "}
                    {getAntDateTimeFormat(
                      add30Days(orderDetails?.delivery_date || orderDetails?.order_date)
                    )}
                  </Typography.Text>

                  <Button
                    type="primary"
                    icon={<ReloadOutlined />}
                    style={{ backgroundColor: "#1755a6", borderColor: "#1755a6" }}
                    onClick={() => {
                      setShowButton(true);
                      setShowReturn(true);
                    }}>
                    Return order
                  </Button>
                </Flex>
              )}

              {showReturn && checkStatusDelivered(orderDetails?.item_status) && (
                <>
                  {!showButton && checkReturnOrder(orderDetails?.order_items) && (
                    <Button
                      icon={<CheckOutlined />}
                      onClick={() => onSelectAll(CARD_STATUS.RETURNED)}>
                      Confirm Return Completely
                    </Button>
                  )}

                  {showButton && checkField && checkField?.length > 0 && (
                    <Button onClick={handleReturnRefund} icon={<CheckOutlined />}>
                      Confirm Return
                    </Button>
                  )}
                  <Button type="primary" danger onClick={handleReturn}>
                    Cancel
                  </Button>
                </>
              )}
            </>
          )}

        {/* {orderDetails?.order_status === CARD_STATUS.CONFIRMED && (
          <Button
            type="primary"
            onClick={() => createInvoiceApi({ order_no: orderDetails?.order_no })}>
            {"Create Invoice"}
          </Button>
        )} */}
      </Flex>

      {orderDetails?.order_status === ORDER_STATUS_ENUM.CANCEL_REQUEST && (
        <Alert
          className="alert_request"
          message={"You have Order Cancel Request"}
          type="error"
          icon={<ExclamationCircleOutlined />}
          showIcon
          action={
            <Button type="primary" size="small" danger onClick={() => setCancelOrderModel(true)}>
              View Request
            </Button>
          }
        />
      )}
    </Flex>
  );
};

export default OrderActions;
