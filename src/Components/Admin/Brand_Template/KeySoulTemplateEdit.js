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
  ALLOWED_FILE_TYPES
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
import TestimonialModal from "./TestimonialModal";
import Link from "antd/es/typography/Link";
import { type } from "@testing-library/user-event/dist/type";
import BlogModal from "./BlogModal";
import { render } from "@testing-library/react";
import Program from "./Program";
import Blog from "./Blog";
import SocialLink from "./SocialLink";
import BestSeller from "./BestSeller";
import Testimonials from "./Testimonials";
import BasicDetailEdit from "./EditTemplate/BasicDetailEdit";

const { Title, Text } = Typography;
const { Search } = Input;
const getBase64 = (img, callback) => {
  const reader = new FileReader();
  reader.addEventListener("load", () => callback(reader.result));
  reader.readAsDataURL(img);
};
export default function KeySoulTemplateEdit() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { setBreadCrumb } = useUserContext();
  const { apiService } = useServices();
  const [form] = Form.useForm();
  const [socialForm] = Form.useForm();

  const [category, setCategory] = useState([]);

  const [carouselImages, setCarouselImages] = useState([{ imgUrl: null }]);
  const [isTabsEnabled, setIsTabsEnabled] = useState(false); // Tracks if other tabs are enabled
  const [brandID, setBrandId] = useState("");
  const [platformType, setPlatformType] = useState("web");

  const [activeTabKey, setActiveTabKey] = useState("1"); // Default to the first tab
  const {
    token: { colorText, colorBgContainer, paddingSM, paddingLG, colorBgLayout, colorBorder }
  } = theme.useToken();

  /***
   * styles
   */
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

  // // UseQuery hook for fetching data of a All Category from the API
  // const { isLoading: categoryLoading } = useQuery(
  //   "getKeySoulBrandCategory",
  //   // Function to fetch data of a single Category using apiService.getRequest
  //   () => apiService.getCategoryByBrand(),
  //   {
  //     // Configuration options
  //     enabled: true, // Enable the query by default
  //     onSuccess: (data) => {
  //       // Set form values based on the fetched data
  //       setCategory([]);
  //       if (data?.data?.data?.length) {
  //         setBrandId(data?.data?.brand_id);

  //         const updateCategory = data?.data?.data.map(({ category_id, category_name }) => ({
  //           value: category_id,
  //           label: category_name
  //         }));
  //         setCategory(updateCategory);
  //       }
  //     },
  //     onError: (error) => {
  //       // Handle errors by displaying a Snackbar notification
  //       // enqueueSnackbar(error.message, snackBarErrorConf);
  //     }
  //   }
  // );

  /**
   * UseEffect function to set breadcrumb
   */
  useEffect(() => {
    actionsPermissionValidator(window.location.pathname, PermissionAction.VIEW)
      ? ""
      : navigate("/", { state: { from: null }, replace: true });

    form.setFieldValue("status", true);
    setBreadCrumb({
      title: "Brand Template",
      icon: "no",
      titlePath: Paths.brandTemplateList,
      path: Paths.users,
      subtitle: "Edit Brand Template"
    });
  }, []);

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

  // Function to set the active tab
  const handleTabChange = (key) => {
    setActiveTabKey(key); // Update the active tab state
  };

  // Callback function to set the brand ID
  const handleSaveBasicDetails = (brandID, platform_type) => {
    setBrandId(brandID);
    setPlatformType(platform_type);
  };
  return actionsPermissionValidator(window.location.pathname, PermissionAction.ADD) ? (
    <>
      <Spin spinning={false}>
        <div style={StyleSheet.formStyle}>
          <Typography.Title level={4} style={StyleSheet.TitleStyle}>
            Edit Brand Template
          </Typography.Title>

          <Tabs
            renderTabBar={renderTabBar}
            onChange={handleTabChange}
            activeKey={activeTabKey}
            items={[
              {
                label: "Basic Details",
                key: "1",
                children:
                  activeTabKey === "1" ? (
                    <BasicDetailEdit
                      category={category}
                      brandID={brandID}
                      platform_type={platformType}
                      onSave={handleSaveBasicDetails}
                    />
                  ) : null // Render only if active
              },
              {
                label: "Best Sellers Section",
                key: "2",
                children:
                  activeTabKey === "2" ? (
                    <BestSeller brandID={brandID} platform_type={platformType} />
                  ) : null
              },
              {
                label: "Programs",
                key: "3",
                children:
                  activeTabKey === "3" ? (
                    <Program brandID={brandID} platform_type={platformType} />
                  ) : null
              },
              {
                label: "Testimonials",
                key: "4",
                children:
                  activeTabKey === "4" ? (
                    <Testimonials brandID={brandID} platform_type={platformType} />
                  ) : null
              },
              {
                label: "Blogs",
                key: "5",
                children:
                  activeTabKey === "5" ? (
                    <Blog brandID={brandID} platform_type={platformType} />
                  ) : null
              },
              {
                label: "Social Links",
                key: "6",
                children:
                  activeTabKey === "6" ? (
                    <SocialLink brandID={brandID} platform_type={platformType} />
                  ) : null
              }
            ]}
          />
        </div>
      </Spin>
    </>
  ) : (
    <></>
  );
}
