/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import {
  Button,
  Carousel,
  Col,
  Divider,
  Flex,
  Form,
  Image,
  Input,
  Popconfirm,
  Row,
  Select,
  Skeleton,
  Space,
  Spin,
  Switch,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
  theme
} from "antd";
import React, { useEffect, useState } from "react";
import { useUserContext } from "Hooks/UserContext";
import { Paths } from "Router/Paths";
import { useNavigate } from "react-router-dom";
import { enqueueSnackbar } from "notistack";
import {
  PermissionAction,
  snackBarSuccessConf,
  RULES_MESSAGES,
  ALLOWED_FILE_TYPES,
  snackBarErrorConf
} from "Helpers/ats.constants";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useServices } from "Hooks/ServicesContext";
import {
  actionsPermissionValidator,
  convertRangeISODateFormat,
  firstlettCapital,
  validateFileSize
} from "Helpers/ats.helper";
import {
  CloudUploadOutlined,
  DeleteOutlined,
  EditOutlined,
  FormOutlined,
  PlusCircleOutlined,
  PlusOutlined,
  PlusSquareOutlined
} from "@ant-design/icons";
import StickyBox from "react-sticky-box";
import KeySoulTestIcon from "Static/img/keysoul_testimonial.svg";
import _ from "lodash";
import BannerModal from "./BannerModal";
import Link from "antd/es/typography/Link";
import { type } from "@testing-library/user-event/dist/type";
import BlogModal from "./BlogModal";
import { render } from "@testing-library/react";
import { getBase64 } from "Helpers/functions";
import TestimonialModal from "./TestimonialModal";
const { Title, Text } = Typography;
const { Search } = Input;

export default function BestSeller({ brandID, platform_type }) {
  const {
    token: { colorText, colorBgContainer, paddingSM, paddingLG, colorBgLayout, colorBorder }
  } = theme.useToken();
  const StyleSheet = {
    backBtnStyle: {
      marginRight: "10px"
    },
    editBannerImgIcon: {
      fontSize: "22px",
      color: "white",
      marginTop: "10px"
    },
    uploadBtnStyle: {
      border: 0,
      background: "none"
    },
    carouselStyle: {
      marginBottom: "10px",
      border: "1px solid",
      borderColor: colorBorder,
      padding: "20px",
      height: "250px"
    },
    cloudIconStyle: {
      fontSize: "1.5rem",
      color: colorText
    },
    uploadLoadingStyle: {
      marginTop: 8,
      color: colorText
    },
    uploadBoxStyle: {
      position: "relative"
    },
    formStyle: {
      margin: "0 -10px",
      paddingTop: 0,
      paddingBottom: paddingSM,
      paddingLeft: paddingLG,
      paddingRight: paddingLG
    },
    TitleStyle: {
      marginTop: 0
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
    mainContainer: {
      paddingTop: "40px",
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
    contentStyle: {
      position: "relative",
      color: "#fff",
      textAlign: "center"
    },
    imgStyle: {
      height: "200px",
      objectFit: "cover",
      marginBottom: "10px",
      width: "100%"
    }
  };

  const { apiService } = useServices();
  const [form] = Form.useForm();

  const [products, setProducts] = useState([]);
  const [bestSellerproducts, setBestSellerProducts] = useState([]);
  const [searchTimer, setSearchTimer] = useState(null); // Timer state for debounce
  const [searchTerm, setSearchTerm] = useState(""); // Track the current search term

  const onFinishBestSeller = (values) => {
    const obj = { ...values, brand_id: brandID, platform_type: platform_type };
    addBestSeller({ obj, id: brandID });
  };

  //API call to add best seller products
  const { mutate: addBestSeller, isLoading: addLinksLoading } = useMutation(
    (data) => apiService.addBestSeller(data.obj, data.id),
    {
      onSuccess: (data) => {
        enqueueSnackbar(data.message, snackBarSuccessConf);
      },
      onError: (error) => {
        console.error("Error adding Links:", error);
      }
    }
  );

  // API call to fetch products
  const { mutate: getAllProducts, isLoading: productsLoading } = useMutation(
    (data) => apiService.getProductsByBrand(data.brand_id, data.searchTerm),
    {
      onSuccess: (data, variables) => {
        if (data.success && data?.data?.length > 0) {
          const products = data?.data?.map((val) => ({
            label: val.product_name,
            value: +val.product_id
          }));
          setProducts([...products, ...bestSellerproducts]);
        }
      },
      onError: (error) => {
        console.error("Error fetching products:", error);
      }
    }
  );

  // API call to fetch best seller products
  const { mutate: getBestSellerProducts, isLoading: bestSellerLoading } = useMutation(
    (data) => apiService.getBestSellerProductsById(data.brand_id, data.searchTerm),
    {
      onSuccess: (data) => {
        if (data.success) {
          if (data?.data?.length > 0) {
            let bestSellersArr = [];
            let productsArr = [];
            for (let i = 0; i < data?.data?.length; i++) {
              const el = data.data[i];
              productsArr.push(+el.product_id);
              bestSellersArr.push({
                label: el.product_name,
                value: +el.product_id
              });
            }

            setBestSellerProducts(bestSellersArr);
            form.setFieldValue("product_ids", productsArr);
          }
        }
      },
      onError: (error) => {
        console.error("Error fetching bestSellerProducts:", error);
      }
    }
  );

  //Function to run when user searches for a product
  const onSearch = (value) => {
    setSearchTerm(value);
  };

  // Reset search term when a value is selected or deselected
  const onChange = (value) => {
    setSearchTerm("");
  };

  //useEffect to run when the componenet mounts
  useEffect(() => {
    // Clear the existing timer
    if (searchTimer) {
      clearTimeout(searchTimer);
    }
    // Set a new timer
    const newTimer = setTimeout(() => {
      getAllProducts({
        brand_id: brandID,
        searchTerm: searchTerm
      });
    }, 500);

    setSearchTimer(newTimer);
    // Cleanup timer on unmount or when searchTerm changes
    return () => clearTimeout(newTimer);
  }, [searchTerm]);

  //useEffect to run when the component unmounts
  useEffect(() => {
    getBestSellerProducts({ brand_id: brandID });
    return () => {
      if (searchTimer) {
        clearTimeout(searchTimer);
      }
    };
  }, []);

  return (
    <Spin spinning={addLinksLoading || bestSellerLoading || productsLoading}>
      <div style={StyleSheet.mainContainer}>
        <div style={StyleSheet.contentSubStyle}>
          <Form name="best_seller" form={form} layout="vertical" onFinish={onFinishBestSeller}>
            <Row gutter={16}>
              {/* Facebook Section */}
              <Col span={24}>
                <Form.Item
                  label="Best Sellers Section"
                  name={"product_ids"}
                  rules={[{ required: true, message: "Best Sellers Section is required" }]}>
                  <Select
                    loading={bestSellerLoading || productsLoading}
                    placeholder="Select Best Selling Products"
                    allowClear
                    size="large"
                    onSearch={onSearch}
                    options={products}
                    onChange={onChange} // Reset search term on value change
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label?.toLowerCase() ?? "").includes(input?.toLowerCase())
                    }
                    mode="multiple"
                  />
                </Form.Item>
              </Col>
            </Row>

            <Flex gap="middle" align="start" vertical>
              <Flex justify={"flex-end"} align={"center"} className="width_full">
                {actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) && (
                  <Button type="primary" htmlType="submit">
                    Save
                  </Button>
                )}
              </Flex>
            </Flex>
          </Form>
        </div>
      </div>
    </Spin>
  );
}
