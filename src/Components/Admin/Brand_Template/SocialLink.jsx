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
  linkValidation,
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

export default function SocialLink({ brandID, platform_type }) {
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
  const [socialForm] = Form.useForm();

  //API call to add or update social links of keysoul brand
  const { mutate: addUpdateSocialLinks, isLoading: addLinksLoading } = useMutation(
    (data) => apiService.keySoulCreateOrUpdateSocialLink(data.brandID, data.body),
    {
      onSuccess: (data) => {
        enqueueSnackbar(data.message, snackBarSuccessConf);
      },
      onError: (error) => {
        console.error("Error adding Links:", error);
      }
    }
  );

  // API call to get the Social Links
  const { mutate: getSocialLinks, isLoading: loadingSocialLinks } = useMutation(
    "getSocialLink",
    (data) => apiService.getKeySoulSocialLink(data.id, platform_type),
    {
      onSuccess: (res) => {
        // Dynamically set the fields in the form based on the API response
        const socialLinks = res.data.social_links;

        if (res.success && res.data) {
          socialForm.setFieldsValue({
            ...(socialLinks.facebook && { facebook: socialLinks.facebook }),
            ...(socialLinks.telegram && { telegram: socialLinks.telegram }),
            ...(socialLinks.instagram && { instagram: socialLinks.instagram }),
            ...(socialLinks.youtube && { youtube: socialLinks.youtube }),
            ...(socialLinks.twitter && { twitter: socialLinks.twitter })
          });
        }
      },
      onError: (error) => {
        console.error(error);
      }
    }
  );

  // Function to submit form data for social link
  const onSocialLinkFinish = (values) => {
    try {
      for (let key in values) {
        if (values[key]) {
          continue;
        } else {
          delete values[key];
        }
      }
      const body = { social_links: values, platform_type };
      addUpdateSocialLinks({ brandID, body });
    } catch (error) { }
  };

  //useEffect to run when component mounts
  useEffect(() => {
    getSocialLinks({ id: brandID });
  }, []);

  return (
    <Spin spinning={addLinksLoading || loadingSocialLinks}>
      <div style={StyleSheet.mainContainer}>
        <div style={StyleSheet.contentSubStyle}>
          <br />
          <Form
            name="form_item_path"
            form={socialForm}
            layout="vertical"
            onFinish={onSocialLinkFinish}>
            <Row gutter={16}>
              {/* Facebook Section */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Facebook (optional)"
                  name={"facebook"}
                  rules={[
                    {
                      pattern: /^https?:\/\/[^ "<>#%{}|^~[\]`]+$/,
                      message: "Please enter a valid URL"
                    },
                    {
                      pattern: /^.{1,200}$/,
                      message: "The value must be between 1 and 200 characters long."
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
                  <Input placeholder="Enter URL" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Instagram (optional)"
                  name={"instagram"}
                  rules={[
                    {
                      pattern: /^https?:\/\/[^ "<>#%{}|^~[\]`]+$/,
                      message: "Please enter a valid URL"
                    },
                    {
                      pattern: /^.{1,200}$/,
                      message: "The value must be between 1 and 200 characters long."
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
                  <Input placeholder="Enter URL" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              {/* YouTube Section */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Youtube (optional)"
                  name={"youtube"}
                  rules={[
                    {
                      pattern: /^https?:\/\/[^ "<>#%{}|^~[\]`]+$/,
                      message: "Please enter a valid URL"
                    },
                    {
                      pattern: /^.{1,200}$/,
                      message: "The value must be between 1 and 200 characters long."
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
                  <Input placeholder="Enter URL" />
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Telegram (optional)"
                  name={"telegram"}
                  rules={[
                    {
                      pattern: /^https?:\/\/[^ "<>#%{}|^~[\]`]+$/,
                      message: "Please enter a valid URL"
                    },
                    {
                      pattern: /^.{1,200}$/,
                      message: "The value must be between 1 and 200 characters long."
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
                  <Input placeholder="Enter URL" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              {/* YouTube Section */}
              <Col xs={24} sm={12}>
                <Form.Item
                  label="Twitter (optional)"
                  name={"twitter"}
                  rules={[
                    {
                      pattern: /^https?:\/\/[^ "<>#%{}|^~[\]`]+$/,
                      message: "Please enter a valid URL"
                    },
                    {
                      pattern: /^.{1,200}$/,
                      message: "The value must be between 1 and 200 characters long."
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
                  <Input placeholder="Enter URL" />
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
