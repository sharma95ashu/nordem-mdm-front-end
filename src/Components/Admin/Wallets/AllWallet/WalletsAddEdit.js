import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Spin,
  Switch,
  TreeSelect,
  Typography
} from "antd";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { NavLink, useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { enqueueSnackbar } from "notistack";
import {
  PermissionAction,
  snackBarSuccessConf,
  RULES_MESSAGES,
  snackBarErrorConf,
  WALLET_TYPES
} from "Helpers/ats.constants";
import { useMutation, useQuery } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import { actionsPermissionValidator } from "Helpers/ats.helper";
import { debounce } from "lodash";

// Add/Edit Wallet component
export default function WalletsAddEdit() {
  const params = useParams();
  const { Title } = Typography;
  const { setBreadCrumb } = useUserContext();
  const [form] = Form.useForm();
  const { apiService } = useServices();
  const [walletType, setWalletType] = useState("Brand");
  const [walletIds, setWalletIds] = useState([]);
  const navigate = useNavigate();
  const [productList, setProductList] = useState([]);
  const isPVEnabled = Form.useWatch(["with_pv"], form);

  // UseQuery hook for fetching singlw wallet details
  const { refetch: fetchSingleWalletDetails, isLoading: singleWalletDetailsloading } = useQuery(
    "getSingleWalletDetails",
    () => apiService.getSingleWalletDetails(params?.id),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data && data.data) {
            form.setFieldsValue(data?.data);
            form.setFieldValue("wallet_code", data?.data.wallet_code.toString());

            const { wallet_status, type_ids, wallet_type } = data?.data || {};
            setWalletType(wallet_type);

            let typeIds = [];
            type_ids.map((item) => typeIds.push(Number(item[`${data.data.wallet_type}_id`])));

            form.setFieldValue("type_ids", typeIds);
            form.setFieldValue("wallet_status", wallet_status === "active");

            wallet_type === "category" && fetchWalletCategory();
            wallet_type === "brand" && fetchWalletBrand();

            if (wallet_type === "product") {
              const tempProduct = type_ids?.map((item) => ({
                label: item?.product_name,
                value: item?.product_id
              }));
              setProductList(tempProduct || []);
            }
          }
        } catch (error) {}
      },
      onError: (error) => {
        console.log(error);
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  /**
   * Function to submit form data
   * @param {*} value
   */
  const onFinish = (value) => {
    try {
      let data = {
        ...value,
        wallet_status: value.wallet_status ? "active" : "inactive",
        wallet_code: Number(value.wallet_code)
      };

      if (params?.id) {
        delete data.wallet_name;
        delete data.wallet_code;
      }
      // Initiate the Wallet creation process by triggering the mutate function
      mutate(data);
    } catch (error) {}
  };

  // UseMutation hook for creating/updating a Wallet via API
  const { mutate, isLoading } = useMutation(
    // Mutation function to handle the API call for creating a new Wallet
    (data) => apiService.addEditWallet(params?.id, data),
    {
      // Configuration options for the mutation
      onSuccess: (data) => {
        if (data) {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          // Navigate to the current window pathname after removing a specified portion
          navigate(`/${Paths.walletList}`);
        }
      },
      onError: (error) => {
        // Handle errors by displaying an error Snackbar notification
      }
    }
  );

  // handle wallet type change
  const handleWalletType = (value) => {
    try {
      if (value) {
        // reset default value
        if (value !== "category") {
          form.setFields([{ name: "type_ids", value: null, errors: [] }]);
        } else {
          form.setFields([{ name: "type_ids", errors: [], value: undefined }]);
        }
        setWalletIds([]);
        setProductList([]);
        setWalletType(value || "");
      }
    } catch (error) {}
  };

  useEffect(() => {
    walletType === "brand" && fetchWalletBrand();
    walletType === "category" && fetchWalletCategory();
    walletType === "product" && fetchWalletProduct();
  }, [walletType]);

  // UseQuery hook for fetching wallet brand list from the API
  const { refetch: fetchWalletBrand, isLoading: walletBrandListLoading } = useQuery(
    "getWalletBrandDetails",
    () => apiService.getWalletBrandDetails(),
    {
      // Configuration options
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data?.data?.data) {
            const tempWalletBrand = data?.data?.data?.map((item) => ({
              value: item?.brand_id,
              label: item?.brand_name
            }));

            setWalletIds(tempWalletBrand);
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  // UseQuery hook for fetching data of a wallet category list from the API
  const { refetch: fetchWalletCategory, isLoading: walletCatListLoading } = useQuery(
    "getWalletCategoryDetails",
    () => apiService.getWalletCategoryDetails(),
    {
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data?.data?.data) {
            // const tempCategoryList = data?.data?.data?.map((item) => ({
            //   value: item?.category_id,
            //   label: item?.category_name
            // }));

            const transformCategoryData = (categories) => {
              return categories.map((category) => {
                return {
                  value: category.category_id,
                  label: category.category_name,
                  ...(category.children &&
                    category.children.length > 0 && {
                      children: transformCategoryData(category.children)
                    })
                };
              });
            };

            const treeData = transformCategoryData(data?.data?.data);
            setWalletIds(treeData);
          }
        } catch (error) {}
      },
      onError: (error) => {
        // Handle errors by displaying a Snackbar notification
      }
    }
  );

  const updateProductList = (tempProductList) => {
    try {
      // Create a set of unique ids from products array and wholeData array
      const uniqueIDs = [
        ...new Set([
          ...productList.map((item) => item.value),
          ...tempProductList.map((item) => item.value)
        ])
      ];
      // createing a whole data array
      const mergedArr = [...tempProductList, ...productList];
      // Create a final array by filtering the wholeData array based on uniqueIDs set
      const finalArray = uniqueIDs.map((item) => {
        return mergedArr.find((product) => product?.value === item);
      }); //

      setProductList([...finalArray]);
    } catch (error) {}
  };

  // UseQuery hook for fetching data of a product list from the API
  const { mutate: fetchWalletProduct, isLoading: walletProductListLoading } = useMutation(
    "getWalletProductDetails",

    (val) => apiService.getWalletProductDetails(val?.search),
    {
      // Configuration options
      enabled: false, // Enable the query by default
      onSuccess: (data) => {
        try {
          if (data?.data?.data?.length > 0) {
            const tempProductList = data?.data?.data?.map((item) => ({
              value: item?.product_id,
              label: item?.product_name + " " + "(" + item?.sap_code + ")"
            }));
            updateProductList(tempProductList);
          } else {
            enqueueSnackbar("Product not found", snackBarErrorConf);
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
  /**
   * UseEffect function to set breadcrumb
   */
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    setBreadCrumb({
      title: "All Wallets",
      icon: "wallet",
      titlePath: Paths.walletList,
      subtitle: params?.id ? "Edit Wallet" : "Add Wallet",
      path: Paths.users
    });

    if (params.id) {
      fetchSingleWalletDetails();
    } else {
      form.setFieldValue("wallet_type", "brand");
      form.setFieldValue("wallet_status", true);
      form.setFieldValue("with_pv", false);
      fetchWalletBrand();
    }
  }, []);

  // for product - debounce
  const debounceFetcherProduct = useMemo(() => {
    const loadOptions = (value) => {
      const obj = { search: value };
      fetchWalletProduct(obj);
    };
    return debounce(loadOptions, 1000);
  }, [fetchWalletProduct]);

  // search product function
  const searchProduct = (val) => {
    try {
      if (val && val.length >= 3) {
        const searchExist = walletIds?.some((item) =>
          String(item?.label).toLowerCase().includes(val)
        ); // Check if any item matches the condition

        if (walletType == "product" && !searchExist) {
          debounceFetcherProduct(val);
        }
      }
    } catch (error) {}
  };

  return actionsPermissionValidator(
    window.location.pathname,
    params?.id ? PermissionAction.VIEW : PermissionAction.ADD
  ) ? (
    <>
      <Spin spinning={singleWalletDetailsloading} fullscreen />
      <Title level={5}>{params?.id ? "Edit Wallet" : "Add Wallet"}</Title>

      <Form name="form_item_path" form={form} layout="vertical" onFinish={onFinish}>
        <Row gutter={[24, 0]}>
          <Col className="gutter-row" span={24}>
            <Row gutter={[24, 0]}>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="wallet_name"
                  label="Wallet Name"
                  type="text"
                  rules={[
                    { required: true, whitespace: true, message: "Wallet name is required" },
                    {
                      pattern: /^.{1,50}$/,
                      message: RULES_MESSAGES.MIN_MAX_LENGTH_MESSAGE
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
                  <Input placeholder="Enter Wallet Name" size="large" disabled={params?.id} />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="wallet_code"
                  type="number"
                  label="Wallet Code"
                  rules={[
                    { required: true, whitespace: true, message: "Wallet code is required" },
                    {
                      pattern: /^\d{3}$/,
                      message: "Wallet code must be exactly 3 digits"
                    }
                  ]}>
                  <Input
                    placeholder="Enter Wallet Code"
                    inputMode="numeric"
                    type="number"
                    maxLength={3}
                    size="large"
                    disabled={params?.id}
                  />
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={12}>
                <Form.Item
                  name="wallet_type"
                  label="Wallet Type"
                  rules={[{ required: true, message: "Wallet type is required" }]}>
                  <Select
                    size="large"
                    onChange={(value) => {
                      handleWalletType(value);
                    }}
                    placeholder="Select Wallet Type"
                    showSearch
                    allowClear
                    options={WALLET_TYPES}
                  />
                </Form.Item>
              </Col>
              {walletType != "generic" && (
                <Col className="gutter-row" span={12}>
                  {walletType !== "category" ? (
                    <Form.Item
                      name="type_ids"
                      className="textCapitalize"
                      label={`Select ${walletType}`}
                      rules={[{ required: true, message: `${walletType} is required` }]}>
                      <Select
                        size="large"
                        showSearch
                        mode="multiple"
                        allowClear
                        className="textCapitalize"
                        placeholder={`Select ${walletType}`}
                        onSearch={searchProduct}
                        loading={
                          walletProductListLoading || walletCatListLoading || walletBrandListLoading
                        }
                        notFoundContent={
                          walletProductListLoading ||
                          walletCatListLoading ||
                          walletBrandListLoading ? (
                            <Spin size="small" />
                          ) : null
                        }
                        options={walletType == "product" ? productList : walletIds}
                        disabled={
                          (walletType !== "product" && walletIds.length == 0) ||
                          (walletType == "product" && productList.length == 0)
                        }
                        filterOption={(input, option) => {
                          return (option?.label.toLowerCase() ?? "").includes(input.toLowerCase());
                        }}
                      />
                    </Form.Item>
                  ) : (
                    <Form.Item
                      name="type_ids"
                      className="textCapitalize"
                      label={`Select ${walletType}`}
                      rules={[{ required: true, message: `${walletType} is required` }]}>
                      <TreeSelect
                        size="large"
                        showSearch
                        multiple
                        allowClear
                        className="textCapitalize"
                        placeholder={`Select ${walletType}`}
                        onSearch={searchProduct}
                        treeData={walletType == "product" ? productList : walletIds}
                        loading={
                          walletProductListLoading || walletCatListLoading || walletBrandListLoading
                        }
                        notFoundContent={
                          walletProductListLoading ||
                          walletCatListLoading ||
                          walletBrandListLoading ? (
                            <Spin size="small" />
                          ) : null
                        }
                        disabled={
                          (walletType !== "product" && walletIds.length == 0) ||
                          (walletType == "product" && productList.length == 0)
                        }
                        filterTreeNode={(input, node) => {
                          return (node?.label?.toLowerCase() ?? "").includes(input?.toLowerCase());
                        }}
                      />
                    </Form.Item>
                  )}
                </Col>
              )}

              <Col className="gutter-row" span={6}>
                <Form.Item name="with_pv" label="With PV">
                  <Switch
                    size="large"
                    checkedChildren="Yes"
                    unCheckedChildren="No"
                  />
                </Form.Item>
              </Col>

              {isPVEnabled && (
                <Col className="gutter-row" span={6}>
                  <Form.Item
                    name="pv_percentage"
                    label="PV %"
                    rules={[
                      { required: true, message: "PV % is required" },
                      {
                        pattern: /^(100(?:\.0{1,2})?|([1-9]\d?)(\.\d{1,2})?)$/, // 1–100 only
                        message:
                          "Enter a valid percentage between 1 and 100, up to 2 decimal places"
                      }
                    ]}>
                    <Input
                      type="number"
                      addonAfter={<span>%</span>}
                      placeholder="Enter PV %"
                      size="large"
                    />
                  </Form.Item>
                </Col>
              )}

              <Col className="gutter-row" span={6}>
                <Form.Item name="wallet_status" label="Status">
                  <Switch size="large" checkedChildren="Active" unCheckedChildren="Inactive" />
                </Form.Item>
              </Col>
            </Row>
          </Col>
        </Row>
        <Flex gap="middle" align="start" vertical>
          <Flex justify={"flex-end"} align={"center"} className="width_full">
            <NavLink to={"/" + Paths.walletList}>
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
        </Flex>
      </Form>
    </>
  ) : (
    <></>
  );
}

/***
 * styles
 */
const StyleSheet = {
  backBtnStyle: {
    marginRight: "10px"
  }
};
