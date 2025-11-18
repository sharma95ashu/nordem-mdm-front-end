import {
  CheckCircleOutlined,
  EllipsisOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  PlusCircleOutlined
} from "@ant-design/icons";
import {
  Button,
  Card,
  Col,
  Row,
  Typography,
  Table,
  Modal,
  Form,
  Spin,
  Alert,
  Space,
  Input,
  Select,
  Tooltip,
  Flex,
  Popconfirm,
  Dropdown
  // Tag,
  // Image
} from "antd";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Search from "antd/es/input/Search";
import { useServices } from "Hooks/ServicesContext";
import React, { useState, useEffect, useContext } from "react";
import { Paths } from "Router/Paths";
import { ColorModeContext } from "Helpers/contexts";

import { useMutation, useQuery } from "react-query";
import {
  StringTruncate,
  getDateTimeFormat
  //  validateLength
} from "Helpers/ats.helper";
import { CART_TYPE, snackBarSuccessConf } from "Helpers/ats.constants";
import { enqueueSnackbar } from "notistack";
import {
  checkStatusDelivered,
  getIconsColor,
  getStatusTag,
  getStatusTagCount,
  isOrderItemIncluded,
  validateMaxLength,
  validateMessage
} from "CrmHelper/crm.helper";
import { CRMOrderContext } from "Helpers/contexts";
import OrderDetails from "./Details";
import { useUserContext } from "Hooks/UserContext";
import Images from "Static/CRM_STATIC/img";
import { CARD_STATUS, CRM_ORDER_KEY, REMARK_CANCEL_ITEMS } from "CrmHelper/crmConstant";
import {
  CancelRequestModel,
  DimensionModal,
  OfferModal,
  OtpVerficationModal,
  PickupModalShipRocket,
  ShippingModal,
  SuccessModal,
  TrackingModal
} from "./Model";
import OrderActions from "./header";
import DepotTable from "./NestedTable";
import { getDepoOrderColumsForReturn } from "./Columns";
import ShippingModuleReturn from "./ShippingModuleReturn";
import RejectModel from "./RejectModel";
// import ShippingSvg from "Static/CRM_STATIC/img/Shipping.svg";

const CrmOrders = () => {
  const { mode } = useContext(ColorModeContext);
  const location = useLocation();
  const { lastOrderDetails } = location.state || {};
  const { setBreadCrumb } = useUserContext();
  const scrollDetails = React.useRef(null);

  const [shippingForm] = Form.useForm();
  const [orderForm] = Form.useForm();
  const [otpForm] = Form.useForm();

  const params = useParams();
  const [open, setOpen] = React.useState(false);
  const [orderDetails, setOrderDetails] = useState();
  const [rejectModel, setRejectModel] = useState({ open: false });
  const [showButton, setShowButton] = useState(false);
  const [searchData, setSearchData] = useState(null);
  const [OrderSearchData, setOrderSearchData] = useState(null);
  const [cancelOrderModel, setCancelOrderModel] = useState(false);
  const [offerEnable, setOfferEnable] = useState(false);
  const [offerData, setOfferData] = useState([]);
  const [offerTableData, setOfferTableData] = useState([]);
  const [refundData, setRefundData] = useState([]);

  const [checkField, setCheckField] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [isFormTouched, setIsFormTouched] = useState(true);
  const [tableModal, setTableModal] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [cancelItemCall, setCancelItemCall] = useState(false);
  const [selectedOtherReason, setSelectedOtherReason] = useState(null);
  const [selectedReason, setSelectedReason] = useState(null);
  const [showReturn, setShowReturn] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [showSuccessModel, setShowSuccessModal] = useState(false);
  const [itemTracking, setItemTracking] = useState([]);
  const [apiData, setApiData] = useState(null);
  const [showReturnQty, setShowReturnQty] = useState(false);
  const [recordData, setRecordData] = useState(null);
  const [isDimensionalModal, setDimensionModal] = useState(false);
  const [showShippingScreen, setShowShippingScreen] = useState(false);
  const [selectButton, setSelectButton] = useState("");
  const [isPickupAddress, setIsPickupAddress] = useState(false);
  const [selectedValue, setSelectedValue] = useState(null);
  const [singleOrderDetails, setSingleOrderDetails] = useState(null);
  const [depotExpand, setDepoExpand] = useState([]);
  const [confirmOpen, setConfirmOpen] = useState({});
  const [actionType, setActionType] = useState({});
  const [returnMessage, setReturnMessage] = useState("");

  // const [otherReasonText, setOtherReasonText] = useState('');

  const navigate = useNavigate();
  const { apiService } = useServices();

  const handleQuantity = (record, action) => {
    try {
      const updatedData = [...offerTableData]; // Make a copy of the table data
      const itemIndex = updatedData.findIndex((item) => item.product_id === record.product_id);

      if (itemIndex !== -1) {
        // Make sure the item exists in the array
        const updatedItem = updatedData[itemIndex];

        // Ensure return_qty is initialized if it doesn't exist
        updatedItem.return_qty = updatedItem.return_qty || 1;

        if (action === "increment") {
          // Increment the return_qty if it hasn't reached the total quantity
          if (updatedItem.return_qty < updatedItem.quantity - (updatedItem.returned_qty || 0)) {
            updatedItem.return_qty += 1;
          }
        } else if (action === "decrement") {
          // Decrement the return_qty if it's greater than 0
          if (updatedItem.return_qty > 0) {
            updatedItem.return_qty -= 1;
          }
        }

        // Update return_qty in the checkField as well
        const checkFieldItemIndex = checkField.findIndex(
          (item) => item.order_item_id === updatedItem.order_item_id
        );
        if (checkFieldItemIndex !== -1) {
          checkField[checkFieldItemIndex].return_qty = updatedItem.return_qty;
        }

        // Update the state with the modified data
        setOfferTableData(updatedData);
      }
    } catch (error) {
      console.error("Error in handleQuantity:", error);
    }
  };

  const handleConfirmedQuantity = (record, action) => {
    try {
      const updatedOfferData = [...offerTableData];
      const offerIndex = updatedOfferData.findIndex(
        (item) => item.product_id === record.product_id
      );

      // Helper: update accepted quantity
      const updateQuantity = (item, action) => {
        const updatedItem = { ...item };

        if (action === "decrement" && updatedItem?.total_accepted_qty != 1) {
          updatedItem.total_accepted_qty -= 1;
        }

        if (action === "increment" && updatedItem?.quantity != updatedItem?.total_accepted_qty) {
          updatedItem.total_accepted_qty += 1;
        }

        return updatedItem;
      };

      // Update offerTableData
      if (offerIndex !== -1) {
        updatedOfferData[offerIndex] = updateQuantity(updatedOfferData[offerIndex], action);
        setOfferTableData(updatedOfferData);
      }

      // Update tableData only if it has items
      if (tableData.length > 0) {
        const updatedTableData = [...tableData];
        const updatedCheckFiledData = [...checkField];
        const tableIndex = updatedTableData.findIndex(
          (item) => item.product_id === record.product_id
        );
        const checkFieldIndex = updatedCheckFiledData.findIndex(
          (item) => item.order_item_id === record.order_item_id
        );

        if (tableIndex !== -1) {
          updatedCheckFiledData[checkFieldIndex] = updateQuantity(
            updatedCheckFiledData[tableIndex],
            action
          );
          updatedTableData[tableIndex] = updateQuantity(updatedTableData[tableIndex], action);
          setCheckField(updatedCheckFiledData);
          setTableData(updatedTableData);
        }
      }
    } catch (error) {
      console.error("Error in handleConfirmedQuantity:", error);
    }
  };
  const handleConfirmedQuantityDepot = (record, action) => {
    try {
      const updatedOfferData = [...offerTableData];
      let itemIndex = -1;

      const offerIndex = updatedOfferData.findIndex((e) =>
        e.order_items.find((item, index) => {
          if (item.product_id === record.product_id) {
            itemIndex = index;
            return true;
          }
        })
      );

      // Helper: update accepted quantity
      const updateQuantity = (item, action) => {
        const updatedItem = { ...item };

        if (action === "decrement" && updatedItem?.total_accepted_qty != 1) {
          updatedItem.total_accepted_qty -= 1;
        }

        if (action === "increment" && updatedItem?.quantity != updatedItem?.total_accepted_qty) {
          updatedItem.total_accepted_qty += 1;
        }

        return updatedItem;
      };

      // Update offerTableData
      if (offerIndex !== -1) {
        updatedOfferData[offerIndex]["order_items"][itemIndex] = updateQuantity(
          updatedOfferData[offerIndex]["order_items"][itemIndex],
          action
        );
        setOfferTableData(updatedOfferData);
      }

      // Update tableData only if it has items
      if (tableData.length > 0) {
        const updatedTableData = [...tableData];
        const updatedCheckFiledData = [...checkField];
        const tableIndex = updatedTableData.findIndex(
          (item) => item.product_id === record.product_id
        );
        const checkFieldIndex = updatedCheckFiledData.findIndex(
          (item) => item.order_item_id === record.order_item_id
        );

        if (tableIndex !== -1) {
          updatedCheckFiledData[checkFieldIndex] = updateQuantity(
            updatedCheckFiledData[tableIndex],
            action
          );
          updatedTableData[tableIndex] = updateQuantity(updatedTableData[tableIndex], action);
          setCheckField(updatedCheckFiledData);
          setTableData(updatedTableData);
        }
      }
    } catch (error) {
      console.error("Error in handleConfirmedQuantity:", error);
    }
  };

  // Table columns
  const columns = [
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
      width: 600,
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
      sorter: (a, b) => a.item_status.localeCompare(b.crm_item_status),
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
      title: " Remaining Quantity",
      dataIndex: "quantity",
      sorter: (a, b) => a.quantity - b.quantity,
      render: (text, record) => (
        <>{record.crm_item_status == CARD_STATUS.CANCELLED ? 0 : Number(text)}</>
      )
    },

    ...(orderDetails?.order_status === CARD_STATUS.DELIVERED &&
    orderDetails.order_to !== CART_TYPE.DEPOT
      ? [
          {
            title: "Quantity to Return",
            dataIndex: "return_quantity",
            key: "return_quantity",
            render: (text, record) => {
              return record.item_status === CARD_STATUS.DELIVERED ||
                record?.returned_qty != record?.quantity ? (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button
                    type="link"
                    icon={<MinusCircleOutlined />}
                    onClick={() => handleQuantity(record, "decrement")}
                    disabled={
                      !isOrderItemIncluded(checkField, record.order_item_id) ||
                      record.return_qty == 1 ||
                      record.return_qty == undefined ||
                      record.item_status == CARD_STATUS.PENDING
                    }
                  />
                  <span style={{ margin: "0 8px" }}>
                    {record.return_qty ? record.return_qty : 1}{" "}
                    {/* Use 0 if return_qty is not defined */}
                  </span>
                  <Button
                    type="link"
                    icon={<PlusCircleOutlined />}
                    onClick={() => handleQuantity(record, "increment")}
                    disabled={
                      !isOrderItemIncluded(checkField, record.order_item_id) ||
                      record.return_qty >= record.quantity ||
                      record.quantity == 1 ||
                      record.item_status == CARD_STATUS.PENDING ||
                      record.return_qty == record.quantity - record.returned_qty //when return_qty reaches the total quantity
                    } // Disable increment if return_qty reaches the total quantity
                  />
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <Button type="link" icon={<MinusCircleOutlined />} disabled={true} />
                  <span style={{ margin: "0 8px" }}>
                    {0} {/* Use 0 if return_qty is not defined */}
                  </span>
                  <Button
                    type="link"
                    icon={<PlusCircleOutlined />}
                    disabled={true} // Disable increment if return_qty reaches the total quantity
                  />
                </div> // Show plain text for non-DELIVERED status
              );
            }
          },
          {
            title: "Total Returned Qty",
            dataIndex: "returned_qty",
            sorter: (a, b) => a.returned_qty - b.returned_qty,
            render: (text) => <Typography.Text type="secondary">{text || 0}</Typography.Text>
          }
        ]
      : []),

    ...(orderDetails?.order_status === CARD_STATUS.PENDING && selectButton == "confirm"
      ? [
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
                      onClick={() => handleConfirmedQuantity(record, "decrement")}
                      disabled={
                        record?.total_accepted_qty == 1 ||
                        !isOrderItemIncluded(checkField, record.order_item_id) ||
                        record?.offer_items?.length
                      }
                    />
                    <span style={{ margin: "0 8px" }}>
                      {record?.total_accepted_qty ? record?.total_accepted_qty : record?.quantity}
                    </span>
                    <Button
                      type="link"
                      icon={<PlusCircleOutlined />}
                      onClick={() => handleConfirmedQuantity(record, "increment")}
                      // Disable increment if quantity  is equal to total_accepted_qty  reaches
                      disabled={
                        record?.quantity == record?.total_accepted_qty ||
                        !isOrderItemIncluded(checkField, record.order_item_id) ||
                        record?.offer_items?.length
                      }
                    />
                  </div>
                </>
              );
            }
          }
        ]
      : []),

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
    // {
    //   title: "Discount (₹)",
    //   dataIndex: "discount",
    //   width: 200,
    //   sorter: (a, b) => parseFloat(a.discount) - parseFloat(b.discount),
    //   render: (text) => <Typography.Text type="secondary">{text ? text : ""}</Typography.Text>
    // },

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
      title: "Discount",
      dataIndex: "discount",
      width: 200,
      sorter: (a, b) => Number(a.discount) - Number(b.discount),
      render: (text) => <Typography.Text type="secondary">{text || "N/A"}</Typography.Text>
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
          {record.return_order_item?.length > 0 && (
            <Tooltip title={"View order tracking"}>
              <Button type="primary" onClick={() => handleTrackingModal(record)}>
                View Tracking
              </Button>
            </Tooltip>
          )}

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

  // Table Model column
  const tableModalColumns = [
    {
      title: "SAP Code",
      dataIndex: "sap_code",
      width: 40
    },
    {
      title: "Product Name",
      dataIndex: "product_name",
      width: 150,
      render: (text) => <Typography.Text type="secondary">{text || "N/A"}</Typography.Text>
    },

    {
      title: "Total Quantity",
      dataIndex: "total_accepted_qty",
      width: 40
    },
    ...(orderDetails?.order_status === CARD_STATUS.DELIVERED
      ? [
          {
            title: "Qty to Return",
            dataIndex: "return_qty",
            width: 40,
            render: (text, record) => (
              <Typography>
                {showReturnQty ? record.quantity - (record?.returned_qty || 0) : text || 1}
              </Typography>
            ) // Default to 0 if missing
          }
        ]
      : []),

    {
      title: "Total Amount (₹)",
      dataIndex: "total_amount",
      width: 50,
      render: (text, record, index) => {
        const totalAmount = Number(record.rate) * Number(record.total_accepted_qty);
        return <Typography.Text>{totalAmount.toFixed(2)}</Typography.Text>;
      }
    }
  ];

  // View tracking trackingData
  const handleTrackingModal = (record) => {
    setItemTracking(record);
    setTracking(true);
  };

  // Handle back Button
  const handleBack = () => {
    if (showShippingScreen) {
      setIsPickupAddress(false);
      setShowShippingScreen(false);
      return;
    }
    navigate(`/${Paths.crmOrderReturnSearch}`, {
      state: {
        lastOrderDetails: OrderSearchData
      }
    });
  };

  // handle View details
  const scrollToElement = () => {
    if (scrollDetails.current) {
      scrollDetails.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Handle modal
  const handleModal = () => {
    try {
      setOpen(true);
      const data = {
        shipping_address: orderDetails.shipping_address,
        shipping_mobile: orderDetails.shipping_mobile
      };

      shippingForm.setFieldsValue(data);
    } catch (error) {
      console.error("Error in handleModal:", error);
    }
  };

  // handle Cancel
  const handleCancel = () => {
    setOpen(false);
    setIsFormTouched(true);
  };

  // handle search products
  const handleSearch = (value) => {
    try {
      // Allow search key
      const AllowedSearchKey = ["product_name", "sap_code"];

      const filterTable = orderDetails?.order_items.filter((o) =>
        Object.keys(o).some((k) => {
          // Check if the key matches any of the specified columns and if the value contains the search text
          if (
            AllowedSearchKey &&
            AllowedSearchKey.includes(k) &&
            String(o[k]).toLowerCase().startsWith(value.toLowerCase())
          ) {
            return true;
          }
          return false;
        })
      );

      setSearchData(filterTable.length > 0 ? filterTable : []);
    } catch (error) {
      setSearchData([]);
      // Handle error
      console.log(error);
    }
  };

  // GET Available Pickup Dates
  const { mutate: getPickUpDateApi, isLoading: pickupLoading } = useMutation(
    "getCourierDetails",
    (data) => apiService.apiPickupScheduleDate(data),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        if (data?.success) {
          enqueueSnackbar(data.message, snackBarSuccessConf);
          setSelectedValue(null);
          setIsPickupAddress(false);
          getSingleOrder();
        }
      },
      onError: (error) => {
        setSelectedValue(null);
        console.log(error);

        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // call Api getSingleOrder
  const { refetch: getSingleOrder, isLoading: getSingleLoader } = useQuery(
    "getSingleOrderDetails", // Unique query key for tracking in the query client

    () => apiService.getCrmOrdersReturnByID(params.id),
    {
      // Configuration options for the query
      enabled: true, // Enable the query by default
      onSuccess: (data) => {
        if (data?.success) {
          setOrderDetails(data?.data);
          let cartData = data?.data;

          // Store the result in state

          const offerItemsMap = cartData.return_order_items.map((e) =>
            e.order_items
              ?.filter((item) => item.is_offer_product && !item.is_only_offer_purchasable)
              .reduce((acc, item) => {
                const offerId = item.offer_id;
                if (!acc[offerId]) {
                  acc[offerId] = [];
                }
                acc[offerId].push(item);
                return acc;
              }, {})
          );

          // Map to transform the input into the desired output
          const output = cartData.return_order_items?.map((e) => {
            let newOrder = e.order_items
              ?.filter((item) => !item.is_offer_product || item.is_only_offer_purchasable)
              .map((item, index) => {
                let offer_items = offerItemsMap.find((e) => e[item.offer_id]);
                offer_items = offer_items ? offer_items[item.offer_id] : [];
                return {
                  ...item,
                  // return_order_items: item.order_items?.map((item) => ({
                  //   ...item,
                  total_accepted_qty: item.quantity,
                  sr_no: index + 1,
                  offer_items: offer_items
                  // }))
                };
              });

            return {
              ...e,
              order_items: newOrder
            };
          });

          setOfferTableData(output);
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        console.log(error);
      }
    }
  );

  // update shipping address call Api
  const { mutate: updateShippingAdd, isLoading: shippingLoading } = useMutation(
    (data) => apiService.updateShippingAddress(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          setOpen(false);
          enqueueSnackbar(data.message, snackBarSuccessConf);
          setIsFormTouched(true);
          getSingleOrder();
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );

  // create Invoice depot order
  const { mutate: depotCreateInvoice, isLoading: loadingInvoice } = useMutation(
    (data) => apiService.createInvoiceDepot(data),
    {
      onSuccess: (data) => {
        if (data?.success && data?.data?.length && data?.data[0].INVOICE) {
          getSingleOrder();

          // call order created on ship rocket
          // addOrderShipRocket(recordData[0]);
          // setRecordData(recordData[0]);
          // enqueueSnackbar(data.message, snackBarSuccessConf);
          // getSingleOrder();
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );

  // // Ship rocket order create
  // const { mutate: shipRocketOrderCreateReturn, isLoading: shippingRocketLoading } = useMutation(
  //   (data) => apiService.addShipRocketReturnApi(data),
  //   {
  //     onSuccess: (data) => {
  //       if (data?.success) {
  //         getSingleOrder();
  //         enqueueSnackbar(data.message, snackBarSuccessConf);
  //       }
  //     },
  //     onError: (error) => {
  //       //error log
  //       console.log(error);
  //     }
  //   }
  // );

  // update shipping address call Api
  const { mutate: updateDetailsShipApi, isLoading: shipRocketApiLoading } = useMutation(
    (data) => apiService.UpdateDetailsShipRocketDetails(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          setDimensionModal(false);
          enqueueSnackbar(data.message, snackBarSuccessConf);
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );

  // handle reset confirm order and cancel Return items
  const handleReset = () => {
    setShowButton(false);
    setTableModal(false);
    setCheckField(null);
    setSelectedRowKeys(null);
    getSingleOrder();
    setSelectedOtherReason(null);
    setSelectedReason(null);
    orderForm.resetFields();
    otpForm.resetFields();
  };

  // Reset Button Header

  const ResetOnCancel = () => {
    setShowButton(false);
    setTableModal(false);
    setCheckField(null);
    setSelectedRowKeys(null);
    getSingleOrder();
    setSelectedOtherReason(null);
    setSelectedReason(null);
    setSelectButton("");
  };

  // Api order confirm Returns

  const { mutate: confirmOrderItemApi, isLoading: loaderOrderConfirm } = useMutation(
    (data) => apiService.orderConfirm(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          enqueueSnackbar(data.message, snackBarSuccessConf);
          handleReset();
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );

  // Refund cancel item

  const { mutate: refundCancelItem, isLoading: refundLoader } = useMutation(
    (data) => apiService.cancelOrderRefund(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          setRefundData(data?.data);
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );

  // order cancel Return items
  const { mutate: orderCancelItem, isLoading: loaderCancelItems } = useMutation(
    (data) => apiService.orderCancelItems(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          orderForm.resetFields();
          enqueueSnackbar(data.message, snackBarSuccessConf);
          handleReset();
          setCancelItemCall(false);
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );

  // Refund cancel item

  const { mutate: returnRefundCalc, isLoading: returnrefundLoader } = useMutation(
    (data) => apiService.returnOrderRefund(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          setRefundData(data?.data);
          setTableModal(true);
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );

  // Refund cancel item

  const { mutate: returnRefund, isLoading: returnRefundLoader } = useMutation(
    (data) => apiService.returnDepotOrderItem(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          setRefundData(data?.data);

          handleReset();
          setOtpModal(false);
          setShowSuccessModal(true);
          setReturnMessage("Return Confirmed Successfully");
          setShowReturn(false);
          setShowButton(false);
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );
  const { mutate: cancelReturnRefund } = useMutation(
    (data) => apiService.cancelReturnDepotOrderItem(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          setRefundData(data?.data);

          handleReset();
          setOtpModal(false);
          setShowSuccessModal(true);
          setReturnMessage("Return Cancelled Successfully");
          setShowReturn(false);
          setShowButton(false);
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );

  // Download label
  const downloadLabel = (label_url) => {
    const link = document.createElement("a");
    link.href = label_url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // generate OTP

  const { mutate: generateOTP, isLoading: loadingOtp } = useMutation(
    (data) => apiService.generateOTPReturn(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          // orderForm.resetFields();
          enqueueSnackbar(data.message, snackBarSuccessConf);
          setOtpModal(true);
          // handleReset();
          // setCancelItemCall(false);
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );

  // cancel ship rocket order
  // const { mutate: cancelShipRocketOrderApi, isLoading: loadingCancelOrder } = useMutation(
  //   (data) => apiService.shipRocketCancelOrderById(data),
  //   {
  //     onSuccess: (data) => {
  //       if (data?.success) {
  //         // orderForm.resetFields();
  //         enqueueSnackbar(data.message, snackBarSuccessConf);

  //         // handleReset();
  //         // setCancelItemCall(false);
  //       }
  //     },
  //     onError: (error) => {
  //       //error log
  //       console.log(error);
  //     }
  //   }
  // );

  // Download manifest ship rocket

  const { mutate: shipRocketDownloadMainfestApi, isLoading: loadingMainfeast } = useMutation(
    (data) => apiService.downloadManifestShipRocket(data),
    {
      onSuccess: (data) => {
        if (data?.success && data?.data?.manifest_url) {
          downloadLabel(data?.data?.manifest_url);
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );

  // Generate Label Ship rocket APi

  const { mutate: apiGenerateLabel, isLoading: loadingGenerateLabel } = useMutation(
    (data) => apiService.shipRocketGenerateLabel(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          try {
            if (data?.data?.label_url) {
              // download generate label
              downloadLabel(data.data.label_url);
            }
          } catch (error) {
            console.log(error);
          }
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );

  // call api and also setBreadCrumb
  useEffect(() => {
    try {
      setBreadCrumb({
        title: "CRM Orders Details"
      });
      // API Call to fetch order Data

      setOrderSearchData(lastOrderDetails);
      getSingleOrder();
    } catch (error) {
      //
    }
  }, []);
  // call api and also setBreadCrumb
  // useEffect(() => {
  //   try {
  //     if (recordData) {
  //       addOrderShipRocket();
  //     }
  //   } catch (error) {
  //     //
  //   }
  // }, [recordData]);

  // function to handle search on key down or backspace
  const handleKeyDown = (e) => {
    if (e.nativeEvent.inputType === "deleteContentBackward") {
      if (e.target?.value?.length === 0) {
        setSearchData(null);
      }
    }
  };

  // handle form
  const handleForm = (values) => {
    try {
      const filter = {
        order_no: orderDetails.order_no,
        ...values
      };

      updateShippingAdd(filter);
    } catch (error) {
      console.log(error);
    }
  };

  // call Api on submit
  const handleShipAddress = () => {
    shippingForm.submit();
  };

  // Tracking data Timeline
  const timelineItems = orderDetails?.order_tracking?.map((item, index) => ({
    children: (
      <div>
        <Typography.Text className="textCapitalize">
          {}

          {item?.action_type ? getStatusTag(item?.action_type) : getStatusTag(item?.status)}
        </Typography.Text>
        <br />
        Remark :{" "}
        <Typography.Text type="secondary" className="textCapitalize">
          {item?.remark}
        </Typography.Text>
        <br />
        {item.updated_by && (
          <>
            Updated By :{" "}
            <Typography.Text type="secondary" className="textCapitalize">
              {item?.updated_by}
            </Typography.Text>
            <br />
          </>
        )}
        <Typography.Text type="secondary">{getDateTimeFormat(item?.change_date)}</Typography.Text>
      </div>
    ),
    dot: (
      <CheckCircleOutlined
        style={{
          color: item?.action_type ? getIconsColor(item?.action_type) : getIconsColor(item?.status)
        }}
      />
    )
  }));

  // handleOrder to confirm Or cancel or return
  const handleOrder = async () => {
    try {
      let filter;
      if (orderDetails?.order_status == CARD_STATUS.DELIVERED) {
        filter = {
          order_no: orderDetails?.order_no,
          items_to_return: checkField
        };
      } else {
        filter = {
          order_no: orderDetails?.order_no,
          order_info: checkField
        };
      }

      // api call for  cancel Return items
      if (cancelItemCall) {
        const values = await orderForm.validateFields(["reason"]);
        if (values?.reason == "other") {
          await orderForm.validateFields(["message"]);
        }
        filter["remark"] = selectedReason === "other" ? selectedOtherReason : selectedReason;
        orderCancelItem(filter);
      } else if (orderDetails?.order_status == CARD_STATUS.DELIVERED) {
        const values = await orderForm.validateFields(["reason"]);
        if (values?.reason == "other") {
          await orderForm.validateFields(["message"]);
        }
        filter["remark"] = selectedReason === "other" ? selectedOtherReason : selectedReason;

        setApiData(filter);
        // Api Call

        generateOTP(filter);
        // returnRefund(filter);

        // handleReset();
        // orderForm.resetFields();
      } else {
        // api call for order items confirmed
        confirmOrderItemApi(filter);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Function  to Confirm(check all order which are pending) all order
  const onSelectAll = (key = "confirm") => {
    // Determine the data source, either searchData or orderDetails
    const data = searchData === null ? offerTableData : searchData;

    let filteredData;
    // Filter out rows where the status is "pending"
    if (key == "returned") {
      setShowReturnQty(true);
      filteredData = data.filter(
        (item) =>
          (item.item_status == CARD_STATUS.DELIVERED &&
            item.is_returnable == true &&
            item.fully_returned == false) ||
          (item.partially_returned == true &&
            item.item_status == CARD_STATUS.RETURNED &&
            item.fully_returned == false)
      );
    } else {
      if (orderDetails?.order_to === CART_TYPE.PUC) {
        filteredData = data.filter((item) => item.item_status == CARD_STATUS.PENDING);
      } else {
        let newData = [];

        data.map((e) => {
          let filter = e.order_items.filter((item) => item.item_status == CARD_STATUS.PENDING);
          newData.push(...filter);
        });
        filteredData = newData;
      }
    }

    // Map the filtered data to get all the row keys and selected rows
    const allRowKeys = filteredData.map((item) => item.order_item_id);
    const allSelectedRows = filteredData;

    // Set the selected row keys and table data
    setSelectedRowKeys(allRowKeys);
    setTableData(allSelectedRows);
    const payloadData = {
      order_no: orderDetails?.order_no,
      items_to_cancel: allRowKeys
    };
    if (orderDetails?.payment_method == CRM_ORDER_KEY.PREPAID) {
      refundCancelItem(payloadData);
    }

    const selectedData = allSelectedRows.map((row) => {
      const data = {
        order_item_id: row.order_item_id,
        sap_code: row.sap_code,
        ...(row?.depot_order_id ? { depot_order_id: row.depot_order_id } : {})
      };
      if (orderDetails?.order_status === CARD_STATUS.PENDING) {
        data.total_accepted_qty = row.total_accepted_qty;
      }

      if (row.item_status == CARD_STATUS.DELIVERED || row.item_status == CARD_STATUS.RETURNED) {
        delete data.sap_code;
      }

      // Optionally include offer_id if it exists
      if (row.offer_id) {
        data.offer_id = row.offer_id;
      }
      if (key == "returned") {
        data.return_qty = row.quantity - (row.returned_qty || 0);
      }

      return data;
    });

    if (key == "returned") {
      const filterData = {
        order_no: orderDetails?.order_no,
        items_to_return: selectedData
      };

      returnRefundCalc(filterData);
    }

    // Set the checkField and open the modal
    setCheckField(selectedData);

    if (key == "cancel") {
      setCancelItemCall(true);
    }

    if (orderDetails?.order_status == CARD_STATUS.PENDING) {
      setTableModal(true);
    }
  };

  // Single row selection for confirm order
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      setSelectedRowKeys(selectedRowKeys);
      setTableData(selectedRows);
      if (selectedRows.length > 0) {
        const selectedData = selectedRows.map((row) => {
          const data = {
            order_item_id: row.order_item_id,
            sap_code: row.sap_code,
            ...(row?.depot_order_id ? { depot_order_id: row.depot_order_id } : {})
          };

          if (orderDetails?.order_status === CARD_STATUS.PENDING) {
            data.total_accepted_qty = row.total_accepted_qty;
          }

          if (row.item_status == CARD_STATUS.DELIVERED || row.item_status == CARD_STATUS.RETURNED) {
            delete data.sap_code;
          }

          // Optionally include offer_id if it exists
          if (row.offer_id) {
            data.offer_id = row.offer_id;
          }

          if (orderDetails?.order_status == CARD_STATUS.DELIVERED) {
            data.return_qty = row?.return_qty != undefined ? row.return_qty : 1;
          }

          return data;
        });

        setCheckField(selectedData);
        setShowButton(true);
        return;
      } else {
        setCheckField([]);
        const updatedData = [...offerTableData];
        let d = updatedData.filter((i) => {
          i.return_qty = 1;
          i.total_accepted_qty = i.quantity;
          return i;
        });
        setOfferTableData(d);
      }
      // setShowButton(false);
    },

    getCheckboxProps: (record) => {
      return {
        disabled:
          record.crm_item_status == CARD_STATUS.RETURN_INITIATED ||
          record.crm_item_status == CARD_STATUS.CANCELLED ||
          (record.crm_item_status == CARD_STATUS.RETURNED && record?.partially_returned == false) ||
          (record.crm_item_status == CARD_STATUS.DELIVERED && record?.is_returnable == false),

        name: record.crm_item_status
      };
    }
  };

  // handle changes values of field to enable and disable save button
  const handleFormChange = (changedValues) => {
    try {
      const { shipping_address, shipping_mobile } = changedValues;

      // Check if shipping_address has changed
      if (shipping_address !== undefined && shipping_address !== orderDetails?.shipping_address) {
        setIsFormTouched(false);
        return;
      }
      // Check if shipping_mobile has changed
      if (shipping_mobile !== undefined && shipping_mobile !== orderDetails?.shipping_mobile) {
        setIsFormTouched(false);
        return;
      }
      // Reset to false if the fields are the same as initial values
      if (
        (shipping_address === orderDetails?.shipping_address || shipping_address === undefined) &&
        (shipping_mobile === orderDetails?.shipping_mobile || shipping_mobile === undefined)
      ) {
        setIsFormTouched(true);
        return;
      }
      setIsFormTouched(true);
    } catch (error) {
      console.error("Error handling form change:", error);
    }
  };

  const handleUpdateTableOnCancel = () => {
    // Replace with your actual selected ID list
    const updateData = offerTableData.map((item) => {
      if (selectedRowKeys.includes(item.order_item_id)) {
        return {
          ...item,
          total_accepted_qty: item.quantity
        };
      }
      return item; // unchanged
    });

    setOfferTableData(updateData);
  };

  // handle Hide Table
  const handleTableModal = () => {
    // update at initial state
    handleUpdateTableOnCancel();
    setSelectedRowKeys([]);
    setTableModal(false);
    setShowButton(false);
    setCancelItemCall(false);
    setSelectedOtherReason(null);
    setSelectedReason(null);
    setCheckField(null);

    setShowReturnQty(false);

    orderForm.resetFields();
  };

  const handleSelectChange = (value) => {
    setSelectedReason(value);
  };

  // Handle cancel and api call for refund
  const handleCancelRefund = () => {
    try {
      setCancelItemCall(true);
      setTableModal(true);

      const data = {
        order_no: orderDetails?.order_no,
        items_to_cancel: selectedRowKeys
      };
      if (orderDetails?.payment_method == CRM_ORDER_KEY.PREPAID) {
        refundCancelItem(data);
      }
    } catch (error) {}
  };

  // Handle cancel and api call for refund
  const handleReturnRefund = () => {
    try {
      // setCancelItemCall(true);
      // setTableModal(true);

      const data = {
        order_no: orderDetails?.order_no,
        items_to_return: checkField
      };

      returnRefundCalc(data);

      // refundCancelItem(data);
    } catch (error) {}
  };

  const RemarkColumn = (
    <>
      <Col span={24}>
        <Form.Item
          name="reason"
          label="Remark"
          rules={[{ required: true, message: "Please select a reason" }]}>
          <Select
            size="large"
            placeholder="Select reason"
            className="fullWidth"
            options={REMARK_CANCEL_ITEMS}
            onChange={handleSelectChange}
          />
        </Form.Item>
      </Col>

      {selectedReason === "other" && (
        <Col span={24}>
          <Form.Item
            name="message"
            rules={[
              { required: true, message: "Please provide a reason" },
              {
                validator: validateMessage(10, 60, "Invalid Reason")
              }
            ]}>
            <Input.TextArea
              minLength={10}
              maxLength={60}
              onInput={(e) => validateMaxLength(e, 60)}
              placeholder="Please specify other reasons"
              className="fullWidth"
              rows={4}
              onChange={(e) => setSelectedOtherReason(e.target.value)}
            />
          </Form.Item>
        </Col>
      )}
    </>
  );

  const handleReturn = () => {
    setShowReturn(false);
    setCheckField(null);
    setSelectedRowKeys(null);
    const updatedData = [...offerTableData];
    let d = updatedData.filter((i) => {
      i.return_qty = 1;
      return i;
    });
    setOfferTableData(d);
  };

  const handleDepotOrder = (record, orderNo, return_order_no, key) => {
    try {
      let payload = {
        order_no: orderNo,
        return_id: record?.order_items[0].return_id,
        items_to_return: [],
        return_order_no
      };

      if (record?.order_items.length > 0) {
        record.order_items.map((row) => {
          if (key && key == "cancel") {
            payload.items_to_return.push({
              order_item_id: row.order_item_id,
              return_order_item_id: row.return_order_item_id,
              return_qty: row.quantity ? row.quantity : 1
            });
          } else {
            payload.items_to_return.push({
              order_item_id: row.order_item_id,
              return_order_item_id: row.return_order_item_id,
              return_qty: row.quantity ? row.quantity : 1
            });
          }
        });
      }

      if (key && key == "cancel") {
        cancelReturnRefund(payload);
      } else {
        // Api call to confirm order
        returnRefund(payload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Api method To Download Order Invoice
  const { mutate: apiDownloadInvoice, isLoading: downloadInvoiceLoading } = useMutation(
    "getCourierDetails",
    (data) => apiService.shipRocketDownloadInvoice(data),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data?.success && data?.data?.invoice_url) {
            // download  order invoice
            downloadLabel(data?.data?.invoice_url);
          }
        } catch (error) {
          console.log(error);
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // Handle Download Invoice
  const HandleDownloadInvoice = (recordData) => {
    try {
      apiDownloadInvoice({ ids: [recordData.ship_rocket_order_id] });
    } catch (error) {
      console.log(error);
    }
  };

  const { mutate: getShipRocketOrderDetails, isLoading: loadingOrderDetails } = useMutation(
    "singleOrderDetailsShipRocket",
    (recordData) => apiService.getShipRocketSingleOrder(recordData.ship_rocket_return_order_id),
    {
      // Configuration options
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        if (data?.success) {
          setSingleOrderDetails(data?.data?.data);
          setIsPickupAddress(true);
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  const { mutate: rejectReturn, isLoading: rejectReasonLoad } = useMutation(
    (data) => apiService.rejectReturn(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          setRefundData(data?.data);
          setRecordData(null);
          setRejectModel({ open: false });
          handleReset();
          setOtpModal(false);
          setShowSuccessModal(true);
          setReturnMessage("Rejected Return");

          setShowReturn(false);
          setShowButton(false);
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );

  const { mutate: markPickup, isLoading: markPickupLoad } = useMutation(
    (data) => apiService.markAsPickup(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          setRecordData(null);
          setRejectModel({ open: false });
          handleReset();
          setOtpModal(false);
          setShowSuccessModal(true);
          setReturnMessage("Marked as Out for Pickup successfully");
          setShowReturn(false);
          setShowButton(false);
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );
  const { mutate: acceptReturn, isLoading: acceptReturnLoading } = useMutation(
    (data) => apiService.acceptReturn(data),
    {
      onSuccess: (data) => {
        if (data?.success) {
          setRefundData(data?.data);
          setRecordData(null);
          setRejectModel({ open: false });
          handleReset();
          setOtpModal(false);
          setShowSuccessModal(true);
          setReturnMessage("Accepted Return successfully");
          setShowReturn(false);
          setShowButton(false);
        }
      },
      onError: (error) => {
        //error log
        console.log(error);
      }
    }
  );

  const handleReturnOperation = (data) => {
    console.log(data, "data", recordData);
    try {
      // if ((!checkField || checkField?.length === 0) && orderDetails?.offer_id === null) {
      //   return enqueueSnackbar("Please select at least one item", snackBarErrorConf);
      // }
      // const selectedData = [];

      // record?.order_items.map((row) => {
      //   if (row.crm_item_status === "pending") {
      //     selectedData.push({
      //       order_item_id: row.order_item_id,
      //       sap_code: row.sap_code,
      //       ...(row?.depot_order_id ? { depot_order_id: row.depot_order_id } : {})
      //     });
      //   }
      // });
      let payload = {
        order_no: orderDetails?.order_no,
        return_id: recordData?.order_items[0].return_id,
        items_to_return: [],
        return_order_no: orderDetails?.return_order_no,
        reason: data.reject_reason
      };

      if (data?.customer_satisfaction) {
        payload.reason = `(CUSTOMER SATISFACTION)   ` + data.reject_reason;
      }

      if (recordData?.order_items.length > 0) {
        recordData.order_items.map((row) => {
          payload.items_to_return.push({
            order_item_id: row.order_item_id,
            return_order_item_id: row.return_order_item_id,
            return_qty: row.quantity ? row.quantity : 1
          });
        });
      }

      if (rejectModel.dialog === "accept") {
        acceptReturn(payload);
      } else {
        rejectReturn(payload);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const markAsOutForPickup = (record) => {
    try {
      let payload = {
        order_no: orderDetails?.order_no,
        return_id: record?.order_items[0].return_id,
        items_to_return: [],
        return_order_no: orderDetails?.return_order_no
      };

      if (record?.order_items.length > 0) {
        record.order_items.map((row) => {
          payload.items_to_return.push({
            order_item_id: row.order_item_id,
            return_order_item_id: row.return_order_item_id,
            return_qty: row.quantity ? row.quantity : 1
          });
        });
      }

      markPickup(payload);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <React.Fragment>
      <Spin
        spinning={
          getSingleLoader ||
          loaderOrderConfirm ||
          loaderCancelItems ||
          loadingInvoice ||
          shipRocketApiLoading ||
          // loadingCancelOrder ||
          downloadInvoiceLoading ||
          loadingGenerateLabel ||
          loadingMainfeast ||
          pickupLoading ||
          loadingOrderDetails
        }>
        <Row gutter={[20, 24]}>
          <Col xs={{ span: 24 }} sm={{ span: 24 }} md={{ span: 24 }} lg={{ span: 24 }}>
            <Card>
              <Row gutter={[20, 20]}>
                <Col span={24}>
                  <OrderActions
                    isReturn={true}
                    orderDetails={orderDetails}
                    mode={mode}
                    handleBack={handleBack}
                    scrollToElement={scrollToElement}
                    handleModal={handleModal}
                    onSelectAll={onSelectAll}
                    showButton={showButton}
                    handleCancelRefund={handleCancelRefund}
                    setTableModal={setTableModal}
                    checkStatusDelivered={checkStatusDelivered}
                    showReturn={showReturn}
                    setShowReturn={setShowReturn}
                    handleReturnRefund={handleReturnRefund}
                    handleReturn={handleReturn}
                    setCancelOrderModel={setCancelOrderModel}
                    getStatusTag={getStatusTag}
                    getStatusTagCount={getStatusTagCount}
                    createInvoiceApi={depotCreateInvoice}
                    selectButton={selectButton}
                    setSelectButton={setSelectButton}
                    setShowButton={setShowButton}
                    ResetOnCancel={ResetOnCancel}
                    checkField={checkField}
                  />
                </Col>
                {showShippingScreen && (
                  <Col span={24}>
                    <ShippingModuleReturn
                      orderDetails={orderDetails}
                      recordId={recordData}
                      getSingleOrder={getSingleOrder}
                      setRecordData={setRecordData}
                      setShowShippingScreen={setShowShippingScreen}
                    />
                  </Col>
                )}
                {showShippingScreen == false && (
                  <>
                    {orderDetails?.offer_id != null && (
                      <Col span={10}>
                        <Alert
                          message={
                            <Typography.Text strong>
                              Cart offers are applicable, so you cannot confirm or cancel or return
                              individual items
                            </Typography.Text>
                          }
                          type="info"
                          icon={<ExclamationCircleOutlined />}
                          showIcon
                        />
                      </Col>
                    )}

                    <Col span={24}>
                      <Row gutter={[10, 10]}>
                        {orderDetails?.order_items?.length > 5 && (
                          // (searchData?.length > 5 && (
                          <Col span={24}>
                            <Search
                              placeholder="Search by Product Name, SAP Code"
                              size="large"
                              onInput={handleKeyDown}
                              onSearch={handleSearch}
                              maxLength={40}
                              allowClear
                            />
                          </Col>
                        )}
                        {orderDetails?.order_to == CART_TYPE.DEPOT ? (
                          <Col span={24}>
                            <DepotTable
                              orderDetails={orderDetails}
                              depotExpand={depotExpand}
                              setDepoExpand={setDepoExpand}
                              columns={[
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
                                  title: "Depot",
                                  dataIndex: "depot_id",
                                  key: "depot_id"
                                },
                                {
                                  title: "Status",
                                  dataIndex: "status",
                                  key: "status",
                                  render: (text, record) => (
                                    <Typography.Text type="secondary">
                                      {getStatusTag(text)}
                                    </Typography.Text>
                                  )
                                },

                                ...((orderDetails?.order_status === CARD_STATUS.PENDING ||
                                  orderDetails?.order_status === CARD_STATUS.RETURN_INITIATED ||
                                  orderDetails?.order_status === CARD_STATUS.OUT_FOR_PICKUP ||
                                  orderDetails?.order_status === CARD_STATUS.CONFIRMED) &&
                                orderDetails.offer_id === null
                                  ? [
                                      {
                                        title: "Action",
                                        key: "action",
                                        width: 100,
                                        render: (text, record) => {
                                          console.log(record, "record");
                                          // setRecordData(record);
                                          const items = [
                                            record?.is_pickup_scheduled && {
                                              key: "reschedule_pickup",
                                              label: (
                                                <Typography.Text>Reschedule Pickup</Typography.Text>
                                              )
                                            },
                                            record?.awb != null && {
                                              key: "order_reassign",
                                              label: (
                                                <Typography.Text>Order Reassign</Typography.Text>
                                              )
                                            }
                                          ];
                                          const handleMenuClick = ({ key }) => {
                                            // Example logic
                                            try {
                                              if (key === "download_invoice") {
                                                setRecordData(record);
                                                HandleDownloadInvoice(record);
                                                // call function with record
                                              } else if (key === "add_dimension") {
                                                setRecordData(record);
                                                // open modal to add dimension
                                                setDimensionModal(true);
                                              } else if (key === "download_label") {
                                                //  api call (Generate label)

                                                apiGenerateLabel({
                                                  shipment_id: [record.ship_rocket_shipment_id]
                                                });
                                              } else if (key == "download_manifest") {
                                                // {"order_ids": [16240904]}'
                                                shipRocketDownloadMainfestApi({
                                                  order_ids: [record.ship_rocket_order_id]
                                                });
                                              } else if (key == "reschedule_pickup") {
                                                setRecordData(record);
                                                getShipRocketOrderDetails(record);
                                              } else if (key == "order_reassign") {
                                                setRecordData(record);
                                                setShowShippingScreen(true);
                                              }
                                            } catch (error) {
                                              console.log(error);
                                            }
                                          };

                                          return record?.status === "out_for_pickup" ? (
                                            <Flex align="center" gap={5}>
                                              <Button
                                                type="primary"
                                                onClick={() => {
                                                  setRecordData(record);
                                                  setRejectModel({ open: true, dialog: "accept" });
                                                  // API call for accept return
                                                  // handleReturnAction(record, "accept");
                                                }}>
                                                Accept Return
                                              </Button>

                                              <Button
                                                danger
                                                onClick={() => {
                                                  setRecordData(record);
                                                  setRejectModel({ open: true, dialog: "reject" });
                                                  // API call for reject return
                                                  // handleReturnAction(record, "reject");
                                                }}>
                                                Reject Return
                                              </Button>
                                            </Flex>
                                          ) : (
                                            <Flex align="center" gap={5}>
                                              {/* {record.status === CARD_STATUS.CONFIRMED &&
                                                //  record.invoice_generated != true
                                                (record.invoice_generated != true ||
                                                  !record.ship_rocket_order_id) &&
                                                !isNoPendingStatus && (
                                                  <Popconfirm
                                                    title="Generate Invoice"
                                                    description="Are you sure to Create Return Shipment ?"
                                                    onConfirm={() => {
                                                      // api call create invoice
                                                      depotCreateInvoice({
                                                        order_no: record.depot_order_id
                                                      });
                                                    }}
                                                    okText="Yes"
                                                    cancelText="No">
                                                    <Button
                                                      type="primary"
                                                      disabled={
                                                        record.status == CARD_STATUS.PENDING ||
                                                        record.invoice_generated == true
                                                      }>
                                                      Create Shiprocket Order
                                                    </Button>
                                                  </Popconfirm>
                                                )} */}

                                              {record.ship_rocket_return_order_id &&
                                                record?.awb == null && (
                                                  <Button
                                                    type="primary"
                                                    onClick={() => {
                                                      setRecordData(record);
                                                      setShowShippingScreen(true);
                                                    }}>
                                                    Ship Now
                                                  </Button>
                                                )}

                                              {record?.status === "confirmed" &&
                                              (record?.awb != null || record?.user_reciept) ? (
                                                // ||
                                                // return_status_sequence[record?.status] <=
                                                //   return_status_sequence["confirmed"] ||
                                                // record?.user_reciept ?

                                                <Button
                                                  type="primary"
                                                  loading={markPickupLoad}
                                                  onClick={() => {
                                                    setRecordData(record);
                                                    markAsOutForPickup(record);
                                                  }}>
                                                  {` ${"Mark as out for pickup"} `}
                                                </Button>
                                              ) : (
                                                ""
                                              )}

                                              {record?.status === "confirmed" &&
                                              record?.user_reciept === null &&
                                              record?.pickup_location == null ? (
                                                // ||
                                                // return_status_sequence[record?.status] <=
                                                //   return_status_sequence["confirmed"] ||
                                                // record?.user_reciept ?

                                                <Typography.Text>
                                                  {`Waiting for pickup confirmation`}
                                                </Typography.Text>
                                              ) : (
                                                ""
                                              )}

                                              {record.ship_rocket_return_order_id !== null &&
                                                record.awb !== null && (
                                                  <Space>
                                                    <Dropdown
                                                      menu={{ items, onClick: handleMenuClick }}
                                                      placement="bottomLeft"
                                                      arrow={{ pointAtCenter: true }}>
                                                      <Button
                                                        shape="circle"
                                                        icon={<EllipsisOutlined />}></Button>
                                                    </Dropdown>
                                                  </Space>
                                                )}

                                              {record.status === CARD_STATUS.CONFIRMED &&
                                                record.ship_rocket_return_order_id === null && (
                                                  <>
                                                    {" "}
                                                    {/* <Button
                                                      type="primary"
                                                      onClick={(e) => {
                                                        if (record?.file_path) {
                                                          // handlePreview(); // trigger preview
                                                          setPreviewVisible(true);
                                                        } else {
                                                          addOrderShipRocket(
                                                            orderDetails.return_order_items[0]
                                                          );
                                                        }
                                                      }}
                                                      disabled={
                                                        record.status == CARD_STATUS.PENDING ||
                                                        (!record?.pickup_location &&
                                                          !record?.user_reciept)
                                                      }>
                                                      {record?.pickup_location
                                                        ? "Create Shiprocket Order"
                                                        : "View Uploaded Receipt"}
                                                    </Button> */}
                                                    {/* <Image
                                                      ref={imgRef}
                                                      src={`http://localhost:5800${record?.file_path}`}
                                                      preview={{
                                                        visible: previewVisible,
                                                        onVisibleChange: (visible) =>
                                                          setPreviewVisible(visible)
                                                      }}
                                                      // style={{ visibility: "none" }}
                                                      // preview={{
                                                      //   visible: false,
                                                      //   src: `http://223.239.131.254:30011${record?.file_path}`,
                                                      //   onVisibleChange: (visible, prevVisible) => {
                                                      //     if (!prevVisible && visible) {
                                                      //       imgRef.current?.preview();
                                                      //     }
                                                      //   }
                                                      // }}
                                                    />{" "} */}
                                                  </>
                                                )}
                                              {record.status === CARD_STATUS.PENDING && (
                                                <>
                                                  <Popconfirm
                                                    title="Cancel order"
                                                    description={`Are you sure to ${
                                                      actionType[record.depot_order_id]
                                                    } this return?`}
                                                    onConfirm={() => {
                                                      setConfirmOpen({
                                                        ...confirmOpen,
                                                        [record.depot_order_id]: false
                                                      });

                                                      handleDepotOrder(
                                                        record,
                                                        orderDetails?.order_no,
                                                        orderDetails?.return_order_no,
                                                        actionType[record.depot_order_id] ===
                                                          "cancel"
                                                          ? "cancel"
                                                          : ""
                                                      );
                                                    }}
                                                    open={confirmOpen[record.depot_order_id]}
                                                    okText="Yes"
                                                    onCancel={() => {
                                                      setConfirmOpen({
                                                        ...confirmOpen,
                                                        [record.depot_order_id]: false
                                                      });
                                                    }}
                                                    cancelText="No"></Popconfirm>
                                                  {actionType[record.depot_order_id] !==
                                                    "confirm" && (
                                                    <Button
                                                      danger
                                                      disabled={
                                                        record.status !== CARD_STATUS.PENDING
                                                      }
                                                      onClick={(e, val) => {
                                                        setActionType({
                                                          // ...actionType,
                                                          [record.depot_order_id]: "cancel"
                                                        });
                                                        if (!depotExpand.length) {
                                                          setDepoExpand([record.sr_no]);
                                                        }
                                                        setConfirmOpen({
                                                          ...confirmOpen,
                                                          [record.depot_order_id]: true
                                                        });
                                                      }}>
                                                      {actionType[record.depot_order_id]
                                                        ? orderDetails?.offer_id == null
                                                          ? "Cancel Return"
                                                          : "Cancel All Return"
                                                        : "Cancel"}
                                                    </Button>
                                                  )}

                                                  {/* <Popconfirm
                                                    title="Confirm order"
                                                    description="Are you sure to confirm this order?"
                                                    onConfirm={() => {
                                                      setConfirmOpen({
                                                        ...confirmOpen,
                                                        [record.depot_order_id]: false
                                                      });
                                                      handleDepotOrder(
                                                        record,
                                                        orderDetails?.order_no
                                                      );
                                                    }}
                                                    okText="Yes"
                                                    open={confirmOpen[record.depot_order_id]}
                                                    onCancel={() =>
                                                      setConfirmOpen({
                                                        ...confirmOpen,
                                                        [record.depot_order_id]: false
                                                      })
                                                    }
                                                    cancelText="No"></Popconfirm> */}
                                                  {actionType[record.depot_order_id] !==
                                                    "cancel" && (
                                                    <Button
                                                      type="primary"
                                                      onClick={(e, val) => {
                                                        setActionType({
                                                          // ...actionType,
                                                          [record.depot_order_id]: "confirm"
                                                        });
                                                        if (!depotExpand.length) {
                                                          setDepoExpand([record.sr_no]);
                                                        }
                                                        // if (actionType[record.depot_order_id]) {
                                                        setConfirmOpen({
                                                          ...confirmOpen,
                                                          [record.depot_order_id]: true
                                                        });
                                                        // }
                                                      }}
                                                      disabled={
                                                        record.status !== CARD_STATUS.PENDING
                                                      }>
                                                      {"Confirm Returns"}
                                                    </Button>
                                                  )}
                                                  {actionType[record.depot_order_id] && (
                                                    <Button
                                                      type="primary"
                                                      onClick={(e, val) => {
                                                        setActionType({});
                                                        setCheckField([]);
                                                        setShowButton(false);
                                                      }}
                                                      disabled={
                                                        record.status !== CARD_STATUS.PENDING
                                                      }>
                                                      {"Back"}
                                                    </Button>
                                                  )}
                                                </>
                                              )}
                                            </Flex>
                                          );
                                        }
                                      }
                                    ]
                                  : [])
                              ]}
                              hidePagination={false}
                              data={offerTableData}
                              expandedColumnsList={getDepoOrderColumsForReturn(
                                handleConfirmedQuantity,
                                isOrderItemIncluded,
                                checkField,
                                handleConfirmedQuantityDepot,
                                actionType,
                                setOfferData,
                                setOfferEnable,
                                orderDetails
                              )}
                              loading={false}
                              // rowSelect={rowSelection}
                              actionType={actionType}
                              status={
                                // (orderDetails?.order_status == CARD_STATUS.PENDING &&
                                //   orderDetails?.offer_id == null) ||
                                // (orderDetails?.order_status == CARD_STATUS.DELIVERED &&
                                //   checkStatusDelivered(orderDetails?.item_status) &&
                                //   showReturn)
                                //   ?
                                true
                                // : false
                              }
                            />
                          </Col>
                        ) : (
                          <Col span={24}>
                            <Table
                              rowSelection={
                                (orderDetails?.order_status == CARD_STATUS.PENDING &&
                                  orderDetails?.offer_id == null &&
                                  showButton) ||
                                (orderDetails?.order_status == CARD_STATUS.DELIVERED &&
                                  checkStatusDelivered(orderDetails?.item_status) &&
                                  showReturn)
                                  ? {
                                      type: "checkbox",
                                      ...rowSelection,
                                      renderCell: (checked, record, index, originNode) => {
                                        const isConditionMet =
                                          record.is_returnable == false &&
                                          record.item_status == CARD_STATUS.DELIVERED; // Check your condition here

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
                              columns={columns}
                              dataSource={searchData === null ? offerTableData || [] : searchData}
                              rowKey="order_item_id"
                              pagination={false}
                              bordered={true}
                              scroll={{
                                x: "1070px"
                              }}
                            />
                          </Col>
                        )}

                        {console.log(recordData)}

                        {isPickupAddress && (
                          <Col span={24}>
                            <PickupModalShipRocket
                              open={isPickupAddress}
                              isReturn={true}
                              setClose={setIsPickupAddress}
                              selectedValue={selectedValue}
                              setSelectedValue={setSelectedValue}
                              getPickUpDateApi={getPickUpDateApi}
                              recordId={recordData}
                              singleOrderDetails={singleOrderDetails}
                            />
                          </Col>
                        )}
                      </Row>
                    </Col>
                  </>
                )}
              </Row>
            </Card>
          </Col>

          {showShippingScreen == false && (
            <CRMOrderContext.Provider
              value={{
                handleModal,
                timelineItems,
                scrollDetails,
                orderDetails,
                timeLineData: orderDetails?.order_tracking
              }}>
              <OrderDetails isReturn={true} />
            </CRMOrderContext.Provider>
          )}

          {/* use context wrapper */}
        </Row>

        {showShippingScreen == false && (
          <>
            {/* shipping update model */}
            <ShippingModal
              open={open}
              shippingForm={shippingForm}
              handleCancel={handleCancel}
              handleForm={handleForm}
              handleFormChange={handleFormChange}
              handleShipAddress={handleShipAddress}
              shippingLoading={shippingLoading}
              isFormTouched={isFormTouched}
              orderDetails={orderDetails}
            />
            {/* Confirm update model */}
            <Modal
              size={"large"}
              title={
                orderDetails?.order_status == CARD_STATUS.DELIVERED
                  ? "Return Items"
                  : cancelItemCall
                    ? "Cancel Return Items"
                    : "Confirm Returns"
              }
              closable={false}
              maskClosable={false}
              loading={refundLoader || returnrefundLoader}
              width={"40%"}
              footer={
                <>
                  <Button onClick={handleTableModal}>Cancel</Button>
                  <Button
                    type="primary"
                    loading={loaderOrderConfirm || loaderCancelItems || loadingOtp}
                    onClick={handleOrder}>
                    {orderDetails?.order_status == CARD_STATUS.DELIVERED
                      ? "Confirm Return Items"
                      : cancelItemCall
                        ? "Cancel Return Items"
                        : "Confirm Returns"}
                  </Button>
                </>
              }
              open={tableModal}>
              <Form
                form={orderForm}
                layout="vertical"
                onFinish={handleOrder}
                id="orderForm"
                initialValues={{
                  reason: null,
                  message: null
                }}>
                <Row gutter={[20, 5]}>
                  {orderDetails?.order_status == CARD_STATUS.DELIVERED && RemarkColumn}
                  <Col span={24}>
                    <Table
                      columns={tableModalColumns}
                      dataSource={tableData}
                      rowKey="product_id"
                      pagination={false}
                      bordered={true}
                      scroll={{
                        x: "max-content"
                      }}
                    />
                  </Col>

                  {
                    // orderDetails?.payment_method == CRM_ORDER_KEY.PREPAID &&
                    orderDetails?.order_status == CARD_STATUS.DELIVERED && (
                      <>
                        <Col span={16}>
                          <Typography.Text>
                            {orderDetails?.order_status == CARD_STATUS.DELIVERED
                              ? "Total Return Item :"
                              : "Total Cancel Item :"}
                            <b>{checkField?.length}</b>
                          </Typography.Text>
                        </Col>

                        <Col span={8}>
                          <Typography.Text>
                            Total Refund Amount :<b> ₹{refundData?.total_refund_amount}</b>
                          </Typography.Text>
                        </Col>
                      </>
                    )
                  }

                  <Col span={24}>
                    <Row gutter={[20, 10]}>
                      {cancelItemCall && (
                        <>
                          {orderDetails?.payment_method == CRM_ORDER_KEY.PREPAID && (
                            <>
                              <Col span={16}>
                                <Typography.Text>
                                  {orderDetails?.order_status == CARD_STATUS.DELIVERED
                                    ? "Total Return Item :"
                                    : "Total Cancel Item :"}
                                  <b>{refundData?.cancelled_items}</b>
                                </Typography.Text>
                              </Col>

                              <Col span={8}>
                                <Typography.Text>
                                  Total Refund Amount :<b> ₹{refundData?.total_refund_amount}</b>
                                </Typography.Text>
                              </Col>
                            </>
                          )}
                          {RemarkColumn}
                        </>
                      )}
                    </Row>
                  </Col>
                </Row>
              </Form>
            </Modal>
            {/* // cancel request */}
            <CancelRequestModel
              orderDetails={orderDetails}
              orderApi={getSingleOrder}
              show={cancelOrderModel}
              hide={setCancelOrderModel}
            />
            {/* // Offer modal  */}
            <OfferModal show={offerEnable} hide={setOfferEnable} data={offerData} />
            {/*  Tracking Modal  */}
            <TrackingModal
              show={tracking}
              setTracking={setTracking}
              trackingData={itemTracking}
              orderDetails={orderDetails}
              handlereset={handleReset}
            />
            {/* Verification Modal */}
            <OtpVerficationModal
              otpModal={otpModal}
              setOtpModal={setOtpModal}
              setShowSuccessModal={setShowSuccessModal}
              apiData={apiData}
              returnOrderItem={returnRefund}
              otpform={otpForm}
              returnRefundLoader={returnRefundLoader}
            />
            {/* Success Modal */}
            <SuccessModal
              showSuccessModel={showSuccessModel}
              setShowSuccessModal={setShowSuccessModal}
              message={returnMessage}
              setReturnMessage={setReturnMessage}
            />

            <RejectModel
              // fetchOnlineReturn={fetchOnlineReturn}
              rejectModel={rejectModel}
              setRejectModel={(value) => {
                setRejectModel({ open: value });
                setRecordData(null);
              }}
              acceptReturnLoading={acceptReturnLoading}
              handleReturnOperation={handleReturnOperation}
              rejectReasonLoad={rejectReasonLoad}
              // orderNo={orderNo}
            />

            {/* Dimension modal */}
            <DimensionModal
              recordData={recordData}
              apiMethod={updateDetailsShipApi}
              loading={shipRocketApiLoading}
              orderDetails={orderDetails}
              setDimensionModal={setDimensionModal}
              isDimensionalModal={isDimensionalModal}
            />
          </>
        )}
      </Spin>
    </React.Fragment>
  );
};

export default CrmOrders;
