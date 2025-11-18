/* eslint-disable no-unused-vars */
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import {
  Button,
  Checkbox,
  Col,
  Flex,
  Form,
  Input,
  Popconfirm,
  Row,
  Select,
  Skeleton,
  Switch,
  Table,
  Tabs,
  TreeSelect,
  Typography,
  Upload,
  theme,
  Tag,
  Card,
  Tooltip
} from "antd";

import React, { useEffect, useState } from "react";

import { NavLink, useNavigate } from "react-router-dom";

import { CloudUploadOutlined, InfoCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "react-query";

import {
  DeleteOutlined,
  PictureOutlined,
  ThunderboltOutlined,
  UpOutlined,
  DownOutlined
} from "@ant-design/icons";

import { enqueueSnackbar } from "notistack";
import {
  ALLOWED_FILE_TYPES,
  PermissionAction,
  snackBarErrorConf,
  snackBarSuccessConf,
  RULES_MESSAGES,
  supportedStoresOptions,
  otherUsergroup,
  Price_obj
} from "Helpers/ats.constants";
import { useServices } from "Hooks/ServicesContext";
// import RichEditor from "Components/Shared/richEditor";
import StickyBox from "react-sticky-box";

import { DndContext, PointerSensor, useSensor } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  actionsPermissionValidator,
  check3charcterValidation,
  checkSAPValidation,
  firstlettCapital,
  negativeValueValiation,
  validateFileSize,
  validationNumber
} from "Helpers/ats.helper";
import { Option } from "antd/es/mentions";
import ProductSections from "./ProoductSection/ProductSections";
import Joditor from "Components/Shared/Joditor";

//

// drag upload list for media
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
  );
};

export default function ProductAdd() {
  const navigate = useNavigate();
  const { TextArea } = Input;
  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const queryClient = useQueryClient();
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();

  const [form4] = Form.useForm();
  const [tags, setTags] = useState([]);
  const [tabdisabled, setTabDisabled] = useState(true);
  const [bannerImage, setBannerImage] = useState();

  const [form6] = Form.useForm();
  const [form7] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [loadingBanner, setLoadingBanner] = useState(false);
  const [categoryImage, setCategoryImage] = useState();
  const [brandInfo, setBrandInfo] = useState([]);
  const { Text } = Typography;
  const [display, setDisplay] = useState(false);

  const {
    token: {
      colorBgContainer,
      colorBorder,
      colorBgLayout,
      paddingSM,
      paddingLG,
      colorText,
      colorPrimary,
      colorError
    }
  } = theme.useToken();

  /**
   * Add Variants Manually toggle
   */
  const handleDisplay = () => {
    setDisplay(true);
  };

  // styles
  const StyleSheet = {
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
    contentSubStyles: {
      paddingTop: paddingSM,
      paddingBottom: paddingSM,
      paddingLeft: paddingLG,
      paddingRight: paddingLG,
      background: colorBgContainer,
      border: `1px solid ${colorBorder}`,
      borderRadius: "10px",
      margin: "0 0 20px",
      width: "100%",
      display: "flex"
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

  // Before file upload validation
  const beforeUpload = (file) => {
    const isJpgOrPng =
      file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg";
    if (!isJpgOrPng) {
      enqueueSnackbar("You can only upload JPG/PNG file!", snackBarErrorConf);
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      enqueueSnackbar("Image must smaller than 2MB!", snackBarErrorConf);
    }

    return isJpgOrPng && isLt2M;
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
   * toggle for all states table
   */
  const [checked, setChecked] = useState(false);
  const handleSwitchChange = (checked) => {
    setChecked(checked);
  };

  /**
   * Columns for table
   */
  const columns = [
    {
      title: "State Code",
      dataIndex: "state_code",
      key: "state_code",
      render: (text) => <a>{text}</a>
    },
    {
      title: "State Name",
      dataIndex: "state_name",
      key: "state_name"
    },
    {
      title: (
        <div>
          <p style={StyleSheet.checkTdstyle}>Sale Price</p>
          <label>
            <Checkbox />
          </label>
          <span style={StyleSheet.labelText}>Copy to all</span>
        </div>
      ),
      dataIndex: "sale_price",
      key: "sale_price",
      render: (records) => <Input placeholder="State Name" name={`state${records?.id}`} />
    },
    {
      title: (
        <div>
          <p style={StyleSheet.checkTdstyle}>Offer Price</p>
          <label>
            <Checkbox />
          </label>
          <span style={StyleSheet.labelText}>Copy to all</span>
        </div>
      ),
      dataIndex: "offer_price",
      key: "offer_price",
      render: (records) => <Input placeholder="State Name" name={`state${records?.id}`} />
    },
    {
      title: (
        <div>
          <p style={StyleSheet.checkTdstyle}>PV Price</p>
          <label>
            <Checkbox />
          </label>
          <span style={StyleSheet.labelText}>Copy to all</span>
        </div>
      ),
      dataIndex: "pv",
      key: "pv",
      render: (records) => <Input placeholder="State Name" name={`state${records?.id}`} />
    },
    {
      title: (
        <div>
          <p style={StyleSheet.checkTdstyle}>Shipping Price</p>
          <label>
            <Checkbox />
          </label>
          <span style={StyleSheet.labelText}>Copy to all</span>
        </div>
      ),
      key: "shipping_price",
      dataIndex: "shipping_price",
      render: (records) => <Input placeholder="State Name" name={`state${records?.id}`} />
    }
  ];
  const data = [
    {
      key: "1",
      state_code: "1",
      state_name: "State 1"
    },
    {
      key: "2",
      state_code: "2",
      state_name: "State 2"
    }
  ];

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
   * Function to find type and show loader and upload file accordingly
   * @param {*} info
   * @param {*} type
   * @returns
   */
  const handleChange = (info, type) => {
    if (info.file.status === "uploading") {
      if (type === "banner") {
        setLoadingBanner(true);
      } else {
        setLoading(true);
      }

      return;
    }
    if (info.file.status === "done") {
      // Get this url from response in real world.

      getBase64(info.file.originFileObj, (url) => {
        if (type === "banner") {
          setLoadingBanner(false);
          setBannerImage(url);
        } else {
          setLoading(false);
          setCategoryImage(url);
        }
      });
    }
    if (info.file.status === "error") {
      setLoading(false);
      setLoadingBanner(false);
      return;
    }
  };

  // UseQuery hook for fetching data of a all brand from the API
  useQuery(
    "getAllBrand",

    // Function to fetch data of a all brand using apiService.getRequest
    () => apiService.getRequest(`/products/brands/0/500`),
    {
      // Configuration options
      enabled: true, // Enable the query by default
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

  // const apiUrl = `/products/categories/0/1000`;
  // // UseQuery hook for fetching data of a All Category from the API
  // useQuery(
  //   "getAllCategory",

  //   // Function to fetch data of a single Category using apiService.getRequest
  //   () => apiService.getRequest(apiUrl),
  //   {
  //     // Configuration options
  //     enabled: true, // Enable the query by default
  //     onSuccess: (data) => {
  //       // Set form values based on the fetched data
  //       setParentCategory([]);

  //       // const filteredData = data?.data?.data.filter((item) => item.category_status == "active");

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
  useQuery(
    "getAllTags",

    // Function to fetch data of a single tag using apiService.getRequest
    () => apiService.getRequest(apiTagsUrl),
    {
      // Configuration options
      enabled: true, // Enable the query by default
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

  /**
   * function to filter by label in multi select dropdown
   * @param {} inputValue
   * @param {*} treeNode
   * @returns
   */
  const filterTreeNode = (inputValue, treeNode) => {
    // Check if the input value matches any part of the label of the treeNode
    return treeNode.label.toLowerCase().includes(inputValue.toLowerCase());
  };

  /**
   * Function to submit form data
   * @param {*} value
   */

  const onFinish = (value) => {
    return value;
  };

  /**
   * useEffect function to set breadCrumb data
   */
  useEffect(() => {
    setBreadCrumb({
      title: "Product",
      icon: "products",
      titlePath: Paths.productList,
      subtitle: "Add Product",
      path: Paths.productAdd
    });
  }, []);

  /**
   * Basic Detail Component
   */
  function BasicDetails() {
    // const [shortdescription, setShortDescription] = useState("");
    // const [fulldescription, setFullDescription] = useState("");
    const [categoryValue, setCategoryValue] = useState(undefined);
    const [minDescription, setMinDescription] = useState("");
    const [maxDescription, setMaxDescription] = useState("");

    const [displayStoresFields, setDisplayStoresFields] = useState(false);
    const [displayUserType, setdisplayUserType] = useState(false);
    const [sizeChartsList, setSizeChartsList] = useState([]);
    const [productSectionData, setProductSectionData] = useState([]);
    const [brandId, setBrandId] = useState();
    const [parentCategory, setParentCategory] = useState([]);

    /**
     * Function to submit form data
     * @param {*} value
     */

    const onBasicUpdate = (value) => {
      const data = {
        basic_details: {
          product_name: value?.product_name,
          // short_desc: minDescription,
          long_desc: maxDescription || "",
          display_order: value?.display_order || 1,
          dispatch_by: value?.dispatch_by,
          is_trending: value?.is_trending,
          new_arrival: value?.new_arrival,
          show_stock: value?.show_stock,
          sap_code: value?.sap_code,
          product_status: value?.status,
          uqc: value?.uqc,
          category_id: value?.category,
          tags: value?.tags?.length > 0 ? value?.tags?.toString().split(",") : value?.tags,
          brand_id: value?.select_brand,
          is_returnable: value?.is_returnable,
          quantity_per_box: value?.quantity_per_box ? value?.quantity_per_box : null,
          weight: value?.weight || 0,
          unit: value?.unit,
          barcode: value?.barcode,
          show_on_type: value?.show_on_type,
          supported_stores: value?.supported_stores?.length > 0 ? value?.supported_stores : null,
          size_chart_id: value?.size_chart_id || null,
          net_content: value?.net_content || null,
          product_detail_data: productSectionData,
          user_type: value.user_type,
          is_warranty: value.is_warranty || false,
          is_only_offer_purchasable: value.is_only_offer_purchasable || false,
          is_not_for_sale: value.is_not_for_sale || false,
          hide_pv: value.hide_pv || false,
          hide_sp: value.hide_sp || false,
          is_fmcg: value.is_fmcg || false
        },
        cart_details: {
          min_cart_qty: value?.min_cart_quantity,
          max_cart_qty: value?.max_cart_quantity,
          multiple_cart_qty: value?.multiple_cart_quantity || false
        }
      };

      let obj = { load: data };

      mutate(obj);
    };

    // UseQuery hook for getting all size charts for dropdown
    const { isLoading: sizeChartLoading } = useQuery(
      "getSizeChartList",
      () => apiService.getAllSizeChartList(),
      {
        enabled: true,
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

    // UseMutation hook for creating a new Brand via API
    const { mutate, isLoading } = useMutation(
      // Mutation function to handle the API call for creating a new Brand
      (data) => apiService.createBasicDetails(data.load),
      {
        // Configuration options for the mutation
        onSuccess: (data) => {
          // Display a success Snackbar notification with the API response message
          enqueueSnackbar(data.message, snackBarSuccessConf);

          const newPathname =
            Paths.productEdit + "/" + (data?.data?.basic_details?.product_id || "");
          // window.location.pathname = newPathname;
          navigate(`/${newPathname}`);

          // Invalidate the "getAllRoles" query in the query client to trigger a refetch
          queryClient.invalidateQueries("fetchProductData");
        },
        onError: (error) => {
          // Handle errors by displaying an error Snackbar notification
        }
      }
    );

    /**
     *  Min description validation
     */
    const minHandleDescription = (value) => {
      setMinDescription(value);
      form.setFieldsValue({ short_description: value });
    };

    /**
     *  Max description validation
     */
    const maxHandleDescription = (value) => {
      setMaxDescription(value);
      // form.setFieldValue("full_desc", value)
      form.setFieldsValue({ full_desc: value });
    };

    /**
     * Set Initial value
     */
    useEffect(() => {
      form.setFieldValue("status", "active");
      form.setFieldValue("is_trending", false);
      form.setFieldValue("new_arrival", false);
      form.setFieldValue("is_warranty", false);
      form.setFieldValue("is_only_offer_purchasable", false);
      form.setFieldValue("is_not_for_sale", false);
      form.setFieldValue("show_stock", false);
      form.setFieldValue("multiple_cart_quantity", false);
      form.setFieldValue("display_order", 1);
      form.setFieldValue("is_returnable", false);
      form.setFieldValue("unit", "gm");
      form.setFieldValue("hide_pv", false);
      form.setFieldValue("hide_sp", false);
      form.setFieldValue("is_fmcg", false);
      // form.setFieldValue("net_content", 1);
    }, []);

    const checkMaxCart = ({ getFieldValue }) => ({
      validator(_, val) {
        let value = Number(val);
        let maxVal = parseInt(form.getFieldValue("max_cart_quantity"));

        if (value && maxVal) {
          if (value > maxVal) {
            return Promise.reject("Min cart quantity must be less than max cart quantity");
          } else {
            form.setFields([{ name: "max_cart_quantity", errors: [] }]);
            return Promise.resolve();
          }
        } else {
          return Promise.resolve();
        }
      }
    });

    const checkMinCart = ({ getFieldValue }) => ({
      validator(_, val) {
        let value = Number(val);
        let minVal = parseInt(form.getFieldValue("min_cart_quantity"));
        if (minVal && value) {
          if (value < minVal) {
            return Promise.reject("Max cart quantity must be greater than min cart quantity");
          } else {
            form.setFields([{ name: "min_cart_quantity", errors: [] }]);
            return Promise.resolve();
          }
        } else {
          return Promise.resolve();
        }
      }
    });

    // const handleSelectChange = (value) => {
    //   form.setFieldValue("unit", value);
    // };

    // const selectAfter = (
    //   <Select defaultValue="g" onChange={handleSelectChange} disabled>
    //     <Option value="g">Grams</Option>
    //     {/* <Option value="t">Tonne</Option>
    //     <Option value="q">Quintal</Option>
    //     <Option value="kg">Kilogram</Option>
    //     <Option value="mg">Milligram</Option> */}
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

    // const apiUrl = `/products/categories/0/1000`;
    // // UseQuery hook for fetching data of a All Category from the API
    // useQuery(
    //   "getAllCategory",

    //   // Function to fetch data of a single Category using apiService.getRequest
    //   () => apiService.getRequest(apiUrl),
    //   {
    //     // Configuration options
    //     enabled: true, // Enable the query by default
    //     onSuccess: (data) => {
    //       // Set form values based on the fetched data
    //       setParentCategory([]);

    //       // const filteredData = data?.data?.data.filter((item) => item.category_status == "active");

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
        // Configuration options for the mutation
        onSuccess: (data) => {
          // Set form values based on the fetched data
          setParentCategory([]);
          // const filteredData = data?.data?.data.filter((item) => item.category_status == "active");
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
        <Form name="form_basic" form={form} layout="vertical" onFinish={onBasicUpdate}>
          <div style={StyleSheet.mainContainer}>
            <div style={StyleSheet.contentSubStyle}>
              <Row gutter={(50, 40)}>
                <Col span={12}>
                  <Typography.Title level={5}>Product Info</Typography.Title>
                </Col>
                <Col span={12}>
                  <Flex align="start" justify={"flex-end"} style={StyleSheet.submitNavStyle}>
                    {/* <NavLink to={"/" + Paths.productList}>
                      <Button style={StyleSheet.backBtnStyle}>Cancel</Button>
                    </NavLink> */}
                    <Button type="primary" htmlType="submit" disabled={isLoading}>
                      Save
                    </Button>
                  </Flex>
                </Col>
              </Row>
              <Row gutter={20}>
                <Form.Item
                  name="unit"
                  noStyle // Hide the form item, as we're handling it separately
                  hidden={true}>
                  <Input />
                </Form.Item>
                <Col className="gutter-row" span={12}>
                  <Form.Item
                    name="product_name"
                    label="Product Name"
                    rules={[
                      { required: true, whitespace: true, message: "Product name is required" },
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
                    rules={[{ required: true, whitespace: true, message: "Dispatch is required" }]}>
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
                    {/* <Input size="large" placeholder="Weight" type="number" /> */}
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
                      { required: true, whitespace: true, message: "SAP code is required" },
                      {
                        pattern: /^(?:0|[0-9]{3,12})(?:\.[0-9])?$/,
                        message: "The value must be between 3 and 12 characters long."
                      },

                      {
                        pattern: /^\d+$/,
                        message: "Only integer values are allowed."
                      }
                    ]}>
                    <Input
                      type="number"
                      size="large"
                      placeholder="SAP Code"
                      onInput={validationNumber}
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
                      { required: true, message: "Net Content is required" }
                      // {
                      //   pattern: /^(?:[1-9]\d{0,4})$/,
                      //   message: "The value must be a positive integer between 1 and 99999."
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

                    <Form.Item name="is_only_offer_purchasable" label="Is Only Offer Purchasable">
                      <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>
                    <Form.Item name="is_not_for_sale" label="Not For Sale">
                      <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>
                    <Form.Item name="hide_pv" label={`Hide ${Price_obj.PV}`}>
                      <Switch checkedChildren="Yes" unCheckedChildren="No" />
                    </Form.Item>
                    <Form.Item name="hide_sp" label={`Hide ${Price_obj.SP}`}>
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
                    name="full_desc"
                    label="Full Description"
                    rules={[{ required: true, message: "Full description is required" }]}>
                    {/* <RichEditor
                      name="full_desc"
                      placeholder="Enter Full Description Here"
                      handleDescription={maxHandleDescription}
                      description={maxDescription}
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
                      disabled={!brandId}
                      treeDefaultExpandAll
                      className="width_full"
                      value={categoryValue}
                      size="large"
                      treeData={parentCategory}
                      filterTreeNode={filterTreeNode}
                      onChange={(value, item) => {
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
                      placeholder="Select Tag"
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
                          checkMaxCart,
                          { validator: negativeValueValiation }
                        ]}>
                        <Input
                          size="large"
                          type="number"
                          min={0}
                          step={1}
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
                          checkMinCart,
                          { validator: negativeValueValiation }
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

                  {/* <Form.Item name="multiple_cart_quantity" label="Multiple Cart Quantity">
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
                          return (option?.label.toLowerCase() ?? "").includes(input.toLowerCase());
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
              <NavLink to={"/" + Paths.productList}>
                <Button style={StyleSheet.backBtnStyle}>Cancel</Button>
              </NavLink>
              <Button type="primary" htmlType="submit" disabled={isLoading}>
                Save
              </Button>
            </Flex>
          </div>
        </Form>
      </>
    );
  }

  /**
   * Media Details Components
   */
  function MediaDetails() {
    const [loading, setLoading] = useState(false);
    const [loadingBanner, setLoadingBanner] = useState(false);
    const [categoryImage, setCategoryImage] = useState();
    const [bannerImage, setBannerImage] = useState();
    /**
     * Function to find type and show loader and upload file accordingly
     * @param {*} info
     * @param {*} type
     * @returns
     */
    const handleChange = (info, type) => {
      try {
        if (!validateFileSize(info.file)) {
          return false;
        }

        if (info.file && info.fileList.length === 1) {
          // Get this url from response in real world.
          getBase64(info.fileList[0].originFileObj, (url) => {
            if (type === "banner") {
              setLoadingBanner(false);
              setBannerImage(url);
            } else {
              setLoading(false);
              setCategoryImage(url);
            }
          });
        }
      } catch (error) {}
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
    // upload drag list for media tab
    const [fileList, setFileList] = useState([]);
    const sensor = useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10
      }
    });
    const onDragEnd = ({ active, over }) => {
      if (active.id !== over?.id) {
        setFileList((prev) => {
          const activeIndex = prev.findIndex((i) => i.uid === active.id);
          const overIndex = prev.findIndex((i) => i.uid === over?.id);
          return arrayMove(prev, activeIndex, overIndex);
        });
      }
    };
    const onChange = ({ fileList: newFileList }) => {
      setFileList(newFileList);
    };
    const onFinish = (value) => {
      return value;
    };

    return (
      <Form name="form_media" form={form1} layout="vertical" onFinish={onFinish}>
        <div style={StyleSheet.mainContainer}>
          <div style={StyleSheet.contentSubStyle}>
            <Typography.Title level={5}>Product Info</Typography.Title>
            <Row gutter={[24, 15]}>
              <Col className="gutter-row" span={4}>
                <Form.Item
                  name="product_image"
                  label="Product Image"
                  rules={[{ required: true, message: "Product image is required" }]}
                  extra="Allowed formats: JPEG, PNG (Max size: 2MB)">
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
                      <img src={categoryImage} alt="category" style={categoryStyle} />
                    ) : (
                      uploadButton
                    )}
                  </Upload>
                </Form.Item>
              </Col>
              <Col className="gutter-row" span={20}>
                <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
                  <SortableContext
                    items={fileList.map((i) => i.uid)}
                    strategy={verticalListSortingStrategy}>
                    <div className="product_gallery_cover">
                      <Form.Item
                        name="product_gallery"
                        label="Product Gallery"
                        rules={[{ required: true, message: "Product gallery is required" }]}
                        extra="Allowed formats: JPEG, PNG (Max size: 2MB) (Max allowed images: 10)">
                        <Upload
                          multiple={true}
                          maxCount={10}
                          name="product_gallery"
                          fileList={fileList}
                          onChange={onChange}
                          listType="picture-card"
                          className="avatar-uploader"
                          onPreview={() => {
                            "";
                          }}
                          accept={ALLOWED_FILE_TYPES}
                          beforeUpload={() => false}
                          itemRender={(originNode, file) => (
                            <DraggableUploadListItem originNode={originNode} file={file} />
                          )}>
                          {uploadBannerButton}
                        </Upload>
                      </Form.Item>
                    </div>
                  </SortableContext>
                </DndContext>
              </Col>
            </Row>
          </div>
          <Flex align="start" justify={"flex-end"} style={StyleSheet.submitNavStyle}>
            <NavLink to={"/" + Paths.productList}>
              <Button style={StyleSheet.backBtnStyle}>Cancel</Button>
            </NavLink>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Flex>
        </div>
      </Form>
    );
  }

  /**
   * Seo Details Components
   */

  function SeoDetails() {
    return (
      <Form name="form_seo" form={form2} layout="vertical" onFinish={onFinish}>
        <div style={StyleSheet.mainContainer}>
          <div style={StyleSheet.contentSubStyle}>
            <Row gutter={20}>
              <Col span={24}>
                <Typography.Title level={5}>Meta Data</Typography.Title>
                <Row gutter={20}>
                  <Col span={12}>
                    <Form.Item
                      name="product_name"
                      label="Product Name"
                      rules={[
                        { required: true, whitespace: true, message: "Product name is required" }
                      ]}>
                      <Input size="large" placeholder="Enter Product Name" />
                    </Form.Item>
                    <Form.Item
                      name="short_description"
                      label="Short Description"
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "Short description stock is required"
                        }
                      ]}>
                      <TextArea rows={4} placeholder="Enter Description Here" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name="product_name"
                      label="Product Name"
                      rules={[
                        { required: true, whitespace: true, message: "Product name is required" }
                      ]}>
                      <Input size="large" placeholder="Enter Product Name" />
                    </Form.Item>
                    <Form.Item
                      name="short_description"
                      label="Short Description"
                      rules={[
                        {
                          required: true,
                          whitespace: true,
                          message: "Short description stock is required"
                        }
                      ]}>
                      <TextArea rows={4} placeholder="Enter Category Description Here" />
                    </Form.Item>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
          <Flex align="start" justify={"flex-end"} style={StyleSheet.submitNavStyle}>
            <NavLink to={"/" + Paths.productList}>
              <Button style={StyleSheet.backBtnStyle}>Cancel</Button>
            </NavLink>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Flex>
        </div>
      </Form>
    );
  }

  /**
   * Pricing Details Components
   */

  function PricingDetails() {
    const onPriceFinish = (value) => {
      return value;
    };

    return (
      <Form name="form_price" form={form7} layout="vertical" onFinish={onPriceFinish}>
        <div style={StyleSheet.mainContainer}>
          <div style={StyleSheet.contentSubStyle}>
            <Row gutter={20}>
              <Col span={24}>
                <Typography.Title level={5}>Price</Typography.Title>
                <Row gutter={20}>
                  <Col span={8}>
                    <Form.Item
                      name="HSN_no"
                      label="HSN No."
                      rules={[
                        { required: true, whitespace: true, message: "HSN no. is required" }
                      ]}>
                      <Input size="large" placeholder="Enter HSN no." />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="GST"
                      label="GST %."
                      rules={[{ required: true, whitespace: true, message: "GST is required" }]}>
                      <Input size="large" placeholder="Enter GST %." />
                    </Form.Item>
                  </Col>
                  <Col span={8}></Col>
                </Row>
                <Row gutter={20}>
                  <Col span={8}>
                    <Form.Item name="purchase_price" label="Purchase Price">
                      <Input size="large" placeholder="Enter Purchase Price" />
                    </Form.Item>
                    <Form.Item
                      name="sale_price"
                      label="Sale Price"
                      rules={[
                        { required: true, whitespace: true, message: "Sale price is required" }
                      ]}>
                      <Input size="large" placeholder="Enter Sale Price" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="mrp"
                      label="MRP"
                      rules={[{ required: true, whitespace: true, message: "MRP is required" }]}>
                      <Input size="large" placeholder="Enter MRP" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item
                      name="shipping_price"
                      label="Shipping Price"
                      rules={[
                        { required: true, whitespace: true, message: "Shipping price is required" }
                      ]}>
                      <Input size="large" placeholder="Enter Shipping Price" />
                    </Form.Item>
                    <Form.Item
                      name="pv"
                      label="PV"
                      rules={[{ required: true, whitespace: true, message: "PV is required" }]}>
                      <Input size="large" placeholder="Enter PV" />
                    </Form.Item>
                  </Col>
                  <Col span={24}>
                    <Form.Item name="all_states" label="Do above values are same for all states ?">
                      <Switch
                        checkedChildren="Yes"
                        onChange={handleSwitchChange}
                        unCheckedChildren="No"
                      />
                      {/* <span>{checked ? 'Enabled' : 'Disabled'}</span> */}
                    </Form.Item>

                    {checked ? <Table columns={columns} dataSource={data} /> : ""}
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
          <Flex align="start" justify={"flex-end"} style={StyleSheet.submitNavStyle}>
            <NavLink to={"/" + Paths.productList}>
              <Button style={StyleSheet.backBtnStyle}>Cancel</Button>
            </NavLink>
            <Button type="primary" htmlType="submit">
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
    return (
      <Form name="form_attributes" form={form4} layout="vertical" onFinish={onFinish}>
        <div style={StyleSheet.mainContainer}>
          <div style={StyleSheet.contentSubStyle}>
            <Row gutter={20}>
              <Col span={24}>
                <Typography.Title level={5}>Attribute Mapping</Typography.Title>

                <Row gutter={20}>
                  <Col className="gutter-row" span={24}>
                    <Form.List name="users">
                      {(fields, { add, remove }) => (
                        <>
                          <Col className="gutter-row" span={15}>
                            <Form.Item
                              name="attribute_name"
                              label="Select Attribute"
                              type="text"
                              rules={[
                                {
                                  required: true,
                                  whitespace: true,
                                  message: "Attribute is required"
                                }
                              ]}>
                              <Flex justify="space-between" align="end" gap="middle">
                                <Select
                                  allowClear
                                  showSearch
                                  size="large"
                                  placeholder="Select Attribute"
                                  options={[]}
                                  filterOption={(input, option) =>
                                    (option?.label.toLowerCase() ?? "").includes(
                                      input.toLowerCase()
                                    )
                                  }
                                />

                                <Button
                                  size="large"
                                  type="primary"
                                  className="wrapButton"
                                  onClick={add}>
                                  <PlusOutlined />
                                  Add Attribute
                                </Button>
                              </Flex>
                            </Form.Item>
                          </Col>
                          {fields.map(({ key, name, ...restField }) => (
                            <Col className="gutter-row" span={24} key={key}>
                              <div style={StyleSheet.contentSubStyle}>
                                <Typography.Title level={5}>Size</Typography.Title>
                                <Form.Item
                                  name="all_states"
                                  label="Do you want to use this attribute in product variants ?">
                                  <Switch
                                    defaultChecked
                                    checkedChildren="Yes"
                                    unCheckedChildren="No"
                                  />
                                </Form.Item>
                                <Col className="gutter-row" span={24}>
                                  <Form.Item
                                    name="values_name"
                                    label="Select Values"
                                    type="text"
                                    rules={[
                                      {
                                        required: true,
                                        whitespace: true,
                                        message: "Values is required"
                                      }
                                    ]}>
                                    <Select
                                      allowClear
                                      showSearch
                                      size="large"
                                      placeholder="Select Values"
                                      options={[]}
                                      filterOption={(input, option) =>
                                        (option?.label.toLowerCase() ?? "").includes(
                                          input.toLowerCase()
                                        )
                                      }
                                    />
                                  </Form.Item>
                                </Col>
                                <Col className="gutter-row" span={24}>
                                  <Flex justify="flex-end">
                                    <Flex
                                      align="start"
                                      justify={"space-between"}
                                      style={StyleSheet.submitNavStyle}>
                                      <Button
                                        type="default"
                                        htmlType="submit"
                                        onClick={() => remove(name)}>
                                        Cancel
                                      </Button>
                                      <Button type="primary" htmlType="submit">
                                        Save
                                      </Button>
                                    </Flex>
                                  </Flex>
                                </Col>
                              </div>
                            </Col>
                          ))}
                        </>
                      )}
                    </Form.List>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
          <Flex align="start" justify={"flex-end"} style={StyleSheet.submitNavStyle}>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Flex>
        </div>
      </Form>
    );
  }

  /**
   * Variants Details Components
   */
  function VariantsDetails() {
    /**
     * Toggle for Variants
     */
    const [isToggled, setIsToggled] = useState(false);
    const [toggledFields, setToggledFields] = useState({});
    const [bannerImage, setBannerImage] = useState();

    const toggle = () => {
      setIsToggled((prevState) => !prevState);
    };
    const toggleVariant = (index) => {
      setToggledFields((prevState) => ({
        ...prevState,
        [index]: !prevState[index]
      }));
    };

    const onVarFinish = (value) => {
      return value;
    };

    return (
      <Form name="form_attributes" form={form6} layout="vertical" onFinish={onVarFinish}>
        {!display ? (
          <div style={StyleSheet.mainContainer}>
            <div style={StyleSheet.contentSubStyle}>
              <Typography.Title level={5}>Variants</Typography.Title>
              <Flex vertical justify="center" align="center" style={{ padding: "20px 0" }}>
                <PictureOutlined style={{ color: colorPrimary, fontSize: 30, marginBottom: 20 }} />
                <Text style={{ marginBottom: 20 }}>There are no product variants yet..</Text>
                <Flex gap="middle">
                  <Button type="primary">
                    <ThunderboltOutlined /> Generate Automatically
                  </Button>
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
                  <Text style={StyleSheet.subTextStyle}>
                    Select attribute values and create combinations
                  </Text>
                  <Row gutter={20}>
                    <Col className="gutter-row" span={24}>
                      <Form.List name="users">
                        {(fields, { add, remove }) => (
                          <>
                            <Col span={24}>
                              <div
                                style={
                                  isToggled
                                    ? StyleSheet.variantsBoxOpen
                                    : StyleSheet.variantsBoxClose
                                }>
                                <Row gutter={18}>
                                  <Col span="5">
                                    <Form.Item
                                      name="color"
                                      rules={[
                                        {
                                          required: true,
                                          whitespace: true,
                                          message: "color is required"
                                        }
                                      ]}>
                                      <Select
                                        placeholder="Color"
                                        options={[
                                          { value: "black", label: "Black" },
                                          { value: "red", label: "Red" }
                                        ]}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span="5">
                                    <Form.Item name="size">
                                      <Select
                                        placeholder="Size"
                                        options={[
                                          { value: "normal", label: "Normal" },
                                          { value: "large", label: "Large" }
                                        ]}
                                      />
                                    </Form.Item>
                                  </Col>
                                  <Col span="2"></Col>
                                  <Col span="5">
                                    <Form.Item name="sap_code">
                                      <Input placeholder="Enter SAP Code" />
                                    </Form.Item>
                                  </Col>
                                  <Col span="3">
                                    <Popconfirm
                                      title="Delete"
                                      okButtonProps={{ danger: true }}
                                      icon={
                                        <DeleteOutlined
                                          style={{
                                            color: colorError
                                          }}
                                        />
                                      }
                                      description="Are you sure to delete this?"
                                      okText="Yes"
                                      cancelText="No"
                                      placement="left">
                                      <Button danger block type="text">
                                        <DeleteOutlined /> Delete
                                      </Button>
                                    </Popconfirm>
                                  </Col>
                                  <Col span="4">
                                    <Button onClick={toggle} block type="text">
                                      Update Details {isToggled ? <UpOutlined /> : <DownOutlined />}{" "}
                                    </Button>
                                  </Col>
                                </Row>
                                {isToggled && (
                                  <Row gutter={18}>
                                    <Col span="24">
                                      <Form.Item
                                        name="display_order"
                                        label="Display Order"
                                        rules={[
                                          {
                                            required: true,
                                            message: "Display order is required"
                                          },
                                          {
                                            pattern: /^[1-9]\d*$/,
                                            message: "Please enter valid number"
                                          }
                                        ]}>
                                        <Input placeholder="Enter Display Order" />
                                      </Form.Item>
                                    </Col>
                                    <Col span="24">
                                      <Form.Item
                                        name="full_description"
                                        label="Full Description"
                                        rules={[
                                          {
                                            required: true,
                                            message: "Full description stock is required"
                                          }
                                        ]}>
                                        <TextArea rows={4} placeholder="Enter Description Here" />
                                      </Form.Item>
                                    </Col>
                                    <Col span="24">
                                      <Form.Item>
                                        <Form.Item
                                          name="product_gallery2"
                                          label="Product Gallery"
                                          extra="Allowed formats: JPEG, PNG (Max size: 2MB)">
                                          <Upload
                                            name="banner_logo"
                                            listType="picture-card"
                                            className="avatar-uploader"
                                            showUploadList={false}
                                            action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                                            beforeUpload={beforeUpload}
                                            onChange={(e) => handleChange(e, "banner")}>
                                            {bannerImage ? (
                                              <img
                                                src={bannerImage}
                                                alt="Banner"
                                                style={bannerStyle}
                                              />
                                            ) : (
                                              uploadBannerButton
                                            )}
                                          </Upload>
                                        </Form.Item>
                                      </Form.Item>
                                    </Col>
                                  </Row>
                                )}
                              </div>
                            </Col>
                            {fields.map(({ key, name, ...restField }, index) => (
                              <Col className="gutter-row" span={24} key={key}>
                                <div
                                  style={
                                    toggledFields[index]
                                      ? StyleSheet.variantsBoxOpen
                                      : StyleSheet.variantsBoxClose
                                  }>
                                  <Row gutter={18}>
                                    <Col span="5">
                                      <Form.Item name={`color${index}`}>
                                        <Select
                                          placeholder="Color"
                                          options={[
                                            { value: "black", label: "Black" },
                                            { value: "red", label: "Red" }
                                          ]}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col span="5">
                                      <Form.Item name={`size${index}`}>
                                        <Select
                                          placeholder="size"
                                          options={[
                                            { value: "normal", label: "Normal" },
                                            { value: "large", label: "Large" }
                                          ]}
                                        />
                                      </Form.Item>
                                    </Col>
                                    <Col span="2"></Col>
                                    <Col span="5">
                                      <Form.Item name="sap_code">
                                        <Input placeholder="Enter SAP Code" />
                                      </Form.Item>
                                    </Col>
                                    <Col span="3">
                                      <Button danger block type="text">
                                        <DeleteOutlined /> Delete
                                      </Button>
                                    </Col>
                                    <Col span="4">
                                      <Button
                                        onClick={() => {
                                          toggleVariant(index);
                                        }}
                                        block
                                        type="text">
                                        Update Details{" "}
                                        {toggledFields[index] ? <UpOutlined /> : <DownOutlined />}{" "}
                                      </Button>
                                    </Col>
                                  </Row>
                                  {toggledFields[index] && (
                                    <Row gutter={18}>
                                      <Col span="24">
                                        <Form.Item
                                          name="display_order"
                                          label="Display Order"
                                          rules={[
                                            {
                                              required: true,
                                              whitespace: true,
                                              message: "Display order is required"
                                            },
                                            {
                                              pattern: /^.{0,5}$/,
                                              message: "Value should not exceed 5 characters"
                                            },
                                            {
                                              pattern: /^[1-9]\d*$/,
                                              message: "Please enter valid number"
                                            }
                                          ]}>
                                          <Input placeholder="Enter Display Order" />
                                        </Form.Item>
                                      </Col>
                                      <Col span="24">
                                        <Form.Item
                                          name="full_description"
                                          label="Full Description"
                                          rules={[
                                            {
                                              required: true,
                                              whitespace: true,
                                              message: "Full description stock is required"
                                            }
                                          ]}>
                                          <TextArea rows={4} placeholder="Enter Description Here" />
                                        </Form.Item>
                                      </Col>
                                      <Col span="24">
                                        <Form.Item>
                                          <Form.Item
                                            name="product_gallery3"
                                            label="Product Gallery"
                                            extra="Allowed formats: JPEG, PNG (Max size: 2MB)">
                                            <Upload
                                              name="banner_logo"
                                              listType="picture-card"
                                              multiple={true}
                                              maxCount={10}
                                              className="avatar-uploader"
                                              showUploadList={false}
                                              action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                                              beforeUpload={beforeUpload}
                                              onChange={(e) => handleChange(e, "banner")}>
                                              {bannerImage ? (
                                                <img
                                                  src={bannerImage}
                                                  alt="Banner"
                                                  style={bannerStyle}
                                                />
                                              ) : (
                                                uploadBannerButton
                                              )}
                                            </Upload>
                                          </Form.Item>
                                        </Form.Item>
                                      </Col>
                                    </Row>
                                  )}
                                </div>
                              </Col>
                            ))}

                            <Col className="gutter-row" span={24} style={StyleSheet.addVariants}>
                              <Flex justify="center" gap="middle">
                                <Button
                                  size="large"
                                  type="primary"
                                  className="wrapButton"
                                  onClick={add}>
                                  <PlusOutlined />
                                  Add Variants
                                </Button>
                              </Flex>
                            </Col>
                          </>
                        )}
                      </Form.List>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </div>
            <Flex align="start" justify={"flex-end"} style={StyleSheet.submitNavStyle}>
              <Button type="primary" htmlType="submit">
                Save
              </Button>
            </Flex>
          </div>
        )}
      </Form>
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
      <DefaultTabBar
        {...props}
        style={{
          background: colorBgContainer,
          margin: "0 -24px",
          padding: "0 24px"
        }}
      />
    </StickyBox>
  );

  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.ADD)
      ? ""
      : navigate("/", { state: { from: null }, replace: true });
  });

  return actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) ? (
    <>
      <div style={StyleSheet.formStyle}>
        <Typography.Title level={4} style={StyleSheet.TitleStyle}>
          Add New Product
        </Typography.Title>

        <Tabs
          renderTabBar={renderTabBar}
          style={{
            marginBottom: 0
          }}
          defaultActiveKey="1"
          items={[
            {
              label: "Basic Details",
              key: "1",
              children: <BasicDetails />
            },
            {
              label: "Media",
              key: "2",
              children: <MediaDetails />,
              disabled: tabdisabled
            },
            {
              label: "SEO",
              key: "3",
              children: <SeoDetails />,
              disabled: tabdisabled
            },
            {
              label: "Tax & Pricing",
              key: "4",
              children: <PricingDetails />,
              disabled: tabdisabled
            },
            {
              label: "Attributes",
              key: "5",
              children: <AttributeDetails />,
              disabled: tabdisabled
            },
            {
              label: "Variants",
              key: "6",
              disabled: tabdisabled,
              children: <VariantsDetails />
            }
          ]}
        />
      </div>
    </>
  ) : (
    <></>
  );
}
