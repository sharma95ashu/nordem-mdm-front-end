/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Button,
  Col,
  Flex,
  Form,
  Input,
  Row,
  Select,
  Skeleton,
  Spin,
  Switch,
  Tabs,
  Table,
  Checkbox,
  TreeSelect,
  Typography,
  Upload,
  theme,
  Popconfirm,
  Tag,
  message,
  Modal,
  InputNumber,
  Card,
  Tooltip
} from "antd";

import React, { useCallback, useEffect, useRef, useState } from "react";

import { NavLink, useLocation, useNavigate, useParams } from "react-router-dom";

import {
  CloseOutlined,
  CloudUploadOutlined,
  ConsoleSqlOutlined,
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  EyeOutlined,
  FileImageOutlined,
  InfoCircleOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  PlaySquareOutlined,
  PlusOutlined,
  ThunderboltOutlined,
  UpOutlined
} from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { enqueueSnackbar } from "notistack";
import {
  ALLOWED_FILE_TYPES,
  PermissionAction,
  snackBarErrorConf,
  snackBarInfoConf,
  snackBarSuccessConf,
  RULES_MESSAGES,
  valueUptoTwoDecimalValueRegex,
  GST_VALUES,
  supportedStoresOptions,
  otherUsergroup,
  ALLOWED_FILE_SIZE
} from "Helpers/ats.constants";
import { useServices } from "Hooks/ServicesContext";
// import RichEditor from "Components/Shared/richEditor";
import {
  actionsPermissionValidator,
  firstlettCapital,
  check3charcterValidation,
  checkCharcterValidation,
  checkHsnNo,
  checkSAPValidation,
  negativeValueValiation,
  validateFileSize,
  checkIfEditorEmpty,
  gstValiation,
  validationNumber,
  validationFloatNumber,
  imageCompress,
  getFile,
  negativeValueWithZeroAllowValiation
} from "Helpers/ats.helper";
import StickyBox from "react-sticky-box";
import CommonVariant from "Components/Shared/CommonVariant";

import Language from "./Language";
import ProductSections from "./ProoductSection/ProductSections";
import { filter, set } from "lodash";
import { getFullImageUrl } from "Helpers/functions";
import Joditor from "Components/Shared/Joditor";

export default function ProductEdit() {
  const [activeKey, setActiveKey] = useState("1");

  const navigate = useNavigate();
  const { TextArea } = Input;
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [basicDetailForm] = Form.useForm();
  const [seoDetailForm] = Form.useForm();

  const [priceDetailForm] = Form.useForm();
  const [attributeDetailForm] = Form.useForm();
  const [variantDetailForm] = Form.useForm();
  const [productLanguageForm] = Form.useForm();
  const location = useLocation();

  const [tabdisabled, setTabDisabled] = useState(true);
  const params = useParams();
  const [componetReRender, setcomponetReRender] = useState(false);

  const formChangeListener = useRef({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false,
    7: false
  });

  const [formSubmitStatus, setFormSubmitStatus] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false,
    6: false
  });

  const {
    token: {
      colorBgContainer,
      colorBorder,
      colorBgLayout,
      paddingSM,
      paddingLG,
      colorText,
      colorError,
      colorPrimary
    }
  } = theme.useToken();

  // styles
  const StyleSheet = {
    StyleBottom: {
      marginTop: "5px"
    },
    marginBottomCustom: {
      marginTop: "-16px"
    },
    marginBottomCustomButton: {
      marginTop: "18px"
    },
    customeHeight: {
      height: "15px !important"
    },
    AlignMiddle: {
      alignItems: "center"
    },
    errorStyling: {
      paddingLeft: paddingLG,
      position: "relative",
      top: paddingSM
    },
    contentSubStyle: {
      paddingTop: paddingSM,
      paddingBottom: paddingSM,
      paddingLeft: paddingLG,
      paddingRight: paddingLG,
      background: colorBgContainer,
      border: `1px solid ${colorBorder}`,
      borderRadius: "10px",
      margin: "0 0 20px",
      width: "100%"
    },
    savedStyle: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap"
    },
    mainContainer: {
      paddingTop: paddingLG,
      paddingBottom: paddingSM,
      paddingLeft: paddingLG,
      paddingRight: paddingLG,
      marginRight: -paddingLG,
      marginLeft: -paddingLG,
      marginBottom: -paddingSM,
      marginTop: -16,
      background: colorBgLayout,
      minHeight: "calc(100vh - 195px)"
    },
    submitNavStyle: {
      marginTop: "0",
      gap: "10px"
    },
    backBtnStyle: {
      marginRight: "10px"
    },
    formStyle: {
      margin: "0 -10px",
      paddingTop: 0,
      paddingBottom: paddingSM,
      paddingLeft: paddingLG,
      paddingRight: paddingLG
    },
    metaBoxStyle: {
      minHeight: "1200px"
    },
    categoryMappingStye: {
      display: "flex"
    },
    uploadBtnStyle: {
      border: 0,
      background: "none"
    },
    cloudIconStyle: {
      fontSize: "1.5rem",
      color: colorText
    },
    uploadLoadingStyle: {
      marginTop: 8,
      color: colorText
    },
    TitleStyle: {
      marginTop: 0
    },
    variantsBoxOpen: {
      padding: "20px 20px 0",
      background: colorBgLayout,
      borderRadius: "8px",
      marginBottom: 10
    },
    variantsBoxClose: {
      padding: "20px 20px 0",
      borderRadius: "8px 8px 0 0",
      borderBottom: "1px solid",
      borderColor: colorBorder
    },
    addVariants: {
      marginTop: 20
    },
    subTextStyle: {
      marginBottom: 10,
      display: "block"
    },
    labelText: {
      marginLeft: 10,
      fontWeight: 400
    },
    checkTdstyle: {
      margin: 0
    },
    rowAttributesStyle: {
      display: "flex",
      justifyContent: "flex-start",
      alignItems: "center",
      gap: "16px"
    },
    attibuteButtonStyle: {
      marginTop: "4px"
    },
    StickyStyle: {
      background: colorBgContainer,
      margin: "0 -24px",
      padding: "0 24px"
    },
    videoPlayerStyle: {
      width: "100%"
    },
    modalCloseBtnStyle: {
      position: "absolute",
      top: "0",
      right: "0",
      zIndex: 1
    },
    uploadBoxStyle: {
      position: "relative"
    }
  };

  /**
   * Banner style css
   */
  const bannerStyle = {
    width: "100%",
    height: "100%",
    objectFit: "cover"
  };

  /**
   * Conversion of image to base 64
   */
  const getBase64 = (img, callback) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => callback(reader.result));
    reader.readAsDataURL(img);
  };

  /**
   * Category image css
   */

  const categoryStyle = {
    width: "100%",
    height: "100%",
    objectFit: "contain"
  };

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT)
      ? ""
      : navigate("/", { state: { from: null }, replace: true });
    setBreadCrumb({
      title: "Product",
      icon: "products",
      titlePath: Paths.productList,
      subtitle: "Edit Product",
      path: Paths.productAdd
    });
  }, []);

  //Function to go back to the Category listing page
  const handleCancelBtn = () => {
    const searchParams = new URLSearchParams(location.search);
    const page = searchParams.get("page") || "1";
    const pageSize = searchParams.get("pageSize") || "10";
    navigate(`/${Paths.productList}?page=${page}&pageSize=${pageSize}`);
  };

  /**
   * Basic Detail Component
   */

  const BasicDetails = () => {
    const [minDescription, setMinDescription] = useState("");
    const [maxDescription, setMaxDescription] = useState("");
    const [categoryValue, setCategoryValue] = useState(undefined);
    const [basicLoader, setBasicLoader] = useState(false);
    const [tags, setTags] = useState([]);
    const [brandInfo, setBrandInfo] = useState([]);
    const [parentCategory, setParentCategory] = useState([]);
    const [displayStoresFields, setDisplayStoresFields] = useState(false);
    const [displayUserType, setdisplayUserType] = useState(false);
    const [sizeChartsList, setSizeChartsList] = useState([]);
    const [productSectionData, setProductSectionData] = useState([]);
    const [disableSapCode, setDisableSapCode] = useState(false);
    const [brandId, setBrandId] = useState();

    /**
     * function to filter by label in multi select dropdown
     * @param {} inputValue
     * @param {*} treeNode
     * @returns
     */
    const filterTreeNode = (inputValue, treeNode) => {
      // Check if the input value matches any part of the label of the treeNode
      // return treeNode.label.toLowerCase().includes(inputValue.toLowerCase());
      return treeNode.label.toLowerCase().includes(inputValue.toLowerCase());
    };

    // UseQuery hook for fetching data of a all brand from the API
    const { refetch: fetchAllBrands, isLoading: brandsLoading } = useQuery(
      "getAllBrand",
      // Function to fetch data of a all brand using apiService.getRequest
      () => apiService.getRequest(`/products/brands/0/500`),
      {
        // Configuration options
        enabled: false, // Enable the query by default
        onSuccess: (data) => {
          setBrandInfo([]);
          data?.data?.data.map((item) =>
            setBrandInfo((prev) => [...prev, { value: item?.brand_id, label: item?.brand_name }])
          );
          // Set form values based on the fetched data
        },
        onError: (error) => {
          enqueueSnackbar(error.message, snackBarErrorConf);
        }
      }
    );

    // const apiUrl = `/products/categories/0/1000?brand_id=${brandId}`;

    // // UseQuery hook for fetching data of a All Category from the API
    // const { refetch: fetchingCategory, isLoading: categoryLoading } = useQuery(
    //   "getAllCategory",

    //   // Function to fetch data of a single Category using apiService.getRequest
    //   () => apiService.getRequest(apiUrl),
    //   {
    //     // Configuration options
    //     enabled: false, // Enable the query by default
    //     onSuccess: (data) => {
    //       // Set form values based on the fetched data
    //       setParentCategory([]);

    //       // const filteredData = (data?.data?.data || []).filter(
    //       //   (item) => item.category_status == "active"
    //       // );

    //       data?.data?.data.map((item) =>
    //         setParentCategory((prev) => [
    //           ...prev,
    //           {
    //             value: item.category_id,
    //             label: firstlettCapital(item.category_name),
    //             // children: item?.children?.map((child) => ({
    //             //   value: child.category_id,
    //             //   label: firstlettCapital(child.category_name),
    //             //   children: child?.children?.map((subchild) => ({
    //             //     value: subchild.category_id,
    //             //     label: firstlettCapital(subchild.category_name)
    //             //   }))
    //             // }))

    //             children: item?.children?.map((child) => ({
    //               value: child.category_id,
    //               label: firstlettCapital(child.category_name),
    //               children: child?.children?.map((subchild) => ({
    //                 value: subchild.category_id,
    //                 label: firstlettCapital(subchild.category_name),
    //                 children: subchild?.children?.map((level4) => ({
    //                   value: level4.category_id,
    //                   label: firstlettCapital(level4.category_name),
    //                   children: level4?.children?.map((level5) => ({
    //                     value: level5.category_id,
    //                     label: firstlettCapital(level5.category_name),
    //                     children: level5?.children?.map((level6) => ({
    //                       value: level6.category_id,
    //                       label: firstlettCapital(level6.category_name),
    //                       children: level6?.children?.map((level7) => ({
    //                         value: level7.category_id,
    //                         label: firstlettCapital(level7.category_name)
    //                       }))
    //                     }))
    //                   }))
    //                 }))
    //               }))
    //             }))
    //           }
    //         ])
    //       );
    //     },
    //     onError: (error) => {
    //       // Handle errors by displaying a Snackbar notification
    //       enqueueSnackbar(error.message, snackBarErrorConf);
    //     }
    //   }
    // );

    const apiTagsUrl = `/products/tags/0/400`;
    // UseQuery hook for fetching data of a All tag from the API
    const { refetch: fetchingTags, isLoading: tagsLoading } = useQuery(
      "getAllTags",

      // Function to fetch data of a single tag using apiService.getRequest
      () => apiService.getRequest(apiTagsUrl),
      {
        // Configuration options
        enabled: false, // Enable the query by default
        onSuccess: (data) => {
          // Set form values based on the fetched data
          setTags([]);
          data?.data?.data.map((item) =>
            setTags((prev) => [
              ...prev,
              {
                value: item.tag_id,
                label: item.tag_name
              }
            ])
          );
        },
        onError: (error) => {
          // Handle errors by displaying a Snackbar notification
          enqueueSnackbar(error.message, snackBarErrorConf);
        }
      }
    );

    // UseQuery hook for fetching data of a single Basic Details from the API
    const { refetch: fetchingBasicDetails, isLoading: basicDetailsLoading } = useQuery(
      "getSingleBasicDetails",
      // Function to fetch data of a single Basic Details using apiService.getBasicDetails
      () => apiService.getBasicDetails(params.id),
      {
        // Configuration options
        enabled: false, // Enable the query by default
        onSuccess: (data) => {
          // Set form values based on the fetched data
          if (data?.data) {
            form.setFieldsValue(data?.data);
            if (data?.data?.product_type == "master") {
              setDisableSapCode(true);
            }
            if (data?.data?.short_desc) {
              setMinDescription(data?.data?.short_desc);
              form.setFieldValue("short_description", data?.data?.short_desc);
            }
            if (data?.data?.long_desc) {
              setMaxDescription(data?.data?.long_desc);
              form.setFieldValue("full_description", data?.data?.long_desc);
            }
            form.setFieldValue("min_cart_quantity", data?.data?.cart_details?.min_cart_qty || 1);
            form.setFieldValue("max_cart_quantity", data?.data?.cart_details?.max_cart_qty);
            form.setFieldValue("select_brand", data?.data?.brand_id);
            fetchBrandRelatedCategories(data?.data?.brand_id);

            setBrandId(data?.data?.brand_id);
            form.setFieldValue("category", data?.data?.category_id);
            form.setFieldValue(
              "tags",
              data?.data?.tags?.map((e) => ({ label: e.tag_name, value: e.tag_id }))
            );
            form.setFieldValue("status", data?.data?.product_status);
            form.setFieldValue("uqc", data?.data?.uqc);
            form.setFieldValue(
              "multiple_cart_quantity",
              data?.data?.cart_details?.multiple_cart_qty || false
            );
            form.setFieldValue("weight", data?.data?.weight);
            form.setFieldValue("unit", "gm");
            form.setFieldValue("quantity_per_box", data?.data?.quantity_per_box);

            const { show_on_type } = data?.data || {};

            show_on_type && setDisplayStoresFields(show_on_type?.includes("stores"));
            setProductSectionData(data?.data?.product_detail_data || []);

            handleShowOn(show_on_type || []);
          }
        },
        onError: (error) => {
          // Handle errors by displaying a Snackbar notification
          enqueueSnackbar(error.message, snackBarErrorConf);
        }
      }
    );

    // UseQuery hook for getting all size charts for dropdown
    const { refetch: fetchAllSizeCharts, isLoading: sizeChartLoading } = useQuery(
      "getSizeChartList",
      () => apiService.getAllSizeChartList(),
      {
        enabled: false,
        onSuccess: (data) => {
          try {
            if (data) {
              const tempSizeChartList = data?.data?.data?.map((item) => ({
                label: item?.name,
                value: item?.size_chart_id
              }));

              setSizeChartsList(tempSizeChartList);
            }
          } catch (error) {}
        },
        onError: (error) => {
          // Handle errors by displaying an error Snackbar notification
        }
      }
    );

    const fetchData = () => {
      setBasicLoader(true);

      Promise.all([
        fetchAllBrands(),
        // fetchingCategory(),
        fetchingTags(),
        fetchingBasicDetails(),
        fetchAllSizeCharts()
      ])
        .then(
          ([brandsResult, categoryResult, tagsResult, basicDetailsResult, sizeChartsResult]) => {
            // All promises resolved successfully
            // You can access the results here if needed
            // brandsResult, categoryResult, tagsResult, basicDetailsResult
            setBasicLoader(false);
          }
        )
        .catch((error) => {
          // Handle error if any of the promises fail
        });
    };

    useEffect(() => {
      fetchData();
    }, []);

    /**
     * Function to submit form data
     * @param {*} value
     */

    const onBasicUpdate = (value) => {
      try {
        let tagsValue = [];
        if (value?.tags?.length > 0) {
          if (typeof value?.tags[0] == "object") {
            value?.tags?.forEach((item) => {
              tagsValue.push(String(item?.value));
            });
          } else {
            tagsValue = value?.tags?.toString().split(",");
          }
        } else {
          tagsValue = [];
        }

        const data = {
          basic_details: {
            product_name: value?.product_name,
            // short_desc: minDescription,
            long_desc: maxDescription || "",
            display_order: value?.display_order || 1,
            dispatch_by: value?.dispatch_by,
            is_trending: value?.is_trending,
            new_arrival: value?.new_arrival,
            is_warranty: value.is_warranty || false,
            is_only_offer_purchasable: value.is_only_offer_purchasable || false,
            is_not_for_sale: value.is_not_for_sale || false,
            hide_pv: value.hide_pv || false,
            hide_sp: value.hide_sp || false,
            is_fmcg: value.is_fmcg || false,

            show_stock: value?.show_stock,
            sap_code: value?.sap_code,
            category_id: value?.category,
            product_status: value?.status,
            tags: tagsValue,
            brand_id: value?.select_brand,
            is_returnable: value?.is_returnable,
            quantity_per_box: value?.quantity_per_box ? value?.quantity_per_box : null,
            weight: value?.weight || 0,
            unit: value?.unit,
            uqc: value?.uqc,

            barcode: value?.barcode,
            show_on_type: value?.show_on_type,
            // supported_stores: value?.supported_stores || []
            supported_stores: value?.supported_stores?.length > 0 ? value?.supported_stores : null,

            size_chart_id: value?.size_chart_id || null,
            net_content: value?.net_content || null,
            user_type: value.user_type,
            product_detail_data: productSectionData.map((section) => ({
              ...section,
              product_id: params?.id
            }))
          },
          cart_details: {
            cart_id: form.getFieldValue("cart_details")?.cart_id || undefined,
            min_cart_qty: value?.min_cart_quantity,
            max_cart_qty: value?.max_cart_quantity,
            multiple_cart_qty: value?.multiple_cart_quantity || false,
            product_id: params?.id
          }
        };

        let obj = { load: data };
        mutate(obj);
      } catch (error) {}
    };

    // UseMutation hook for creating a new Brand via API
    const { mutate, isLoading } = useMutation(
      // Mutation function to handle the API call for creating a new Brand
      (data) => apiService.updatedBasicDetails(data.load, params?.id),
      {
        // Configuration options for the mutation
        onSuccess: (data) => {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          fetchData();

          // Invalidate the "getAllRoles" query in the query client to trigger a refetch
          queryClient.invalidateQueries("fetchProductData");
        },
        onError: (error) => {
          // Handle errors by displaying an error Snackbar notification
          enqueueSnackbar(error.message, snackBarErrorConf);
        }
      }
    );

    // const checkIfEditorEmpty = (value) => {
    //   let updatedValue = value.replace(/<(.|\n)*?>/g, '').trim().length === 0 ? "" : value;
    //   return updatedValue;
    // }

    /**
     *  Min description validation
     */
    const minHandleDescription = (value) => {
      let updatedValue = checkIfEditorEmpty(value);
      setMinDescription(updatedValue);
      form.setFieldValue("short_description", updatedValue);
    };

    /**
     *  Max description validation
     */
    const maxHandleDescription = (value) => {
      let updatedValue = checkIfEditorEmpty(value);
      setMaxDescription(updatedValue);
      form.setFieldValue("full_description", updatedValue);
    };

    /**
     * Set Initial value
     */
    useEffect(() => {
      if (params?.id) {
        setTabDisabled(false);
      }
      form.setFieldValue("is_trending", false);
      form.setFieldValue("new_arrival", false);
      form.setFieldValue("is_warranty", false);
      form.setFieldValue("is_only_offer_purchasable", false);
      form.setFieldValue("is_not_for_sale", false);
      form.setFieldValue("hide_pv", false);
      form.setFieldValue("hide_sp", false);
      form.setFieldValue("is_fmcg", false);
      form.setFieldValue("show_stock", false);
      form.setFieldValue("multiple_cart_quantity", false);
      form.setFieldValue("display_order", 1);
      form.setFieldValue("is_returnable", false);
      form.setFieldValue("tags", []);
    }, []);

    const checkMaxCart = (_, val) => {
      let value = Number(val);
      let maxVal = parseInt(form.getFieldValue("max_cart_quantity"));

      if (value && maxVal) {
        if (value > 0) {
          if (value > maxVal) {
            return Promise.reject(
              new Error("Min cart quantity must be less than max cart quantity")
            );
          } else {
            form.setFields([{ name: "max_cart_quantity", errors: [] }]);
            return Promise.resolve();
          }
        } else {
          return Promise.reject(new Error("Value must be greater than 0"));
        }
      } else {
        return Promise.reject(new Error("Invalid input"));
      }
    };

    const checkMinCart = (_, val) => {
      let value = Number(val);
      let minVal = parseInt(form.getFieldValue("min_cart_quantity"));
      if (minVal && value) {
        if (value < minVal) {
          return Promise.reject(
            new Error("Max cart quantity must be greater than min cart quantity")
          );
        } else {
          form.setFields([{ name: "min_cart_quantity", errors: [] }]);
          return Promise.resolve();
        }
      } else {
        return Promise.resolve();
      }
    };

    // const handleSelectChange = (value) => {
    //   form.setFieldValue("unit", value);
    // };

    // const selectAfter = (
    //   <Select defaultValue={form.getFieldValue("unit")} onChange={handleSelectChange}>
    //     <Option value="t">Tonne</Option>
    //     <Option value="q">Quintal</Option>
    //     <Option value="kg">Kilogram</Option>
    //     <Option value="g">Gram</Option>
    //     <Option value="mg">Milligram</Option>
    //   </Select>
    // );

    // handle show-on check boxes change
    const handleShowOn = (val) => {
      try {
        if (val) {
          let exists = ["app", "web"].some((item) => val.includes(item));
          setdisplayUserType(exists);

          const shouldShowStoresFields = val.includes("stores");
          setDisplayStoresFields(shouldShowStoresFields); // Set state for displaying store fields

          if (!shouldShowStoresFields) {
            form.setFields([{ name: "supported_stores", errors: [], value: [] }]);
          }
        }
      } catch (error) {}
    };

    // handle supported stores change
    const handleSupportedStoresChange = (e) => {
      {
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
      }
    };

    const sectionDataHandle = (e) => {
      try {
        setProductSectionData(e);
      } catch (error) {}
    };

    const handleSelectChange = (value) => {
      try {
        if (value.includes("all")) {
          form.setFieldValue(
            "user_type",
            otherUsergroup.filter((item) => item.value !== "all").map((option) => option.value)
          );
        }
      } catch (error) {}
    };

    const handeleDeSelectChange = () => {
      try {
        const otherUserVal = form.getFieldValue("user_type");
        form.setFieldValue(
          "user_type",
          otherUserVal?.filter((item) => item !== "all")
        );
      } catch (error) {}
    };

    // Function to fetch brand category relation
    const { mutate: fetchBrandRelatedCategories } = useMutation(
      (data) => apiService.getBrandRelatedCategories(data),
      {
        // Configuration options
        onSuccess: (data) => {
          // Set form values based on the fetched data
          setParentCategory([]);

          // const filteredData = (data?.data?.data || []).filter(
          //   (item) => item.category_status == "active"
          // );

          data?.data?.data.map((item) =>
            setParentCategory((prev) => [
              ...prev,
              {
                value: item.category_id,
                label: firstlettCapital(item.category_name),
                // children: item?.children?.map((child) => ({
                //   value: child.category_id,
                //   label: firstlettCapital(child.category_name),
                //   children: child?.children?.map((subchild) => ({
                //     value: subchild.category_id,
                //     label: firstlettCapital(subchild.category_name)
                //   }))
                // }))

                children: item?.children?.map((child) => ({
                  value: child.category_id,
                  label: firstlettCapital(child.category_name),
                  children: child?.children?.map((subchild) => ({
                    value: subchild.category_id,
                    label: firstlettCapital(subchild.category_name),
                    children: subchild?.children?.map((level4) => ({
                      value: level4.category_id,
                      label: firstlettCapital(level4.category_name),
                      children: level4?.children?.map((level5) => ({
                        value: level5.category_id,
                        label: firstlettCapital(level5.category_name),
                        children: level5?.children?.map((level6) => ({
                          value: level6.category_id,
                          label: firstlettCapital(level6.category_name),
                          children: level6?.children?.map((level7) => ({
                            value: level7.category_id,
                            label: firstlettCapital(level7.category_name)
                          }))
                        }))
                      }))
                    }))
                  }))
                }))
              }
            ])
          );
        },
        onError: (error) => {
          // Handle errors by displaying a Snackbar notification
          enqueueSnackbar(error.message, snackBarErrorConf);
        }
      }
    );

    //Function to handle change in brand value
    const handleBrandChange = (val) => {
      form.setFieldValue("category", null);
      setBrandId(val);

      if (val) {
        fetchBrandRelatedCategories(val);
      }
    };

    //Function to run when brand value is cleared
    const onClearBrand = () => {
      setBrandId(null);
      form.setFieldValue("category", null);
    };
    return (
      <>
        {
          // brandsLoading && categoryLoading && tagsLoading && basicDetailsLoading
          basicLoader ? (
            <Spin fullscreen />
          ) : (
            <Form name="form_basic" form={form} layout="vertical" onFinish={onBasicUpdate}>
              <div style={StyleSheet.mainContainer}>
                <div style={StyleSheet.contentSubStyle}>
                  <Row gutter={(50, 40)}>
                    <Col span={12}>
                      <Typography.Title level={5}>Product Info</Typography.Title>
                    </Col>
                    <Col span={12}>
                      <Flex align="start" justify={"flex-end"} style={StyleSheet.submitNavStyle}>
                        {/* <Button style={StyleSheet.backBtnStyle} onClick={handleCancelBtn}>
                          Cancel
                        </Button> */}
                        <Button type="primary" htmlType="submit" disabled={isLoading}>
                          Update
                        </Button>
                      </Flex>
                    </Col>
                  </Row>

                  <Row gutter={20}>
                    <Col className="gutter-row" span={12}>
                      <Form.Item
                        name="unit"
                        noStyle // Hide the form item, as we're handling it separately
                        hidden={true}>
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name="product_name"
                        label="Product Name"
                        rules={[
                          {
                            required: true,
                            whitespace: true,
                            message: "Product name is required"
                          },
                          {
                            pattern: /^\S(.*\S)?$/,
                            message: RULES_MESSAGES.NO_WHITE_SPACE_MESSAGE
                          },
                          {
                            pattern: /^(?!.*\s{2,}).*$/,
                            message: RULES_MESSAGES.CONSECUTIVE_SPACE_MESSAGE
                          },
                          {
                            min: 2,
                            message: "Product name must be at least 2 characters long"
                          },
                          {
                            max: 150,
                            message: "Product name must be at max. 150 characters long"
                          }
                        ]}>
                        <Input size="large" placeholder="Enter Product Name" />
                      </Form.Item>
                    </Col>
                    <Col className="gutter-row" span={12}>
                      <Form.Item
                        name="select_brand"
                        label="Select Brand"
                        rules={[{ required: true, message: "Brand is required" }]}>
                        <Select
                          showSearch
                          allowClear
                          placeholder="Select Brand"
                          size="large"
                          options={brandInfo}
                          filterOption={(input, option) =>
                            (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                          }
                          onChange={handleBrandChange}
                          onClear={onClearBrand}
                        />
                      </Form.Item>
                    </Col>
                    <Col className="gutter-row" span={12}>
                      <Form.Item
                        name="dispatch_by"
                        label="Dispatch By"
                        rules={[{ required: true, message: "Dispatch is required" }]}>
                        <Select
                          placeholder="Select Dispatch By"
                          size="large"
                          options={[
                            {
                              value: "puc",
                              label: "PUC"
                            },
                            {
                              value: "depot",
                              label: "Depot"
                            },
                            {
                              value: "ho",
                              label: "Head Office"
                            },
                            {
                              value: "both",
                              label: "PUC + Depot"
                            },
                            {
                              value: "supplier",
                              label: "Supplier"
                            }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    {/* <Col className="gutter-row" span={12}>
                      <Form.Item
                        name="display_order"
                        label="Display Order"
                        rules={[
                          { required: true, message: "Display order is required" },
                          {
                            pattern: /^.{0,5}$/,
                            message: "Value should not exceed 5 characters"
                          },
                          {
                            pattern: /^[1-9]\d*$/,
                            message: "Please enter valid number"
                          }
                        ]}>
                        <Input size="large" placeholder="Display order" type="number" min={1} />
                      </Form.Item>
                    </Col> */}
                    <Col className="gutter-row" span={12}>
                      <Form.Item
                        name="weight"
                        label="Weight"
                        rules={[
                          { required: true, message: "Weight is required" },
                          {
                            pattern: /^([0]|[1-9]\d*)(\.\d+)?$/,
                            message: "Please enter valid number"
                          }
                        ]}>
                        <Input size="large" placeholder="Weight" addonAfter={<span>Grams</span>} />
                      </Form.Item>
                    </Col>
                    <Col
                      className="gutter-row"
                      xs={{ span: 24 }}
                      sm={{ span: 24 }}
                      md={{ span: 24 }}
                      lg={{ span: 12 }}>
                      <Form.Item
                        name="sap_code"
                        label="SAP Code"
                        rules={[
                          { required: true, message: "SAP code is required" },
                          {
                            // pattern: /^(?:[0-9]{3,12})(?:\.[0-9])?$/,
                            pattern: /^(?:0|[0-9]{3,12})(?:\.[0-9])?$/,
                            message: "The value must be between 3 and 12 characters long."
                          },
                          {
                            //pattern: /^[1-9]\d*$/,
                            pattern: /^\d+$/,
                            message: "Please enter valid number"
                          }
                        ]}>
                        <Input
                          size="large"
                          placeholder="SAP Code"
                          onInput={validationNumber}
                          disabled={disableSapCode} // ✅ Disable input when editing
                        />
                      </Form.Item>
                    </Col>
                    <Col className="gutter-row" span={6}>
                      <Form.Item
                        name="quantity_per_box"
                        label="Quantity Per Box"
                        rules={[
                          {
                            pattern: /^\d{1,5}(\.\d+)?$/,
                            message: "The value must be between 1 and 5 digits long."
                          },
                          {
                            pattern: /^\d+$/,
                            message: "Only integer values are allowed."
                          }
                        ]}>
                        <Input size="large" placeholder="Quantity" type="number" min={1} />
                      </Form.Item>
                    </Col>
                    <Col
                      className="gutter-row"
                      xs={{ span: 24 }}
                      sm={{ span: 24 }}
                      md={{ span: 24 }}
                      lg={{ span: 6 }}>
                      <Form.Item
                        name="net_content"
                        label="Net Content"
                        rules={[
                          { required: true, message: "Net content is required" }
                          // {
                          //   pattern: /^(?:[1-9]\d{0,4})$/,
                          //   message: "The value must be a positive integer"
                          // }
                        ]}>
                        <Input size="large" placeholder="Net Content" />
                      </Form.Item>
                    </Col>

                    <Col
                      className="gutter-row"
                      xs={{ span: 24 }}
                      sm={{ span: 24 }}
                      md={{ span: 24 }}
                      lg={{ span: 12 }}>
                      <Form.Item
                        name="barcode"
                        label="Barcode"
                        rules={[
                          {
                            pattern: /^[a-zA-Z0-9]*$/,
                            message: "Barcode must be alphanumeric"
                          },
                          {
                            max: 40,
                            message: "Barcode must be at most 40 characters long"
                          }
                        ]}>
                        <Input type="text" size="large" maxLength={40} placeholder="Barcode" />
                      </Form.Item>
                    </Col>
                    <Col
                      className="gutter-row"
                      xs={{ span: 24 }}
                      sm={{ span: 24 }}
                      md={{ span: 24 }}
                      lg={{ span: 12 }}>
                      <Form.Item
                        name="size_chart_id"
                        label="Size Chart"
                        // rules={[{ required: true, message: "Size Chart is required" }]}
                      >
                        <Select
                          placeholder="Select Size Chart"
                          allowClear
                          size="large"
                          options={sizeChartsList}
                          loading={sizeChartLoading}
                        />
                      </Form.Item>
                    </Col>

                    <Col
                      className="gutter-row"
                      xs={{ span: 24 }}
                      sm={{ span: 24 }}
                      md={{ span: 12 }}
                      lg={{ span: 6 }}>
                      <Form.Item
                        name="status"
                        label="Status"
                        rules={[{ required: true, message: "Status is required" }]}>
                        <Select
                          placeholder="Select Status"
                          size="large"
                          options={[
                            {
                              value: "active",
                              label: "Active"
                            },
                            {
                              value: "inactive",
                              label: "Inactive"
                            },
                            {
                              value: "discontinued",
                              label: "Discontinued"
                            }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <Col
                      className="gutter-row"
                      xs={{ span: 24 }}
                      sm={{ span: 24 }}
                      md={{ span: 12 }}
                      lg={{ span: 6 }}>
                      <Form.Item
                        name="uqc"
                        label={
                          <span>
                            UQC&nbsp;
                            <Tooltip title="Select the correct Unit Quantity Code (e.g., BAG, BOX, PCS)">
                              <InfoCircleOutlined />
                            </Tooltip>
                          </span>
                        }
                        rules={[{ required: false, message: "UQC is required" }]}>
                        <Select
                          placeholder="Select UQC"
                          size="large"
                          options={[
                            { label: "Bags", value: "BAG" },
                            { label: "Bale", value: "BAL" },
                            { label: "Bundles", value: "BDL" },
                            { label: "Buckles", value: "BKL" },
                            { label: "Billions of Units", value: "BOU" },
                            { label: "Box", value: "BOX" },
                            { label: "Bottles", value: "BTL" },
                            { label: "Bunches", value: "BUN" },
                            { label: "Cans", value: "CAN" },
                            { label: "Cubic Meter", value: "CBM" },
                            { label: "Cubic Centimeter", value: "CCM" },
                            { label: "Centimeter", value: "CMS" },
                            { label: "Cartons", value: "CTN" },
                            { label: "Dozen", value: "DOZ" },
                            { label: "Drum", value: "DRM" },
                            { label: "Great Gross", value: "GGR" },
                            { label: "Grams", value: "GMS" },
                            { label: "Gross", value: "GRS" },
                            { label: "Gross Yards", value: "GYD" },
                            { label: "Kilograms", value: "KGS" },
                            { label: "Kiloliter", value: "KLR" },
                            { label: "Kilometer", value: "KME" },
                            { label: "Milliliter", value: "MLT" },
                            { label: "Meters", value: "MTR" },
                            { label: "Numbers", value: "NOS" },
                            { label: "Packs", value: "PAC" },
                            { label: "Pieces", value: "PCS" },
                            { label: "Pairs", value: "PRS" },
                            { label: "Quintal", value: "QTL" },
                            { label: "Rolls", value: "ROL" },
                            { label: "Sets", value: "SET" },
                            { label: "Square Feet", value: "SQF" },
                            { label: "Square Meters", value: "SQM" },
                            { label: "Square Yards", value: "SQY" },
                            { label: "Tablets", value: "TBS" },
                            { label: "Ten Gross", value: "TGM" },
                            { label: "Thousands", value: "THD" },
                            { label: "Tonnes", value: "TON" },
                            { label: "Tubes", value: "TUB" },
                            { label: "US Gallons", value: "UGS" },
                            { label: "Units", value: "UNT" },
                            { label: "Yards", value: "YDS" },
                            { label: "Others", value: "OTH" }
                          ]}
                        />
                      </Form.Item>
                    </Col>

                    <Col
                      className="gutter-row"
                      xs={{ span: 24 }}
                      sm={{ span: 24 }}
                      md={{ span: 24 }}
                      lg={{ span: 24 }}>
                      <Flex justify="space-between" align="center">
                        <Form.Item name="is_trending" label="Is Trending?">
                          <Switch checkedChildren="Yes" unCheckedChildren="No" />
                        </Form.Item>

                        <Form.Item name="show_stock" label="Show Stock">
                          <Switch checkedChildren="Yes" unCheckedChildren="No" />
                        </Form.Item>

                        <Form.Item name="is_returnable" label="Is Returnable?">
                          <Switch checkedChildren="Yes" unCheckedChildren="No" />
                        </Form.Item>

                        <Form.Item name="new_arrival" label="New Arrival">
                          <Switch checkedChildren="Yes" unCheckedChildren="No" />
                        </Form.Item>

                        <Form.Item name="is_warranty" label="In Warranty">
                          <Switch checkedChildren="Yes" unCheckedChildren="No" />
                        </Form.Item>

                        <Form.Item
                          name="is_only_offer_purchasable"
                          label="Is Only Offer Purchasable">
                          <Switch checkedChildren="Yes" unCheckedChildren="No" />
                        </Form.Item>
                        <Form.Item name="is_not_for_sale" label="Not For Sale">
                          <Switch checkedChildren="Yes" unCheckedChildren="No" />
                        </Form.Item>
                        <Form.Item name="hide_pv" label="Hide PV">
                          <Switch checkedChildren="Yes" unCheckedChildren="No" />
                        </Form.Item>
                        <Form.Item name="hide_sp" label="Hide Sp">
                          <Switch checkedChildren="Yes" unCheckedChildren="No" />
                        </Form.Item>
                        <Form.Item name="is_fmcg" label="Is FMCG">
                          <Switch checkedChildren="Yes" unCheckedChildren="No" />
                        </Form.Item>
                      </Flex>
                    </Col>

                    {/* <Col span={24}>
                      <Form.Item
                        name="short_description"
                        label="Short Description"
                        rules={[{ required: true, message: "Short description is required" }]}>
                        <RichEditor
                          name="short_description"
                          placeholder="Enter Short Description Here"
                          description={minDescription}
                          handleDescription={minHandleDescription}
                          image={"image"}
                        />
                      </Form.Item>
                    </Col>*/}
                    <Col span={24}>
                      <Form.Item
                        name="full_description"
                        label="Full Description"
                        rules={[{ required: true, message: "Full description is required" }]}>
                        {/* <RichEditor
                          name="full_description"
                          placeholder="Enter Full Description Here"
                          description={maxDescription}
                          handleDescription={maxHandleDescription}
                          image={"image"}
                        /> */}

                        <Joditor
                          placeholder="Enter Full Description Here"
                          description={maxDescription}
                          handleDescription={maxHandleDescription}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </div>

                <Card className="mb-20">
                  <ProductSections
                    getSectionData={sectionDataHandle}
                    productSectionData={productSectionData}
                    type="basic_detail"
                  />
                </Card>
                <Row gutter={20}>
                  <Col span={12} style={StyleSheet.categoryMappingStye}>
                    <div style={StyleSheet.contentSubStyle}>
                      <Typography.Title level={5}>Category Mapping</Typography.Title>
                      <Form.Item
                        name="category"
                        label="Select Category"
                        rules={[{ required: true, message: "Category is required" }]}>
                        <TreeSelect
                          allowClear
                          showSearch
                          treeDefaultExpandAll
                          className="width_full"
                          value={categoryValue}
                          disabled={!brandId}
                          size="large"
                          treeData={parentCategory}
                          filterTreeNode={filterTreeNode}
                          onChange={(value) => {
                            setCategoryValue(value);
                          }}
                          placeholder="Select Category"
                        />
                      </Form.Item>
                    </div>
                  </Col>

                  <Col span={12} style={StyleSheet.categoryMappingStye}>
                    <div style={StyleSheet.contentSubStyle}>
                      <Typography.Title level={5}>Tags</Typography.Title>
                      <Form.Item name="tags" label="Select Tags">
                        <Select
                          allowClear
                          showSearch
                          mode="multiple"
                          size="large"
                          placeholder="Select Tags"
                          options={tags}
                          filterOption={(input, option) => (option?.label ?? "").includes(input)}
                        />
                      </Form.Item>
                    </div>
                  </Col>

                  <Col span={24}>
                    <div style={StyleSheet.contentSubStyle}>
                      <Typography.Title level={5}>Cart</Typography.Title>
                      <Row gutter={24}>
                        <Col span={12}>
                          <Form.Item
                            name="min_cart_quantity"
                            label="Min Cart Quantity"
                            rules={[
                              { required: true, message: "Min cart quantity is required" },
                              {
                                pattern: /^\d+$/,
                                message: "Only integer values are allowed"
                              },
                              { validator: checkMaxCart }
                            ]}>
                            <Input
                              size="large"
                              type="number"
                              min={0}
                              placeholder="Enter Min Cart Quantity"
                            />
                          </Form.Item>
                        </Col>
                        <Col span={12}>
                          <Form.Item
                            name="max_cart_quantity"
                            label="Max Cart Quantity"
                            rules={[
                              { required: true, message: "Max cart quantity is required" },
                              {
                                pattern: /^\d+$/,
                                message: "Only integer values are allowed"
                              },
                              {
                                pattern: /^[1-9][0-9]?$|^99$/,
                                message: "The value must be between 1 to 99"
                              },
                              { validator: checkMinCart }
                            ]}>
                            <Input
                              size="large"
                              type="number"
                              min={0}
                              placeholder="Enter Max Cart Quantity Name"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                      {/* <Form.Item
                        name="multiple_cart_quantity"
                        label="Multiple Cart Quantity"
                        rules={[{ required: true, message: "Multiple cart quantity is required" }]}>
                        <Switch checkedChildren="Yes" unCheckedChildren="No" />
                      </Form.Item> */}
                    </div>
                  </Col>
                </Row>

                <div style={StyleSheet.contentSubStyle}>
                  <Typography.Title level={5}>Availability</Typography.Title>
                  <Row>
                    <Col span={12}>
                      <Form.Item
                        name="show_on_type"
                        label="Available on"
                        rules={[{ required: true, message: "Available on is required" }]}>
                        <Checkbox.Group onChange={(e) => handleShowOn(e)}>
                          <Checkbox value="web">Web (E-com)</Checkbox>
                          <Checkbox value="app">App (E-com)</Checkbox>
                          <Checkbox value="stores">Stores</Checkbox>
                        </Checkbox.Group>
                      </Form.Item>
                    </Col>

                    {displayStoresFields && (
                      <Col span={12}>
                        <Form.Item
                          name="supported_stores"
                          label={`Supported Stores`}
                          rules={[{ required: true, message: "Supported Stores is required" }]}>
                          <Select
                            placeholder={`Select Stores`}
                            allowClear
                            mode={"multiple"}
                            disabled={false}
                            name="supported_stores"
                            size="large"
                            options={[{ label: "All", value: "all" }, ...supportedStoresOptions]}
                            onChange={handleSupportedStoresChange}
                            filterOption={(input, option) => {
                              return (option?.label.toLowerCase() ?? "").includes(
                                input.toLowerCase()
                              );
                            }}
                          />
                        </Form.Item>
                      </Col>
                    )}
                    {displayUserType && (
                      <Col span={12}>
                        <Form.Item
                          name="user_type"
                          label="User Type"
                          rules={[{ required: true, message: "User Type is required" }]}>
                          <Select
                            allowClear
                            mode="multiple"
                            size="large"
                            placeholder="Select User Type"
                            onSelect={handleSelectChange}
                            onDeselect={handeleDeSelectChange}
                            filterOption={(input, option) =>
                              (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
                            }
                            options={otherUsergroup}
                          />
                          {/* {otherUsergroup.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select> */}
                        </Form.Item>
                      </Col>
                    )}
                  </Row>
                </div>

                <Flex align="start" justify={"flex-end"} style={StyleSheet.submitNavStyle}>
                  <Button style={StyleSheet.backBtnStyle} onClick={handleCancelBtn}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" disabled={isLoading}>
                    Update
                  </Button>
                </Flex>
              </div>
            </Form>
          )
        }
      </>
    );
  };
  /**
   * Media Details Components
   */

  function MediaDetails() {
    const [loading, setLoading] = useState(false);
    const [loadingBanner, setLoadingBanner] = useState(false);
    const [categoryImage, setCategoryImage] = useState();
    // const [bannerImage, setBannerImage] = useState();
    const [fileList, setFileList] = useState([]);

    const [activeVideoPrevUrl, setActiveVideoPrevUrl] = useState(null);
    const [activeImagePrevUrl, setActiveImagePrevUrl] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [productThumbnail, setProductThumbnail] = useState();

    const buttonRef = useRef(null);

    // function to upload drag list for media
    const DraggableUploadListItem = ({ originNode, file }) => {
      const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: file.uid
      });
      const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        cursor: "move"
      };

      return (
        <>
          <div
            ref={setNodeRef}
            style={style}
            // prevent preview event when drag end
            className={isDragging ? "is-dragging" : ""}
            {...attributes}
            {...listeners}>
            {/* hide error tooltip when dragging */}
            {file.status === "error" && isDragging ? originNode.props.children : originNode}
          </div>
          <Button
            type="link"
            ref={buttonRef}
            key={file.uid}
            block
            onClick={() => {
              handleFilePreview(file);
            }}>
            {file.mime_type?.includes("video") || file.type?.includes("video") ? (
              <PlayCircleOutlined />
            ) : (
              <FileImageOutlined />
            )}
            Preview
          </Button>
        </>
      );
    };

    /**
     * Function to find type and show loader and upload file accordingly
     * @param {*} info
     * @param {*} type
     * @returns
     */
    const handleChange = async (info, type) => {
      // Varify the size of file
      if (!validateFileSize(info.file)) {
        if (type === "category") {
          form.setFieldValue("product_image", null);
        }
        return false;
      }

      if (info.file && info.fileList.length === 1) {
        const result = await imageCompress(info.fileList[0].originFileObj);
        setProductThumbnail(result);

        // Get this url from response in real world.
        getBase64(info.fileList[0].originFileObj, (url) => {
          if (type === "banner") {
          } else {
            setLoading(false);
            setCategoryImage(url);
          }
        });
      }
    };

    // upload drag list for media tab

    const sensor = useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10
      }
    });
    /**
     * function to drag and drop of images
     * @param {*} param0
     */
    const onDragEnd = ({ active, over }) => {
      if (active.id !== over?.id) {
        setFileList((prev) => {
          const activeIndex = prev.findIndex((i) => i.uid === active.id);
          const overIndex = prev.findIndex((i) => i.uid === over?.id);
          return arrayMove(prev, activeIndex, overIndex);
        });
      }
    };

    // Define a 2MB size limit in bytes
    const MAX_FILE_SIZE = ALLOWED_FILE_SIZE * 1024 * 1024;

    // Function to filter out files exceeding 2MB
    const filterLargeFiles = (fileList, file) => {
      try {
        if (file.size > MAX_FILE_SIZE) {
          // basicDetailForm.setFieldValue("product_gallery", null)

          message.error("Image must smaller than 2MB!");

          return false; // Exclude this file from the list
        } else {
          const filteredList = fileList.filter((file) => {
            if (file.size > MAX_FILE_SIZE) {
              return false; // Exclude this file from the list
            }
            return true; // Keep this file in the list
          });

          return filteredList;
        }
      } catch (error) {}
    };

    // Handle Preview of Files
    const handleFilePreview = (file) => {
      // Make values null by default
      setActiveVideoPrevUrl(null);
      setActiveImagePrevUrl(null);
      // handle preview for existing and new files
      if (file && file.originFileObj instanceof File) {
        let fileObj = file.originFileObj;
        if (fileObj.type == "image/jpeg" || fileObj.type == "image/png") {
          let url = URL.createObjectURL(fileObj);
          setActiveImagePrevUrl(url);
        } else if (fileObj.type == "video/mp4") {
          let url = URL.createObjectURL(fileObj);
          setActiveVideoPrevUrl(url);
        }
      } else if (file && file.thumbUrl) {
        // file uploaded already case
        if (
          (file.origin_type == "remote" && !file.thumbUrl.includes(".mp4")) ||
          file.mime_type == "image/jpeg" ||
          file.mime_type == "image/png"
        ) {
          setActiveImagePrevUrl(file.thumbUrl);
        } else if (
          (file.origin_type == "remote" && file.thumbUrl.includes(".mp4")) ||
          file.mime_type == "video/mp4"
        ) {
          setActiveVideoPrevUrl(file.thumbUrl);
        }
      }

      setIsModalOpen(true);
    };

    const handleCancel = () => {
      setIsModalOpen(false);
    };

    /**
     * function to set file in new list
     * @param {*} param0
     */
    const onChange = ({ fileList: newFileList, file: file }) => {
      const isJpgOrPngOrPdf =
        file.type === "image/jpeg" ||
        file.type === "image/png" ||
        file.type === "video/mp4" ||
        file.origin_type == "remote";
      if (!isJpgOrPngOrPdf) {
        message.error("You can only upload JPG/PNG/MP4 file!");
        return false;
      }
      setLoadingBanner(false);
      const filteredFileList = filterLargeFiles(newFileList, file);
      if (filteredFileList) {
        if (filteredFileList.length === 10 && filteredFileList[9].uid === file.uid) {
          message.error("Only 10 files are allowed");
        }

        if (!filteredFileList.length) {
          basicDetailForm.setFieldValue("product_gallery", null);
        }
        setFileList(filteredFileList);
      }
    };

    /**
     * Update Button UI
     */

    const uploadButton = (
      <button style={StyleSheet.uploadBtnStyle} type="button">
        {loading ? (
          <Skeleton.Image active={loading} />
        ) : (
          <CloudUploadOutlined style={StyleSheet.cloudIconStyle} />
        )}
        {!loading && <div style={StyleSheet.uploadLoadingStyle}>Upload</div>}
      </button>
    );

    /**
     * Update Banner Button UI
     */

    const uploadBannerButton = (
      <button style={StyleSheet.uploadBtnStyle} type="button">
        {loadingBanner ? (
          <Skeleton.Image active={loadingBanner} />
        ) : (
          <CloudUploadOutlined style={StyleSheet.cloudIconStyle} />
        )}
        {!loadingBanner && <div style={StyleSheet.uploadLoadingStyle}>Upload</div>}
      </button>
    );

    // UseQuery hook for fetching data of a single media Details from the API
    const { isLoading: mediaDetailsLoading, refetch: refetchMediaDetails } = useQuery(
      "getSingleMediaDetails",

      // Function to fetch data of a single media Details using apiService.getMediaDetails
      () => apiService.getMediaDetails(params.id),
      {
        // Configuration options
        enabled: true, // Enable the query by default
        onSuccess: (data) => {
          try {
            if (data) {
              const { main_image, main_image_id, gallery_images, gallery_images_values } =
                data?.data || {};

              //for product image
              if (main_image) {
                const { origin_type, file_path } = main_image;
                origin_type &&
                  setCategoryImage(
                    origin_type == "remote" ? file_path : getFullImageUrl(file_path)
                  );

                main_image_id && basicDetailForm.setFieldValue("product_image", main_image_id);
                main_image_id && basicDetailForm.setFieldValue("main_image_id", main_image_id);
              }

              //for product gallery
              if (gallery_images && gallery_images_values) {
                let gallery_ids = [];
                gallery_images.forEach((mainitem) => {
                  const matchingItem = gallery_images_values.find(
                    (item) => mainitem == item.attachment_id
                  );

                  if (matchingItem) {
                    setFileList((prev) => [
                      ...prev,
                      {
                        ...matchingItem,
                        thumbUrl:
                          matchingItem?.origin_type == "remote"
                            ? matchingItem.file_path
                            : getFullImageUrl(matchingItem.file_path)
                      }
                    ]);
                    gallery_ids.push(matchingItem.attachment_id);
                  }
                });

                basicDetailForm.setFieldValue("product_gallery", gallery_ids);
                basicDetailForm.setFieldValue("gallery_ids", gallery_ids);
              }
            }
          } catch (error) {}
        },
        onError: (error) => {
          // Handle errors by displaying a Snackbar notification
          enqueueSnackbar(error.message, snackBarErrorConf);
        }
      }
    );

    /**
     * Function to submit form data
     * @param {*} value
     */

    const onMediaUpdate = (value) => {
      let mediaFormData = new FormData();

      value?.product_image?.file
        ? mediaFormData.append("main_image", value?.product_image?.file)
        : "";
      value?.product_image?.file ? mediaFormData.append("thumbnail_image", productThumbnail) : "";
      if (Array.isArray(value?.product_gallery?.fileList)) {
        value?.product_gallery?.fileList.forEach((item, index) => {
          if (item?.size < MAX_FILE_SIZE) {
            item && !item?.attachment_id
              ? mediaFormData.append(`${"gallery_images"}`, item?.originFileObj)
              : "";
          }
        });
      }

      if (Array.isArray(fileList)) {
        let gallery_ids = [];
        fileList.forEach((item, index) => {
          item && item?.attachment_id ? gallery_ids.push(item?.attachment_id) : "";
        });
        mediaFormData.append("gallery_ids", JSON.stringify(gallery_ids));
      }

      value?.product_image ? mediaFormData.append("main_image_id", value?.product_image) : "";

      let obj = { load: mediaFormData };
      mutate(obj);
    };

    // UseMutation hook for creating a new Brand via API
    const { mutate, isLoading } = useMutation(
      // Mutation function to handle the API call for creating a new Brand
      (data) => apiService.updatedMediaDetails(data.load, params?.id, true),
      {
        // Configuration options for the mutation
        onSuccess: (data) => {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          formChangeListener.current = { ...formChangeListener.current, 2: false };

          setcomponetReRender(!componetReRender); // Invalidate the "getAllRoles" query in the query client to trigger a refetch
          queryClient.invalidateQueries("fetchProductData");
        },
        onError: (error) => {
          // Handle errors by displaying an error Snackbar notification
          enqueueSnackbar(error.message, snackBarErrorConf);
        }
      }
    );

    // Function to remove the uploaded image
    const handleRemove = () => {
      if (categoryImage) {
        // Revoke the object URL to free up memory
        URL.revokeObjectURL(categoryImage);
        setCategoryImage(null); // Clear the image state
        basicDetailForm.setFieldValue("product_image", null);
        // basicDetailForm.setFieldValue("main_image_id", null);
        formChangeListener.current = { ...formChangeListener.current, 2: true };
      }
    };

    return (
      <>
        {mediaDetailsLoading ? (
          <Spin fullscreen />
        ) : (
          <Form name="form_media" form={basicDetailForm} layout="vertical" onFinish={onMediaUpdate}>
            <div style={StyleSheet.mainContainer}>
              <div style={StyleSheet.contentSubStyle}>
                <Typography.Title level={5}>Product Info</Typography.Title>
                <Row gutter={[24, 15]}>
                  <Col className="gutter-row" xs={24} sm={24} md={8} lg={6} xl={4} xxl={4}>
                    <div style={StyleSheet.uploadBoxStyle}>
                      <Form.Item
                        name="product_image"
                        label="Product Image"
                        rules={[{ required: true, message: "Product image is required" }]}
                        extra={
                          <>
                            {`Allowed formats: JPEG,PNG, Max size : ${ALLOWED_FILE_SIZE}MB,
                            Resolution : 1080 x 1080 px`}
                          </>
                        }>
                        <Upload
                          name="product_image"
                          listType="picture-card"
                          className="avatar-uploader"
                          accept={ALLOWED_FILE_TYPES}
                          showUploadList={false}
                          maxCount={1}
                          beforeUpload={() => false}
                          onChange={(e) => handleChange(e, "category")}>
                          {categoryImage ? (
                            <>
                              <img src={categoryImage} alt="category" style={categoryStyle} />
                            </>
                          ) : (
                            uploadButton
                          )}
                        </Upload>
                      </Form.Item>
                      {categoryImage && (
                        <div
                          className="cover_delete"
                          type="text"
                          onClick={handleRemove} // Click handler to remove the image
                        >
                          <DeleteOutlined />
                        </div>
                      )}
                    </div>
                  </Col>
                  <Col
                    className="product_upload_box gutter-row"
                    xs={24}
                    sm={24}
                    md={16}
                    lg={18}
                    xl={20}
                    xxl={20}>
                    <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                      <SortableContext
                        items={fileList.map((i) => i.uid)}
                        strategy={verticalListSortingStrategy}>
                        <div className="product_gallery_cover">
                          <Form.Item
                            name="product_gallery"
                            label="Product Gallery"
                            rules={[{ required: true, message: "Product gallery is required" }]}
                            extra={`Allowed formats : JPEG, PNG, MP4, Max size : ${ALLOWED_FILE_SIZE}MB, Image Resolution : 1080 x 1080 px, Max allowed images : 10`}>
                            <Upload
                              fileList={fileList}
                              name="product_gallery"
                              multiple={true}
                              maxCount={10}
                              onChange={onChange}
                              listType="picture-card"
                              accept={[...ALLOWED_FILE_TYPES, "video/mp4"]}
                              beforeUpload={() => false}
                              itemRender={(originNode, file, fileList) => {
                                return (
                                  <>
                                    <DraggableUploadListItem
                                      originNode={originNode}
                                      file={file}
                                      fileList={fileList}
                                    />
                                  </>
                                );
                              }}>
                              {uploadBannerButton}
                            </Upload>
                          </Form.Item>
                        </div>
                      </SortableContext>
                    </DndContext>
                    <Form.Item name={"main_image_id"} style={{ display: "none" }}>
                      <Input />
                    </Form.Item>
                    <Form.Item name={"gallery_ids"} style={{ display: "none" }}>
                      <Input />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
              <Flex align="start" justify={"flex-end"} style={StyleSheet.submitNavStyle}>
                <Button style={StyleSheet.backBtnStyle} onClick={handleCancelBtn}>
                  Cancel
                </Button>

                <Button type="primary" htmlType="submit" disabled={isLoading}>
                  Update
                </Button>
              </Flex>
            </div>
          </Form>
        )}
        {isModalOpen ? (
          <Modal
            forceRender={true}
            open={true}
            onCancel={handleCancel}
            closable={false}
            header={false}
            footer={false}>
            {activeVideoPrevUrl ? (
              <>
                <video style={StyleSheet.videoPlayerStyle} controls>
                  <source src={activeVideoPrevUrl} type="video/mp4" />
                  Your browser does not support HTML video.
                </video>
              </>
            ) : (
              <></>
            )}
            {activeImagePrevUrl ? (
              <>
                <img style={{ maxWidth: "100%" }} src={activeImagePrevUrl} alt="" />
              </>
            ) : (
              <></>
            )}

            <Button
              type="text"
              icon={<CloseOutlined />}
              style={StyleSheet.modalCloseBtnStyle}
              onClick={handleCancel} // Close the modal on click
            />
          </Modal>
        ) : null}
      </>
    );
  }

  /**
   * Seo Details Components
   */

  function SeoDetails() {
    // UseQuery hook for fetching data of a single Seo Details from the API
    const { isLoading: singleSeoDetailsLoading, refetch: fetchSeodetails } = useQuery(
      "getSingleSeoDetails",

      // Function to fetch data of a single Seo Details using apiService.getSeoDetails
      () => apiService.getSeoDetails(params.id),
      {
        // Configuration options
        enabled: true, // Enable the query by default
        onSuccess: (data) => {
          seoDetailForm.setFieldsValue(data?.data?.seo_details);
        },
        onError: (error) => {
          // Handle errors by displaying a Snackbar notification
          enqueueSnackbar(error.message, snackBarErrorConf);
        }
      }
    );
    /**
     * Function to submit form data
     * @param {*} value
     */

    const onSeoUpdate = (value) => {
      const data = {
        meta_title: value?.meta_title,
        meta_keyword: value?.meta_keyword,
        resource_type: "product",
        meta_desc: value?.meta_desc,
        status: "active"
      };
      let obj = { load: data };
      mutate(obj);
    };

    // UseMutation hook for creating a new Brand via API
    const { mutate, isLoading } = useMutation(
      // Mutation function to handle the API call for creating a new Brand
      (data) => apiService.updatedSeoDetails(data.load, params?.id),
      {
        // Configuration options for the mutation
        onSuccess: (data) => {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          setcomponetReRender(!componetReRender);
          queryClient.invalidateQueries("fetchProductData");
        },
        onError: (error) => {
          // Handle errors by displaying an error Snackbar notification
          enqueueSnackbar(error.message, snackBarErrorConf);
        }
      }
    );

    return (
      <>
        {singleSeoDetailsLoading ? (
          <Spin fullscreen />
        ) : (
          <Form name="form_seo" form={seoDetailForm} layout="vertical" onFinish={onSeoUpdate}>
            <div style={StyleSheet.mainContainer}>
              <div style={StyleSheet.contentSubStyle}>
                <Row gutter={20}>
                  <Col span={24}>
                    <Typography.Title level={5}>Meta Data</Typography.Title>
                    <Row gutter={20}>
                      <Col span={12}>
                        <Form.Item
                          name="meta_title"
                          label="Meta Title"
                          rules={[
                            { required: true, message: "Meta title is required" },
                            {
                              pattern: /^.{2,100}$/,
                              message: "The value must be between 2 and 100 characters long."
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
                          <Input size="large" placeholder="Enter Meta Title" />
                        </Form.Item>
                        <Form.Item
                          name="meta_keyword"
                          label="Meta Keyword"
                          rules={[
                            { required: true, message: "Meta keyword is required" },
                            checkCharcterValidation(2)
                          ]}>
                          <TextArea rows={4} placeholder="Enter Meta Keyword " />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="meta_desc"
                          label="Meta Description"
                          rules={[
                            { required: true, message: "Meta description is required" },
                            {
                              pattern: /^.{2,300}$/,
                              message: "The value must be between 2 and 300 characters long."
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
                          <TextArea rows={4} placeholder="Enter Meta Description" />
                        </Form.Item>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
              <Flex align="start" justify={"flex-end"} style={StyleSheet.submitNavStyle}>
                <Button style={StyleSheet.backBtnStyle} onClick={handleCancelBtn}>
                  Cancel
                </Button>
                <Button type="primary" htmlType="submit" disabled={isLoading}>
                  Update
                </Button>
              </Flex>
            </div>
          </Form>
        )}
      </>
    );
  }

  /**
   * Pricing Details Components
   */

  function PricingDetails() {
    const [gstExempted, setGstExempted] = useState(false);
    const [checked, setChecked] = useState(false);
    const [allstate, setAllState] = useState([]);
    const [showPriceLoader, setShowPriceLoader] = useState(false);
    // UseMutation hook for creating a new Price via API
    const { mutate, isLoading } = useMutation(
      // Mutation function to handle the API call for creating a new Price
      (data) => apiService.updatedPriceDetails(data.load, params?.id),
      {
        // Configuration options for the mutation
        onSuccess: (data) => {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          getAllData();
          queryClient.invalidateQueries("fetchProductData");
        },
        onError: (error) => {
          // Handle errors by displaying an error Snackbar notification
          enqueueSnackbar(error.message, snackBarErrorConf);
        }
      }
    );
    /**
     * Function to submit price
     * @param {*} value
     */
    const onPriceFinish = (value) => {
      try {
        // let tempObj = {}
        // if (value?.is_price_same_in_all_states) {
        //   tempObj = { ...value, state_prices: [] }
        // } else {
        //   tempObj = { ...value }
        // }
        let obj = {
          load: {
            ...value,
            purchase_price: value?.purchase_price ? value?.purchase_price : 0,
            shipping_price: value?.shipping_price || null
          }
        };
        mutate(obj);
      } catch (error) {}
    };

    /**
     * Copy to all value sale price
     */

    const handleSalePrice = (value) => {
      try {
        if (value?.target?.checked) {
          allstate.length > 0 &&
            allstate.map((item, index) => {
              priceDetailForm.setFieldValue(
                ["state_prices", index, `sale_price`],
                priceDetailForm.getFieldValue("sale_price")
              );
              priceDetailForm.setFields([
                { name: ["state_prices", index, `sale_price`], errors: [] }
              ]);
            });
        } else {
          allstate.length > 0 &&
            allstate.map((item) => {
              priceDetailForm.setFieldValue(["state_prices", index, `sale_price`], "");
            });
        }
      } catch (error) {}
    };

    /**
     * Copy to all value pv price
     */

    const handlePVPrice = (value) => {
      try {
        if (value?.target?.checked) {
          allstate.length > 0 &&
            allstate.map((item, index) => {
              priceDetailForm.setFieldValue(
                ["state_prices", index, `purchase_volume`],
                priceDetailForm.getFieldValue("purchase_volume")
              );
              priceDetailForm.setFields([
                { name: ["state_prices", index, `purchase_volume`], errors: [] }
              ]);
            });
        } else {
          allstate.length > 0 &&
            allstate.map((item) => {
              priceDetailForm.setFieldValue(["state_prices", index, `purchase_volume`], "");
            });
        }
      } catch (error) {}
    };

    /**
     * Copy to all value pv price
     */

    const handleShippingPrice = (value) => {
      try {
        if (value?.target?.checked) {
          allstate.length > 0 &&
            allstate.map((item, index) => {
              priceDetailForm.setFieldValue(
                ["state_prices", index, `shipping_price`],
                priceDetailForm.getFieldValue("shipping_price")
              );
              priceDetailForm.setFields([
                { name: ["state_prices", index, `shipping_price`], errors: [] }
              ]);
            });
        } else {
          allstate.length > 0 &&
            allstate.map((item) => {
              priceDetailForm.setFieldValue(["state_prices", index, `shipping_price`], "");
            });
        }
      } catch (error) {}
    };

    // UseQuery hook for fetching data of a all state Details from the API
    const { refetch: fetchStatesList } = useQuery(
      "getAllStateDetails",

      // Function to fetch data of a all state Details using apiService.getSeoDetails
      () => apiService.getAllState(),
      {
        // Configuration options
        enabled: true, // Enable the query by default
        onSuccess: (data) => {
          setAllState(data?.data?.data);
        },
        onError: (error) => {
          // Handle errors by displaying a Snackbar notification
          enqueueSnackbar(error.message, snackBarErrorConf);
        }
      }
    );

    // UseQuery hook for fetching data of a single price Details from the API
    const { refetch: getPriceDetails } = useQuery(
      "getSinglePriceDetails",

      // Function to fetch data of a single price Details using apiService.getPriceDetails
      () => apiService.getPriceDetails(params?.id),
      {
        // Configuration options
        enabled: true, // Enable the query by default
        onSuccess: (data) => {
          if (data?.data) {
            // const filteredData = Object.fromEntries(
            //   Object.entries(data?.data).filter(([key, value]) => value !== 0)
            // );
            const filteredData = data?.data;
            let tempObj = {
              ...filteredData,
              // state_prices: filteredData?.product_prices,
              purchase_price: data?.data?.purchase_price
            };
            delete tempObj.product_prices;
            priceDetailForm.setFieldsValue(tempObj);
            setGstExempted(tempObj?.gst_exempted);
            priceDetailForm.setFieldValue(
              "is_price_same_in_all_states",
              data?.data?.is_price_same_in_all_states
            );
            setChecked(data?.data?.is_price_same_in_all_states);
          }
        },
        onError: (error) => {
          // Handle errors by displaying a Snackbar notification
          enqueueSnackbar(error.message, snackBarErrorConf);
        }
      }
    );

    const getAllData = () => {
      setShowPriceLoader(true);
      Promise.all([fetchStatesList(), getPriceDetails()])
        .then(([stateResult, pricingDetails]) => {
          try {
            let allstate = stateResult?.data?.data?.data || [];
            let tempData = pricingDetails?.data?.data?.product_prices || [];
            // modifying data for correct sequence as per states list
            const tempStatePrices = [];
            if (allstate?.length > 0 && tempData?.length > 0) {
              allstate.forEach((state, index) => {
                tempStatePrices[index] = {
                  state_id: state?.state_id,
                  state_code: state?.state_code_old,
                  state_code_old: state?.state_code_old,
                  state_name: state?.state_name,
                  sale_price: "",
                  purchase_volume: "",
                  shipping_price: ""
                };
                tempData?.forEach((item) => {
                  if (
                    state?.state_code == item?.state_code &&
                    state?.state_code_old == item?.state_code_old
                  ) {
                    tempStatePrices[index] = item;
                  }
                });
              });
              priceDetailForm.setFieldValue("state_prices", tempStatePrices);
            }
          } catch (error) {}
          setShowPriceLoader(false);
        })
        .catch((error) => {
          setShowPriceLoader(false);
          // Handle error if any of the promises fail
        });
    };

    useEffect(() => {
      getAllData();
    }, []);

    /**
     * Columns for table
     */
    const columns = [
      {
        title: "State Code",
        dataIndex: "state_code_old",
        width: "10%",
        key: "state_code_old",
        render: (text) => <>{text}</>
      },
      {
        title: "State Name",
        width: "15%",
        dataIndex: "state_name",
        key: "state_name"
      },
      {
        title: (
          <div>
            <p style={StyleSheet.checkTdstyle}>Sale Price</p>
            <label>
              <Checkbox
                onChange={(e) => {
                  handleSalePrice(e);
                }}
              />
            </label>
            <span style={StyleSheet.labelText}>Copy to all</span>
          </div>
        ),
        dataIndex: "sale_price",
        key: "sale_price",
        width: "25%",
        render: (text, record, index) => (
          <>
            {priceDetailForm.setFieldValue(["state_prices", index, `state_id`], record?.state_id)}{" "}
            <Form.Item
              name={["state_prices", index, `state_id`]}
              className="margin_Remove"
              style={{ display: "none" }}>
              <Input placeholder="state_id" />
            </Form.Item>
            {priceDetailForm.setFieldValue(
              ["state_prices", index, `state_code`],
              record?.state_code_old
            )}{" "}
            <Form.Item
              name={["state_prices", index, `state_code`]}
              className="margin_Remove"
              style={{ display: "none" }}>
              <Input placeholder="state_code" />
            </Form.Item>
            <Form.Item
              name={["state_prices", index, `sale_price`]}
              className="margin_Remove"
              rules={[
                { required: true, message: "Sale Price is required" },
                {
                  pattern: /^.{0,15}$/,
                  message: "The value must be between 0 and 15 digits long."
                },
                { pattern: /^\d+(\.\d+)?$/, message: "Negative value is not allowed" },
                // { validator: salePriceValidation },
                { validator: negativeValueValiation }
              ]}>
              <Input
                type="number"
                placeholder="Sale Price"
                onChange={(e) => handleFloatCheck(e, ["state_prices", index, `sale_price`])}
              />
            </Form.Item>
          </>
        )
      },
      {
        title: (
          <div>
            <p style={StyleSheet.checkTdstyle}>PV Price</p>
            <label>
              <Checkbox
                onChange={(e) => {
                  handlePVPrice(e);
                }}
              />
            </label>
            <span style={StyleSheet.labelText}>Copy to all</span>
          </div>
        ),
        dataIndex: "pv",
        key: "pv",
        width: "25%",
        render: (text, record, index) => (
          <Form.Item
            name={["state_prices", index, `purchase_volume`]}
            className="margin_Remove"
            rules={[
              { required: true, message: "Purchase volume is required" },
              { pattern: /^\d+(\.\d+)?$/, message: "Negative value is not allowed" },
              {
                pattern: /^.{0,8}$/,
                message: "The value must be between 0 and 8 digits long."
              }
              // {
              //   pattern: /^[1-9]\d*(\.\d{1,2})?$/,
              //   message: "Value must be greater than 0 and decimal value is not allowed"
              // }
            ]}>
            <Input type="number" placeholder="Purchase Volume" />
          </Form.Item>
        )
      },
      {
        title: (
          <div>
            <p style={StyleSheet.checkTdstyle}>Shipping Price</p>
            <label>
              <Checkbox
                onChange={(e) => {
                  handleShippingPrice(e);
                }}
              />
            </label>
            <span style={StyleSheet.labelText}>Copy to all</span>
          </div>
        ),
        width: "25%",
        key: "shipping_price",
        dataIndex: "shipping_price",
        render: (text, record, index) => (
          <Form.Item
            name={["state_prices", index, `shipping_price`]}
            className="margin_Remove"
            rules={[
              { required: true, message: "Shipping price is required" },
              {
                pattern: /^.{1,15}$/,
                message: "The value must be between 1 and 15 digits long."
              },
              { pattern: /^\d+(\.\d+)?$/, message: "Negative value is not allowed" }
            ]}>
            <Input
              type="number"
              placeholder="Shipping Price"
              onChange={(e) => handleFloatCheck(e, ["state_prices", index, `shipping_price`])}
            />
          </Form.Item>
        )
      }
    ];

    const handleSwitchChange = (checked) => {
      setChecked(checked);
      priceDetailForm.setFieldValue("is_price_same_in_all_states", checked);
    };

    // Purchase Price Validation
    // const purchasePriceValidation = () => ({
    //   validator(_, value) {
    //     if (value && Number(priceDetailForm.getFieldValue('product_mrp'))) {
    //       if (Number(value) > Number(priceDetailForm.getFieldValue('product_mrp'))) {
    //         return Promise.reject("Purchase price should be lesser than MRP");
    //       } else {
    //         priceDetailForm.setFields([{ name: 'product_mrp', errors: [] }])
    //         return Promise.resolve();
    //       }

    //     } else {
    //       return Promise.resolve();
    //     }
    //   }
    // });

    //MRP Validation
    const mrpValidation = (_, value) => {
      if (value && Number(priceDetailForm.getFieldValue("purchase_price"))) {
        if (Number(value) < Number(priceDetailForm.getFieldValue("purchase_price"))) {
          return Promise.reject("MRP should be greater than purchase price");
        } else {
          priceDetailForm.setFields([{ name: "purchase_price", errors: [] }]);
          return Promise.resolve();
        }
      } else if (value && Number(priceDetailForm.getFieldValue("offer_price"))) {
        if (Number(value) < Number(priceDetailForm.getFieldValue("offer_price"))) {
          return Promise.reject("MRP should be greater than offer price");
        } else {
          priceDetailForm.setFields([{ name: "offer_price", errors: [] }]);
          return Promise.resolve();
        }
      }
      // else if (value && Number(priceDetailForm.getFieldValue("sale_price"))) {
      //   if (Number(value) < Number(priceDetailForm.getFieldValue("sale_price"))) {
      //     return Promise.reject("MRP should be greater than sale price");
      //   } else {
      //     priceDetailForm.setFields([{ name: "sale_price", errors: [] }]);
      //     return Promise.resolve();
      //   }
      // }
      else {
        return Promise.resolve();
      }
    };

    //Sales Price Validation
    const salePriceValidation = (_, value) => {
      if (value && Number(priceDetailForm.getFieldValue("product_mrp"))) {
        if (Number(value) > Number(priceDetailForm.getFieldValue("product_mrp"))) {
          return Promise.reject("Sales price should be lesser than MRP");
        } else {
          priceDetailForm.setFields([{ name: "product_mrp", errors: [] }]);
          return Promise.resolve();
        }
      } else {
        return Promise.resolve();
      }
    };

    const handleGst = (e) => {
      priceDetailForm.setFieldValue("gst_exempted", e.target.checked);
      if (!gstExempted) {
        priceDetailForm.setFieldValue("gst_rate", null);
        priceDetailForm.setFields([{ name: "gst_rate", errors: [] }]);
      }
      setGstExempted(!gstExempted);
    };

    const purchasePriceValidation = (_, value) => {
      if (value && !/^\d+(\.\d{1,3})?$/.test(value)) {
        return Promise.reject("Please enter valid number");
      } else if (value && !/^.{0,15}$/.test(value)) {
        return Promise.reject("The value must be between 1 and 15 digits long.");
      } else {
        return Promise.resolve();
      }
    };

    // handle float value check : only two digits after decimal are allowedssss
    const handleFloatCheck = (e, type) => {
      try {
        const inputValue = e.target.value;
        // regex to check valid number with upto two decimal vvalue
        if (!valueUptoTwoDecimalValueRegex.test(inputValue)) {
          priceDetailForm.setFieldValue(type, Number(inputValue.slice(0, inputValue.length - 1)));
        }
      } catch (error) {}
    };

    return showPriceLoader ? (
      <Spin fullscreen />
    ) : (
      <Form name="form_price" form={priceDetailForm} layout="vertical" onFinish={onPriceFinish}>
        <div style={StyleSheet.mainContainer}>
          <div style={StyleSheet.contentSubStyle}>
            <Row gutter={20}>
              <Col span={24}>
                <Typography.Title level={5}>Tax Details</Typography.Title>
                <Row gutter={20}>
                  <Col span={8}>
                    <Form.Item
                      name="hsn_no"
                      label="HSN No."
                      rules={[
                        { required: true, message: "HSN no. is required" },
                        // {
                        //   pattern: /^\d+$/,
                        //   message: "Only integer values are allowed."
                        // },
                        {
                          min: 8,
                          message: "HSN no must be at least 8 characters long"
                        }
                        // {
                        //   max: 8,
                        //   message: "HSN no must be at least 8 characters long"
                        // }
                        // checkHsnNo
                      ]}>
                      <Input
                        size="large"
                        placeholder="Enter HSN no."
                        type="number"
                        suffix={
                          <Tooltip title="HSN codes must be exactly 8 digits long. If your HSN number is shorter, add leading zeros at the beginning (e.g., 00123456).">
                            <InfoCircleOutlined />
                          </Tooltip>
                        }
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="gst_rate"
                      label="GST %"
                      rules={[!gstExempted && { required: true, message: "GST% is required" }]}>
                      <Select
                        disabled={gstExempted}
                        placeholder="Select Status"
                        size="large"
                        options={GST_VALUES}
                      />
                    </Form.Item>
                  </Col>

                  <Col span={8}>
                    <Form.Item name="gst_exempted" label=" ">
                      <Checkbox checked={gstExempted} onChange={(e) => handleGst(e)}>
                        GST Exempted
                      </Checkbox>
                    </Form.Item>
                  </Col>
                </Row>
                <Typography.Title level={5}>Price Details</Typography.Title>
                <Row gutter={20}>
                  <Col span={8}>
                    <Form.Item
                      name="purchase_price"
                      label="Purchase Price"
                      rules={[{ validator: purchasePriceValidation }]}>
                      <Input
                        type="number"
                        size="large"
                        onChange={(e) => handleFloatCheck(e, "purchase_price")}
                        placeholder="Enter Purchase Price"
                      />
                    </Form.Item>
                    <Form.Item
                      name="sale_price"
                      label="Sale Price"
                      rules={[
                        { required: true, message: "Sale price is required" },
                        {
                          pattern: /^.{0,8}$/,
                          message: "The value must be between 0 and 8 digits long."
                        },
                        // { validator: salePriceValidation },
                        { validator: negativeValueWithZeroAllowValiation }
                      ]}>
                      <Input
                        size="large"
                        type="number"
                        //onChange={(e) => handleFloatCheck(e, "sale_price")}
                        placeholder="Enter Sale Price"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="product_mrp"
                      label="MRP"
                      rules={[
                        { required: true, message: "MRP is required" },
                        {
                          pattern: /^.{0,15}$/,
                          message: "The value must be between 0 and 15 digits long."
                        },
                        { validator: mrpValidation },
                        { validator: negativeValueWithZeroAllowValiation }
                      ]}>
                      <Input
                        size="large"
                        type="number"
                        //onChange={(e) => handleFloatCheck(e, "product_mrp")}
                        placeholder="Enter MRP"
                      />
                    </Form.Item>
                    <Form.Item
                      name="purchase_volume"
                      label="Purchase Volume"
                      rules={[
                        { required: true, message: "Purchase volume is required" },
                        {
                          pattern: /^.{0,8}$/,
                          message: "The value must be between 0 and 8 digits long."
                        },
                        { validator: negativeValueWithZeroAllowValiation }
                        // {
                        //   pattern: /^[1-9]\d*(\.\d{1,2})?$/,
                        //   message: "Value must be greater than 0 and decimal value is not allowed"
                        // }
                      ]}>
                      <Input
                        size="large"
                        onInput={validationFloatNumber}
                        // type="number"
                        min={0}
                        placeholder="Enter Purchase Volume"
                      />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="shipping_price"
                      label="Shipping Price"
                      rules={[
                        // { required: true, message: "Shipping price is required" },
                        {
                          pattern: /^.{1,15}$/,
                          message: "The value must be between 1 and 15 digits long."
                        },
                        {
                          pattern: /^[0-9]\d*$/,
                          message: "Please enter valid number"
                        }
                        // { validator: negativeValueValiation }
                      ]}>
                      <Input size="large" type="number" placeholder="Enter Shipping Price" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item
                      name="is_price_same_in_all_states"
                      label="Do above values are same for all states ?"
                      value={!checked}>
                      <Switch
                        checkedChildren="Yes"
                        onChange={handleSwitchChange}
                        unCheckedChildren="No"
                      />
                    </Form.Item>
                    {!checked ? (
                      <Table columns={columns} dataSource={allstate} pagination={false} />
                    ) : (
                      ""
                    )}
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
          <Flex align="start" justify={"flex-end"} style={StyleSheet.submitNavStyle}>
            <Button style={StyleSheet.backBtnStyle} onClick={handleCancelBtn}>
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={isLoading}>
              Save
            </Button>
          </Flex>
        </div>
      </Form>
    );
  }

  /**
   * Attributes Details Components
   */

  function AttributeDetails() {
    const [parentAttributes, setParentAttributes] = useState([]);
    const [showAttributeLoader, setShowAttributeLoader] = useState(false);
    const [attributeList, SetAttributeList] = useState([]);
    const [selectedAttributeData, setSelectedAttributeData] = useState({});
    const attributeFilterUrl = useRef();
    const [submitAttributes, setSubmitAttributes] = useState("");
    const [editList, setEditList] = useState([]);
    const [editIndex, setEditIndex] = useState([]);
    const [deleteAttributeStatus, setDeleteAttributeStatus] = useState(false);
    // UseQuery hook for fetching data of a single attributes Details from the API
    const { refetch: fetchAttributeDetail, isLoading: singleAttributeLoading } = useQuery(
      "getSingleAttributesDetails",

      // Function to fetch data of a single Seo Details using apiService.getSeoDetails
      () => apiService.getAttributesDetails(params.id),
      {
        // Configuration options
        enabled: false, // Enable the query by default
        onSuccess: (data) => {
          let fetchdata = [];

          data?.data?.attribute_details?.map((item, index) => {
            fetchdata.push({
              attr_id: item?.attr_id,
              attr_name: item?.attribute?.attr_name
            });
            attributeDetailForm.setFieldValue(["attributes", index, `attr_id`], item?.attr_id);
            attributeDetailForm.setFieldValue(
              ["attributes", index, `pp_display`],
              item?.pp_display
            );
            attributeDetailForm.setFieldValue(
              ["attributes", index, `used_for_variation`],
              item?.used_for_variation
            );

            // handleEdit(index, item?.attr_id, true);
            let attr_values_arr = [];
            item?.attr_values.map((item) => attr_values_arr.push(Number(item)));
            attributeDetailForm.setFieldValue(
              ["attributes", index, `attr_values`],
              attr_values_arr
            );
          });
          SetAttributeList(fetchdata);
        },
        onError: (error) => {
          // Handle errors by displaying a Snackbar notification
        }
      }
    );

    /**
     * function to handle add into attribute list
     */
    const handleAdd = () => {
      const checkAttributeValueExist = attributeList?.filter(
        (item) => item?.attr_id === selectedAttributeData?.value
      );
      if (selectedAttributeData?.value === undefined) {
        let details = [
          {
            name: ["attr_name"],
            errors: ["Attributes cannot be empty"]
          }
        ];

        attributeDetailForm.setFields(details);
      } else if (
        selectedAttributeData?.value !== undefined &&
        checkAttributeValueExist.length === 0
      ) {
        const data = {
          attr_id: selectedAttributeData?.value,
          attr_name: selectedAttributeData?.label
        };

        SetAttributeList((prevList) => [...prevList, data]);
        attributeDetailForm.setFieldValue(
          ["attributes", attributeList.length, `attr_id`],
          selectedAttributeData?.value
        );
        attributeDetailForm.setFieldValue(["attributes", attributeList.length, `pp_display`], true);
        attributeDetailForm.setFieldValue(
          ["attributes", attributeList.length, `used_for_variation`],
          false
        );
        attributeDetailForm.setFieldValue(
          ["attributes", attributeList.length, `attr_values`],
          null
        );
        handleEdit(attributeList.length, selectedAttributeData?.value);

        const filterData = {
          attr_id: selectedAttributeData?.value
        };
        // Convert filterData to JSON string
        const convertData = JSON.stringify(filterData);

        // If sort is provided, set the sorting state

        // Construct parameters for the API request
        const paramsList = {
          filterTerm: convertData
        };

        // Construct the complete API URL with parameters
        const attributesValueUrl = `/products/all_attribute_values?${new URLSearchParams(
          paramsList
        ).toString()}`;
        attributeFilterUrl.current = attributesValueUrl;
        fetchAttributeValues();
        // setSubmitAttributes("");
        attributeDetailForm.setFieldValue("attr_name", null);
      } else {
        enqueueSnackbar("Attributes already selected", snackBarErrorConf);
      }
    };

    /**
     * function to handle delete attribute list
     * @param { } index
     */
    const handleDelete = (index) => {
      // Ensure index is within bounds
      if (index >= 0 && index < attributeList.length) {
        // Create a new array excluding the item at the specified index
        const updatedList = attributeList.filter((_, i) => i !== index);
        if (updatedList?.length == 0) {
          setDeleteAttributeStatus(true);
        }
        let updatedFormAttributes = attributeDetailForm
          .getFieldValue("attributes")
          ?.filter((_, i) => i !== index);
        attributeDetailForm.setFieldValue("attributes", [...updatedFormAttributes]);

        SetAttributeList(updatedList);
      }

      setSubmitAttributes("");

      formChangeListener.current = { ...formChangeListener.current, 5: true };
    };

    /**
     * function  to handle submit request
     */

    const handleSubmit = (index) => {
      const attrValues = attributeDetailForm.getFieldValue([`attributes`, index, `attr_values`]);

      // Check if attrValues is empty
      if (!attrValues || attrValues.length === 0) {
        // Set error message in attributeDetailForm
        let details = [
          {
            name: ["attributes", index, "attr_values"],
            errors: ["Attributes is required"]
          }
        ];

        attributeDetailForm.setFields(details);

        return; // Prevent further execution if there's an error
      }
      if (attributeDetailForm.getFieldError([`attributes`, index, `attr_values`]).length === 0) {
        setEditList((prev) => [...prev, index]);
        setSubmitAttributes("");
      }
    };

    /**
     * function to handle edit functionality
     * @param { } index
     */
    const handleEdit = (index, id, fetchValue = false) => {
      try {
        setEditIndex((prev) => [...prev, id]);
        if (editList.includes(index)) {
          setEditList((prev) => prev.filter((item) => item != index));
        } else {
          if (fetchValue) {
            setEditList((prev) => [...prev, index]);
          }
        }
        const filterData = {
          attr_id: id
        };
        // Convert filterData to JSON string
        const convertData = JSON.stringify(filterData);

        // If sort is provided, set the sorting state

        // Construct parameters for the API request
        const paramsList = {
          filterTerm: convertData
        };

        // Construct the complete API URL with parameters
        const attributesValueUrl = fetchValue
          ? `/products/all_attribute_values/0/7000`
          : `/products/all_attribute_values/0/7000?${new URLSearchParams(paramsList).toString()}`;
        attributeFilterUrl.current = attributesValueUrl;

        fetchAttributeValues();
      } catch (error) {}
    };

    /**
     * function to set attribute selected data
     * @param {*} value
     */
    const handleAttribute = (value) => {
      if (value) {
        const data = parentAttributes.filter((item) => item.value === value);
        setSelectedAttributeData(data[0]);
        // setSubmitAttributes("");
      }
    };

    // UseMutation hook for creating a new attributes via API
    const { mutate, isLoading } = useMutation(
      // Mutation function to handle the API call for creating a new attributes
      (data) => apiService.updatedAttributesDetails(data.load, params?.id),
      {
        // Configuration options for the mutation
        onSuccess: (data) => {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          setDeleteAttributeStatus(false);

          formChangeListener.current = { ...formChangeListener.current, 5: false };
          getData();
          // Invalidate the "fetchProductData" query in the query client to trigger a refetch
          queryClient.invalidateQueries("fetchProductData");
        },
        onError: (error) => {
          // Handle errors by displaying an error Snackbar notification
          enqueueSnackbar(error.message, snackBarErrorConf);
        }
      }
    );

    /**
     * function to check index exist in edit list
     * @param { } index
     */
    const checkIndexExist = (index) => {
      return editList.includes(index);
    };
    /**
     * function to handle AttributeSumit
     * @param {*} value
     */
    const AttributeSumit = (value) => {
      if (submitAttributes !== "") {
        let obj = { load: value?.attributes || [] };
        mutate(obj);
      }
    };

    /**
     *  UseQuery hook for fetching data of a All Attributes from the API
     */
    const { refetch: fetchAttributes } = useQuery(
      "getAllAttributes",
      // Function to fetch data of a single Category using apiService.getRequest
      () => apiService.getRequest(`/products/all_attributes/0/2000`),
      {
        // Configuration options
        enabled: false, // Enable the query by default
        onSuccess: (data) => {
          // Set form values based on the fetched data
          setParentAttributes([]);
          data?.data?.data?.map((item) =>
            setParentAttributes((prev) => [
              ...prev,
              { value: item?.attr_id, label: item?.attr_name }
            ])
          );
        },
        onError: (error) => {
          // Handle errors by displaying a Snackbar notification
        }
      }
    );

    /**
     *  UseQuery hook for fetching data of a All Attributes Value from the API
     */
    const { refetch: fetchAttributeValues, isLoading: loadingAllAttributes } = useQuery(
      "getAllAttributesValues",
      // Function to fetch data of a single Attribute Value using apiService.getRequest
      () => apiService.getRequest(attributeFilterUrl.current),
      {
        // Configuration options
        enabled: false, // Enable the query by default
        onSuccess: (data) => {
          // Set form values based on the fetched data
          let valueArr = [];
          data?.data?.data.map((item) =>
            valueArr.push({ id: item?.attr_id, value: item?.attr_val_id, label: item?.attr_value })
          );

          const filteredData =
            attributeList.length > 0 &&
            attributeList?.map((attribute) => {
              const filteredItems =
                valueArr.length > 0 && valueArr.filter((item) => item.id === attribute.attr_id);
              return {
                attr_id: attribute.attr_id,
                attr_name: attribute.attr_name,
                attributelist: filteredItems
              };
            });

          SetAttributeList(filteredData ? filteredData : []);

          setShowAttributeLoader(false);
        },
        onError: (error) => {
          // Handle errors by displaying a Snackbar notification
        }
      }
    );

    const getData = () => {
      Promise.all([fetchAttributes(), fetchAttributeDetail()])
        .then(() => {
          // All promises resolved successfully
          // You can access the results here if needed
          // brandsResult, categoryResult, tagsResult, basicDetailsResult

          setShowAttributeLoader(true);
          const attributesValueUrl = `/products/all_attribute_values/0/7000`;

          attributeFilterUrl.current = attributesValueUrl;
          fetchAttributeValues();
        })
        .catch((error) => {
          // Handle error if any of the promises fail
        });
    };

    useEffect(() => {
      getData();
    }, []);

    return (
      <>
        {showAttributeLoader ? (
          <Spin fullscreen />
        ) : (
          <Form
            name="form_attributes"
            form={attributeDetailForm}
            layout="vertical"
            onFinish={AttributeSumit}>
            <div style={StyleSheet.mainContainer}>
              <div style={StyleSheet.contentSubStyle}>
                <Row gutter={20}>
                  <Col span={24}>
                    <Typography.Title level={5}>Attribute Mapping</Typography.Title>

                    <Row gutter={20}>
                      <Col className="gutter-row" span={24}>
                        <Col className="gutter-row" span={24}>
                          <Row style={StyleSheet.rowAttributesStyle}>
                            <Col className="gutter-row" span={15}>
                              <Form.Item name={"attr_name"} label="Select Attribute">
                                <Select
                                  allowClear
                                  showSearch
                                  size="large"
                                  onChange={(value) => {
                                    handleAttribute(value);
                                  }}
                                  placeholder="Select Attribute"
                                  options={parentAttributes}
                                  filterOption={(input, option) =>
                                    (option?.label.toLowerCase() ?? "").includes(
                                      input.toLowerCase()
                                    )
                                  }
                                />
                              </Form.Item>
                            </Col>
                            <Col className="gutter-row" span={3}>
                              <Button
                                size="large"
                                type="primary"
                                htmlType={"button"}
                                className="wrapButton"
                                style={StyleSheet.attibuteButtonStyle}
                                onClick={handleAdd}
                                disabled={
                                  Object.keys(selectedAttributeData)?.length > 0 ? false : true
                                }>
                                Add Attribute
                              </Button>
                            </Col>
                          </Row>
                        </Col>

                        {attributeList.length > 0 &&
                          attributeList.map((item, index) => (
                            <Col className="gutter-row" span={24} key={index}>
                              <div style={StyleSheet.contentSubStyle}>
                                <div style={StyleSheet.savedStyle}>
                                  <Typography.Title level={5} className="textCapitalize">
                                    {item?.attr_name}
                                  </Typography.Title>

                                  <Flex align="center" justify="center">
                                    <Popconfirm
                                      title="Delete"
                                      icon={
                                        <DeleteOutlined
                                          style={{
                                            color: colorError
                                          }}
                                        />
                                      }
                                      okButtonProps={{ danger: true }}
                                      description="Are you sure to delete this attribute ?"
                                      onConfirm={() => {
                                        handleDelete(index);
                                      }}
                                      // onCancel={() => { }}
                                      okText="Yes"
                                      cancelText="No"
                                      placement="left">
                                      <Button
                                        type="text"
                                        danger
                                        size="large"
                                        icon={<DeleteOutlined />}>
                                        Delete
                                      </Button>
                                    </Popconfirm>
                                  </Flex>
                                </div>

                                <Form.Item
                                  name={["attributes", index, "used_for_variation"]}
                                  label="Do you want to use this attribute in product variants ?">
                                  <Switch
                                    checkedChildren="Yes"
                                    unCheckedChildren="No"
                                    // disabled={checkIndexExist(index)}
                                  />
                                </Form.Item>
                                <Col className="gutter-row" span={24}>
                                  <Form.Item
                                    name={["attributes", index, "attr_values"]}
                                    label="Select Values"
                                    rules={[
                                      { required: true, message: "Attribute values is required" }
                                    ]}>
                                    <Select
                                      allowClear
                                      showSearch
                                      mode="multiple"
                                      // disabled={checkIndexExist(index)}
                                      size="large"
                                      placeholder="Select Values"
                                      options={item?.attributelist}
                                      filterOption={(input, option) =>
                                        (option?.label.toLowerCase() ?? "").includes(
                                          input.toLowerCase()
                                        )
                                      }
                                    />
                                  </Form.Item>
                                  <Form.Item
                                    name={["attributes", index, "attr_id"]}
                                    style={{ display: "none" }}>
                                    <Input />
                                  </Form.Item>
                                  <Form.Item
                                    name={["attributes", index, "pp_display"]}
                                    style={{ display: "none" }}>
                                    <Input />
                                  </Form.Item>
                                </Col>
                                <Col className="gutter-row" span={24}>
                                  <Flex justify="flex-end">
                                    <Flex
                                      align="start"
                                      justify={"space-between"}
                                      style={StyleSheet.submitNavStyle}>
                                      {/* {!checkIndexExist(index) ? (
                                    <Button
                                      type="default"
                                      htmlType="button"
                                      onClick={() => {
                                        handleEdit(index, item.attr_id, true);
                                      }}>
                                      Cancel
                                    </Button>
                                  ) : (
                                    ""
                                  )} */}
                                      {/* {!checkIndexExist(index) ? (
                                    <Button
                                      type="primary"
                                      htmlType="submit"
                                      onClick={() => {
                                        handleSubmit(index);
                                      }}>
                                      Save
                                    </Button>
                                  ) : (
                                    ""
                                  )} */}
                                    </Flex>
                                  </Flex>
                                </Col>
                              </div>
                            </Col>
                          ))}
                      </Col>
                    </Row>
                    <Form.Item name="attrDeleteBtnTouched" hidden={true}>
                      <input />
                    </Form.Item>
                  </Col>
                </Row>
              </div>
              {(attributeList.length > 0 || deleteAttributeStatus) && (
                <Flex align="start" justify={"flex-end"} style={StyleSheet.submitNavStyle}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    onClick={() => {
                      setSubmitAttributes("submit");
                    }}
                    disabled={isLoading}>
                    Update
                  </Button>
                </Flex>
              )}
            </div>
          </Form>
        )}
      </>
    );
  }

  /**
   * Variants Details Components
   */
  function VariantsDetails() {
    /**
     * Toggle for Variants
     */
    const [variantList, SetVariantList] = useState([]);
    const [loadingBanner, setLoadingBanner] = useState(false);
    const [toggledFields, setToggledFields] = useState({});
    const [bannerImage, setBannerImage] = useState();
    const [display, setDisplay] = useState(false);
    const [attributeData, SetAttributeData] = useState([]);
    const [usedForVariation, setUsedForVariation] = useState(false);
    const [combinationError, setCombinationError] = useState({});
    const [switchIndexesValue, setSwitchIndexesValue] = useState([]);
    const [varaiantLoader, setVariantLoader] = useState(false);

    const [mainImages, setMainImages] = useState([]);
    const [galleryImages, setGalleryImages] = useState([]);

    /**
     * function to show update details
     * @param {*} index
     */
    const toggleVariant = (index) => {
      setToggledFields((prevState) => ({
        ...prevState,
        [index]: !prevState[index]
      }));
    };

    // Define a 2MB size limit in bytes
    const MAX_FILE_SIZE = 5 * 1024 * 1024;

    // UseQuery hook for fetching data of a attributes Details from the API
    const { refetch: fetchAttributes } = useQuery(
      "getSingleAttributesDetails",

      // Function to fetch data of a single attributes Details using apiService.getAttributesDetails
      () => apiService.getAttributesDetails(params.id),
      {
        // Configuration options
        enabled: false, // Enable the query by default
        onSuccess: (data) => {
          SetAttributeData([]);
          data?.data?.attribute_details?.map((item) => {
            if (item.used_for_variation) {
              setUsedForVariation(true);
              let attribute_Data = []; // Corrected variable name
              item?.attribute_values.map((mainItem) => {
                attribute_Data.push({
                  label: mainItem?.attr_value,
                  value: mainItem?.attr_val_id
                });
              });
              let mainData = [];
              mainData.push({
                attribute: item?.attribute,
                attribute_values: attribute_Data // Corrected variable name
              });

              SetAttributeData((prev) => [...prev, mainData]);
            } else {
              data?.data?.attribute_details.length > 1 ? "" : setUsedForVariation(false);
            }
          });

          fetchVariant();
        },
        onError: (error) => {
          // Handle errors by displaying a Snackbar notification
        }
      }
    );

    // UseQuery hook for fetching data of a variant Details from the API
    const { refetch: fetchVariant } = useQuery(
      "getSingleVariantDetails",
      // Function to fetch data of a single variant Details using apiService.getAttributesDetails
      () => apiService.getVariantDetails(params.id),
      {
        // Configuration options
        enabled: false, // Enable the query by default
        onSuccess: (data) => {
          SetVariantList([]);
          let tempSwitchValues = [];
          let mainImages = [];
          let galleryImages = [];

          let arrToStoreVariants = [];
          data?.data?.map((item, index) => {
            // toggleVariant(index);
            if (item?.main_image?.file_path) {
              mainImages.push(getFile(item?.main_image?.file_path));
            } else {
              mainImages.push(null);
            }
            // Process gallery images correctly
            if (item?.gallery_images_values?.length > 0 && item?.gallery_images) {
              let formattedGalleryImages = item?.gallery_images_values.map((imgItem, imgIndex) => ({
                uid: imgItem?.attachment_id.toString() || `__AUTO__${Date.now()}_${imgIndex}__`, // Unique identifier
                name: imgItem?.file_name, // File name
                url: getFile(imgItem?.file_path), // Convert file path to URL
                thumbUrl: getFile(imgItem?.file_path), // Thumbnail for preview
                status: "done", // Mark as uploaded
                originFileObj: null // No local file object
              }));

              galleryImages.push(formattedGalleryImages);
            } else {
              galleryImages.push([]);
            }

            variantDetailForm.setFieldValue(
              ["attrs", index, "is_price_same_in_all_states"],
              item?.is_price_same_in_all_states
            );

            tempSwitchValues.push(item?.is_price_same_in_all_states);

            variantDetailForm.setFieldValue(["attrs", index, "state_values"], item?.product_prices);

            variantDetailForm.setFieldValue(["attrs", index, "sap_code"], item?.sap_code);
            variantDetailForm.setFieldValue(["attrs", index, "display_order"], item?.display_order);
            variantDetailForm.setFieldValue(["attrs", index, "long_desc"], item?.long_desc || "");
            if (item?.main_image_id) {
              variantDetailForm.setFieldValue(
                ["attrs", index, "main_image_id"],
                item?.main_image_id
              );
            }
            variantDetailForm.setFieldValue(["attrs", index, "gallery_images"], null);
            variantDetailForm.setFieldValue(["attrs", index, "product_gallery"], null);
            if (item?.gallery_images) {
              variantDetailForm.setFieldValue(
                ["attrs", index, "gallery_images_body"],
                JSON.stringify(item?.gallery_images)
              );
            } else {
              variantDetailForm.setFieldValue(
                ["attrs", index, "gallery_images_body"],
                item?.gallery_images
              );
            }

            let selectedVariant = [];
            let variantArr = [];
            item?.product_variant_attributes.map((mainItem, mainIndex) => {
              variantDetailForm.setFieldValue(
                ["attrs", index, "variants_attrs", mainIndex, "attr_id"],
                mainItem?.attr_id
              );
              variantDetailForm.setFieldValue(
                ["attrs", index, "variants_attrs", mainIndex, "attr_value"],
                mainItem?.attr_val_id
              );
              variantDetailForm.setFieldValue(
                ["attrs", index, "variants_attrs", mainIndex, "product_variant_attr_id"],
                mainItem?.product_variant_attr_id
              );

              selectedVariant.push({
                attr_id: mainItem?.attr_id,
                attr_value: mainItem?.attr_val_id
              });
              variantArr.push({
                attr_id: mainItem?.attr_id,
                attr_value: mainItem?.attr_val_id
              });

              setDisplay(true);
            });
            arrToStoreVariants.push(variantArr);
            variantArr = [];

            SetVariantList((prev) => [
              ...prev,
              { id: index, mainid: item?.product_id, variant: selectedVariant }
            ]);
          });

          // console.log("arrToStoreVariants", arrToStoreVariants);

          setCombinationError({});

          setSwitchIndexesValue(tempSwitchValues);
          setMainImages(mainImages);

          setGalleryImages(galleryImages);
        },
        onError: (error) => {
          // Handle errors by displaying a Snackbar notification
        }
      }
    );

    const getVariantsData = () => {
      setVariantLoader(true);
      setToggledFields({});
      Promise.all([fetchAttributes()])
        .then(() => {
          setVariantLoader(false);
        })
        .catch((error) => {
          // Handle error if any of the promises fail
        });
    };

    useEffect(() => {
      getVariantsData();
    }, []);

    /**
     * function to submit variant request
     * @param {*} value
     */
    const onVarFinish = (value, index) => {
      let mediaFormData = new FormData();
      try {
        let variantFormData;
        const check = variantDetailForm.getFieldValue(["attrs"]);

        //Reset the fields value of the form before submission and set value of variantFormData
        value?.attrs?.map((values, i) => {
          if (i === index) {
            variantFormData = values;
          } else if (!values.variant_id && i !== index) {
            variantDetailForm.setFieldValue(["attrs", i], null);
          }
        });

        if (variantFormData.variants_attrs) {
          variantFormData.variants_attrs = JSON.stringify(variantFormData.variants_attrs);
        }
        if (variantFormData.is_price_same_in_all_states === undefined) {
          variantFormData.is_price_same_in_all_states = true;
        }
        if (!variantFormData.display_order) {
          delete variantFormData.display_order;
        }
        if (!variantFormData.main_image_id) {
          delete variantFormData.main_image_id;
        }
        if (!variantFormData.long_desc) {
          delete variantFormData.long_desc;
        }
        if (!variantFormData.gallery_images_body) {
          delete variantFormData.gallery_images_body;
        }

        if (Array.isArray(variantFormData?.product_gallery?.fileList)) {
          delete variantFormData.main_image_id;
          variantFormData?.product_gallery?.fileList.forEach((item, index) => {
            if (item?.size < MAX_FILE_SIZE) {
              const compressedFile = item?.originFileObj;

              item && !item?.attachment_id
                ? mediaFormData.append(`${"product_gallery"}`, compressedFile)
                : "";
            }
          });
        }

        if (Array.isArray(variantFormData?.gallery_images?.fileList)) {
          variantFormData?.gallery_images?.fileList.forEach((item, index) => {
            if (item?.size < MAX_FILE_SIZE) {
              const compressedFile = item?.originFileObj;
              // const compressedFile = await imageCompress(item?.originFileObj);
              item && !item?.attachment_id
                ? mediaFormData.append(`${"gallery_images"}`, compressedFile)
                : "";
            }
          });
        }
        if (variantFormData?.sap_code && variantFormData?.is_price_same_in_all_states === true) {
          variantFormData.state_values = [];
        }

        // Append variant details to FormData
        Object.keys(variantFormData).forEach((key) => {
          if (key === "state_values") {
            mediaFormData.append("state_values", JSON.stringify(variantFormData[key]));
          } else if (key !== "gallery_images" && key !== "product_gallery") {
            mediaFormData.append(key, variantFormData[key]);
          }
        });

        let data = {
          load: mediaFormData,
          index: index
        };

        // Log FormData contents

        mutate(data, index);
      } catch (error) {
        console.log(error);
      }
    };

    // UseMutation hook for creating a new variant via API
    const { mutate, isLoading } = useMutation(
      // Mutation function to handle the API call for creating a new variant
      (data) => apiService.updatedVariantDetails(data.load, params?.id),
      {
        // Configuration options for the mutation
        onSuccess: (data) => {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          getVariantsData();

          formChangeListener.current = { ...formChangeListener.current, 6: false };
          // Invalidate the "fetchProductData" query in the query client to trigger a refetch
          queryClient.invalidateQueries("fetchProductData");
        },
        onError: (error) => {
          // Handle errors by displaying an error Snackbar notification
        }
      }
    );
    /**
     * Function to find type and show loader and upload file accordingly
     * @param {*} info
     * @param {*} type
     * @returns
     */
    const handleChange = (info, type) => {
      // Varify the size of file
      if (!validateFileSize(info.file)) {
        return false;
      }

      if (info.file && info.fileList.length === 1) {
        // Get this url from response in real world.
        getBase64(info.fileList[0].originFileObj, (url) => {
          if (type === "banner") {
            setLoadingBanner(false);
            setBannerImage(url);
          }
        });
      }
    };

    // UseMutation hook for delete a variant via API
    const { mutate: deleteVariant, isLoading: deleteVariantLoading } = useMutation(
      (data) => apiService.deleteVariantDetails(data.variantId),
      {
        onSuccess: (data, variables) => {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);
          const allAttributes = variantDetailForm.getFieldValue(["attrs"]);

          if (allAttributes?.length > 0) {
            const filteredAttrs = allAttributes?.filter((_, i) => i !== variables.index);
            variantDetailForm.setFieldValue(["attrs"], filteredAttrs);
          }

          getVariantsData();
        },
        onError: (err) => {
          console.error(err);
        }
      }
    );

    /**
     * function to handle deleting variant
     * @param {*} index
     */
    const handleDelete = (currentIndex, mainIndex) => {
      try {
        const variantId = variantDetailForm.getFieldValue(["attrs", currentIndex, "variant_id"]);

        if (variantId) {
          // If variant has an ID, delete from backend
          deleteVariant({ variantId, index: currentIndex });
        } else {
          // If variant has NO ID, remove it locally
          let tempList = [...variantList];
          let tempSwitchList = [...switchIndexesValue];

          if (currentIndex >= 0 && currentIndex < variantList.length) {
            let updatedFormData = { ...variantDetailForm.getFieldsValue() };

            // Remove the selected variant from `attrs`
            updatedFormData.attrs = updatedFormData.attrs.filter(
              (_, index) => index !== currentIndex
            );

            // Update form values with the modified data
            variantDetailForm.setFieldsValue(updatedFormData);

            // Remove variant from local lists
            tempList.splice(currentIndex, 1);
            tempSwitchList.splice(currentIndex, 1);

            setSwitchIndexesValue(tempSwitchList);
            SetVariantList(tempList);

            // ✅ Preserve existing errors while removing only the deleted variant's error
            setCombinationError((prevErrors) => {
              const newErrors = { ...prevErrors };
              if (newErrors[currentIndex]) {
                delete newErrors[currentIndex]; // Remove only the error related to the deleted variant
              }

              return newErrors;
            });

            // ✅ Revalidate remaining variants to ensure no conflicts arise after deletion
            tempList.forEach((variant, index) => {
              const excludedVariants = tempList.filter((_, i) => i !== index);
              const selectedVariant = variantDetailForm.getFieldValue([
                "attrs",
                index,
                "variants_attrs"
              ]);

              const checkValueExist = validateSelectedVariant(selectedVariant, excludedVariants);

              if (checkValueExist) {
                setCombinationError((prevErrors) => ({
                  ...prevErrors,
                  [index]: "One of your combinations already exists"
                }));
              } else {
                setCombinationError((prevErrors) => {
                  const newErrors = { ...prevErrors };
                  delete newErrors[index]; // Remove error if resolved
                  return newErrors;
                });
              }
            });

            formChangeListener.current = { ...formChangeListener.current, 6: true };
          }
        }
      } catch (error) {
        console.log("Error in handleDelete:", error);
      }
    };

    /**
     * Update Banner Button UI
     */

    const uploadBannerButton = (
      <button style={StyleSheet.uploadBtnStyle} type="button">
        {loadingBanner ? (
          <Skeleton.Image active={loadingBanner} />
        ) : (
          <CloudUploadOutlined style={StyleSheet.cloudIconStyle} />
        )}
        {!loadingBanner && <div style={StyleSheet.uploadLoadingStyle}>Upload</div>}
      </button>
    );
    /**
     * Add Variants Manually toggle
     */
    const handleDisplay = () => {
      if (usedForVariation) {
        setDisplay(true);
        let tempChckedArr = [];
        tempChckedArr.push(true);
        setSwitchIndexesValue([...tempChckedArr]);
        handleAdd();
      } else {
        enqueueSnackbar("No attributes exist for product variants", snackBarInfoConf);
      }
    };

    // Function to generate combinations
    const generateCombinations = (data) => {
      // Check if data is empty
      if (!data.length) {
        return [];
      }

      // Recursive helper function to generate combinations
      const generateHelper = (index, prefix, combinations) => {
        // If we've processed all levels of data, add the current prefix to combinations
        if (index === data.length) {
          combinations.push([...prefix]);
          return;
        }

        // Loop through each labelValue for the current data level
        for (const labelValue of data[index][0].attribute_values) {
          // Add the label, value, parent label, and parent value to the prefix
          prefix.push({
            parentLabel: data[index][0]?.attribute?.attr_name,
            parentValue: data[index][0]?.attribute?.attr_id,
            label: labelValue.label,
            value: labelValue.value
          });
          // Recursively call the function for the next level of data
          generateHelper(index + 1, prefix, combinations);
          // Remove the last item from the prefix to backtrack
          prefix.pop();
        }
      };

      // Initialize array to store combinations
      const combinations = [];
      // Start the recursive generation process
      generateHelper(0, [], combinations);

      // Return the generated combinations
      return combinations;
    };

    /**
     * auto generate combination function to create unique combination
     */
    const autoGenerateCombination = async () => {
      try {
        variantDetailForm.setFieldsValue("");
        if (usedForVariation) {
          const data = await generateCombinations(attributeData);
          SetVariantList([]);
          setDisplay(true);
          let tempSwitchStatus = [];
          if (data.length > 0) {
            let mainAutoGenerate = [];
            data.forEach((item, index) => {
              let subMainAutoGenerate = [];
              item.forEach((mainitem, mainindex) => {
                subMainAutoGenerate.push({
                  attr_id: mainitem?.parentValue,
                  attr_value: mainitem?.value
                });
                variantDetailForm.setFieldValue(
                  ["attrs", index, "variants_attrs", mainindex, "attr_id"],
                  mainitem?.parentValue
                );
                variantDetailForm.setFieldValue(
                  ["attrs", index, "variants_attrs", mainindex, "attr_value"],
                  mainitem?.value
                );
              });
              variantDetailForm.setFieldValue(["attrs", index, "sap_code"], "");
              mainAutoGenerate.push({
                id: index,
                variant: subMainAutoGenerate
              });
              tempSwitchStatus.push(true);
            });
            SetVariantList(mainAutoGenerate);
            setSwitchIndexesValue(tempSwitchStatus);
          }
        } else {
          enqueueSnackbar("No attributes exist for product variants", snackBarInfoConf);
        }
      } catch (error) {}
    };
    /**
     * Add Variant list
     */
    const handleAdd = () => {
      if (usedForVariation) {
        const data = {
          id: variantList.length + 1,
          variant: [
            {
              attr_id: null,
              attr_value: null
            },
            {
              attr_id: null,
              attr_value: null
            }
          ]
        };

        let tempArr = [...switchIndexesValue];
        tempArr[variantList.length] = true;

        setSwitchIndexesValue([...tempArr]);
        SetVariantList((prevList) => [...prevList, data]);

        variantDetailForm.setFieldValue(["attrs", variantList.length + 1, "variants_attrs"], "");
        variantDetailForm.setFieldValue(["attrs", variantList.length + 1, "sap_code"], "");
        variantDetailForm.setFieldValue(["attrs", variantList.length + 1, "variant_id"], "");
        variantDetailForm.setFieldValue(
          ["attrs", variantList.length + 1, "is_price_same_in_all_states"],
          true
        );

        attributeData?.length > 0 &&
          attributeData.map((_, mainindex) => {
            variantDetailForm.setFieldValue(
              [`attrs`, variantList.length + 1, `variants_attrs`, mainindex, `attr_value`],
              null
            );
          });
      } else {
        enqueueSnackbar("No attributes exist for product variants", snackBarErrorConf);
      }
    };

    /**
     * function to check handle variant value duplicacy
     * @param {*} value
     * @param {*} index
     * @param {*} mainindex
     * @returns
     */

    const handleAttributeValueChange = (value, index, mainindex) => {
      // Update form field value
      variantDetailForm.setFieldValue(
        ["attrs", index, "variants_attrs", mainindex, "attr_value"],
        value
      );

      // Clone variantList to update state safely
      let updateData = [...variantList];

      // Get attribute ID and value from form
      const attrId = variantDetailForm.getFieldValue([
        "attrs",
        index,
        "variants_attrs",
        mainindex,
        "attr_id"
      ]);
      const attrValue = variantDetailForm.getFieldValue([
        "attrs",
        index,
        "variants_attrs",
        mainindex,
        "attr_value"
      ]);

      // Ensure variant entry exists
      if (!updateData[index].variant[mainindex]) {
        updateData[index].variant.push({ attr_id: attrId, attr_value: attrValue });
      } else {
        updateData[index].variant[mainindex] = { attr_id: attrId, attr_value: attrValue };
      }

      // Update state
      SetVariantList((prev) => {
        const newList = [...prev];
        newList[index] = { ...newList[index], variant: [...updateData[index].variant] };
        return newList;
      });

      // Validate uniqueness of the selected combination
      const excludedVariants = updateData.filter((_, filterIndex) => filterIndex !== index);
      const selectedVariant = variantDetailForm.getFieldValue(["attrs", index, "variants_attrs"]);
      const checkvalueExist = validateSelectedVariant(selectedVariant, excludedVariants);

      // Manage error state and disable save button if combination exists
      if (checkvalueExist) {
        setCombinationError((prevErrors) => ({
          ...prevErrors,
          [index]: "One of your combination already exists"
        }));
      } else {
        setCombinationError((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[index]; // Remove error if resolved
          return newErrors;
        });
      }
    };

    /**
     * function to check the variant are equal or not
     * @param {*} selectedVariant
     * @param {*} variantList
     * @returns
     */
    function checkVariantAreEqual(selectedVariant, variantList) {
      if (selectedVariant.length !== variantList.length) {
        return false;
      }

      for (let i = 0; i < selectedVariant.length; i++) {
        if (
          selectedVariant[i].attr_id !== variantList[i].attr_id ||
          selectedVariant[i].attr_value !== variantList[i].attr_value
        ) {
          return false;
        }
      }

      return true;
    }

    /**
     * function to check for selected variant duplicacy
     * @param {*} selectedVariant
     * @param {*} variantList
     * @returns
     */
    function validateSelectedVariant(selectedVariant, variantList) {
      return variantList.some((variant) =>
        variant.variant
          ? checkVariantAreEqual(selectedVariant, variant.variant)
          : checkVariantAreEqual(selectedVariant, variant)
      );
    }

    useEffect(() => {
      setDisplay(false);
      SetVariantList([]);
      SetAttributeData([]);
    }, []);

    const handleReset = () => {
      try {
        if (confirm(" Would you like to reset ?") == true) {
          setDisplay(false);
          SetVariantList([]);
        }
      } catch (error) {}
    };

    return (
      <>
        {varaiantLoader || deleteVariantLoading ? (
          <Spin fullscreen />
        ) : (
          <Form
            name="form_attributes"
            form={variantDetailForm}
            layout="vertical"
            onFinish={onVarFinish}>
            <>
              <Form.Item name={"variantDeleteBtntouched"} style={{ display: "none" }}>
                <Input />
              </Form.Item>
            </>
            {!display ? (
              <div style={StyleSheet.mainContainer}>
                <div style={StyleSheet.contentSubStyle}>
                  <Typography.Title level={5}>Variants</Typography.Title>
                  <Flex vertical justify="center" align="center" style={{ padding: "20px 0" }}>
                    <PictureOutlined
                      style={{ color: colorPrimary, fontSize: 30, marginBottom: 20 }}
                    />
                    <Typography.Text style={{ marginBottom: 20 }}>
                      There are no product variants yet..
                    </Typography.Text>
                    <Flex gap="middle">
                      {/* <Button type="primary" onClick={autoGenerateCombination}>
                        <ThunderboltOutlined /> Generate Automatically
                      </Button> */}
                      <Button onClick={handleDisplay}>
                        <PlusOutlined />
                        Add Variants Manually
                      </Button>
                    </Flex>
                  </Flex>
                </div>
              </div>
            ) : (
              <div style={StyleSheet.mainContainer}>
                <div style={StyleSheet.contentSubStyle}>
                  <Row gutter={20}>
                    <Col span={24}>
                      <Typography.Title level={5}>Variants</Typography.Title>
                      <Typography.Text style={StyleSheet.subTextStyle}>
                        {variantList.length > 0
                          ? "Select attribute values and create combinations"
                          : "Add attribute values and create combinations"}
                      </Typography.Text>
                      <Row gutter={20}>
                        <Col className="gutter-row" span={24}>
                          {variantList.length > 0 &&
                            variantList.map((item, index) => (
                              <Col className="gutter-row" span={24} key={index}>
                                <CommonVariant
                                  setSwitchIndexesValue={setSwitchIndexesValue}
                                  switchIndexesValue={switchIndexesValue}
                                  toggledFields={toggledFields}
                                  index={index}
                                  item={item}
                                  variantDetailForm={variantDetailForm}
                                  attributeData={attributeData}
                                  handleAttributeValueChange={handleAttributeValueChange}
                                  handleDelete={handleDelete}
                                  uploadBannerButton={uploadBannerButton}
                                  colorError={colorError}
                                  toggleVariant={toggleVariant}
                                  getBase64={getBase64}
                                  onVarFinish={onVarFinish}
                                  mainImages={mainImages}
                                  galleryImages={galleryImages}
                                  combinationError={combinationError}
                                  setGalleryImages={setGalleryImages}
                                  setMainImages={setMainImages}
                                />
                              </Col>
                            ))}
                          {combinationError.message ? (
                            <Typography.Text type="danger" style={StyleSheet.errorStyling}>
                              {combinationError.message}
                            </Typography.Text>
                          ) : (
                            ""
                          )}

                          <Col className="gutter-row" span={24} style={StyleSheet.addVariants}>
                            <Flex justify="center" gap="middle">
                              {variantList?.length > 0 &&
                                !variantList.some((item) => item?.mainid) && (
                                  <Button
                                    size="large"
                                    type="default"
                                    className="wrapButton"
                                    onClick={() => {
                                      handleReset();
                                    }}>
                                    Reset
                                  </Button>
                                )}

                              <Button
                                size="large"
                                type="primary"
                                className="wrapButton"
                                disabled={combinationError.message}
                                onClick={handleAdd}>
                                <PlusOutlined />
                                Add Variants
                              </Button>
                            </Flex>
                          </Col>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </div>
                {/* <Flex align="start" justify={"flex-end"} style={StyleSheet.submitNavStyle}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={combinationError.message || isLoading}
                    loading={isLoading}>
                    Save
                  </Button>
                </Flex> */}
              </div>
            )}
          </Form>
        )}
      </>
    );
  }
  /**
   * Sticky tab
   */
  const renderTabBar = (props, DefaultTabBar) => (
    <StickyBox
      offsetTop={64}
      offsetBottom={20}
      style={{
        zIndex: 1
      }}>
      <DefaultTabBar {...props} style={StyleSheet.StickyStyle} />
    </StickyBox>
  );

  const resetValues = (tabKey) => {
    setActiveKey(tabKey);

    formChangeListener.current = {
      1: false,
      2: false,
      3: false,
      4: false,
      5: false,
      6: false
    };
  };

  const handleTabChange = (tabKey) => {
    try {
      // Array of form objects
      // const forms = [form, basicDetailForm, seoDetailForm, priceDetailForm, attributeDetailForm, variantDetailForm];
      const formTypes = [
        {
          key: "1",
          formName: form
        },
        {
          key: "2",
          formName: basicDetailForm
        },
        {
          key: "3",
          formName: seoDetailForm
        },
        {
          key: "4",
          formName: priceDetailForm
        },
        {
          key: "5",
          formName: attributeDetailForm
        },
        {
          key: "6",
          formName: variantDetailForm
        },
        {
          key: "7",
          formName: productLanguageForm
        }
      ];

      // Check if any form has touched fields
      let touchedForm = false;
      let formErrorStatus = false;

      formTypes?.forEach((item) => {
        if (item.key == activeKey) {
          const getformErrors = item.formName.getFieldsError();
          formErrorStatus = Object.keys(getformErrors).some(
            (field) => getformErrors[field]?.errors?.length > 0
          );
          touchedForm = item.formName?.isFieldsTouched();
        }
      });

      if (touchedForm || formErrorStatus) {
        if (confirm("You may have unsaved changes. Would you still like to proceed ?") == true) {
          formTypes?.forEach((item, index) => {
            item?.formName?.resetFields();
          });
          resetValues(tabKey);
        }
      } else {
        if (formChangeListener.current[activeKey]) {
          if (confirm("You may have unsaved changes. Would you still like to proceed ?") == true) {
            formTypes?.forEach((item, index) => {
              item?.formName?.resetFields();
            });
            resetValues(tabKey);
          }
        } else {
          resetValues(tabKey);
        }
      }
    } catch (error) {}
  };

  return actionsPermissionValidator(window.location.pathname, PermissionAction.EDIT) ? (
    <>
      <div style={StyleSheet.formStyle}>
        <Typography.Title level={4} style={StyleSheet.TitleStyle}>
          Edit Product
        </Typography.Title>

        <Tabs
          onChange={(item) => handleTabChange(item)}
          renderTabBar={renderTabBar}
          style={{
            marginBottom: 0
          }}
          // defaultActiveKey={activeKey}
          activeKey={activeKey}
          destroyInactiveTabPane={true}
          items={[
            {
              label: "Basic Details",
              key: "1",
              children: <BasicDetails />
            },
            {
              label: "Media",
              key: "2",
              children: <MediaDetails />
              // disabled: tabdisabled
            },
            {
              label: "SEO",
              key: "3",
              children: <SeoDetails />
              // disabled: tabdisabled
            },
            {
              label: "Pricing",
              key: "4",
              children: <PricingDetails />
              // disabled: tabdisabled
            },
            {
              label: "Attributes",
              key: "5",
              children: <AttributeDetails />
              // disabled: tabdisabled
            },
            {
              label: "Variants",
              key: "6",
              children: <VariantsDetails />
              // disabled: tabdisabled
            },
            {
              label: "Language",
              key: "7",
              children: <Language productLanguageForm={productLanguageForm} />
              // disabled: tabdisabled
            }
          ]}
        />
      </div>
    </>
  ) : (
    <></>
  );
}
