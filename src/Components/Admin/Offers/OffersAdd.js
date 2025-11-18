/* eslint-disable no-unused-vars */
import RichEditor from "Components/Shared/richEditor";
import {
  applicableBuyerType,
  PermissionAction,
  RULES_MESSAGES,
  snackBarErrorConf,
  snackBarSuccessConf,
  supportedStoresOptions,
  typesOfOffer
} from "Helpers/ats.constants";
import {
  actionsPermissionValidator,
  checkDiscountValue,
  checkMinimumPriceValue,
  disablePastTimes
} from "Helpers/ats.helper";
import { useServices } from "Hooks/ServicesContext";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import {
  Button,
  Checkbox,
  Col,
  DatePicker,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Switch,
  Typography
} from "antd";
import dayjs from "dayjs";
import { debounce } from "lodash";
import { enqueueSnackbar } from "notistack";
import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "react-query";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import OfferTypes from "./OfferTypes";
import { offerPayload } from "./offerPayload";

// Add/Edit Offer Component
export default function OfferAddEdit() {
  const params = useParams();
  const { setBreadCrumb } = useUserContext();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const { RangePicker } = DatePicker;
  const { apiService } = useServices();
  const [applicableOn, setApplicableOn] = useState("");
  const [listBasedOnApplicableOn, setListBasedOnApplicableOn] = useState([]);
  const [userGroupList, setUserGroupList] = useState([]);
  const [offerDescription, setOfferDescription] = useState("");
  const [disableMinPurchaseAmount, setDisableMinPurchaseAmount] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [offerType, setOfferType] = useState("");
  const [bundleDealType, setBundleDealType] = useState("");
  const [freeShippingType, setFreeShippingType] = useState("");
  const [newProductList, setNewProductList] = useState([]);
  const [eligibleProduct, setEligibleProduct] = useState([]);
  const [isPriceSame, setIsPriceSame] = useState(true);

  const [specificStoresList, setSpecificStoresList] = useState([]);

  const [displayStoresFields, setDisplayStoresFields] = useState(false);
  const [productNameToBuy, setProductNameToBuy] = useState("");
  const [productNameToGetFree, setProductNameToGetFree] = useState("");

  /***
   * styles
   */
  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    },
    datePickerStyle: {
      width: "100%"
    }
  };

  // hook for fetching single offer details
  const { refetch: fetchSingleOffer } = useQuery(
    "fetchSingleOffer",
    () => apiService.getSingleOfferDetails(params?.id),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data?.data) {
            const {
              offer_type,
              start_date,
              expiry_date,
              offer_status,
              offer_description,
              discount_type,
              offer_options,
              reduce_pv,
              supported_types
            } = data.data; // destructuring api data
            const {
              product_name_to_buy,
              product_to_buy,
              product_name_to_get_free,
              product_to_get_free,
              product_to_buy_options
            } = offer_options || {};

            const allSame = product_to_buy_options
              ? product_to_buy_options.every(
                  (item) => item.sale_price === product_to_buy_options[0].sale_price
                )
              : false;
            setIsPriceSame(allSame);

            form.setFieldsValue({ ...data?.data });
            form.setFieldValue("select_start_date_expiry_date", [
              dayjs(start_date),
              dayjs(expiry_date)
            ]);
            form.setFieldsValue(offer_options);
            form.setFieldValue("offer_status", offer_status == "active" ? true : false);
            setOfferDescription(offer_description);
            setOfferType(offer_type);
            setBundleDealType(discount_type);

            if (offer_type == "free_shipping") {
              const { free_shipping_type } = offer_options;
              setFreeShippingType(free_shipping_type);
            }

            if (offer_type == "default_offer") {
              const { applicable_on, discount_type } = data.data || {};
              let applicableOnType =
                applicable_on == "brand"
                  ? "brands"
                  : applicable_on == "category"
                    ? "categories"
                    : applicable_on;
              setApplicableOn(applicableOnType);
              applicableOnType !== "all" && fetchDataBasedonApplicableOn(applicableOnType);
              form.setFieldValue(
                "applicable_users",
                data?.data?.applicable_users?.map((item) => ({
                  label: item?.role_name,
                  value: item?.role_id
                }))
              );

              if (applicableOnType == "categories") {
                form.setFieldValue(
                  "type_ids",
                  data?.data?.type_ids?.map((item) => ({
                    label: item?.category_name,
                    value: item?.category_id
                  }))
                );
              } else if (applicableOnType == "brands") {
                form.setFieldValue(
                  "type_ids",
                  data?.data?.type_ids?.map((item) => ({
                    label: item?.brand_name,
                    value: item?.brand_id
                  }))
                );
              } else {
                form.setFieldValue("type_ids", null);
              }

              setDisableMinPurchaseAmount(discount_type == "percentage");
            }

            supported_types && setDisplayStoresFields(supported_types.includes("puc"));

            // Create an array of product options
            const tempProductList =
              offer_type === "bundle_deal" ||
              offer_type === "buy_x_get_y_eligible" ||
              offer_type === "buy_x_amount_of_products_and_get_a_product_free" ||
              offer_type ===
                "buy_x_amount_of_products_and_get_a_product_on_y_prices_or_get_y%_discount" ||
              offer_type === "buy_x_get_y_free"
                ? product_to_buy_options
                : [
                    {
                      label: `${product_name_to_buy} (${product_to_buy})`,
                      value: product_to_buy
                    },
                    {
                      label: `${product_name_to_get_free} (${product_to_get_free})`,
                      value: product_to_get_free
                    }
                  ];

            updateProductList(tempProductList); // update product list
            updateEligibleProductList([
              {
                label: `${product_name_to_get_free} (${product_to_get_free})`,
                value: product_to_get_free
              }
            ]);

            setProductNameToBuy(product_name_to_buy);
            setProductNameToGetFree(product_name_to_get_free);
          }
        } catch (error) {
          console.log(error);
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // useMutation hook for fetching data of users
  const { refetch: fetchUsers } = useQuery("fetchUsers", () => apiService.getAllUsersGroup(), {
    enabled: false, // Enable the query by default
    onSuccess: (data) => {
      try {
        if (data?.data) {
          data?.data?.map((item) =>
            setUserGroupList((prev) => [
              ...prev,
              {
                value: item?.role_id,
                label: item?.role_name
              }
            ])
          );
        } else {
          setUserGroupList([]);
        }
      } catch (error) {}
    },
    onError: (error) => {
      // Handle errors by displaying a Snackbar notification
      enqueueSnackbar(error.message, snackBarErrorConf);
    }
  });

  // useMutation hook for fetching data of based on selecting applicable on
  const { mutate: fetchDataBasedonApplicableOn } = useMutation(
    "getDataBasedonApplicableOn",
    (type) => apiService.getDataBasedonApplicableOn(type),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data, type) => {
        if (data) {
          try {
            setListBasedOnApplicableOn([]);

            if (data?.data?.data) {
              if (type == "categories") {
                data?.data?.data?.map((item) =>
                  setListBasedOnApplicableOn((prev) => [
                    ...prev,
                    {
                      value: item?.category_id,
                      label: item?.category_name
                    }
                  ])
                );
              } else if (type == "products") {
                data?.data?.data?.map((item) =>
                  setListBasedOnApplicableOn((prev) => [
                    ...prev,
                    {
                      value: item?.product_id,
                      label: item?.product_name
                    }
                  ])
                );
              } else {
                data?.data?.data?.map((item) =>
                  setListBasedOnApplicableOn((prev) => [
                    ...prev,
                    {
                      value: item?.brand_id,
                      label: item?.brand_name
                    }
                  ])
                );
              }
            } else {
              setListBasedOnApplicableOn([]);
            }
          } catch (error) {}
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  const handleApplicableOn = (val) => {
    try {
      form.setFieldValue("applicable_on", val);
      setApplicableOn(val);
      form.setFields([{ name: "type_ids", errors: [], value: [] }]);
      setListBasedOnApplicableOn([]);
      val !== "all" && fetchDataBasedonApplicableOn(val);
    } catch (error) {}
  };

  const { mutate: addOffer, isLoading } = useMutation(
    "addoffer",
    (payload) => apiService.addOffer(payload),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          enqueueSnackbar(data.message, snackBarSuccessConf);
          navigate(`/${Paths.offersList}`);
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        // enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  // useMutation hook for updating offer
  const { mutate: updateOffer } = useMutation(
    "updateoffer",
    (payload) => apiService.updateOffer(payload, params?.id),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data.message) {
            enqueueSnackbar(data.message, snackBarSuccessConf);
            navigate(`/${Paths.offersList}`);
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
        // enqueueSnackbar(error.message, snackBarErrorConf);
      }
    }
  );

  const onFinish = (value) => {
    try {
      const obj = offerPayload(offerType, value, productNameToBuy, productNameToGetFree);

      if (params?.id) {
        updateOffer(obj);
      } else {
        addOffer(obj);
      }
    } catch (error) {}
  };

  const handleOfferDescription = (value) => {
    setOfferDescription(value);
    form.setFieldValue("offer_description", value);
  };

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    actionsPermissionValidator(
      window.location.pathname,
      params?.id ? PermissionAction.EDIT : PermissionAction.ADD
    )
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "Offers",
      icon: "Offer&Coupon",
      titlePath: Paths.offersList,
      subtitle: params?.id ? "Edit Offer" : "Add Offer",
      path: Paths.users
    });

    fetchUsers();

    if (params?.id) {
      fetchSingleOffer();
    } else {
      // 'add offer' case : setting  default values
      setOfferType("buy_x_get_y_free");
      form.setFieldValue("offer_status", true);
      form.setFieldValue("offer_type", "buy_x_get_y_free");
      form.setFieldValue("reduce_pv", false);

      fetchNewProductsList();
      fetchNewEligibleProductsList();
    }
  }, []);

  // Function to disable past dates using Day.js
  const disablePastDates = (currentDate) => {
    // Disable dates before today
    return currentDate && currentDate.isBefore(dayjs().startOf("day"));
  };

  const handleDiscountType = (val) => {
    try {
      form.setFieldValue("discount_type", val);

      if (val == "percentage") {
        setDisableMinPurchaseAmount(true);
        form.setFields([
          { name: "discount_value", errors: [], value: null },
          { name: "minimum_purchase_amount", errors: [], value: null }
        ]);
      } else {
        setDisableMinPurchaseAmount(false);
        form.setFields([
          { name: "discount_value", errors: [], value: null },
          { name: "minimum_purchase_amount", errors: [], value: null }
        ]);
      }
    } catch (error) {}
  };

  const updateProductList = (tempProductList) => {
    try {
      // Create a set of unique ids from products array and wholeData array
      const uniqueIDs = [
        ...new Set([
          ...newProductList.map((item) => item.value),
          ...tempProductList.map((item) => item.value)
        ])
      ];

      // createing a whole data array
      const mergedArr = [...tempProductList, ...newProductList];
      // Create a final array by filtering the wholeData array based on uniqueIDs set
      const finalArray = uniqueIDs.map((item) => {
        return mergedArr.find((product) => product?.value === item);
      }); //

      setNewProductList(finalArray);
      setProductLoading(false);
    } catch (error) {}
  };

  const updateEligibleProductList = (tempProductList) => {
    try {
      // Create a set of unique ids from products array and wholeData array
      const uniqueIDs = [
        ...new Set([
          ...eligibleProduct.map((item) => item.value),
          ...tempProductList.map((item) => item.value)
        ])
      ];

      // createing a whole data array
      const mergedArr = [...tempProductList, ...eligibleProduct];
      // Create a final array by filtering the wholeData array based on uniqueIDs set
      const finalArray = uniqueIDs.map((item) => {
        return mergedArr.find((product) => product?.value === item);
      });

      setEligibleProduct(finalArray);
      setProductLoading(false);
    } catch (error) {}
  };

  // UseQuery hook for fetching data of a product  Details from the API
  const { mutate: fetchNewProductsList, isLoading: newProductsLoading } = useMutation(
    "getOffersProductDetails",
    // Function to fetch data of applicable field using apiService.getCouponProductDetails
    (val) => apiService.getProductsForCoupon(val?.search || null),
    {
      // Configuration options
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data && data?.data?.data?.length > 0) {
            const tempProductList = data?.data?.data?.map((item) => ({
              mrp: item?.product_mrp,
              sale_price: item?.sale_price,
              value: item?.sap_code,
              label: item?.product_name + " " + "(" + item?.sap_code + ")"
            }));
            updateProductList(tempProductList);
          } else {
            // enqueueSnackbar("Product not found", snackBarErrorConf);
            setProductLoading(false);
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  const { mutate: fetchNewEligibleProductsList, isLoading: newEligibleProductsLoading } =
    useMutation(
      "getOffersProductDetails",
      // Function to fetch data of applicable field using apiService.getCouponProductDetails
      (val) => apiService.getProductsForCoupon(val?.search || null, true),
      {
        // Configuration options
        enabled: false, // Enable the query by default
        onSuccess: (data) => {
          try {
            if (data && data?.data?.data?.length > 0) {
              const tempProductList = data?.data?.data?.map((item) => ({
                mrp: item?.product_mrp,
                sale_price: item?.sale_price,
                value: item?.sap_code,
                label: item?.product_name + " " + "(" + item?.sap_code + ")"
              }));
              updateEligibleProductList(tempProductList);
            } else {
              // enqueueSnackbar("Product not found", snackBarErrorConf);
              setProductLoading(false);
            }
          } catch (error) {}
        },
        onError: (error) => {
          // Handle errors by displaying a Snackbar notification
        }
      }
    );

  // for product - debounce
  const debounceFetcherProduct = useMemo(() => {
    const loadOptions = (value) => {
      const obj = { search: value };
      fetchNewProductsList(obj);
    };
    return debounce(loadOptions, 1000);
  }, [fetchNewProductsList]);

  const debounceFetcherEligibleProduct = useMemo(() => {
    const loadOptions = (value) => {
      const obj = { search: value };
      fetchNewEligibleProductsList(obj);
    };
    return debounce(loadOptions, 1000);
  }, [fetchNewEligibleProductsList]);

  // search product function
  const searchProduct = (val, eligible) => {
    try {
      if (val && val.length >= 3) {
        // const searchExist = newProductList?.some((item) =>
        //   String(item?.label).toLowerCase().includes(val)
        // ); // Check if any item matches the condition

        // if (!searchExist) {
        // }
        setProductLoading(true);
        if (eligible) {
          debounceFetcherEligibleProduct(val);
        } else {
          debounceFetcherProduct(val);
        }
      }
    } catch (error) {}
  };

  // UseQuery hook for checking store data Details from the API
  const { mutate: fetchStoreCode, isLoading: storeCodeLoading } = useMutation(
    "storeCode",
    // Function to fetch data of applicable field using apiService.getCouponProductDetails
    (val) => apiService.getStoreCode(val?.search || null),
    {
      // Configuration options
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        if (data) {
          try {
            if (data?.data) {
              const { store_code } = data.data || {};
              setSpecificStoresList([{ label: store_code, value: store_code }]); // specific store list
            } else {
              enqueueSnackbar("Store Code not found", snackBarErrorConf);
            }
          } catch (error) {}
        }
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // for store code check - debounce
  const debounceFetcherStoreCode = useMemo(() => {
    const loadOptions = (value) => {
      const obj = { search: value };
      fetchStoreCode(obj);
    };
    return debounce(loadOptions, 1000);
  }, [fetchStoreCode]);

  // search specific store
  const checkStoreCode = (val) => {
    try {
      if (val && val.length >= 3) {
        const searchExist = specificStoresList?.some((item) =>
          String(item?.label).toLowerCase().includes(val)
        ); // Check if any item matches the condition

        if (!searchExist) {
          debounceFetcherStoreCode(val);
        }
      }
    } catch (error) {}
  };

  const handleOfferTypeChange = (val) => {
    try {
      if (val) {
        form.setFieldValue("offer_type", val);
        setOfferType(val);

        //Clear previous details when offer type changes
        form.setFields([
          { name: "quantity_to_buy", errors: [], value: null },
          { name: "product_to_buy", errors: [], value: null },
          { name: "quantity_to_get_free", errors: [], value: null },
          { name: "product_to_get_free", errors: [], value: null },
          { name: "amount", errors: [], value: null },
          { name: "applicable_on", errors: [], value: "all" },
          { name: "type_ids", errors: [], value: null }
        ]);

        if (val == "default_offer") {
          setApplicableOn("all");
          setListBasedOnApplicableOn([]);
        }
        if (val == "free_shipping") {
          setFreeShippingType("minimum_order_amount");
          form.setFieldValue("free_shipping_type", "minimum_order_amount");
        }

        setProductNameToBuy("");
        setProductNameToGetFree("");
      }
    } catch (error) {}
  };

  const handleBundleDealTypeChange = (val, e) => {
    console.log("offerType", offerType, isPriceSame);
    if (!isPriceSame && offerType == "bundle_deal") {
      form.setFields([
        { name: "discount_value", errors: [], value: null },
        { name: "discount_type", errors: [], value: null }
      ]);
      return enqueueSnackbar(
        "All products must have the same price for bundle deals.",
        snackBarErrorConf
      );
    } else {
      setBundleDealType(val);
      form.setFields([{ name: "discount_value", errors: [], value: null }]);
    }
  };

  // handle free shipping type change
  const handleFreeShippingTypeChange = (e) => {
    try {
      setFreeShippingType(e);
      form.setFields([{ name: "amount", errors: [], value: null }]);
      form.setFields([{ name: "product_to_buy", errors: [], value: null }]);
    } catch (error) {}
  };

  // handle show-on check boxes change
  const handleShowOn = (val) => {
    try {
      if (val) {
        const shouldShowStoresFields = val.includes("puc");
        setDisplayStoresFields(shouldShowStoresFields); // Set state for displaying store fields

        if (!shouldShowStoresFields) {
          form.setFields([
            { name: "supported_stores", errors: [], value: null },
            { name: "specific_stores", errors: [], value: null }
          ]);
        }
      }
    } catch (error) {}
  };

  // update product name to buy
  const updateProductNameToBuy = (label) => {
    label && setProductNameToBuy(label.split(" (")[0].trim());
  };

  //update product name to get free
  const updateProductNameToGetFree = (label) => {
    label && setProductNameToGetFree(label.split(" (")[0].trim());
  };

  const handleSupportedStoresChange = (e) => {
    // If "all" is selected, check if it's the only selection
    if (e.includes("all")) {
      form.setFieldValue("supported_stores", [
        "wonder_world",
        "wonder_world_quick",
        "wwp",
        "keysoul_store",
        "display_wall"
      ]);
    } else {
      // If another option is selected, remove "all"
      const updatedOptions = e.filter((option) => option !== "all");
      form.setFieldValue("supported_stores", updatedOptions);
    }
  };

  const handleApplicableBuyerType = (e) => {
    // If "all" is selected, check if it's the only selection
    if (e.includes("all")) {
      let d = applicableBuyerType
        .filter((i) => {
          if (i.value != "all") {
            return i.value;
          }
        })
        .map((i) => i.value);
      form.setFieldValue("applicable_buyer_type", d);
    } else {
      // If another option is selected, remove "all"
      const updatedOptions = e.filter((option) => option !== "all");
      form.setFieldValue("applicable_buyer_type", updatedOptions);
    }
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) ? (
    <>
      <Typography.Title level={5}>{params?.id ? "Edit Offer" : "Add Offer"}</Typography.Title>
      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="offer_name"
              label="Offer Name"
              rules={[
                { required: true, message: "Offer name is required" },
                {
                  pattern: /^.{3,150}$/,
                  message: "The value must be between 3 and 150 characters long."
                },
                {
                  pattern: /^\S(.*\S)?$/,
                  message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE
                },
                {
                  pattern: /^(?!.*\s{2,}).*$/,
                  message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                }
              ]}>
              <Input placeholder="Enter Offer Name" size="large" />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item name="offer_type" label="Offer Type">
              <Select
                block
                size="large"
                placeholder="Select Offer Type"
                onChange={(e) => handleOfferTypeChange(e)}
                options={typesOfOffer}
              />
            </Form.Item>
          </Col>
          <OfferTypes
            offerType={offerType}
            bundleDealType={bundleDealType}
            newProductList={newProductList}
            eligibleProduct={eligibleProduct}
            newProductsLoading={newProductsLoading}
            freeShippingType={freeShippingType}
            form={form}
            userGroupList={userGroupList}
            productLoading={productLoading}
            listBasedOnApplicableOn={listBasedOnApplicableOn}
            applicableOn={applicableOn}
            checkDiscountValue={checkDiscountValue}
            disableMinPurchaseAmount={disableMinPurchaseAmount}
            searchProduct={searchProduct}
            handleBundleDealTypeChange={handleBundleDealTypeChange}
            handleFreeShippingTypeChange={handleFreeShippingTypeChange}
            handleDiscountType={handleDiscountType}
            handleApplicableOn={handleApplicableOn}
            checkMinimumPriceValue={checkMinimumPriceValue}
            updateProductNameToBuy={updateProductNameToBuy}
            updateProductNameToGetFree={updateProductNameToGetFree}
            setIsPriceSame={setIsPriceSame}
          />

          <Col className="gutter-row" span={24}>
            <Form.Item name="offer_description" label="Offer Description">
              <RichEditor
                placeholder="Enter Offer Description"
                handleDescription={handleOfferDescription}
                description={offerDescription}
              />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="select_start_date_expiry_date"
              label="Start Date & End Date"
              rules={[{ required: true, message: "Start Date & End Date are required" }]}>
              <RangePicker
                style={{ width: "100%" }} // Adjust according to your style
                size="large"
                disabledTime={(current, picker) => disablePastTimes(current, picker)}
                disabledDate={disablePastDates}
                showTime={{ format: "HH:mm" }}
                format="DD-MM-YYYY HH:mm"
              />
            </Form.Item>
          </Col>

          <Col flex="330px">
            <Form.Item
              name="supported_types"
              label="Show on"
              rules={[{ required: true, message: "Show on is required" }]}>
              <Checkbox.Group onChange={(e) => handleShowOn(e)}>
                <Checkbox value="web">Web (E-com)</Checkbox>
                <Checkbox value="app">App (E-com)</Checkbox>
                <Checkbox value="puc">PUC</Checkbox>
              </Checkbox.Group>
            </Form.Item>
          </Col>

          {displayStoresFields && (
            <>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="supported_stores"
                  label={`Supported Stores`}
                  rules={[{ required: false, message: "Supported stores is required" }]}>
                  <Select
                    placeholder={`Select Stores`}
                    allowClear
                    mode="multiple"
                    disabled={false}
                    name="supported_stores"
                    size="large"
                    options={[{ label: "All", value: "all" }, ...supportedStoresOptions]}
                    onChange={(e) => {
                      form.setFieldValue("specific_stores", null);
                      form.setFieldValue("supported_stores", e);
                      handleSupportedStoresChange(e);
                    }}
                    filterOption={(input, option) => {
                      return (option?.label.toLowerCase() ?? "").includes(input.toLowerCase());
                    }}
                  />
                </Form.Item>
              </Col>

              <Col className="gutter-row" span={12}>
                <Form.Item name="specific_stores" label={`Specific Stores`}>
                  <Select
                    placeholder={`Select Stores`}
                    allowClear
                    mode="multiple"
                    disabled={false}
                    size="large"
                    name="specific_stores"
                    options={specificStoresList}
                    onChange={(e) => {
                      // form.setFieldValue("specific_stores", e);
                      // console.log("e", e);
                      form.setFieldValue("supported_stores", null);
                    }}
                    onSearch={(e) => checkStoreCode(e)}
                    filterOption={(input, option) => (option?.label ?? "").includes(input)}
                  />
                </Form.Item>
              </Col>
            </>
          )}
          <Col className="gutter-row" flex="auto">
            <Form.Item name="reduce_pv" label="Reduce PV ?">
              <Switch size="large" checkedChildren="Yes" unCheckedChildren="No" />
            </Form.Item>
          </Col>
          <Col className="gutter-row" flex="auto">
            <Form.Item name="offer_status" label="Status">
              <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
            </Form.Item>
          </Col>
          <Col className="gutter-row" span={12}>
            <Form.Item
              name="applicable_buyer_type"
              label={`Applicable Buyer Type`}
              rules={[{ required: true, message: "Select buyer type" }]}>
              <Select
                placeholder={`Select Buyer Type`}
                allowClear
                mode="multiple"
                disabled={false}
                size="large"
                name="applicable_buyer_type"
                onSearch={(e) => checkStoreCode(e)}
                filterOption={(input, option) => (option?.label ?? "").includes(input)}
                options={[{ label: "All", value: "all" }, ...applicableBuyerType]}
                onChange={(e) => {
                  form.setFieldValue("applicable_buyer_type", null);
                  handleApplicableBuyerType(e);
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Flex align="start" justify={"flex-end"}>
          <NavLink to={"/" + Paths.offersList}>
            <Button disabled={isLoading} style={StyleSheet.backBtnStyle}>
              Cancel
            </Button>
          </NavLink>
          {actionsPermissionValidator(
            window.location.pathname,
            params?.id ? PermissionAction.EDIT : PermissionAction.ADD
          ) && (
            <Button loading={isLoading} type="primary" htmlType="submit" disabled={isLoading}>
              {params?.id ? "Update" : "Add"}
            </Button>
          )}
        </Flex>
      </Form>
    </>
  ) : (
    <></>
  );
}
